import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FaArrowLeft, FaArrowUp, FaCheckCircle, FaClock, FaReceipt,
    FaChartLine, FaCrown, FaSync,
} from 'react-icons/fa';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../../../shared/services/api';
import toast from 'react-hot-toast';
import AppLayout from '../../../shared/components/layout/AppLayout';
import PageHeader from '../../../shared/components/layout/PageHeader';
import ReportBaselineBanner from '../../../shared/components/feedback/ReportBaselineBanner';
import DateRangeFilter, { computePresetRange } from '../components/DateRangeFilter';
import ExportMenu from '../components/ExportMenu';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#3f3f46'];

const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;
const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

/**
 * IncomeDetailPage — drill-down for the Income KPI on the Reports page.
 *
 * URL contract:  ?preset=this_month&startDate=...&endDate=...
 *
 * The filter state is mirrored back to the URL so a user can bookmark or
 * share a particular slice of revenue. The data fetch is keyed off
 * (startDate, endDate) so changing the filter automatically refetches.
 */
const IncomeDetailPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Hydrate filter from the URL on first render. Falls back to "this month"
    // (the most useful default for a finance drill-down) when no params are
    // present, instead of "all time" which can be enormous.
    const [filter, setFilter] = useState(() => {
        const preset = searchParams.get('preset') || 'this_month';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        if (startDate || endDate) {
            return { preset: preset || 'custom', startDate: startDate || '', endDate: endDate || '' };
        }
        return { preset, ...computePresetRange(preset) };
    });

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        kpi: { totalIncome: 0, transactionCount: 0, avgTransaction: 0, paidIncome: 0, pendingIncome: 0 },
        trend: [],
        byPlan: [],
        byMethod: [],
        byStatus: [],
        topMembers: [],
        transactions: [],
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.startDate) params.set('startDate', filter.startDate);
            if (filter.endDate) params.set('endDate', filter.endDate);
            const res = await api.get(`/reports/income?${params.toString()}`);
            setData(res.data);
        } catch (err) {
            toast.error('Failed to load income report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Mirror the filter back to the URL so the page is shareable.
        const next = new URLSearchParams();
        if (filter.preset) next.set('preset', filter.preset);
        if (filter.startDate) next.set('startDate', filter.startDate);
        if (filter.endDate) next.set('endDate', filter.endDate);
        setSearchParams(next, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    /**
     * Build the export payload — same shape used by all three export
     * formats (CSV, Excel, PDF). Wrapped in a thunk so the parent doesn't
     * have to recompute it on every render of the menu button.
     */
    const buildTransactionExport = () => ({
        filename: 'income-transactions',
        title: 'Income Transactions',
        subtitle: filter.startDate
            ? `${filter.startDate} → ${filter.endDate}`
            : 'All time',
        columns: [
            { key: 'date',          label: 'Date' },
            { key: 'memberName',    label: 'Member' },
            { key: 'phone',         label: 'Phone' },
            { key: 'plan',          label: 'Plan' },
            { key: 'amount',        label: 'Amount (₹)' },
            { key: 'paymentMethod', label: 'Method' },
            { key: 'paymentStatus', label: 'Status' },
            { key: 'remarks',       label: 'Remarks' },
        ],
        rows: data.transactions.map(t => ({
            date:          formatDate(t.transactionDate),
            memberName:    t.memberName || 'Unknown',
            phone:         t.phone || '',
            plan:          t.plan || '',
            amount:        Number(t.amount || 0),
            paymentMethod: t.paymentMethod || '',
            paymentStatus: t.paymentStatus || '',
            remarks:       t.remarks || '',
        })),
    });

    const buildPlanExport = () => ({
        filename: 'income-by-plan',
        title: 'Income by Plan',
        subtitle: filter.startDate ? `${filter.startDate} → ${filter.endDate}` : 'All time',
        columns: [
            { key: 'plan',  label: 'Plan' },
            { key: 'count', label: 'Transactions' },
            { key: 'total', label: 'Revenue (₹)' },
        ],
        rows: data.byPlan.map(p => ({
            plan: p.plan,
            count: p.count,
            total: Number(p.total || 0),
        })),
    });

    // Memoised so the chart prop reference is stable across renders that
    // don't change the underlying data.
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
                    title="Income Report"
                    description="How revenue flows in — by plan, by method, by member"
                    icon={FaArrowUp}
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
                                getExportData={buildTransactionExport}
                                disabled={data.transactions.length === 0}
                            />
                        </>
                    }
                />

                {/* KPI Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <KpiTile
                        label="Total Revenue"
                        value={formatCurrency(data.kpi.totalIncome)}
                        icon={<FaArrowUp />}
                        color="green"
                        loading={loading}
                    />
                    <KpiTile
                        label="Transactions"
                        value={data.kpi.transactionCount.toLocaleString('en-IN')}
                        icon={<FaReceipt />}
                        color="blue"
                        loading={loading}
                    />
                    <KpiTile
                        label="Avg per Transaction"
                        value={formatCurrency(data.kpi.avgTransaction)}
                        icon={<FaChartLine />}
                        color="rose"
                        loading={loading}
                    />
                    <KpiTile
                        label="Paid"
                        value={formatCurrency(data.kpi.paidIncome)}
                        icon={<FaCheckCircle />}
                        color="emerald"
                        loading={loading}
                    />
                    <KpiTile
                        label="Pending / Partial"
                        value={formatCurrency(data.kpi.pendingIncome)}
                        icon={<FaClock />}
                        color="amber"
                        loading={loading}
                    />
                </div>

                {/* Trend chart */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Trend</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Daily income inside the selected range</p>
                        </div>
                    </div>
                    <div className="h-72">
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart />
                        )}
                    </div>
                </div>

                {/* Two-column breakdowns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* By Plan */}
                    <BreakdownCard
                        title="Revenue by Plan"
                        subtitle="Which plans bring in the most money"
                        exportData={buildPlanExport}
                    >
                        {data.byPlan.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.byPlan} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" opacity={0.3} />
                                        <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
                                        <YAxis dataKey="plan" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
                                        <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Bar dataKey="total" fill="#10b981" radius={[0, 6, 6, 0]} maxBarSize={26} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : <EmptyChart />}
                    </BreakdownCard>

                    {/* By Method */}
                    <BreakdownCard
                        title="Revenue by Payment Method"
                        subtitle="Cash · UPI · Card · Bank"
                    >
                        {data.byMethod.length > 0 ? (
                            <div className="h-64 flex items-center">
                                <div className="w-1/2 h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.byMethod}
                                                dataKey="total"
                                                nameKey="method"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={3}
                                                stroke="none"
                                            >
                                                {data.byMethod.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v) => formatCurrency(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-1/2 space-y-2">
                                    {data.byMethod.map((m, i) => (
                                        <div key={m.method} className="flex items-center gap-2 text-xs">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-gray-600 dark:text-gray-300 flex-1 truncate">{m.method}</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(m.total)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : <EmptyChart />}
                    </BreakdownCard>
                </div>

                {/* Top members */}
                <BreakdownCard
                    title="Top Spending Members"
                    subtitle="Your biggest contributors in this window"
                >
                    {data.topMembers.length > 0 ? (
                        <div className="overflow-x-auto -mx-2">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                        <th className="text-left py-2 px-2 font-semibold">#</th>
                                        <th className="text-left py-2 px-2 font-semibold">Member</th>
                                        <th className="text-left py-2 px-2 font-semibold">Phone</th>
                                        <th className="text-right py-2 px-2 font-semibold">Transactions</th>
                                        <th className="text-right py-2 px-2 font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                                    {data.topMembers.map((m, i) => (
                                        <tr key={m.memberId || i} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                                            <td className="py-3 px-2">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    i === 1 ? 'bg-gray-100 text-gray-600' :
                                                    i === 2 ? 'bg-orange-100 text-orange-600' :
                                                    'bg-gray-50 text-gray-400'
                                                }`}>
                                                    {i === 0 ? <FaCrown size={10} /> : i + 1}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 font-medium text-gray-900 dark:text-gray-100">{m.memberName}</td>
                                            <td className="py-3 px-2 text-gray-500 dark:text-gray-400">{m.phone || '-'}</td>
                                            <td className="py-3 px-2 text-right text-gray-700 dark:text-gray-300">{m.count}</td>
                                            <td className="py-3 px-2 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(m.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <EmptyChart />}
                </BreakdownCard>

                {/* Transaction list */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">All Transactions</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{data.transactions.length} record{data.transactions.length === 1 ? '' : 's'} in selected range</p>
                        </div>
                        <ExportMenu
                            getExportData={buildTransactionExport}
                            disabled={data.transactions.length === 0}
                            label="Export List"
                        />
                    </div>
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-zinc-950/50 sticky top-0">
                                <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                    <th className="text-left px-6 py-3 font-semibold">Date</th>
                                    <th className="text-left px-6 py-3 font-semibold">Member</th>
                                    <th className="text-left px-6 py-3 font-semibold">Plan</th>
                                    <th className="text-left px-6 py-3 font-semibold">Method</th>
                                    <th className="text-left px-6 py-3 font-semibold">Status</th>
                                    <th className="text-right px-6 py-3 font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                                {loading && (
                                    <tr><td colSpan={6} className="py-10 text-center text-gray-400">Loading…</td></tr>
                                )}
                                {!loading && data.transactions.length === 0 && (
                                    <tr><td colSpan={6} className="py-10 text-center text-gray-400">No transactions in this range</td></tr>
                                )}
                                {data.transactions.map(t => (
                                    <tr
                                        key={t._id}
                                        className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 cursor-pointer"
                                        onClick={() => navigate(`/invoice/${t._id}`)}
                                    >
                                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(t.transactionDate)}</td>
                                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{t.memberName || 'Unknown'}</td>
                                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{t.plan}</td>
                                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{t.paymentMethod}</td>
                                        <td className="px-6 py-3">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                t.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                t.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-500'
                                            }`}>
                                                {t.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(t.amount)}</td>
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
// Tiny presentational helpers — kept inline because they're page-specific
// ─────────────────────────────────────────────────────────────────────────

const KPI_COLORS = {
    green:   { bg: 'bg-green-50 dark:bg-green-900/20',     text: 'text-green-600 dark:text-green-400' },
    blue:    { bg: 'bg-zinc-50 dark:bg-zinc-800/50',       text: 'text-zinc-900 dark:text-zinc-300' },
    rose:    { bg: 'bg-zinc-100 dark:bg-zinc-800/50',     text: 'text-zinc-900 dark:text-zinc-300' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-600 dark:text-amber-400' },
};

function KpiTile({ label, value, icon, color, loading }) {
    const c = KPI_COLORS[color] || KPI_COLORS.blue;
    return (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <span className={`p-1.5 rounded-lg ${c.bg} ${c.text}`}>{icon}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
            </div>
            <div className={`text-xl sm:text-2xl font-black text-gray-900 dark:text-white ${loading ? 'opacity-50' : ''}`}>{value}</div>
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

export default IncomeDetailPage;
