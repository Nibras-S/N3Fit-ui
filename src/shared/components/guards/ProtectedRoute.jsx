import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { PageSkeleton } from '../ui/Skeleton';

/**
 * Role-based protected route.
 *
 * Render strategy (first-paint optimized):
 *   - If we have a `user` (from the session hint or a completed /auth/me),
 *     render immediately. The background /auth/me verifies in parallel; if
 *     it fails, the context clears `user` and the next render will redirect.
 *   - If we have no hint AND /auth/me hasn't resolved yet, show the page
 *     skeleton. This is the genuine first-visit case.
 *   - If verification is done and we still have no user, redirect to /login.
 *
 * @param {string[]} allowedRoles - Roles that can access this route.
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, initialAuthChecked, user } = useAuth();

  // No hint + not yet verified = genuine first visit — wait.
  if (!isAuthenticated && !initialAuthChecked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
        <PageSkeleton stats={4} tableRows={6} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'superadmin') return <Navigate to="/superadmin" replace />;
    if (user?.role === 'staff') return <Navigate to="/active" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
