// components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem('adminToken'); // or use context or cookie

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin" />;
};

export default ProtectedRoute;
