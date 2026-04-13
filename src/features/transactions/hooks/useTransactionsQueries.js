import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/services/api';

// Query keys for the transactions feature. Match the shape RealtimeSync
// expects (['transactions'] prefix) so a `transaction:created` socket event
// invalidates every subquery under this tree.
export const transactionKeys = {
    all: ['transactions'],
    lists: () => [...transactionKeys.all, 'list'],
    // No params today — the list endpoint returns every transaction for the
    // gym and the UI filters client-side. Kept as a function so adding
    // server-side filters later is a one-line change.
    list: () => [...transactionKeys.lists(), {}],
};

// Paginated/filterable list. Today the server returns the full list and the
// page filters client-side; the hook reflects that. When the backend grows
// server-side filters, take a `filters` arg and include it in the key.
export function useTransactions() {
    return useQuery({
        queryKey: transactionKeys.list(),
        queryFn: async () => {
            const res = await api.get('/transactions');
            // The interceptor strips the outer { success, data } envelope, but
            // some endpoints still wrap their payload under `data.data` —
            // match the same tolerant access pattern used in useMembersQueries.
            const list = Array.isArray(res.data?.data) ? res.data.data : res.data;
            return Array.isArray(list) ? list : [];
        },
    });
}
