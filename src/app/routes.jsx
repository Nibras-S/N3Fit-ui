import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../shared/components/guards/ProtectedRoute';
import LoginGuard from '../features/auth/components/LoginGuard';

// ── Feature Pages ────────────────────────────────────────────────
import LandingPage from '../features/landing/pages/LandingPage';

// Members
import ActiveMembersPage from '../features/members/pages/ActiveMembersPage';
import InactiveMembersPage from '../features/members/pages/InactiveMembersPage';
import MemberProfilePage from '../features/members/pages/MemberProfilePage';
import RegisterMemberPage from '../features/members/pages/RegisterMemberPage';
import InactiveSoonPage from '../features/members/pages/InactiveSoonPage';
import ManageMembersPage from '../features/members/pages/ManageMembersPage';

// Dashboard & Analytics
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import ExpensesPage from '../features/expenses/pages/ExpensesPage';

// Staff, Settings, Notifications, Whatsapp
import StaffPage from '../features/staff/pages/StaffPage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';
import AnnouncementPage from '../features/whatsapp/pages/AnnouncementPage';

// Invoices
import InvoicePage from '../features/invoices/pages/InvoicePage';

// Super Admin
import SuperAdminDashboard from '../features/superadmin/pages/SuperAdminDashboard';
import GymDetailsPage from '../features/superadmin/pages/GymDetailsPage';
import SuperAdminSettingsPage from '../features/superadmin/pages/SuperAdminSettingsPage';
import SaaSPlanPage from '../features/superadmin/pages/SaaSPlanPage';

/**
 * Centralized route configuration.
 * All routes are organized by access level.
 */
export default function AppRoutes() {
    return (
        <Routes>
            {/* ── Public ──────────────────────────────────────────── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginGuard />} />
            <Route path="/admin" element={<LoginGuard />} />

            {/* ── All Authenticated Users ─────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['gymadmin', 'staff', 'superadmin']} />}>
                <Route path="/announcement" element={<AnnouncementPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            {/* ── Gym Admin + Staff ───────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['gymadmin', 'staff']} />}>
                <Route path="/active" element={<ActiveMembersPage />} />
                <Route path="/inactive" element={<InactiveMembersPage />} />
                <Route path="/members/:id" element={<MemberProfilePage />} />
                <Route path="/register" element={<RegisterMemberPage />} />
                <Route path="/inactivesoon" element={<InactiveSoonPage />} />
                <Route path="/manageUsers" element={<ManageMembersPage />} />
                <Route path="/invoice/:id" element={<InvoicePage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* ── Gym Admin Only ──────────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['gymadmin']} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
            </Route>

            {/* ── Super Admin ─────────────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                <Route path="/superadmin" element={<SuperAdminDashboard />} />
                <Route path="/superadmin/gyms/:id" element={<GymDetailsPage />} />
                <Route path="/superadmin/settings" element={<SuperAdminSettingsPage />} />
                <Route path="/superadmin/plans" element={<SaaSPlanPage />} />
            </Route>

            {/* ── Catch-all ───────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
