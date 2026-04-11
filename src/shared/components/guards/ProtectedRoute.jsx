import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';

/**
 * Role-based protected route.
 * @param {string[]} allowedRoles - Roles that can access this route. If empty, any authenticated user can access.
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'superadmin') return <Navigate to="/superadmin" replace />;
    if (user?.role === 'staff') return <Navigate to="/active" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
