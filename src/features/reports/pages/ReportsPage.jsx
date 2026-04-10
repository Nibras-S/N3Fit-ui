import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaChartPie, FaWallet, FaArrowUp, FaArrowDown,
    FaUsers, FaSync, FaArrowRight
} from 'react-icons/fa';
import api from '../../../shared/services/api';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import AppLayout from '../../../shared/components/layout/AppLayout';
import PageHeader from '../../../shared/components/layout/PageHeader';
import DateRangeFilter, { computePresetRange } from '../components/DateRangeFilter';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

const ReportsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        kpi: { totalIncome: 0, totalExpense: 0, netProfit: 0, activeMembers: 0 },
        financialChart: [],
        expenseBreakdown: [],
        memberChart: []
    });

    // Filter shape: { preset, startDate, endDate, interval }.
    // The interval is derived from the preset (long ranges → monthly, short
    // → daily) so the chart never tries to render 365 daily bars.
    const [filter, setFilter] = useState({
        preset: 'all_time',
        startDate: '',
        endDate: '',
        interval: 'monthly',
    });

    const fetchReports = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ interval: filter.interval });
            if (filter.startDate) params.set('startDate', filter.startDate);
            if (filter.endDate) params.set('endDate', filter.endDate);

            const res = await api.get(`/reports/dashboard?${params.toString()}`);
            setData(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    /**
     * Choose a sensible chart granularity for a given range. We don't expose
     * this to the user — the math is mechanical: ≤ 14 days → daily, ≤ 90 days
     * → daily (still readable), longer → monthly. Avoids the "62 daily bars
     * crammed into a chart" problem when the user picks This Year.
     */
    const intervalForRange = (startDate, endDate) => {
        if (!startDate || !endDate) return 'monthly';
        const days = Math.round(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000
        );
        if (days <= 90) return 'daily';
        if (days <= 730) return 'monthly';
        return 'yearly';
    };

    const handleFilterChange = (next) => {
        // next = { preset, startDate, endDate } from DateRangeFilter
        setFilter({
            ...next,
            interval: intervalForRange(next.startDate, next.endDate),
        });
    };

    /**
     * When the user clicks a KPI card we navigate to the matching detail
     * page and forward the current date filter on the URL so the detail
     * page boots up scoped to the same window.
     */
    const drillTo = (path) => {
        const params = new URLSearchParams();
        if (filter.preset && filter.preset !== 'all_time') params.set('preset', filter.preset);
        if (filter.startDate) params.set('startDate', filter.startDate);
        if (filter.endDate) params.set('endDate', filter.endDate);
        const qs = params.toString();
        navigate(qs ? `${path}?${qs}` : path);
    };

    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;

    // True when the API returned data but every meaningful field is zero —
    // we use this to swap the chart area for a Members-style empty state
    // instead of showing four blank graphs.
    const isEmpty = !loading
        && (data.kpi.totalIncome || 0) === 0
        && (data.kpi.totalExpense || 0) === 0
        && (data.financialChart || []).length === 0;

    /**
     * Empty state — modeled after MembersPage.EmptySearchState so the
     * Reports page feels at home with the rest of the app.
     */
    const ReportsEmptyState = () => (
        <div className="flex flex-col items-center justify-center py-24 px-6 relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            {/* Concentric rings background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60 dark:opacity-40">
                <div className="absolute w-[200px] h-[200px] rounded-full border border-gray-200 dark:border-slate-700" />
                <div className="absolute w-[360px] h-[360px] rounded-full border border-gray-200 dark:border-slate-700" />
                <div className="absolute w-[520px] h-[520px] rounded-full border border-gray-200 dark:border-slate-700 shadow-sm" />
                <div className="absolute w-[680px] h-[680px] rounded-full border border-gray-200 dark:border-slate-700" />
            </div>

            {/* Center icon */}
            <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 flex items-center justify-center mb-6 shadow-sm z-10">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center">
                    <FaChartPie className="text-gray-400" size={20} />
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1.5 z-10">No data for this period</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 z-10 w-full max-w-sm">
                There are no transactions or expenses in the selected range. Try a different preset, or come back after recording some activity.
            </p>

            <div className="flex items-center gap-3 z-10">
                <button
                    onClick={() => handleFilterChange({ ...computePresetRange('all_time'), preset: 'all_time' })}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all font-medium text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-2 text-sm"
                >
                    Show all time
                </button>
                <button
                    onClick={fetchReports}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 text-sm"
                >
                    <FaSync size={12} /> Refresh
                </button>
            </div>
        </div>
    );

    if (loading && !data.financialChart.length) {
        return (
            <AppLayout showGenderSwitch={false}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout showGenderSwitch={false}>
            <div className="max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Financial Dashboard"
                description="Complete business overview with revenue tracking"
                icon={FaChartPie}
                action={
                    <>
                        <button
                            onClick={fetchReports}
                            disabled={loading}
                            title="Refresh"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-gray-200 dark:border-slate-700"
                        >
                            <FaSync size={13} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <DateRangeFilter value={filter} onChange={handleFilterChange} />
                    </>
                }
            />

            {/* KPI Cards — every card is a navigation entry into its detail page.
                Hover styles include a subtle ring + arrow to make affordance obvious. */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Income → /reports/income */}
                <button
                    onClick={() => drillTo('/reports/income')}
                    className="text-left bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-lg hover:border-green-200 dark:hover:border-green-800 hover:-translate-y-0.5 transition-all"
                >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                            <FaArrowUp size={20} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">Income</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(data.kpi.totalIncome)}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center justify-between">
                        <span>Total Revenue Generated</span>
                        <FaArrowRight size={11} className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" />
                    </p>
                </button>

                {/* Expenses → /reports/expense */}
                <button
                    onClick={() => drillTo('/reports/expense')}
                    className="text-left bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-lg hover:border-red-200 dark:hover:border-red-800 hover:-translate-y-0.5 transition-all"
                >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                            <FaArrowDown size={20} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full">Expense</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(data.kpi.totalExpense)}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center justify-between">
                        <span>Total Operational Cost</span>
                        <FaArrowRight size={11} className="text-gray-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
                    </p>
                </button>

                {/* Net Profit — non-clickable for now (no detail page yet).
                    Marked with cursor-default so users don't expect a drill-in. */}
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

                {/* Active Members → /members */}
                <button
                    onClick={() => navigate('/members?tab=active')}
                    className="text-left bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 hover:-translate-y-0.5 transition-all"
                >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                            <FaUsers size={20} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full">Active</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{data.kpi.activeMembers}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center justify-between">
                        <span>Current Subscribed Members</span>
                        <FaArrowRight size={11} className="text-gray-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
                    </p>
                </button>
            </div>

            {isEmpty ? (
                <ReportsEmptyState />
            ) : (
                <>
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
                </>
            )}
            </div>
        </AppLayout>
    );
};

export default ReportsPage;
