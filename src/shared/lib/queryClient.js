import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

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

// Persisted cache key — also cleared on logout in AuthContext to prevent
// cross-tenant data leaking when a second user logs in on the same browser.
export const PERSIST_KEY = 'n3fb-tq-cache';

// Sync persister stores the dehydrated cache in localStorage so that a hard
// refresh (F5) hydrates previously successful queries immediately — without
// this the Dashboard (and every other TQ-backed page) flashes its skeleton
// on every reload because `isPending` starts true on a fresh in-memory client.
export const persister =
    typeof window !== 'undefined'
        ? createSyncStoragePersister({
              storage: window.localStorage,
              key: PERSIST_KEY,
          })
        : null;
