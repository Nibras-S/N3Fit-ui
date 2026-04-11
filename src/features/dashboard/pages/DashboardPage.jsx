import React, { useEffect, useState } from 'react';
import api from '../../../shared/services/api';
import AppLayout from '../../../shared/components/layout/AppLayout';
import PageHeader from '../../../shared/components/layout/PageHeader';
import {
    FaWallet, FaUsers, FaChartPie, FaRupeeSign, FaClock, FaCalendarAlt,
    FaArrowUp, FaArrowDown, FaMoneyCheckAlt, FaUserPlus, FaChartLine, FaChartBar,
    FaExclamationCircle, FaWhatsapp, FaPhone, FaUserClock, FaPercentage
} from 'react-icons/fa';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RecordPaymentModal from '../../members/components/RecordPaymentModal';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [todayModalOpen, setTodayModalOpen] = useState(false);

    useEffect(() => {
        if (user && user.role === 'staff' && !user.permissions?.includes('dashboard')) {
            navigate('/members');
            return;
        }
        fetchStats();
    }, [user]);
    const [paymentTxn, setPaymentTxn] = useState(null);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const fetchStats = async () => {
        try {
            const [res, expenseRes] = await Promise.all([
                api.get(`/transactions/stats`),
                api.get(`/expenses/summary`)
            ]);
            setStats({ ...res.data, expenses: expenseRes.data });
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [backendUrl]);

    // Colors
    const METHOD_COLORS = { Cash: '#10b981', UPI: '#6366f1', Card: '#8b5cf6', 'Bank Transfer': '#06b6d4' };
    const STATUS_COLORS = { Paid: '#10b981', Pending: '#f59e0b', Partial: '#f97316', Refunded: '#f43f5e' };
    const PLAN_COLORS = ['#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4']; // brand rose first

    // Format currency
    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;

    if (loading) {
        return (
            <AppLayout title="Dashboard" description="Gym performance and revenue analytics" icon={FaChartPie} showGenderSwitch={false}>
                <div className="space-y-6 pb-10">
                    <div className="h-28 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700/50 dark:to-slate-600/50 animate-pulse rounded-2xl w-full"></div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-24 bg-white dark:bg-slate-800 opacity-60 animate-pulse rounded-xl border border-gray-100 dark:border-slate-700"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-[450px] bg-white dark:bg-slate-800 opacity-60 animate-pulse rounded-2xl border border-gray-100 dark:border-slate-700"></div>
                        <div className="h-[450px] bg-white dark:bg-slate-800 opacity-60 animate-pulse rounded-2xl border border-gray-100 dark:border-slate-700"></div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Prepare data
    const dailyByMethod = stats?.income?.dailyByMethod || [];
    const dailyByStatus = stats?.income?.dailyByStatus || [];
    const trendData = stats?.monthlyTrend || [];
    const pendingPayments = stats?.pendingPayments || [];
    const expiringSoon = stats?.expiringSoon || [];
    const monthChange = stats?.income?.monthChange || 0;

    return (
        <AppLayout title="Dashboard" description="Gym performance and revenue analytics" icon={FaChartPie} showGenderSwitch={false}>
            <div className="space-y-6 pb-10">
                {/* ========== DAILY REPORT SECTION ========== */}
                <div className="bg-brand-50 border border-brand-100 p-6 rounded-2xl shadow-sm transition-all">
                    <div className="flex items-center gap-2 mb-6">
                        <FaCalendarAlt className="text-brand-600" />
                        <h2 className="text-lg font-bold text-brand-800">Daily Report</h2>
                        <span className="text-sm text-brand-600/80 font-medium ml-auto">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Joined Today */}
                        <div className="bg-white p-4 rounded-xl border border-brand-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <FaUserPlus className="text-brand-500 text-sm" />
                                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Joined Today</p>
                            </div>
                            <p className="text-2xl font-black text-brand-600">{stats?.members?.joinedToday || 0}</p>
                            <p className="text-[10px] text-gray-400 font-medium">new members</p>
                        </div>

                        {/* Revenue (Booked) */}
                        <div className="bg-white p-4 rounded-xl border border-brand-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <FaChartLine className="text-blue-500 text-sm" />
                                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Revenue</p>
                            </div>
                            <p className="text-2xl font-black text-gray-800">{formatCurrency(stats?.income?.daily)}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{stats?.income?.dailyCount || 0} transactions</p>
                        </div>

                        {/* Collected (Actual) */}
                        <button
                            onClick={() => setTodayModalOpen(true)}
                            className="bg-white p-4 rounded-xl border-2 border-green-500/50 shadow-md hover:shadow-lg hover:border-green-500 transition-all text-left"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <FaMoneyCheckAlt className="text-green-600 text-sm" />
                                <p className="text-[10px] uppercase font-bold text-green-600 tracking-wider">Collected</p>
                            </div>
                            <p className="text-2xl font-black text-green-700">{formatCurrency(stats?.income?.dailyActual)}</p>
                            <p className="text-[10px] text-green-600/70 font-bold flex items-center gap-1">
                                View Breakdown →
                            </p>
                        </button>

                        {/* Pending */}
                        <div className="bg-white p-4 rounded-xl border border-yellow-400/50 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <FaExclamationCircle className="text-yellow-600 text-sm" />
                                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Pending</p>
                            </div>
                            <p className="text-2xl font-black text-yellow-700">{formatCurrency(dailyByStatus.find(s => s._id === 'Pending')?.total || 0)}</p>
                            <p className="text-[10px] text-yellow-600/70 font-medium">{dailyByStatus.find(s => s._id === 'Pending')?.count || 0} dues today</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== TODAY'S BREAKDOWN MODAL ========== */}
            {todayModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setTodayModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-brand-50 border-b border-brand-100 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-brand-800">
                                        <FaCalendarAlt className="text-brand-600" /> Today's Income Breakdown
                                    </h2>
                                    <p className="text-xs text-brand-600/80 font-medium mt-1">
                                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setTodayModalOpen(false)}
                                    className="text-brand-400 hover:text-brand-600 text-2xl leading-none"
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="bg-white border border-brand-100 rounded-xl p-3">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Booked</p>
                                    <p className="text-2xl font-black text-gray-800">{formatCurrency(stats?.income?.daily)}</p>
                                    <p className="text-xs text-gray-400">{stats?.income?.dailyCount || 0} txns</p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                                    <p className="text-[10px] uppercase font-bold text-green-600 tracking-wider">✓ Actual</p>
                                    <p className="text-2xl font-black text-green-700">{formatCurrency(stats?.income?.dailyActual)}</p>
                                    <p className="text-xs text-green-600/70 font-medium">paid only</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* By Method */}
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider mb-3">By Payment Method</h3>
                                {dailyByMethod.length > 0 ? (
                                    <div className="space-y-2">
                                        {dailyByMethod.map((m) => (
                                            <div
                                                key={m._id || 'unknown'}
                                                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-700"
                                                style={{ backgroundColor: `${METHOD_COLORS[m._id] || '#94a3b8'}10` }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: METHOD_COLORS[m._id] || '#94a3b8' }}></div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-200">{m._id || 'Unknown'}</span>
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
                                                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-700"
                                                style={{ backgroundColor: `${STATUS_COLORS[s._id] || '#94a3b8'}10` }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[s._id] || '#94a3b8' }}></div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-200">{s._id || 'Unknown'}</span>
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

                            {/* Footer link */}
                            <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                <button
                                    onClick={() => { setTodayModalOpen(false); navigate('/transactions'); }}
                                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-brand-200"
                                >
                                    View All Transactions →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {paymentTxn && (
                <RecordPaymentModal
                    transactionId={paymentTxn._id}
                    totalAmount={paymentTxn.amount}
                    paidSoFar={paymentTxn.paidAmount || 0}
                    memberName={paymentTxn.memberName}
                    onClose={() => setPaymentTxn(null)}
                    onPaid={() => { setPaymentTxn(null); fetchStats(); }}
                />
            )}
        </AppLayout>
    );
};

export default Dashboard;
