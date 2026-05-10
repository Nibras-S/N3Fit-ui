import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/services/api';

// Query keys for the Reset Reports feature. Nested under ['settings'] so
// RealtimeSync's `settings:baseline-changed` event invalidates both the
// banner data and the audit history in one shot.
export const settingsKeys = {
    all: ['settings'],
    baseline: () => [...settingsKeys.all, 'baseline'],
    baselineHistory: () => [...settingsKeys.all, 'baselineHistory'],
};

/**
 * Lightweight read for the in-app banner — `{ baselineDate, lastReset }`.
 * `baselineDate` is null when no reset has been applied (default state).
 */
export function useReportBaseline() {
    return useQuery({
        queryKey: settingsKeys.baseline(),
        queryFn: async () => {
            const res = await api.get('/settings/baseline', { silent: true });
            return res.data;
        },
        // Banner is non-critical — fail silently if backend hiccups.
        retry: 1,
        staleTime: 60_000,
    });
}

/** Last 50 audit log entries for the Settings → Reports tab. */
export function useBaselineHistory() {
    return useQuery({
        queryKey: settingsKeys.baselineHistory(),
        queryFn: async () => {
            const res = await api.get('/settings/baseline-history');
            return Array.isArray(res.data) ? res.data : [];
        },
    });
}

/**
 * Reset the baseline. Pass `{ baselineDate, reason }` — both optional.
 * Server defaults baselineDate to today's IST midnight when omitted.
 */
export function useResetBaselineMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ baselineDate, reason } = {}) => {
            const res = await api.post('/settings/reset-baseline', { baselineDate, reason });
            return res.data;
        },
        onSuccess: () => {
            // Invalidate everything report-shaped so KPIs refetch with the new floor.
            queryClient.invalidateQueries({ queryKey: settingsKeys.all });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
}

/** Clear the baseline — reports return to all-time view. */
export function useClearBaselineMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ reason } = {}) => {
            const res = await api.post('/settings/clear-baseline', { reason });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.all });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
}
