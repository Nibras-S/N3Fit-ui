import { QueryClient } from '@tanstack/react-query';

// Single app-wide QueryClient. Defaults are tuned for a CRUD SaaS backed by
// live socket invalidation — we can afford a short staleTime because the
// backend emits `<resource>:<action>` events on every mutation and the
// RealtimeSync component (app/RealtimeSync.jsx) translates those into
// queryClient.invalidateQueries() calls. See N3Fit-ui/CLAUDE.md for the
// query-key convention and how to add a new feature.
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
        },
        mutations: {
            retry: 0,
        },
    },
});
