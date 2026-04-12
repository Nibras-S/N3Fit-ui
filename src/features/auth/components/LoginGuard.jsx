import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { PageSkeleton } from '../../../shared/components/ui/Skeleton';

/**
 * Redirect already-logged-in users away from the login page.
 * Unauthenticated users see the login form.
 */
export default function LoginGuard() {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
                <PageSkeleton stats={4} tableRows={6} />
            </div>
        );
    }

    if (isAuthenticated) {
        if (user?.role === 'superadmin') return <Navigate to="/superadmin" replace />;
        if (user?.role === 'staff') return <Navigate to="/active" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return <LoginPage />;
}
