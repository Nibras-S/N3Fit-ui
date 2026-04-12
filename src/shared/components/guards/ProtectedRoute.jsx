import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { PageSkeleton } from '../ui/Skeleton';

/**
 * Role-based protected route.
 * @param {string[]} allowedRoles - Roles that can access this route. If empty, any authenticated user can access.
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
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
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'superadmin') return <Navigate to="/superadmin" replace />;
    if (user?.role === 'staff') return <Navigate to="/active" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
