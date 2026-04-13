import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { PageSkeleton } from '../../../shared/components/ui/Skeleton';

/**
 * Redirect already-logged-in users away from the login page.
 * Unauthenticated users see the login form.
 *
 * First-paint strategy matches ProtectedRoute: if we already know the user
 * is authenticated (session hint), redirect immediately; otherwise wait only
 * until /auth/me resolves on genuine first visits.
 */
export default function LoginGuard() {
    const { isAuthenticated, initialAuthChecked, user } = useAuth();

    if (isAuthenticated) {
        if (user?.role === 'superadmin') return <Navigate to="/superadmin" replace />;
        if (user?.role === 'staff') return <Navigate to="/active" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    // Genuine first visit: wait for /auth/me before showing the login form
    // so a valid session gets auto-redirected instead of flashing the form.
    if (!initialAuthChecked) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
                <PageSkeleton stats={4} tableRows={6} />
            </div>
        );
    }

    return <LoginPage />;
}
