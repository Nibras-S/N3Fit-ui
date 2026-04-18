import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../shared/components/guards/ProtectedRoute';
import LoginGuard from '../features/auth/components/LoginGuard';
import { PageSkeleton } from '../shared/components/ui/Skeleton';
import ScrollToTop from '../shared/components/ScrollToTop';
import { useAuth } from '../features/auth/context/AuthContext';

/** Redirects to /dashboard if the gym doesn't have the required feature enabled. */
const FeatureGate = ({ feature, children }) => {
    const { hasFeature, user } = useAuth();
    // Superadmin bypasses feature gates
    if (user?.role === 'superadmin' || hasFeature(feature)) return children;
    return <Navigate to="/dashboard" replace />;
};

/**
 * Fallback shown while a lazy page chunk loads. Kept deliberately bare —
 * wrapping this in <AppLayout/> would pull AppLayout (and framer-motion)
 * into the main bundle, which defeats the point of lazy routing.
 */
const LayoutSkeleton = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]" aria-busy="true">
        <PageSkeleton />
    </div>
);

// ── Feature Pages (lazy-loaded for code splitting) ───────────────
const LandingPage = lazy(() => import('../features/landing/pages/LandingPage'));

// Members
const MembersPage = lazy(() => import('../features/members/pages/MembersPage'));
const MemberProfilePage = lazy(() => import('../features/members/pages/MemberProfilePage'));
const RegisterMemberPage = lazy(() => import('../features/members/pages/RegisterMemberPage'));
const InactiveSoonPage = lazy(() => import('../features/members/pages/InactiveSoonPage'));
const BirthdaysPage = lazy(() => import('../features/members/pages/BirthdaysPage'));
const MembershipCardPage = lazy(() => import('../features/members/pages/MembershipCardPage'));

// Dashboard & Analytics
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const ExpensesPage = lazy(() => import('../features/expenses/pages/ExpensesPage'));
const TransactionsPage = lazy(() => import('../features/transactions/pages/TransactionsPage'));
const ReportsPage = lazy(() => import('../features/reports/pages/ReportsPage'));
const IncomeDetailPage = lazy(() => import('../features/reports/pages/IncomeDetailPage'));
const ExpenseDetailPage = lazy(() => import('../features/reports/pages/ExpenseDetailPage'));

// Staff, Settings, Notifications, Whatsapp
const StaffPage = lazy(() => import('../features/staff/pages/StaffPage'));
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage'));
const NotificationsPage = lazy(() => import('../features/notifications/pages/NotificationsPage'));
const AnnouncementPage = lazy(() => import('../features/whatsapp/pages/AnnouncementPage'));

// Invoices
const InvoicePage = lazy(() => import('../features/invoices/pages/InvoicePage'));

// Super Admin
const SuperAdminDashboard = lazy(() => import('../features/superadmin/pages/SuperAdminDashboard'));
const GymDetailsPage = lazy(() => import('../features/superadmin/pages/GymDetailsPage'));
const SuperAdminSettingsPage = lazy(() => import('../features/superadmin/pages/SuperAdminSettingsPage'));
const SaaSPlanPage = lazy(() => import('../features/superadmin/pages/SaaSPlanPage'));
const EnquiryPage = lazy(() => import('../features/superadmin/pages/EnquiryPage'));
const ManageAccountPage = lazy(() => import('../features/account/pages/ManageAccountPage'));

// Detect if running as installed PWA (standalone mode)
const isPWA = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

/**
 * Centralized route configuration.
 * All routes are organized by access level.
 * Pages are lazy-loaded for optimal bundle splitting.
 */
export default function AppRoutes() {
    return (
        <Suspense fallback={<LayoutSkeleton />}>
            <ScrollToTop />
            <Routes>
                {/* ── Public ──────────────────────────────────────────── */}
                <Route path="/" element={isPWA ? <Navigate to="/login" replace /> : <LandingPage />} />
                <Route path="/login" element={<LoginGuard />} />
                <Route path="/admin" element={<LoginGuard />} />

                {/* ── All Authenticated Users ─────────────────────────── */}
                <Route element={<ProtectedRoute allowedRoles={['gymadmin', 'staff', 'superadmin']} />}>
                    <Route path="/announcement" element={<FeatureGate feature="whatsappNotifications"><AnnouncementPage /></FeatureGate>} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/account" element={<ManageAccountPage />} />
                </Route>

                {/* ── Gym Admin + Staff ───────────────────────────────── */}
                <Route element={<ProtectedRoute allowedRoles={['gymadmin', 'staff']} />}>
                    <Route path="/members" element={<MembersPage />} />
                    <Route path="/members/:id" element={<MemberProfilePage />} />
                    <Route path="/members/:id/card" element={<MembershipCardPage />} />
                    <Route path="/register" element={<RegisterMemberPage />} />
                    <Route path="/inactivesoon" element={<InactiveSoonPage />} />
                    <Route path="/birthdays" element={<BirthdaysPage />} />
                    <Route path="/invoice/:id" element={<InvoicePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    {/* Legacy redirects */}
                    <Route path="/active" element={<Navigate to="/members?tab=active" replace />} />
                    <Route path="/inactive" element={<Navigate to="/members?tab=expired" replace />} />
                    <Route path="/manageUsers" element={<Navigate to="/members?tab=all" replace />} />
                </Route>

                {/* ── Gym Admin + Staff with dashboard permission ─────── */}
                <Route element={<ProtectedRoute allowedRoles={['gymadmin', 'staff']} />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                </Route>

                {/* ── Gym Admin + Staff with expenses permission ──────── */}
                <Route element={<ProtectedRoute allowedRoles={['gymadmin', 'staff']} />}>
                    <Route path="/expenses" element={<ExpensesPage />} />
                </Route>

                {/* ── Gym Admin + Staff with payments permission ──────── */}
                <Route element={<ProtectedRoute allowedRoles={['gymadmin', 'staff']} />}>
                    <Route path="/transactions" element={<TransactionsPage />} />
                </Route>

                {/* ── Gym Admin Only ──────────────────────────────────── */}
                <Route element={<ProtectedRoute allowedRoles={['gymadmin']} />}>
                    <Route path="/staff" element={<StaffPage />} />
                </Route>

                {/* ── Analytics (Admin / Staff / Superadmin) ──────────── */}
                <Route element={<ProtectedRoute allowedRoles={['gymadmin', 'staff', 'superadmin']} />}>
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/reports/income" element={<IncomeDetailPage />} />
                    <Route path="/reports/expense" element={<ExpenseDetailPage />} />
                </Route>

                {/* ── Super Admin ─────────────────────────────────────── */}
                <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                    <Route path="/superadmin" element={<SuperAdminDashboard />} />
                    <Route path="/superadmin/gyms/:id" element={<GymDetailsPage />} />
                    <Route path="/superadmin/settings" element={<SuperAdminSettingsPage />} />
                    <Route path="/superadmin/plans" element={<SaaSPlanPage />} />
                    <Route path="/superadmin/enquiries" element={<EnquiryPage />} />
                </Route>

                {/* ── Catch-all ───────────────────────────────────────── */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}
