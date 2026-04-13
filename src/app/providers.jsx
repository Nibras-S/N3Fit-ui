import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { NotificationProvider } from '../features/notifications/context/NotificationContext';
import ErrorBoundary from '../shared/components/feedback/ErrorBoundary';
import { FormStateProvider } from '../shared/context/FormStateContext';
import { queryClient } from '../shared/lib/queryClient';
import RealtimeSync from './RealtimeSync';

/**
 * Compose all application-level providers in one place.
 * Order matters: outer providers are available to inner ones.
 *
 * ThemeProvider is kept in index.js since it wraps the Router.
 *
 * QueryClientProvider must wrap NotificationProvider so RealtimeSync (which
 * uses both the query client and the socket) can live inside both. Auth sits
 * under QueryClientProvider so future auth-related queries (e.g. /auth/me)
 * can flow through TanStack Query without a provider dance.
 */
export default function Providers({ children }) {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <NotificationProvider>
                        <FormStateProvider>
                            <RealtimeSync />
                            {children}
                        </FormStateProvider>
                    </NotificationProvider>
                </AuthProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
