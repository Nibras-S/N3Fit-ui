/**
 * TransactionsPage smoke test — proves the TanStack Query migration wires
 * `useTransactions` → `/transactions` on mount and renders a row from the
 * response. Follows the same shape as MembersPage.test.jsx.
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

// No socket in tests — RealtimeSync is outside this page anyway.
jest.mock('../../../shared/hooks/useGymSocket', () => ({
    __esModule: true,
    default: () => {},
}));

// Persisted filters normally round-trip through /users/preferences. Replace
// it with a plain useState so the page renders without extra API noise.
jest.mock('../../../shared/hooks/usePersistedFilters', () => ({
    __esModule: true,
    default: (_key, defaults) => {
        const React = require('react');
        const [filters, setFilters] = React.useState(defaults);
        const clear = () => setFilters(defaults);
        return [filters, setFilters, clear];
    },
}));

jest.mock('../../../shared/components/layout/AppLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="app-layout">{children}</div>,
}));

// Render each row's memberName as plain text so we can assert on it.
jest.mock('../../../shared/components/data/DataTable', () => ({
    __esModule: true,
    default: ({ data = [] }) => (
        <ul data-testid="data-table">
            {data.map((row, i) => (
                <li key={row._id || i}>{row.memberName}</li>
            ))}
        </ul>
    ),
}));

jest.mock('../../members/components/RecordPaymentModal', () => ({
    __esModule: true,
    default: () => null,
}));

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
import TransactionsPage from './TransactionsPage';

const TRANSACTIONS_PAYLOAD = [
    {
        _id: 't1',
        memberName: 'Alice Anderson',
        plan: '1-Month',
        amount: 1500,
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        transactionDate: '2026-04-01T00:00:00.000Z',
    },
];

describe('TransactionsPage — initial load', () => {
    beforeEach(() => {
        mockApiGet.mockReset();
        mockApiGet.mockImplementation((url) => {
            if (url === '/transactions') {
                return Promise.resolve({ data: TRANSACTIONS_PAYLOAD });
            }
            return Promise.resolve({ data: {} });
        });
    });

    it('fetches /transactions on mount and renders a row', async () => {
        renderWithProviders(<TransactionsPage />);

        await waitFor(() => {
            expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
        });

        const txCalls = mockApiGet.mock.calls.filter(([url]) => url === '/transactions');
        expect(txCalls.length).toBeGreaterThan(0);
    });
});
