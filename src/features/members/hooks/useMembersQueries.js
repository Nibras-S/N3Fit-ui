import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '../../../shared/services/api';

// Query keys live in one place so every invalidation site agrees with every
// query site. Rule of thumb: `['members', 'list', filters]` for lists,
// `['members', 'detail', id, ...sub]` for a single member and its children
// (transactions, audit). Invalidating `['members']` nukes the whole tree,
// which is what RealtimeSync does on member:* socket events.
export const memberKeys = {
    all: ['members'],
    lists: () => [...memberKeys.all, 'list'],
    list: (filters) => [...memberKeys.lists(), filters],
    stats: (status) => [...memberKeys.all, 'stats', status],
    details: () => [...memberKeys.all, 'detail'],
    detail: (id) => [...memberKeys.details(), id],
    detailTransactions: (id) => [...memberKeys.detail(id), 'transactions'],
    detailAudit: (id) => [...memberKeys.detail(id), 'audit'],
    birthdays: () => [...memberKeys.all, 'birthdays'],
};

// ── Queries ────────────────────────────────────────────────────────────────

// Paginated + filtered list used by MembersPage. `filters` must be a plain
// object — TanStack Query serializes it into the cache key, so each filter
// combination caches independently and navigating back to a previous filter
// is instant.
export function useMembers(filters) {
    return useQuery({
        queryKey: memberKeys.list(filters),
        queryFn: async () => {
            const res = await api.get('/contacts/', { params: filters });
            return {
                items: Array.isArray(res.data?.data) ? res.data.data : [],
                pagination: res.data?.pagination || {},
            };
        },
        // Smooth pagination — show the previous page while the next one loads
        // instead of flashing a skeleton.
        placeholderData: keepPreviousData,
    });
}

// Global per-tab member counts (total / male / female) that are NOT affected
// by search or gender filters. Accepts a filters object (status, includeExpired,
// onlyExpired) so archived/expired tabs get correct counts.
export function useMembersStats(filters) {
    return useQuery({
        queryKey: memberKeys.stats(filters),
        queryFn: async () => {
            const params = { ...filters, page: 1, limit: 1 };
            const res = await api.get('/contacts/', { params });
            const p = res.data?.pagination || {};
            return { total: p.total || 0, male: p.male || 0, female: p.female || 0 };
        },
    });
}

export function useMember(id) {
    return useQuery({
        queryKey: memberKeys.detail(id),
        queryFn: async () => {
            const res = await api.get(`/contacts/${id}`);
            return res.data;
        },
        enabled: Boolean(id),
    });
}

export function useMemberTransactions(id) {
    return useQuery({
        queryKey: memberKeys.detailTransactions(id),
        queryFn: async () => {
            const res = await api.get('/transactions', { params: { memberId: id } });
            const data = res.data;
            return Array.isArray(data)
                ? data
                : (Array.isArray(data?.data) ? data.data : []);
        },
        enabled: Boolean(id),
    });
}

// Audit fetch is `silent: true` because it's a non-critical side panel —
// the shared axios interceptor respects the flag and suppresses its toast.
export function useMemberAudit(id) {
    return useQuery({
        queryKey: memberKeys.detailAudit(id),
        queryFn: async () => {
            const res = await api.get(`/contacts/${id}/audit`, { silent: true });
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: Boolean(id),
    });
}

// All members with dob set, sorted by nearest upcoming birthday.
// Nests under ['members'] so RealtimeSync's member:* invalidation covers it.
export function useBirthdays() {
    return useQuery({
        queryKey: memberKeys.birthdays(),
        queryFn: async () => {
            const res = await api.get('/contacts/birthdays');
            return Array.isArray(res.data) ? res.data : [];
        },
    });
}

// ── Mutations ──────────────────────────────────────────────────────────────

// Delete a member. Socket event (member:deleted) will also invalidate the
// cache via RealtimeSync, but we invalidate synchronously here so the list
// page updates even if the socket is momentarily disconnected.
export function useDeleteMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.delete(`/contacts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: memberKeys.all });
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
}
