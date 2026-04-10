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
    const METHOD_COLORS = { Cash: '#10b981', UPI: '#3b82f6', Card: '#8b5cf6', 'Bank Transfer': '#06b6d4' };
    const STATUS_COLORS = { Paid: '#10b981', Pending: '#f59e0b', Partial: '#f97316', Refunded: '#ef4444' };
    const PLAN_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4']; // kept for potential future use

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
            <div className="space-y-6 pb-10">                {/* ========== DAILY REPORT SECTION ========== */}
                <button
                    type="button"
                    onClick={() => setTodayModalOpen(true)}
                    className="w-full text-left bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transition-all"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <FaCalendarAlt />
                        <h2 className="text-lg font-bold">dinDaily Report</h2>
                        <span className="text-sm opacity-75 ml-auto">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {/* Booked Total */}
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <p className="text-xs uppercase opacity-75 mb-1">Booked Total</p>
                            <p className="text-xl font-bold">{formatCurrency(stats?.income?.daily)}</p>
                            <p className="text-xs opacity-75">{stats?.income?.dailyCount || 0} transactions</p>
                        </div>

                        {/* Actual Revenue */}
                        <div className="bg-green-500/20 backdrop-blur rounded-xl p-4 border border-green-400/30">
                            <p className="text-xs uppercase opacity-75 mb-1">✓ Actual Revenue</p>
                            <p className="text-xl font-bold text-green-300">{formatCurrency(stats?.income?.dailyActual)}</p>
                            <p className="text-xs opacity-75">Paid only</p>
                        </div>

                        {/* Cash */}
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                <p className="text-xs uppercase opacity-75">Cash</p>
                            </div>
                            <p className="text-lg font-bold">
                                {formatCurrency(dailyByMethod.find(m => m._id === 'Cash')?.total || 0)}
                            </p>
                            <p className="text-xs opacity-75">
                                {dailyByMethod.find(m => m._id === 'Cash')?.count || 0} payments
                            </p>
                        </div>

                        {/* UPI */}
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                <p className="text-xs uppercase opacity-75">UPI</p>
                            </div>
                            <p className="text-lg font-bold">
                                {formatCurrency(dailyByMethod.find(m => m._id === 'UPI')?.total || 0)}
                            </p>
                            <p className="text-xs opacity-75">
                                {dailyByMethod.find(m => m._id === 'UPI')?.count || 0} payments
                            </p>
                        </div>

                        {/* Pending */}
                        <div className="bg-yellow-500/20 backdrop-blur rounded-xl p-4 border border-yellow-400/30">
                            <div className="flex items-center gap-2 mb-1">
                                <FaExclamationCircle className="text-yellow-300" />
                                <p className="text-xs uppercase opacity-75">Pending</p>
                            </div>
                            <p className="text-lg font-bold text-yellow-300">
                                {formatCurrency(dailyByStatus.find(s => s._id === 'Pending')?.total || 0)}
                            </p>
                            <p className="text-xs opacity-75">
                                {dailyByStatus.find(s => s._id === 'Pending')?.count || 0} dues
                            </p>
                        </div>
                    </div>
                </button>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Monthly Revenue</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats?.income?.monthlyActual)}</p>
                        <div className="flex items-center gap-1 mt-1">
                            {monthChange !== 0 && (
                                <span className={`text-xs font-medium flex items-center gap-0.5 ${monthChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {monthChange > 0 ? <FaArrowUp /> : <FaArrowDown />}
                                    {Math.abs(monthChange)}%
                                </span>
                            )}
                            <span className="text-xs text-gray-400">vs last month</span>
                        </div>
                    </div>
                    <div className="hidden sm:block bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Yearly Revenue</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(stats?.income?.yearlyActual)}</p>
                        <p className="text-xs text-gray-400">{stats?.income?.yearlyCount || 0} transactions</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Outstanding Dues</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(stats?.income?.outstandingDues)}</p>
                        <p className="text-xs text-gray-400">{stats?.income?.outstandingCount || 0} pending</p>
                    </div>
                    <div className="hidden sm:block bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Active Members</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{stats?.members?.active || 0}</p>
                        <p className="text-xs text-gray-400">of {stats?.members?.total || 0} total</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Net Profit</p>
                        <p className={`text-xl font-bold ${stats?.expenses?.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(stats?.expenses?.netProfit)}
                        </p>
                        <p className="text-xs text-gray-400">Revenue - Expenses</p>
                    </div>
                </div>


                {/* ========== PENDING PAYMENTS SECTION ========== */}
                {pendingPayments.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/20 p-5 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FaExclamationCircle className="text-yellow-600 dark:text-yellow-400" />
                                <h3 className="font-bold text-yellow-800 dark:text-yellow-400">Pending Payments - Follow Up</h3>
                            </div>
                            <span className="text-xs bg-yellow-200 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full font-medium">
                                {formatCurrency(stats?.income?.outstandingDues)} outstanding
                            </span>
                        </div>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-yellow-200 dark:border-yellow-900/30">
                                        <th className="pb-2 text-xs font-semibold text-yellow-700 dark:text-yellow-500 uppercase">Member</th>
                                        <th className="pb-2 text-xs font-semibold text-yellow-700 dark:text-yellow-500 uppercase">Date</th>
                                        <th className="pb-2 text-xs font-semibold text-yellow-700 dark:text-yellow-500 uppercase">Amount</th>
                                        <th className="pb-2 text-xs font-semibold text-yellow-700 dark:text-yellow-500 uppercase">Status</th>
                                        <th className="pb-2 text-xs font-semibold text-yellow-700 dark:text-yellow-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingPayments.slice(0, 10).map((txn) => (
                                        <tr key={txn._id} className="border-b border-yellow-100 dark:border-yellow-900/10 last:border-0">
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-yellow-200 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 flex items-center justify-center text-xs font-bold">
                                                        {txn.memberName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200 text-sm block">{txn.memberName}</span>
                                                        {txn.phone && <span className="text-xs text-gray-500 dark:text-gray-400">{txn.phone}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(txn.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </td>
                                            <td className="py-3 font-bold text-red-600 dark:text-red-400">{formatCurrency(txn.amount)}</td>
                                            <td className="py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${txn.paymentStatus === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
                                                    {txn.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex gap-2 items-center">
                                                    <button
                                                        onClick={() => setPaymentTxn(txn)}
                                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                                                    >
                                                        Mark as Paid
                                                    </button>
                                                    {txn.phone && (
                                                        <a href={`https://wa.me/${txn.phone.replace(/[^\d]/g, '').replace(/^(\d{10})$/, '91$1')}?text=Hi ${txn.memberName}, this is a reminder regarding your pending gym fee of ${formatCurrency(txn.amount)}. Please clear the dues.`}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" title="Send WhatsApp">
                                                            <FaWhatsapp />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3">
                            {pendingPayments.slice(0, 10).map((txn) => (
                                <div key={txn._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-yellow-200/50 dark:border-yellow-900/20">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-9 rounded-full bg-yellow-200 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 flex items-center justify-center text-sm font-bold">
                                                {txn.memberName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{txn.memberName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(txn.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-600 dark:text-red-400">{formatCurrency(txn.amount)}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${txn.paymentStatus === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
                                                {txn.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPaymentTxn(txn)} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-medium">Mark as Paid</button>
                                        {txn.phone && (
                                            <a href={`https://wa.me/${txn.phone.replace(/[^\d]/g, '').replace(/^(\d{10})$/, '91$1')}?text=Hi ${txn.memberName}, reminder for pending fee of ${formatCurrency(txn.amount)}.`}
                                                target="_blank" rel="noopener noreferrer" className="p-2 bg-green-500 text-white rounded-lg"><FaWhatsapp size={14} /></a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Payment Method Breakdown */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800 dark:text-white">Payment Methods</h3>
                            <FaMoneyCheckAlt className="text-gray-400" />
                        </div>
                        <div className="space-y-3">
                            {(stats?.income?.byMethod || []).map((item) => (
                                <div key={item._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-700 dark:bg-slate-700/30" style={{ backgroundColor: `${METHOD_COLORS[item._id]}10` }}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: METHOD_COLORS[item._id] || '#94a3b8' }}></div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item._id || 'Unknown'}</span>
                                        <span className="text-xs text-gray-400">({item.count})</span>
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(item.total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 6-Month Trend Chart */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800 dark:text-white">6-Month Trend</h3>
                            <FaChartBar className="text-gray-400" />
                        </div>
                        {trendData.length > 0 ? (
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" opacity={0.2} />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-400">No trend data</div>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 dark:text-white">Recent Transactions</h3>
                        <button onClick={() => navigate('/transactions')} className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">View All →</button>
                    </div>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-700">
                                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Member</th>
                                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Plan</th>
                                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Method</th>
                                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recentTransactions?.map((txn) => (
                                    <tr key={txn._id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                                    {txn.memberName?.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{txn.memberName}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(txn.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{txn.plan}</td>
                                        <td className="py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${txn.paymentMethod === 'Cash' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                                                txn.paymentMethod === 'UPI' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                                                }`}>
                                                {txn.paymentMethod || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="py-3 font-bold text-gray-800 dark:text-white">{formatCurrency(txn.amount)}</td>
                                        <td className="py-3">
                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${txn.paymentStatus === 'Paid' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                                                txn.paymentStatus === 'Pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${txn.paymentStatus === 'Paid' ? 'bg-green-500' :
                                                    txn.paymentStatus === 'Pending' ? 'bg-yellow-500' : 'bg-orange-500'
                                                    }`}></span>
                                                {txn.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-gray-400">
                                            No transactions found. Add members to start tracking.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                        {stats?.recentTransactions?.map((txn) => (
                            <div key={txn._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">
                                    {txn.memberName?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">{txn.memberName}</p>
                                        <p className="font-bold text-gray-800 dark:text-white text-sm shrink-0 ml-2">{formatCurrency(txn.amount)}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(txn.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{txn.plan}</span>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${txn.paymentStatus === 'Paid' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                                            txn.paymentStatus === 'Pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${txn.paymentStatus === 'Paid' ? 'bg-green-500' : txn.paymentStatus === 'Pending' ? 'bg-yellow-500' : 'bg-orange-500'}`}></span>
                                            {txn.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                            <div className="text-center py-8 text-gray-400">
                                No transactions found. Add members to start tracking.
                            </div>
                        )}
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
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <FaCalendarAlt /> Today's Income Breakdown
                                    </h2>
                                    <p className="text-xs opacity-80 mt-1">
                                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setTodayModalOpen(false)}
                                    className="text-white/80 hover:text-white text-2xl leading-none"
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                    <p className="text-xs uppercase opacity-75">Booked</p>
                                    <p className="text-2xl font-black">{formatCurrency(stats?.income?.daily)}</p>
                                    <p className="text-xs opacity-75">{stats?.income?.dailyCount || 0} txns</p>
                                </div>
                                <div className="bg-green-500/20 backdrop-blur rounded-xl p-3 border border-green-400/30">
                                    <p className="text-xs uppercase opacity-75">✓ Actual</p>
                                    <p className="text-2xl font-black text-green-200">{formatCurrency(stats?.income?.dailyActual)}</p>
                                    <p className="text-xs opacity-75">paid only</p>
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
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
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
