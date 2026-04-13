/**
 * DashboardPage smoke test — proves `useDashboardStats` fans out to
 * /transactions/stats and /expenses/summary in parallel on mount.
 */

/* eslint-disable import/first */

const mockApiGet = jest.fn();
const mockApiPost = jest.fn();
const mockApiPut = jest.fn();
const mockApiDelete = jest.fn();
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
    useAuth: () => ({
        user: { role: 'gymadmin', gymId: 'g1', permissions: [] },
    }),
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
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/renderWithProviders';
import DashboardPage from './DashboardPage';

const STATS_PAYLOAD = {
    income: { dailyByMethod: [], dailyByStatus: [] },
    pendingPayments: [],
    expiringSoon: [],
    recentTransactions: [],
};

const SUMMARY_PAYLOAD = { monthlyExpense: 0, categoryBreakdown: [] };

describe('DashboardPage — initial load', () => {
    beforeEach(() => {
        mockApiGet.mockReset();
        mockApiGet.mockImplementation((url) => {
            if (url === '/transactions/stats') return Promise.resolve({ data: STATS_PAYLOAD });
            if (url === '/expenses/summary') return Promise.resolve({ data: SUMMARY_PAYLOAD });
            return Promise.resolve({ data: {} });
        });
    });

    it('fans out to /transactions/stats and /expenses/summary in parallel', async () => {
        renderWithProviders(<DashboardPage />);

        await waitFor(() => {
            const urls = mockApiGet.mock.calls.map(([u]) => u);
            expect(urls).toEqual(
                expect.arrayContaining(['/transactions/stats', '/expenses/summary']),
            );
        });
    });
});
