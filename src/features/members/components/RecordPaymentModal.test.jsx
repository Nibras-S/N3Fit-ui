/* eslint-disable import/first */
const mockGet = jest.fn();
const mockPut = jest.fn();
jest.mock('../../../shared/services/api', () => ({
    __esModule: true,
    default: { get: (...args) => mockGet(...args), put: (...args) => mockPut(...args) },
}));
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn() } }));
jest.mock('../../auth/context/AuthContext', () => ({
    useAuth: () => ({ user: { id: 'u1', role: 'gymadmin', gym: { name: 'Test Gym' } } }),
}));
jest.mock('../../../shared/components/layout/AppLayout', () => ({
    __esModule: true, default: ({ children }) => <div>{children}</div>,
}));

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecordPaymentModal from './RecordPaymentModal';
import MembershipCardPage from '../pages/MembershipCardPage';
import { useTransactions } from '../../transactions/hooks/useTransactionsQueries';
import { useMember } from '../hooks/useMembersQueries';
import { useDashboardStats } from '../../dashboard/hooks/useDashboardQueries';
import { useExpenseSummary } from '../../expenses/hooks/useExpensesQueries';

let transaction;
let member;

function PaymentScreen({ onPaid }) {
    const txns = useTransactions();
    const profile = useMember('m1');
    const dashboard = useDashboardStats();
    const expenses = useExpenseSummary();
    const reports = useQuery({ queryKey: ['reports', 'income'], queryFn: async () => (await mockGet('/reports/income')).data });
    const [open, setOpen] = useState(true);
    return <>
        <output data-testid="transaction">{txns.data?.[0]?.paymentStatus}</output>
        <output data-testid="member">{profile.data?.paymentStatus}</output>
        <output data-testid="collected">{dashboard.data?.income.dailyActual}</output>
        <output data-testid="profit">{expenses.data?.netProfit}</output>
        <output data-testid="report">{reports.data?.paidIncome}</output>
        {open && <RecordPaymentModal transactionId="t1" totalAmount={1000} onClose={() => setOpen(false)}
            onPaid={updated => { onPaid(updated); setOpen(false); }} />}
    </>;
}

function mount(ui, route = '/') {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } } });
    const result = render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter></QueryClientProvider>);
    return { ...result, client };
}

beforeEach(() => {
    transaction = { _id: 't1', memberId: 'm1', memberName: 'Payment Member', amount: 1000, paidAmount: 0, paymentStatus: 'Pending', paymentMethod: 'Cash' };
    member = { _id: 'm1', name: 'Payment Member', plan: '1-Month', gender: 'Male', paymentStatus: 'Pending', endDate: '2026-11-01T00:00:00Z', dews: -1 };
    mockGet.mockReset();
    mockPut.mockReset();
    mockGet.mockImplementation(async url => {
        if (url === '/transactions') return { data: { data: [{ ...transaction }] } };
        if (url === '/transactions/t1') return { data: { ...transaction } };
        if (url === '/contacts/m1') return { data: { ...member } };
        if (url === '/transactions/stats') return { data: { income: { dailyActual: transaction.paidAmount } } };
        if (url === '/expenses/summary') return { data: { netProfit: transaction.paidAmount - 100 } };
        if (url === '/reports/income') return { data: { paidIncome: transaction.paidAmount } };
        return { data: {} };
    });
    mockPut.mockImplementation(async (_url, payload) => {
        const paidAmount = transaction.paidAmount + payload.splits.reduce((sum, s) => sum + s.amount, 0);
        transaction = { ...transaction, paidAmount, paymentStatus: paidAmount === 1000 ? 'Paid' : 'Partial' };
        member = { ...member, paymentStatus: transaction.paymentStatus, endDate: '2026-12-01T00:00:00Z', dews: 30 };
        return { data: { ...transaction } };
    });
});

it.each([[400, 'Partial'], [1000, 'Paid']])('updates every active view after paying %s without a socket', async (amount, status) => {
    const onPaid = jest.fn();
    const { client } = mount(<PaymentScreen onPaid={onPaid} />);
    client.setQueryData(['members', 'list', {}], { items: [{ ...member }] });
    client.setQueryData(['memberships', 'list'], []);
    client.setQueryData(['reminders', 'list'], []);
    await waitFor(() => expect(screen.getByTestId('transaction')).toHaveTextContent('Pending'));
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: String(amount) } });
    fireEvent.click(screen.getByRole('button', { name: amount === 1000 ? 'Confirm Full Payment' : 'Record Partial Payment' }));
    await waitFor(() => expect(onPaid).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('transaction')).toHaveTextContent(status);
    expect(screen.getByTestId('member')).toHaveTextContent(status);
    expect(screen.getByTestId('collected')).toHaveTextContent(String(amount));
    expect(screen.getByTestId('profit')).toHaveTextContent(String(amount - 100));
    expect(screen.getByTestId('report')).toHaveTextContent(String(amount));
    for (const key of [['members', 'list', {}], ['memberships', 'list'], ['reminders', 'list']]) {
        expect(client.getQueryState(key).isInvalidated).toBe(true);
    }
    expect(mockPut).toHaveBeenCalledTimes(1);
});

it('keeps the previous data and does not retry a failed payment', async () => {
    mockPut.mockRejectedValue(new Error('Offline'));
    const onPaid = jest.fn();
    mount(<PaymentScreen onPaid={onPaid} />);
    await waitFor(() => expect(screen.getByTestId('transaction')).toHaveTextContent('Pending'));
    fireEvent.click(screen.getByRole('button', { name: 'Full' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Full Payment' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm Full Payment' })).toBeEnabled());
    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(onPaid).not.toHaveBeenCalled();
    expect(screen.getByTestId('transaction')).toHaveTextContent('Pending');
});

it('blocks repeat submission and closing while a payment is being saved', async () => {
    let finish;
    mockPut.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const onClose = jest.fn();
    const onPaid = jest.fn();
    mount(<RecordPaymentModal transactionId="t1" totalAmount={1000} onClose={onClose} onPaid={onPaid} />);
    fireEvent.click(screen.getByRole('button', { name: 'Full' }));
    const submit = screen.getByRole('button', { name: 'Confirm Full Payment' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(mockPut).toHaveBeenCalledTimes(1));
    expect(onClose).not.toHaveBeenCalled();
    finish({ data: { ...transaction, paymentStatus: 'Paid', paidAmount: 1000 } });
    await waitFor(() => expect(onPaid).toHaveBeenCalledTimes(1));
});

it.each(['', '?txn=t1'])('refreshes membership dates and payment status on the card %s', async suffix => {
    mount(<Routes><Route path="/members/:id/card" element={<MembershipCardPage />} /></Routes>, `/members/m1/card${suffix}`);
    fireEvent.click(await screen.findByRole('button', { name: 'Mark as Paid' }));
    fireEvent.click(screen.getByRole('button', { name: 'Full' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Full Payment' }));
    expect(await screen.findByText('Payment Complete')).toBeInTheDocument();
    expect(screen.getByText(/Dec 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/Nov 2026/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark as Paid' })).not.toBeInTheDocument();
});
