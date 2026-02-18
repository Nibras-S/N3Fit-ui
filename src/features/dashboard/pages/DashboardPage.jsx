import React, { useEffect, useState } from 'react';
import api from '../../../shared/services/api';
import AppLayout from '../../../shared/components/layout/AppLayout';
import {
    FaWallet, FaUsers, FaChartPie, FaRupeeSign, FaClock, FaCalendarAlt,
    FaArrowUp, FaArrowDown, FaMoneyCheckAlt, FaUserPlus, FaChartLine, FaChartBar,
    FaExclamationCircle, FaWhatsapp, FaPhone, FaUserClock, FaPercentage, FaCheck
} from 'react-icons/fa';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === 'staff') {
            navigate('/active');
            return;
        }
        fetchStats();
    }, [user]);
    const [collectingId, setCollectingId] = useState(null);
    const [collectMethod, setCollectMethod] = useState('Cash');
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const fetchStats = async () => {
        try {
            const [res, expenseRes] = await Promise.all([
                api.get(`${backendUrl}/api/transactions/stats`),
                api.get(`${backendUrl}/api/expenses/summary`)
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

    // Handle collect payment
    const handleCollectPayment = async (txnId) => {
        try {
            await api.put(`${backendUrl}/api/transactions/${txnId}/collect`, {
                paymentMethod: collectMethod
            });
            setCollectingId(null);
            setCollectMethod('Cash');
            // Refresh stats
            fetchStats();
        } catch (error) {
            console.error("Error collecting payment:", error);
            toast.error("Failed to collect payment");
        }
    };

    // Colors
    const METHOD_COLORS = { Cash: '#10b981', UPI: '#3b82f6', Card: '#8b5cf6', 'Bank Transfer': '#06b6d4' };
    const STATUS_COLORS = { Paid: '#10b981', Pending: '#f59e0b', Partial: '#f97316', Refunded: '#ef4444' };
    const PLAN_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4'];

    // Format currency
    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;

    if (loading) {
        return (
            <AppLayout showGenderSwitch={false}>
                <div className="flex items-center justify-center h-[80vh]">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
    const planData = stats?.income?.byPlan || [];
    const monthChange = stats?.income?.monthChange || 0;

    return (
        <AppLayout showGenderSwitch={false}>
            <div className="space-y-6 pb-10">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Complete business overview with revenue tracking</p>
                </div>

                {/* ========== DAILY REPORT SECTION ========== */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <FaCalendarAlt />
                        <h2 className="text-lg font-bold">Today's Daily Report</h2>
                        <span className="text-sm opacity-75 ml-auto">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
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
                </div>

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
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Yearly Revenue</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(stats?.income?.yearlyActual)}</p>
                        <p className="text-xs text-gray-400">{stats?.income?.yearlyCount || 0} transactions</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Outstanding Dues</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(stats?.income?.outstandingDues)}</p>
                        <p className="text-xs text-gray-400">{stats?.income?.outstandingCount || 0} pending</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
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
                        <div className="overflow-x-auto">
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
                                                    {collectingId === txn._id ? (
                                                        <>
                                                            <select
                                                                value={collectMethod}
                                                                onChange={(e) => setCollectMethod(e.target.value)}
                                                                className="text-xs border rounded px-1 py-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                            >
                                                                <option>Cash</option>
                                                                <option>UPI</option>
                                                                <option>Card</option>
                                                                <option>Bank Transfer</option>
                                                            </select>
                                                            <button
                                                                onClick={() => handleCollectPayment(txn._id)}
                                                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                            <button
                                                                onClick={() => setCollectingId(null)}
                                                                className="p-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 text-xs"
                                                            >
                                                                ✕
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => setCollectingId(txn._id)}
                                                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                                                            >
                                                                Collect
                                                            </button>
                                                            {txn.phone && (
                                                                <>
                                                                    <a href={`https://wa.me/91${txn.phone}?text=Hi ${txn.memberName}, this is a reminder regarding your pending gym fee of ${formatCurrency(txn.amount)}. Please clear the dues.`}
                                                                        target="_blank" rel="noopener noreferrer"
                                                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" title="Send WhatsApp">
                                                                        <FaWhatsapp />
                                                                    </a>
                                                                    <a href={`tel:${txn.phone}`}
                                                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" title="Call">
                                                                        <FaPhone />
                                                                    </a>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Plan Popularity */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800 dark:text-white">Plan Popularity</h3>
                            <FaChartPie className="text-gray-400" />
                        </div>
                        {planData.length > 0 ? (
                            <div className="space-y-3">
                                {planData.map((plan, idx) => {
                                    const maxCount = Math.max(...planData.map(p => p.count));
                                    const percentage = (plan.count / maxCount) * 100;
                                    return (
                                        <div key={plan._id} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-gray-700 dark:text-gray-200">{plan._id}</span>
                                                <span className="text-gray-500 dark:text-gray-400">{plan.count} members</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{ width: `${percentage}%`, backgroundColor: PLAN_COLORS[idx % PLAN_COLORS.length] }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-400">{formatCurrency(plan.total)} revenue</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-32 flex items-center justify-center text-gray-400">No plan data</div>
                        )}
                    </div>

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
                        <span className="text-xs text-gray-400">Last 10</span>
                    </div>
                    <div className="overflow-x-auto">
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
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
