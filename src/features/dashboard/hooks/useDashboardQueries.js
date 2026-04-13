import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/services/api';

// Dashboard pulls from /transactions/stats and /expenses/summary in parallel.
// One cache entry is fine because both sides are recomputed as a single unit
// whenever RealtimeSync invalidates ['dashboard'] — which happens on any
// member/transaction/expense socket event.
export const dashboardKeys = {
    all: ['dashboard'],
    stats: () => [...dashboardKeys.all, 'stats'],
};

export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: async () => {
            const [txRes, expRes] = await Promise.all([
                api.get('/transactions/stats'),
                api.get('/expenses/summary'),
            ]);
            return { ...txRes.data, expenses: expRes.data };
        },
    });
}
