/**
 * Dashboard access, session hydration, and failed-load regressions.
 */

/* eslint-disable import/first */

const mockApiGet = jest.fn();
const mockApiPost = jest.fn();
const mockApiPut = jest.fn();
const mockApiDelete = jest.fn();
let mockAuth;
jest.mock('../../../shared/services/api', () => ({
    __esModule: true,
    default: {
        get: (...args) => mockApiGet(...args),
        post: (...args) => mockApiPost(...args),
        put: (...args) => mockApiPut(...args),
        delete: (...args) => mockApiDelete(...args),
    },
}));

jest.mock('../../../shared/hooks/useGymSocket', () => ({
    __esModule: true,
    default: () => {},
}));

jest.mock('../../auth/context/AuthContext', () => ({
    useAuth: () => mockAuth,
}));

jest.mock('../../../shared/components/layout/AppLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="app-layout">{children}</div>,
}));

jest.mock('../../members/components/RecordPaymentModal', () => ({
    __esModule: true,
    default: () => null,
}));

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { renderWithProviders } from '../../../test/renderWithProviders';
import DashboardPage from './DashboardPage';

const STATS_PAYLOAD = {
    income: { daily: 1250, dailyByMethod: [], dailyByStatus: [] },
    members: { joinedToday: 3 },
    pendingPayments: [{ _id: 't1', memberName: 'Pending Member', amount: 500, plan: '1-Month' }],
    expiringSoon: [],
    recentTransactions: [],
};

function LocationProbe() {
    return <div data-testid="location">{useLocation().pathname}</div>;
}

describe('DashboardPage — initial load', () => {
    beforeEach(() => {
        mockAuth = {
            user: { role: 'gymadmin', gymId: 'g1', permissions: [] },
            initialAuthChecked: true,
            hasFeature: () => false,
        };
        mockApiGet.mockReset();
        mockApiGet.mockImplementation((url) => {
            if (url === '/transactions/stats') return Promise.resolve({ data: STATS_PAYLOAD });
            return Promise.resolve({ data: {} });
        });
    });

    it('loads dashboard stats for admins without depending on expense summaries', async () => {
        renderWithProviders(<DashboardPage />);
        expect(await screen.findByText('Daily Report')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Collect' })).toBeInTheDocument();
        expect(mockApiGet).toHaveBeenCalledWith('/transactions/stats');
        expect(mockApiGet).not.toHaveBeenCalledWith('/expenses/summary');
    });

    it('shows actual analytics for staff with dashboard + members but no payment handling controls', async () => {
        mockAuth.user = { role: 'staff', permissions: ['dashboard', 'members'] };
        renderWithProviders(<DashboardPage />);
        expect(await screen.findByText('Daily Report')).toBeInTheDocument();
        expect(screen.getByText('₹1,250')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Collect' })).not.toBeInTheDocument();
    });

    it('waits for staff permissions on reload before fetching or redirecting', async () => {
        mockAuth.user = { role: 'staff', _id: 's1' };
        mockAuth.initialAuthChecked = false;
        const page = <><DashboardPage /><LocationProbe /></>;
        const { rerender } = renderWithProviders(page, { route: '/dashboard' });
        expect(mockApiGet).not.toHaveBeenCalled();
        expect(screen.getByTestId('location')).toHaveTextContent('/dashboard');

        mockAuth = { ...mockAuth, initialAuthChecked: true, user: { ...mockAuth.user, permissions: ['dashboard'] } };
        rerender(<><DashboardPage /><LocationProbe /></>);
        expect(await screen.findByText('Daily Report')).toBeInTheDocument();
        expect(screen.getByTestId('location')).toHaveTextContent('/dashboard');
    });

    it('does not request dashboard stats for staff without dashboard permission', async () => {
        mockAuth.user = { role: 'staff', permissions: ['members'] };
        renderWithProviders(<><DashboardPage /><LocationProbe /></>, { route: '/dashboard' });
        await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/members'));
        expect(mockApiGet).not.toHaveBeenCalled();
    });

    it('does not present failed requests as zero revenue or retry permission denials', async () => {
        mockApiGet.mockRejectedValue({ response: { status: 403 } });
        renderWithProviders(<DashboardPage />);
        expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load dashboard data');
        expect(screen.queryByText('₹0')).not.toBeInTheDocument();
        expect(screen.queryByText('No transactions yet')).not.toBeInTheDocument();
        expect(mockApiGet).toHaveBeenCalledTimes(1);
    });
});
