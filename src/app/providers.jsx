import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { NotificationProvider } from '../features/notifications/context/NotificationContext';
import ErrorBoundary from '../shared/components/feedback/ErrorBoundary';
import { FormStateProvider } from '../shared/context/FormStateContext';
import { queryClient, persister } from '../shared/lib/queryClient';
import { ToastProvider } from '../shared/lib/toast';
import RealtimeSync from './RealtimeSync';

/**
 * Compose all application-level providers in one place.
 * Order matters: outer providers are available to inner ones.
 *
 * ThemeProvider is kept in index.js since it wraps the Router.
 *
 * PersistQueryClientProvider wraps QueryClientProvider semantics and also
 * hydrates/dehydrates the TQ cache to localStorage so that a hard refresh
 * doesn't flash skeletons on every TQ-backed page. Auth and Notifications
 * sit under it so future auth queries (e.g. /auth/me) can flow through the
 * client without a provider dance.
 */
const persistOptions = {
    persister,
    maxAge: 1000 * 60 * 60, // 1h — socket invalidation keeps in-memory cache fresh while tab is open
    buster: process.env.REACT_APP_BUILD_ID || 'dev',
    dehydrateOptions: {
        shouldDehydrateQuery: (q) =>
            q.state.status === 'success' && q.queryKey[0] !== 'auth' && q.queryKey[0] !== 'me',
    },
};

export default function Providers({ children }) {
    return (
        <ErrorBoundary>
            <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
                <AuthProvider>
                    <NotificationProvider>
                        <FormStateProvider>
                            <RealtimeSync />
                            {children}
                            {/* Single app-wide dismissible toaster (× button + swipe). */}
                            <ToastProvider />
                        </FormStateProvider>
                    </NotificationProvider>
                </AuthProvider>
            </PersistQueryClientProvider>
        </ErrorBoundary>
    );
}
