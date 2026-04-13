import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/services/api';

// Query keys for the expenses feature. Prefix ['expenses'] matches what
// RealtimeSync invalidates on expense:* socket events, so a burst of
// events from another device flushes the whole tree in one shot.
export const expenseKeys = {
    all: ['expenses'],
    lists: () => [...expenseKeys.all, 'list'],
    list: () => [...expenseKeys.lists(), {}],
    summary: () => [...expenseKeys.all, 'summary'],
};

// Full list — backend returns every expense for the gym; the page filters
// client-side, same shape as useTransactions. Add a filters arg here when
// the backend grows server-side filters.
export function useExpenses() {
    return useQuery({
        queryKey: expenseKeys.list(),
        queryFn: async () => {
            const res = await api.get('/expenses');
            const list = Array.isArray(res.data?.data) ? res.data.data : res.data;
            return Array.isArray(list) ? list : [];
        },
    });
}

// Server-side aggregate (monthly total, top category). Can't be derived
// from the list, so it gets its own query — RealtimeSync invalidates both
// under the same ['expenses'] prefix.
export function useExpenseSummary() {
    return useQuery({
        queryKey: expenseKeys.summary(),
        queryFn: async () => {
            const res = await api.get('/expenses/summary');
            return res.data;
        },
    });
}

// Only delete is migrated to useMutation in this pass. Create/update stay
// in AddExpenseModal's legacy raw-axios code, invalidated via onRefresh
// from the page — same pattern MembersPage uses for its modals.
export function useDeleteExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.delete(`/expenses/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: expenseKeys.all });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
