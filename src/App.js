import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PageHome from './pages/PageHome';
import PageActive from './pages/PageActive';
import PageInActive from './pages/PageInActive';
import MemberProfile from './pages/MemberProfile';
import PageNewMember from './pages/PageNewMember';
import PageNewMember2 from './pages/PageNewMember2';
import ManageUsers from './pages/ManageUsers';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import StaffManagement from './pages/StaffManagement';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SaaSPlanManagement from './pages/SaaSPlanManagement';
import GymProfile from './pages/GymProfile';
import AdminAuth from './components/admin/adminauth';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * Redirect already-logged-in users away from the login page
 */
function LoginGuard() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'superadmin') return <Navigate to="/superadmin" replace />;
    if (user?.role === 'staff') return <Navigate to="/active" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminAuth />;
}

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen font-sans">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PageHome />} />
          <Route path="/login" element={<LoginGuard />} />
          {/* Keep /admin as alias for login for backward compatibility */}
          <Route path="/admin" element={<LoginGuard />} />

          {/* Gym Admin + Staff routes */}
          <Route element={<ProtectedRoute allowedRoles={['gymadmin', 'staff']} />}>
            <Route path="/active" element={<PageActive />} />
            <Route path="/inactive" element={<PageInActive />} />
            <Route path="/members/:id" element={<MemberProfile />} />
            <Route path="/register" element={<PageNewMember />} />
            <Route path="/inactivesoon" element={<PageNewMember2 />} />
            <Route path="/manageUsers" element={<ManageUsers />} />
          </Route>

          {/* Gym Admin-only routes */}
          <Route element={<ProtectedRoute allowedRoles={['gymadmin']} />}>
            <Route path="/settings" element={<Settings />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/gym-profile" element={<GymProfile />} />
          </Route>

          {/* Super Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
            <Route path="/superadmin/plans" element={<SaaSPlanManagement />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
