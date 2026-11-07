import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/services/api';

// The dashboard only consumes transaction stats. Expense summaries belong to
// the Expenses page and must not block the dashboard's data from loading.
export const dashboardKeys = {
    all: ['dashboard'],
    stats: () => [...dashboardKeys.all, 'stats'],
};

export function useDashboardStats({ enabled = true } = {}) {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        enabled,
        retry: (failureCount, error) => {
            if ([401, 403].includes(error.response?.status)) return false;
            return failureCount < 1;
        },
        queryFn: async () => {
            const res = await api.get('/transactions/stats');
            return res.data;
        },
    });
}
