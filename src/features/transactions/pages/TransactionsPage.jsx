import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../../../shared/services/api';
import AppLayout from '../../../shared/components/layout/AppLayout';
import DataTable from '../../../shared/components/data/DataTable';
import { FaSearch, FaArrowLeft, FaSlidersH, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useGymSocket from '../../../shared/hooks/useGymSocket';
import { AnimatePresence, motion } from 'framer-motion';

const STATUS_OPTS  = ['All Statuses', 'Paid', 'Partial', 'Pending'];
const METHOD_OPTS  = ['All Methods', 'Cash', 'UPI', 'Card', 'Bank Transfer'];

const DEFAULT_FILTERS = {
    search: '',
    status: 'All Statuses',
    method: 'All Methods',
    fromDate: '',
    toDate: '',
};

const TransactionsPage = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'transactionDate', direction: 'desc' });

    // Unified filter state
    const [filters, setFilters]       = useState(DEFAULT_FILTERS);
    // Draft filters inside the mobile sheet
    const [draft, setDraft]           = useState(DEFAULT_FILTERS);
    const [sheetOpen, setSheetOpen]   = useState(false);

    const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

    // Count active filters (excluding search — shown inline)
    const activeFilterCount = useMemo(() => {
        let n = 0;
        if (filters.status  !== 'All Statuses') n++;
        if (filters.method  !== 'All Methods')  n++;
        if (filters.fromDate) n++;
        if (filters.toDate)   n++;
        return n;
    }, [filters]);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/transactions');
            const list = response.data?.data ?? response.data;
            setTransactions(Array.isArray(list) ? list : []);
        } catch {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
    useGymSocket(['transaction:created', 'transaction:updated'], fetchTransactions);

    const filteredTransactions = useMemo(() => {
        let list = transactions;

        if (filters.status !== 'All Statuses') {
            list = list.filter(t => t.paymentStatus === filters.status);
        }
        if (filters.method !== 'All Methods') {
            list = list.filter(t => t.paymentMethod === filters.method);
        }
        if (filters.fromDate) {
            const from = new Date(filters.fromDate);
            from.setHours(0, 0, 0, 0);
            list = list.filter(t => new Date(t.transactionDate) >= from);
        }
        if (filters.toDate) {
            const to = new Date(filters.toDate);
            to.setHours(23, 59, 59, 999);
            list = list.filter(t => new Date(t.transactionDate) <= to);
        }
        if (filters.search) {
            const term = filters.search.toLowerCase();
            list = list.filter(t =>
                t.memberName?.toLowerCase().includes(term) ||
                t.plan?.toLowerCase().includes(term) ||
                t.paymentMethod?.toLowerCase().includes(term)
            );
        }

        return [...list].sort((a, b) => {
            let vA = a[sortConfig.key];
            let vB = b[sortConfig.key];
            if (sortConfig.key === 'transactionDate') {
                vA = new Date(vA || 0); vB = new Date(vB || 0);
            } else if (sortConfig.key === 'amount') {
                vA = Number(vA) || 0; vB = Number(vB) || 0;
            } else {
                vA = String(vA || '').toLowerCase(); vB = String(vB || '').toLowerCase();
            }
            if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (vA > vB) return sortConfig.direction === 'asc' ?  1 : -1;
            return 0;
        });
    }, [transactions, filters, sortConfig]);

    const handleSort = (key) =>
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

    // Mobile sheet helpers
    const openSheet  = () => { setDraft(filters); setSheetOpen(true); };
    const applySheet = () => { setFilters(draft); setSheetOpen(false); };
    const resetAll   = () => { setDraft(DEFAULT_FILTERS); };

    const formatDate  = (d) =>
        d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;

    const statusBadge = (status) => {
        const cls = {
            Paid:    'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
            Pending: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
            Partial: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
        };
        const dot = { Paid: 'bg-green-500', Pending: 'bg-yellow-500', Partial: 'bg-orange-500' };
        return (
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${cls[status] || 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dot[status] || 'bg-gray-400'}`} />
                {status}
            </span>
        );
    };

    const methodBadge = (method) => {
        const cls = {
            Cash:           'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
            UPI:            'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400',
            Card:           'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400',
            'Bank Transfer':'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
            Split:          'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-300',
        };
        return (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${cls[method] || 'bg-gray-100 dark:bg-zinc-800 text-gray-600'}`}>
                {method || 'Unknown'}
            </span>
        );
    };

    const columns = [
        {
            key: 'memberName', label: 'Member', sortable: true,
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700/50 text-zinc-900 dark:text-zinc-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {row.memberName?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{row.memberName}</span>
                </div>
            )
        },
        {
            key: 'transactionDate', label: 'Date', sortable: true,
            render: (row) => <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(row.transactionDate)}</span>
        },
        {
            key: 'plan', label: 'Plan', sortable: true,
            render: (row) => <span className="text-sm text-gray-600 dark:text-gray-300">{row.plan || '-'}</span>
        },
        {
            key: 'amount', label: 'Amount', sortable: true,
            render: (row) => <span className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(row.amount)}</span>
        },
        {
            key: 'paymentMethod', label: 'Method',
            render: (row) => methodBadge(row.paymentMethod)
        },
        {
            key: 'paymentStatus', label: 'Status',
            render: (row) => statusBadge(row.paymentStatus)
        },
    ];

    const renderActions = (row) => (
        <button
            onClick={() => navigate(`/invoice/${row._id}`)}
            className="text-zinc-900 dark:text-zinc-300 hover:text-zinc-600 dark:hover:text-white text-sm font-medium"
        >
            Invoice
        </button>
    );

    const renderMobileCard = (row) => (
        <>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-700/50 text-zinc-900 dark:text-zinc-400 flex items-center justify-center text-sm font-bold shrink-0">
                        {row.memberName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{row.memberName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(row.transactionDate)} · {row.plan}</p>
                    </div>
                </div>
                {statusBadge(row.paymentStatus)}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(row.amount)}</span>
                    {methodBadge(row.paymentMethod)}
                </div>
                <button
                    onClick={() => navigate(`/invoice/${row._id}`)}
                    className="text-zinc-900 dark:text-zinc-300 text-xs font-medium"
                >
                    Invoice →
                </button>
            </div>
        </>
    );

    // ── Pill button used inside mobile sheet ──────────────────────────────────
    const Pill = ({ active, onClick, children }) => (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                active
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent'
                    : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700'
            }`}
        >
            {children}
        </button>
    );

    return (
        <AppLayout showGenderSwitch={false}>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {filteredTransactions.length} of {transactions.length} records
                        </p>
                    </div>
                </div>

                {/* ── DESKTOP filter bar (hidden on mobile) ── */}
                <div className="hidden lg:flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 shadow-sm">
                    {/* Search */}
                    <div className="relative flex-1 min-w-0">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Search member, plan…"
                            value={filters.search}
                            onChange={e => setFilter('search', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                        />
                    </div>

                    <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700" />

                    {/* From Date */}
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">From Date</label>
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={e => setFilter('fromDate', e.target.value)}
                            className="py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                        />
                    </div>

                    {/* To Date */}
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">To Date</label>
                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={e => setFilter('toDate', e.target.value)}
                            className="py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                        />
                    </div>

                    <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700" />

                    {/* Status select */}
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                        <select
                            value={filters.status}
                            onChange={e => setFilter('status', e.target.value)}
                            className="py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                        >
                            {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Method select */}
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Method</label>
                        <select
                            value={filters.method}
                            onChange={e => setFilter('method', e.target.value)}
                            className="py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                        >
                            {METHOD_OPTS.map(m => <option key={m}>{m}</option>)}
                        </select>
                    </div>

                    {/* Reset */}
                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => setFilters(DEFAULT_FILTERS)}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white font-medium flex items-center gap-1 transition-colors shrink-0"
                        >
                            <FaTimes size={10} /> Reset
                        </button>
                    )}
                </div>

                {/* ── MOBILE search + filter button (hidden on desktop) ── */}
                <div className="flex lg:hidden gap-2">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search by member, plan…"
                            value={filters.search}
                            onChange={e => setFilter('search', e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 transition-all text-sm"
                        />
                        {filters.search && (
                            <button
                                onClick={() => setFilter('search', '')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <FaTimes size={12} />
                            </button>
                        )}
                    </div>

                    {/* Filter toggle button */}
                    <button
                        onClick={openSheet}
                        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${
                            activeFilterCount > 0
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700'
                        }`}
                    >
                        <FaSlidersH size={14} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-white text-zinc-900 text-[10px] font-bold flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <DataTable
                        data={filteredTransactions}
                        columns={columns}
                        loading={loading}
                        emptyMessage="No transactions found"
                        emptyDescription={activeFilterCount > 0 || filters.search ? 'Try adjusting your filters' : 'No transactions yet'}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        renderActions={renderActions}
                        renderMobileCard={renderMobileCard}
                    />
                </div>
            </div>

            {/* ── MOBILE BOTTOM SHEET ── */}
            <AnimatePresence>
                {sheetOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSheetOpen(false)}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                        />

                        {/* Sheet */}
                        <motion.div
                            key="sheet"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl lg:hidden max-h-[85vh] overflow-y-auto"
                        >
                            {/* Drag handle */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full" />
                            </div>

                            {/* Sheet header */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-zinc-800">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">Filters</h3>
                                <button
                                    onClick={resetAll}
                                    className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                    Reset all
                                </button>
                            </div>

                            <div className="px-5 py-4 space-y-6">
                                {/* Status */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {STATUS_OPTS.map(s => (
                                            <Pill
                                                key={s}
                                                active={draft.status === s}
                                                onClick={() => setDraft(d => ({ ...d, status: s }))}
                                            >
                                                {s === 'All Statuses' ? 'All' : s}
                                            </Pill>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Date Range</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">From</label>
                                            <input
                                                type="date"
                                                value={draft.fromDate}
                                                onChange={e => setDraft(d => ({ ...d, fromDate: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                                            />
                                        </div>
                                        <span className="text-gray-400 text-sm mt-4">—</span>
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">To</label>
                                            <input
                                                type="date"
                                                value={draft.toDate}
                                                onChange={e => setDraft(d => ({ ...d, toDate: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Method */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Method</p>
                                    <div className="flex flex-wrap gap-2">
                                        {METHOD_OPTS.map(m => (
                                            <Pill
                                                key={m}
                                                active={draft.method === m}
                                                onClick={() => setDraft(d => ({ ...d, method: m }))}
                                            >
                                                {m}
                                            </Pill>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Apply button */}
                            <div className="px-5 py-4 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    onClick={applySheet}
                                    className="w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-sm transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.98]"
                                >
                                    Show Results
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AppLayout>
    );
};

export default TransactionsPage;
