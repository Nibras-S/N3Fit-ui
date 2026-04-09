import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../shared/components/guards/ProtectedRoute';
import LoginGuard from '../features/auth/components/LoginGuard';

// ── Feature Pages ────────────────────────────────────────────────
import LandingPage from '../features/landing/pages/LandingPage';

// Members
import MembersPage from '../features/members/pages/MembersPage';
import MemberProfilePage from '../features/members/pages/MemberProfilePage';
import RegisterMemberPage from '../features/members/pages/RegisterMemberPage';
import InactiveSoonPage from '../features/members/pages/InactiveSoonPage';

// Dashboard & Analytics
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import ExpensesPage from '../features/expenses/pages/ExpensesPage';
import TransactionsPage from '../features/transactions/pages/TransactionsPage';
import ReportsPage from '../features/reports/pages/ReportsPage';

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
                <Route path="/members" element={<MembersPage />} />
                <Route path="/members/:id" element={<MemberProfilePage />} />
                <Route path="/register" element={<RegisterMemberPage />} />
                <Route path="/inactivesoon" element={<InactiveSoonPage />} />
                <Route path="/invoice/:id" element={<InvoicePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {/* Legacy redirects */}
                <Route path="/active" element={<Navigate to="/members?tab=active" replace />} />
                <Route path="/inactive" element={<Navigate to="/members?tab=expired" replace />} />
                <Route path="/manageUsers" element={<Navigate to="/members?tab=all" replace />} />
            </Route>

            {/* ── Gym Admin Only ──────────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['gymadmin']} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
            </Route>

            {/* ── Analytics (Admin / Staff / Superadmin) ──────────── */}
            <Route element={<ProtectedRoute allowedRoles={['gymadmin', 'staff', 'superadmin']} />}>
                <Route path="/reports" element={<ReportsPage />} />
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
