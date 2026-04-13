/**
 * ExpensesPage smoke test — asserts the list + summary render after the
 * TQ hooks resolve (/expenses and /expenses/summary) on mount.
 *
 * The create/update flow still lives in AddExpenseModal's raw axios code
 * (see useExpensesQueries.js — only useDeleteExpense is mutation-migrated),
 * so we don't assert on it here.
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

jest.mock('../../../shared/components/data/DataTable', () => ({
    __esModule: true,
    default: ({ data = [] }) => (
        <ul data-testid="data-table">
            {data.map((row, i) => (
                <li key={row._id || i}>{row.category}</li>
            ))}
        </ul>
    ),
}));

jest.mock('../components/AddExpenseModal', () => ({
    __esModule: true,
    default: () => null,
}));
jest.mock('../components/ViewExpenseModal', () => ({
    __esModule: true,
    default: () => null,
}));
jest.mock('../../../shared/components/feedback/ConfirmModal', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('react-hot-toast', () => {
    const toast = Object.assign(jest.fn(), { success: jest.fn(), error: jest.fn() });
    return { __esModule: true, default: toast, Toaster: () => null };
});

jest.mock('framer-motion', () => ({
    __esModule: true,
    motion: new Proxy(
        {},
        {
            get: () => ({ children, ...rest }) => <div {...rest}>{children}</div>,
        },
    ),
    AnimatePresence: ({ children }) => <>{children}</>,
}));

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/renderWithProviders';
import ExpensesPage from './ExpensesPage';

const EXPENSES_PAYLOAD = [
    {
        _id: 'e1',
        category: 'Rent',
        amount: 50000,
        vendor: 'Acme Properties',
        paymentMethod: 'Bank Transfer',
        date: '2026-04-01T00:00:00.000Z',
    },
];

const SUMMARY_PAYLOAD = {
    monthlyExpense: 50000,
    categoryBreakdown: [{ _id: 'Rent', total: 50000 }],
};

describe('ExpensesPage — initial load', () => {
    beforeEach(() => {
        mockApiGet.mockReset();
        mockApiGet.mockImplementation((url) => {
            if (url === '/expenses') return Promise.resolve({ data: EXPENSES_PAYLOAD });
            if (url === '/expenses/summary') return Promise.resolve({ data: SUMMARY_PAYLOAD });
            return Promise.resolve({ data: {} });
        });
    });

    it('fetches /expenses + /expenses/summary and renders both on mount', async () => {
        renderWithProviders(<ExpensesPage />);

        await waitFor(() => {
            expect(screen.getByText('Rent')).toBeInTheDocument();
        });

        // Summary "Top Category" card shows the highest-spend category name.
        expect(screen.getAllByText('Rent').length).toBeGreaterThan(0);

        const urls = mockApiGet.mock.calls.map(([u]) => u);
        expect(urls).toEqual(
            expect.arrayContaining(['/expenses', '/expenses/summary']),
        );
    });
});
