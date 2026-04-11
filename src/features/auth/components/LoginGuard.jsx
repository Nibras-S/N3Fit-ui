import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

/**
 * Redirect already-logged-in users away from the login page.
 * Unauthenticated users see the login form.
 */
export default function LoginGuard() {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
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
