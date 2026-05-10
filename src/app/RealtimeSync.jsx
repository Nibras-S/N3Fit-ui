import { useQueryClient } from '@tanstack/react-query';
import useGymSocket from '../shared/hooks/useGymSocket';

// App-level realtime invalidator. The backend already emits
// `<resource>:<action>` events on every mutation (see emitToGym in
// N3Fit-api/src/shared/socket/socketManager.js); this component translates
// them into queryClient invalidations so every mounted query refetches even
// when the mutation itself went through legacy code that doesn't use
// TanStack Query mutations. That's what lets us migrate features
// incrementally without breaking cache coherence.
//
// Add a new section here when a new feature gets migrated to TanStack Query.
// Must be rendered INSIDE both QueryClientProvider and NotificationProvider
// (NotificationProvider owns the socket useGymSocket subscribes to).
export default function RealtimeSync() {
    const queryClient = useQueryClient();

    useGymSocket(
        ['member:created', 'member:updated', 'member:deleted'],
        () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    );

    // Reminder cron (whatsappReminder.job.js) fires this after it touches a
    // Reminder doc. Without this, MembersPage's pending-reminder badge stayed
    // stale until some unrelated member mutation accidentally flushed the key.
    useGymSocket(
        ['reminder:updated'],
        () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    );

    useGymSocket(
        ['transaction:created', 'transaction:updated'],
        () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            // Member profile page caches transactions under the member detail
            // subtree; a recorded payment needs to flush that too.
            queryClient.invalidateQueries({ queryKey: ['members', 'detail'] });
        },
    );

    useGymSocket(
        ['expense:created', 'expense:updated', 'expense:deleted'],
        () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    );

    // Membership refactor (PR-2): the renewal/registration routes write a
    // Membership row alongside Member + Transaction and emit this event.
    // PR-3 will read from this collection; for now it just keeps the
    // Membership History tab fresh on the member profile.
    useGymSocket(
        ['membership:created', 'membership:updated'],
        () => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
            queryClient.invalidateQueries({ queryKey: ['members', 'detail'] });
        },
    );

    return null;
}
