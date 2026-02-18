import { AuthProvider } from '../features/auth/context/AuthContext';
import { NotificationProvider } from '../features/notifications/context/NotificationContext';

/**
 * Compose all application-level providers in one place.
 * Order matters: outer providers are available to inner ones.
 *
 * ThemeProvider is kept in index.js since it wraps the Router.
 */
export default function Providers({ children }) {
    return (
        <AuthProvider>
            <NotificationProvider>
                {children}
            </NotificationProvider>
        </AuthProvider>
    );
}
