import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FaArrowLeft, FaArrowDown, FaReceipt, FaChartLine,
    FaTags, FaStore, FaSync,
} from 'react-icons/fa';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import AppLayout from '../../../shared/components/layout/AppLayout';
import PageHeader from '../../../shared/components/layout/PageHeader';
import DateRangeFilter, { computePresetRange } from '../components/DateRangeFilter';
import ExportMenu from '../components/ExportMenu';
import { useExpenseReport } from '../hooks/useReportsQueries';
import ReportBaselineBanner from '../../../shared/components/feedback/ReportBaselineBanner';

const COLORS = ['#3f3f46', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#6366f1'];

const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;
const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

/**
 * ExpenseDetailPage — drill-down for the Expense KPI on the Reports page.
 *
 * Same architecture as IncomeDetailPage: URL-mirrored filter, server-side
 * aggregation, three breakdowns (category / method / vendor) and a full
 * expense list with per-section export menus.
 */
const ExpenseDetailPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [filter, setFilter] = useState(() => {
        const preset = searchParams.get('preset') || 'this_month';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        if (startDate || endDate) {
            return { preset: preset || 'custom', startDate: startDate || '', endDate: endDate || '' };
        }
        return { preset, ...computePresetRange(preset) };
    });

    const EMPTY = useMemo(() => ({
        kpi: { totalExpense: 0, expenseCount: 0, avgExpense: 0, largestCategory: '—', largestVendor: '—' },
        trend: [],
        byCategory: [],
        byMethod: [],
        byVendor: [],
        expenses: [],
    }), []);

    const query = useExpenseReport(filter);
    const data = query.data || EMPTY;
    const loading = query.isLoading || query.isFetching;
    const fetchData = () => query.refetch();

    useEffect(() => {
        const next = new URLSearchParams();
        if (filter.preset) next.set('preset', filter.preset);
        if (filter.startDate) next.set('startDate', filter.startDate);
        if (filter.endDate) next.set('endDate', filter.endDate);
        setSearchParams(next, { replace: true });
    }, [filter, setSearchParams]);

    const buildExpenseExport = () => ({
        filename: 'expenses',
        title: 'Expense Report',
        subtitle: filter.startDate ? `${filter.startDate} → ${filter.endDate}` : 'All time',
        columns: [
            { key: 'date',          label: 'Date' },
            { key: 'category',      label: 'Category' },
            { key: 'vendor',        label: 'Vendor' },
            { key: 'amount',        label: 'Amount (₹)' },
            { key: 'paymentMethod', label: 'Method' },
            { key: 'note',          label: 'Note' },
        ],
        rows: data.expenses.map(e => ({
            date:          formatDate(e.date),
            category:      e.category || '',
            vendor:        e.vendor || '',
            amount:        Number(e.amount || 0),
            paymentMethod: e.paymentMethod || '',
            note:          e.note || '',
        })),
    });

    const buildCategoryExport = () => ({
        filename: 'expenses-by-category',
        title: 'Expenses by Category',
        subtitle: filter.startDate ? `${filter.startDate} → ${filter.endDate}` : 'All time',
        columns: [
            { key: 'category', label: 'Category' },
            { key: 'count',    label: 'Entries' },
            { key: 'total',    label: 'Total (₹)' },
        ],
        rows: data.byCategory.map(c => ({
            category: c.category,
            count: c.count,
            total: Number(c.total || 0),
        })),
    });

    const trendData = useMemo(() => data.trend, [data.trend]);

    return (
        <AppLayout showGenderSwitch={false}>
            <div className="max-w-7xl mx-auto space-y-6">
                <ReportBaselineBanner />
                <button
                    onClick={() => navigate('/reports')}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm -mb-2"
                >
                    <FaArrowLeft size={11} /> Back to Reports
                </button>
                <PageHeader
                    title="Expense Report"
                    description="Where the money goes — by category, vendor, and payment method"
                    icon={FaArrowDown}
                    action={
                        <>
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="p-2 text-gray-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-lg border border-gray-200 dark:border-zinc-800 transition-colors"
                                title="Refresh"
                            >
                                <FaSync size={13} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <DateRangeFilter value={filter} onChange={setFilter} />
                            <ExportMenu
                                getExportData={buildExpenseExport}
                                disabled={data.expenses.length === 0}
                            />
                        </>
                    }
                />

                {/* KPI Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <KpiTile label="Total Spent" value={formatCurrency(data.kpi.totalExpense)} icon={<FaArrowDown />} color="red" loading={loading} />
                    <KpiTile label="Entries" value={data.kpi.expenseCount.toLocaleString('en-IN')} icon={<FaReceipt />} color="blue" loading={loading} />
                    <KpiTile label="Avg per Entry" value={formatCurrency(data.kpi.avgExpense)} icon={<FaChartLine />} color="rose" loading={loading} />
                    <KpiTile label="Top Category" value={data.kpi.largestCategory} icon={<FaTags />} color="amber" loading={loading} />
                    <KpiTile label="Top Vendor" value={data.kpi.largestVendor} icon={<FaStore />} color="violet" loading={loading} />
                </div>

                {/* Trend chart */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expense Trend</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Daily spend inside the selected range</p>
                        </div>
                    </div>
                    <div className="h-72">
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3f3f46" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3f3f46" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="expense" stroke="#3f3f46" strokeWidth={2.5} fill="url(#expenseGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : <EmptyChart />}
                    </div>
                </div>

                {/* Breakdowns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* By Category */}
                    <BreakdownCard
                        title="By Category"
                        subtitle="What kind of expense costs the most"
                        exportData={buildCategoryExport}
                    >
                        {data.byCategory.length > 0 ? (
                            <div className="h-64 flex items-center">
                                <div className="w-1/2 h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.byCategory}
                                                dataKey="total"
                                                nameKey="category"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={3}
                                                stroke="none"
                                            >
                                                {data.byCategory.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v) => formatCurrency(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-1/2 space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {data.byCategory.map((c, i) => (
                                        <div key={c.category} className="flex items-center gap-2 text-xs">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-gray-600 dark:text-gray-300 flex-1 truncate">{c.category}</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(c.total)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : <EmptyChart />}
                    </BreakdownCard>

                    {/* By Method */}
                    <BreakdownCard
                        title="By Payment Method"
                        subtitle="How expenses are paid"
                    >
                        {data.byMethod.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.byMethod} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                                        <XAxis dataKey="method" tick={{ fontSize: 11, fill: '#64748b' }} />
                                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
                                        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Bar dataKey="total" fill="#3f3f46" radius={[6, 6, 0, 0]} maxBarSize={60} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : <EmptyChart />}
                    </BreakdownCard>
                </div>

                {/* Top vendors */}
                <BreakdownCard
                    title="Top Vendors"
                    subtitle="Where the most money is going (excluding empty vendors)"
                >
                    {data.byVendor.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.byVendor} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" opacity={0.3} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
                                    <YAxis dataKey="vendor" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
                                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Bar dataKey="total" fill="#f59e0b" radius={[0, 6, 6, 0]} maxBarSize={26} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <EmptyChart />}
                </BreakdownCard>

                {/* Expense list */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">All Expenses</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{data.expenses.length} entr{data.expenses.length === 1 ? 'y' : 'ies'} in selected range</p>
                        </div>
                        <ExportMenu
                            getExportData={buildExpenseExport}
                            disabled={data.expenses.length === 0}
                            label="Export List"
                        />
                    </div>
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-zinc-950/50 sticky top-0">
                                <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                    <th className="text-left px-6 py-3 font-semibold">Date</th>
                                    <th className="text-left px-6 py-3 font-semibold">Category</th>
                                    <th className="text-left px-6 py-3 font-semibold">Vendor</th>
                                    <th className="text-left px-6 py-3 font-semibold">Method</th>
                                    <th className="text-left px-6 py-3 font-semibold">Note</th>
                                    <th className="text-right px-6 py-3 font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                                {loading && (
                                    <tr><td colSpan={6} className="py-10 text-center text-gray-400">Loading…</td></tr>
                                )}
                                {!loading && data.expenses.length === 0 && (
                                    <tr><td colSpan={6} className="py-10 text-center text-gray-400">No expenses in this range</td></tr>
                                )}
                                {data.expenses.map(e => (
                                    <tr key={e._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(e.date)}</td>
                                        <td className="px-6 py-3">
                                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200">
                                                {e.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{e.vendor || '-'}</td>
                                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{e.paymentMethod}</td>
                                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">{e.note || '-'}</td>
                                        <td className="px-6 py-3 text-right font-bold text-zinc-900 dark:text-zinc-300">{formatCurrency(e.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

// ─────────────────────────────────────────────────────────────────────────
// Inline helpers (mirrors IncomeDetailPage)
// ─────────────────────────────────────────────────────────────────────────

const KPI_COLORS = {
    red:    { bg: 'bg-zinc-50 dark:bg-zinc-800/50',       text: 'text-zinc-900 dark:text-zinc-300' },
    blue:   { bg: 'bg-zinc-50 dark:bg-zinc-800/50',     text: 'text-zinc-900 dark:text-zinc-300' },
    rose: { bg: 'bg-zinc-100 dark:bg-zinc-800/50', text: 'text-zinc-900 dark:text-zinc-300' },
    amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-600 dark:text-amber-400' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' },
};

function KpiTile({ label, value, icon, color, loading }) {
    const c = KPI_COLORS[color] || KPI_COLORS.blue;
    return (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <span className={`p-1.5 rounded-lg ${c.bg} ${c.text}`}>{icon}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
            </div>
            <div className={`text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate ${loading ? 'opacity-50' : ''}`} title={value}>
                {value}
            </div>
        </div>
    );
}

function BreakdownCard({ title, subtitle, children, exportData }) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
                </div>
                {exportData && <ExportMenu getExportData={exportData} label="Export" />}
            </div>
            {children}
        </div>
    );
}

function EmptyChart() {
    return (
        <div className="h-full flex items-center justify-center text-sm text-gray-400 italic">
            No data in this range
        </div>
    );
}

export default ExpenseDetailPage;
