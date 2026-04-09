import React, { useState, useEffect } from 'react';
import {
    FaChartPie, FaWallet, FaArrowUp, FaArrowDown,
    FaCalendarAlt, FaUsers, FaUserPlus, FaUserMinus
} from 'react-icons/fa';
import api from '../../../shared/services/api';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

const ReportsPage = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        kpi: { totalIncome: 0, totalExpense: 0, netProfit: 0, activeMembers: 0 },
        financialChart: [],
        expenseBreakdown: [],
        memberChart: []
    });

    const [filter, setFilter] = useState({
        interval: 'monthly',
        startDate: '',
        endDate: ''
    });

    const fetchReports = async () => {
        try {
            setLoading(true);
            let url = `/reports/dashboard?interval=${filter.interval}`;
            if (filter.startDate) url += `&startDate=${filter.startDate}`;
            if (filter.endDate) url += `&endDate=${filter.endDate}`;

            const res = await api.get(url);
            setData(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const handlePresetChange = (preset) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();
        let interval = 'daily';

        switch (preset) {
            case 'this_month':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                interval = 'daily';
                break;
            case 'last_month':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                interval = 'daily';
                break;
            case 'this_year':
                start = new Date(today.getFullYear(), 0, 1);
                interval = 'monthly';
                break;
            default:
                start = '';
                end = '';
                interval = 'monthly';
        }

        setFilter({
            interval,
            startDate: start ? start.toISOString().split('T')[0] : '',
            endDate: end ? end.toISOString().split('T')[0] : ''
        });
    };

    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;

    if (loading && !data.financialChart.length) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FaChartPie className="text-blue-500" />
                        Comprehensive Reports
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Financial & Member Analytics Dashboard</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        onChange={(e) => handlePresetChange(e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="all_time">All Time</option>
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="this_year">This Year</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Income */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                            <FaArrowUp size={20} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">Income</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(data.kpi.totalIncome)}</h3>
                    <p className="text-sm text-gray-500 mt-1">Total Revenue Generated</p>
                </div>

                {/* Expenses */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                            <FaArrowDown size={20} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full">Expense</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(data.kpi.totalExpense)}</h3>
                    <p className="text-sm text-gray-500 mt-1">Total Operational Cost</p>
                </div>

                {/* Net Profit */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                            <FaWallet size={20} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">Profit</span>
                    </div>
                    <h3 className={`text-3xl font-black ${data.kpi.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(data.kpi.netProfit)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Net Income Retained</p>
                </div>

                {/* Active Members */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                            <FaUsers size={20} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full">Active</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{data.kpi.activeMembers}</h3>
                    <p className="text-sm text-gray-500 mt-1">Current Subscribed Members</p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Financial Overview (Bar Chart) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Financial Overview (Income vs Expense)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.financialChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Breakdown (Pie Chart) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Expense Breakdown</h3>
                    <p className="text-xs text-gray-500 mb-6">Category wise distribution</p>
                    {data.expenseBreakdown.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.expenseBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.expenseBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-3 mt-4">
                                {data.expenseBreakdown.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        {entry.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-sm text-gray-400 italic">No expense data for this period</div>
                    )}
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Net Profit Flow (Area Chart) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Net Profit Growth</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.financialChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `${value >= 1000 ? (value / 1000) + 'k' : value}`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Member Retention & Churn (Line Chart) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Member Activity vs Expiry Rate</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.memberChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="joined" name="New Members" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="expired" name="Expired Members" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReportsPage;
