import React, { useEffect, useState } from 'react';
import AppLayout from '../../../shared/components/layout/AppLayout';
import {
    FaWallet, FaChartPie, FaCalendarAlt,
    FaMoneyCheckAlt, FaUserPlus, FaChartLine,
    FaExclamationCircle, FaPhone, FaUserClock, FaExchangeAlt,
    FaFileInvoiceDollar
} from 'react-icons/fa';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RecordPaymentModal from '../../members/components/RecordPaymentModal';
import { useDashboardStats } from '../hooks/useDashboardQueries';
import ReportBaselineBanner from '../../../shared/components/feedback/ReportBaselineBanner';
import { Avatar } from '../../../shared/components/ui/Avatar';

const Dashboard = () => {
    const { user, hasFeature } = useAuth();
    const navigate = useNavigate();
    const [todayModalOpen, setTodayModalOpen] = useState(false);
    const [paymentTxn, setPaymentTxn] = useState(null);

    // Socket-driven invalidation is centralized in app/RealtimeSync.jsx, which
    // flushes ['dashboard'] on member/transaction/expense events. No local
    // useGymSocket needed here — TQ picks it up automatically.
    const statsQuery = useDashboardStats();
    const stats = statsQuery.data;
    const loading = statsQuery.isPending;

    useEffect(() => {
        if (user && user.role === 'staff' && !user.permissions?.includes('dashboard')) {
            navigate('/members');
        }
    }, [user, navigate]);

    const METHOD_COLORS = { Cash: '#10b981', UPI: '#6366f1', Card: '#8b5cf6', 'Bank Transfer': '#06b6d4' };
    const STATUS_COLORS = { Paid: '#10b981', Pending: '#f59e0b', Partial: '#f97316', Refunded: '#3f3f46' };

    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;
    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-';

    if (loading) {
        return (
            <AppLayout title="Dashboard" description="Gym performance and revenue analytics" icon={FaChartPie} showGenderSwitch={false}>
                <div className="space-y-6 lg:pb-10">
                    <div className="h-36 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-[#2a2a2a] dark:to-[#1c1c1c] animate-pulse rounded-2xl w-full" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-white dark:bg-zinc-900 opacity-60 animate-pulse rounded-xl border border-gray-100 dark:border-zinc-800" />
                        ))}
                    </div>
                    <div className="h-80 bg-white dark:bg-zinc-900 opacity-60 animate-pulse rounded-2xl border border-gray-100 dark:border-zinc-800" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-64 bg-white dark:bg-zinc-900 opacity-60 animate-pulse rounded-2xl border border-gray-100 dark:border-zinc-800" />
                        <div className="h-64 bg-white dark:bg-zinc-900 opacity-60 animate-pulse rounded-2xl border border-gray-100 dark:border-zinc-800" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    const dailyByMethod = stats?.income?.dailyByMethod || [];
    const dailyByStatus = stats?.income?.dailyByStatus || [];
    const pendingPayments = stats?.pendingPayments || [];

    // simplePayments gyms don't track payment methods/dues — hide every money
    // figure on the dashboard (revenue, collected, pending, breakdown, amounts).
    const hidePayments = hasFeature('simplePayments');
    const expiringSoon = stats?.expiringSoon || [];
    const recentTransactions = stats?.recentTransactions || [];

    return (
        <AppLayout title="Dashboard" description="Gym performance and revenue analytics" icon={FaChartPie} showGenderSwitch={false}>
            <div className="space-y-6 lg:pb-10">

                <ReportBaselineBanner />

                {/* ── Daily Report ──────────────────────────────────────── */}
                <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <FaCalendarAlt className="text-zinc-900 dark:text-zinc-400" />
                        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Daily Report</h2>
                        <span className="text-sm text-zinc-900/80 dark:text-zinc-400 font-medium ml-auto">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Joined Today */}
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <FaUserPlus className="text-zinc-700 dark:text-zinc-400 text-sm" />
                                <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Joined Today</p>
                            </div>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white">{stats?.members?.joinedToday || 0}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">new members</p>
                        </div>

                        {!hidePayments && (<>
                        {/* Revenue Booked */}
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <FaChartLine className="text-zinc-700 dark:text-zinc-400 text-sm" />
                                <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Revenue</p>
                            </div>
                            <p className="text-2xl font-black text-gray-800 dark:text-white">{formatCurrency(stats?.income?.daily)}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{stats?.income?.dailyCount || 0} transactions</p>
                        </div>

                        {/* Collected — clickable */}
                        <button
                            onClick={() => setTodayModalOpen(true)}
                            className="bg-white dark:bg-zinc-900 p-4 rounded-xl border-2 border-green-500/50 dark:border-green-500/40 shadow-md hover:shadow-lg hover:border-green-500 dark:hover:border-green-500/70 transition-all text-left"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <FaMoneyCheckAlt className="text-green-600 dark:text-green-400 text-sm" />
                                <p className="text-[10px] uppercase font-bold text-green-600 dark:text-green-400 tracking-wider">Collected</p>
                            </div>
                            <p className="text-2xl font-black text-green-700 dark:text-green-400">{formatCurrency(stats?.income?.dailyActual)}</p>
                            <p className="text-[10px] text-green-600/70 dark:text-green-400/70 font-bold">View Breakdown →</p>
                        </button>

                        {/* Pending Today */}
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-yellow-400/50 dark:border-yellow-400/30 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <FaExclamationCircle className="text-yellow-600 dark:text-yellow-400 text-sm" />
                                <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Pending</p>
                            </div>
                            <p className="text-2xl font-black text-yellow-700 dark:text-yellow-400">
                                {formatCurrency(dailyByStatus.find(s => s._id === 'Pending')?.total || 0)}
                            </p>
                            <p className="text-[10px] text-yellow-600/70 dark:text-yellow-400/70 font-medium">
                                {dailyByStatus.find(s => s._id === 'Pending')?.count || 0} dues today
                            </p>
                        </div>
                        </>)}
                    </div>
                </div>


                {/* ── Recent Transactions ───────────────────────────────── */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <FaExchangeAlt className="text-zinc-900 text-sm" />
                            <h3 className="font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
                        </div>
                        <button
                            onClick={() => navigate('/transactions')}
                            className="text-xs text-zinc-900 hover:text-zinc-700 font-semibold transition-colors"
                        >
                            View All →
                        </button>
                    </div>

                    {recentTransactions.length === 0 ? (
                        <div className="text-center py-12">
                            <FaFileInvoiceDollar className="text-gray-300 dark:text-gray-600 text-3xl mx-auto mb-3" />
                            <p className="text-sm text-gray-400 dark:text-gray-500">No transactions yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                            {recentTransactions.map((txn) => (
                                <div
                                    key={txn._id}
                                    className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/invoice/${txn._id}`)}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar src={txn.memberProfileImage} name={txn.memberName}
                                            size="sm" variant="neutral" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{txn.memberName}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-400">{txn.plan} · {formatDate(txn.transactionDate)}</p>
                                        </div>
                                    </div>
                                    {!hidePayments && (
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                            txn.paymentStatus === 'Paid'
                                                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                : txn.paymentStatus === 'Pending'
                                                    ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                    : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                        }`}>
                                            {txn.paymentStatus}
                                        </span>
                                        <span className="text-sm font-bold text-gray-800 dark:text-white">{formatCurrency(txn.amount)}</span>
                                    </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Pending Payments + Expiring Soon ─────────────────── */}
                <div className={`grid grid-cols-1 gap-6 ${hidePayments ? '' : 'lg:grid-cols-2'}`}>

                    {/* Pending Payments */}
                    {!hidePayments && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <FaWallet className="text-yellow-500 text-sm" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Pending Payments</h3>
                                {pendingPayments.length > 0 && (
                                    <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-full font-bold">
                                        {pendingPayments.length}
                                    </span>
                                )}
                            </div>
                        </div>

                        {pendingPayments.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-sm text-gray-400 dark:text-gray-500">All payments up to date</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-zinc-800/50 max-h-64 overflow-y-auto">
                                {pendingPayments.map((p) => (
                                    <div
                                        key={p._id}
                                        className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.memberName}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-400">{p.plan}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{formatCurrency(p.amount)}</span>
                                            <button
                                                onClick={() => setPaymentTxn(p)}
                                                className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-white px-2 py-1 rounded-lg font-semibold transition-colors"
                                            >
                                                Collect
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Expiring Soon */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <FaUserClock className="text-orange-500 text-sm" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Expiring Soon</h3>
                                {expiringSoon.length > 0 && (
                                    <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-bold">
                                        {expiringSoon.length}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/inactivesoon')}
                                className="text-xs text-zinc-900 hover:text-zinc-700 font-semibold transition-colors"
                            >
                                View All →
                            </button>
                        </div>

                        {expiringSoon.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-sm text-gray-400 dark:text-gray-500">No members expiring soon</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-zinc-800/50 max-h-64 overflow-y-auto">
                                {expiringSoon.map((m) => (
                                    <div
                                        key={m._id}
                                        className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/members/${m._id}`)}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-7 h-7 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                {m.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{m.name}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-400">{m.plan}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <a
                                                href={`tel:${m.phone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 text-gray-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors"
                                            >
                                                <FaPhone className="text-xs" />
                                            </a>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                m.dews === 0
                                                    ? 'bg-zinc-50 text-zinc-900 dark:bg-zinc-800/30 dark:text-zinc-500'
                                                    : m.dews <= 3
                                                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                                                        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}>
                                                {m.dews === 0 ? 'Today' : `${m.dews}d`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* ── Today's Breakdown Modal (hidden entirely for simplePayments) ── */}
            {/* Mobile: bottom sheet (anchored to bottom, slides up, drag-handle).
                Desktop (sm+): centered modal. Same DOM, responsive classes flip
                anchor / radius / animation at the breakpoint. */}
            {todayModalOpen && !hidePayments && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setTodayModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-sheet-up sm:animate-modal-in pb-[env(safe-area-inset-bottom)]"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Today's breakdown"
                    >
                        {/* Drag-handle pill — mobile-only affordance for the bottom sheet */}
                        <div className="sm:hidden flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </div>
                        {/* Header */}
                        <div className="sticky top-0 bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700/30 p-6 rounded-t-3xl sm:rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                                        <FaCalendarAlt className="text-zinc-900" /> Today's Breakdown
                                    </h2>
                                    <p className="text-xs text-zinc-900/80 dark:text-white font-medium mt-1">
                                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setTodayModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
                                    aria-label="Close"
                                >×</button>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Booked</p>
                                    <p className="text-2xl font-black text-gray-800 dark:text-white">{formatCurrency(stats?.income?.daily)}</p>
                                    <p className="text-xs text-gray-400">{stats?.income?.dailyCount || 0} txns</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl p-3">
                                    <p className="text-[10px] uppercase font-bold text-green-600 tracking-wider">✓ Collected</p>
                                    <p className="text-2xl font-black text-green-700 dark:text-green-400">{formatCurrency(stats?.income?.dailyActual)}</p>
                                    <p className="text-xs text-green-600/70">paid only</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* By Method */}
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider mb-3">By Payment Method</h3>
                                {dailyByMethod.length > 0 ? (
                                    <div className="space-y-2">
                                        {dailyByMethod.map((m) => (
                                            <div
                                                key={m._id || 'unknown'}
                                                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-zinc-800"
                                                style={{ backgroundColor: `${METHOD_COLORS[m._id] || '#94a3b8'}10` }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: METHOD_COLORS[m._id] || '#94a3b8' }} />
                                                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">{m._id || 'Unknown'}</span>
                                                    <span className="text-xs text-gray-400">({m.count})</span>
                                                </div>
                                                <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(m.total)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic text-center py-4">No payments recorded today</p>
                                )}
                            </div>

                            {/* By Status */}
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider mb-3">By Status</h3>
                                {dailyByStatus.length > 0 ? (
                                    <div className="space-y-2">
                                        {dailyByStatus.map((s) => (
                                            <div
                                                key={s._id || 'unknown'}
                                                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-zinc-800"
                                                style={{ backgroundColor: `${STATUS_COLORS[s._id] || '#94a3b8'}10` }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[s._id] || '#94a3b8' }} />
                                                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">{s._id || 'Unknown'}</span>
                                                    <span className="text-xs text-gray-400">({s.count})</span>
                                                </div>
                                                <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(s.total)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic text-center py-4">No status data for today</p>
                                )}
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    onClick={() => { setTodayModalOpen(false); navigate('/transactions'); }}
                                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-sm transition-colors shadow-none"
                                >
                                    View All Transactions →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Collect Payment Modal ─────────────────────────────────── */}
            {paymentTxn && (
                <RecordPaymentModal
                    transactionId={paymentTxn._id}
                    totalAmount={paymentTxn.amount}
                    paidSoFar={paymentTxn.paidAmount || 0}
                    memberName={paymentTxn.memberName}
                    confirmCancel={!!(paymentTxn.pendingRenewal && !paymentTxn.pendingRenewal.applied)}
                    onClose={() => setPaymentTxn(null)}
                    onPaid={() => { setPaymentTxn(null); }}
                />
            )}
        </AppLayout>
    );
};

export default Dashboard;
