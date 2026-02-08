import { Routes, Route } from 'react-router-dom';
import PageHome from './pages/PageHome';
import PageActive from './pages/PageActive';
import PageInActive from './pages/PageInActive';
import PageExpired from './pages/PageExpired';
import PageNewMember from './pages/PageNewMember';
import PageNewMember2 from './pages/PageNewMember2';
import ManageUsers from './pages/ManageUsers';
import AdminAuth from './components/admin/adminauth';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PageHome />} />
        <Route path="/admin" element={<AdminAuth />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/active" element={<PageActive />} />
          <Route path="/inactive" element={<PageInActive />} />
          <Route path="/expired" element={<PageExpired />} />
          <Route path="/register" element={<PageNewMember />} />
          <Route path="/inactivesoon" element={<PageNewMember2 />} />
          <Route path="/manageUsers" element={<ManageUsers />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
