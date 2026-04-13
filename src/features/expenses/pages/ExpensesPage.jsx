import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AppLayout from '../../../shared/components/layout/AppLayout';
import DataTable from '../../../shared/components/data/DataTable';
import AddExpenseModal from '../components/AddExpenseModal';
import ViewExpenseModal from '../components/ViewExpenseModal';
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';
import {
    FaWallet, FaHistory, FaPlus, FaFilter,
    FaTrash, FaEdit, FaFileExport,
    FaTimesCircle, FaFilePdf, FaImage, FaEye, FaTimes,
    FaSearch, FaSlidersH
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    expenseKeys,
    useExpenses,
    useExpenseSummary,
    useDeleteExpense,
} from '../hooks/useExpensesQueries';

const CATEGORIES = [
    'Rent', 'Electricity', 'Water', 'Staff Salary', 'Equipment',
    'Maintenance', 'Marketing', 'Cleaning', 'Internet', 'Software', 'Others'
];

// Stable empty-array fallback so useMemo deps don't churn when the query
// hasn't resolved yet.
const EMPTY = [];

const Expenses = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === 'staff' && !user.permissions?.includes('expenses')) {
            navigate('/members');
        }
    }, [user, navigate]);

    const queryClient = useQueryClient();
    const expensesQuery = useExpenses();
    const summaryQuery = useExpenseSummary();
    const expenses = expensesQuery.data ?? EMPTY;
    const summary = summaryQuery.data;
    const loading = expensesQuery.isPending;
    const deleteMutation = useDeleteExpense();

    const [selectedIds, setSelectedIds] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [viewingExpense, setViewingExpense] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    // Filters
    const [filterCategory, setFilterCategory] = useState('');
    const [search, setSearch] = useState('');
    const [period, setPeriod] = useState('All Time');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Mobile bottom sheet draft state
    const [draft, setDraft] = useState({ period: 'All Time', fromDate: '', toDate: '', category: '' });
    const [sheetOpen, setSheetOpen] = useState(false);

    // Data fetching, server-aggregate summary, and socket invalidation are
    // all handled centrally: useExpenses/useExpenseSummary hit the API via
    // TanStack Query, and RealtimeSync (app/RealtimeSync.jsx) invalidates
    // the ['expenses'] prefix on expense:* socket events from any device.

    const handleDelete = () => {
        const { id } = deleteModal;
        setDeleteModal({ isOpen: false, id: null });
        deleteMutation.mutate(id, {
            onSuccess: () => {
                setSelectedIds(prev => prev.filter(sid => sid !== id));
                toast.success('Expense deleted');
            },
        });
    };

    const handleExport = () => {
        if (selectedIds.length === 0) {
            toast.error('Please select at least one expense to export');
            return;
        }

        const selectedExpenses = expenses.filter(exp => selectedIds.includes(exp._id));

        const headers = ['Date', 'Category', 'Amount', 'Vendor', 'Method', 'Note'];

        const rows = selectedExpenses.map(exp => [
            new Date(exp.date).toLocaleDateString('en-IN'),
            exp.category,
            exp.amount,
            exp.vendor || 'N/A',
            exp.paymentMethod,
            (exp.note || '').replace(/,/g, ';')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Fit_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${selectedIds.length} expenses`);
    };

    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;

    const filteredExpenses = useMemo(() => {
        const now = new Date();
        return expenses.filter(exp => {
            const expDate = new Date(exp.date);

            // Period filter
            if (period === 'This Month') {
                if (expDate.getMonth() !== now.getMonth() || expDate.getFullYear() !== now.getFullYear()) return false;
            } else if (period === 'Last Month') {
                const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                if (expDate.getMonth() !== lm.getMonth() || expDate.getFullYear() !== lm.getFullYear()) return false;
            } else if (period === 'This Year') {
                if (expDate.getFullYear() !== now.getFullYear()) return false;
            }

            // Date range (overrides period if set)
            if (fromDate) {
                const from = new Date(fromDate); from.setHours(0, 0, 0, 0);
                if (expDate < from) return false;
            }
            if (toDate) {
                const to = new Date(toDate); to.setHours(23, 59, 59, 999);
                if (expDate > to) return false;
            }

            // Category
            if (filterCategory && exp.category !== filterCategory) return false;

            // Search
            if (search) {
                const t = search.toLowerCase();
                if (
                    !exp.category?.toLowerCase().includes(t) &&
                    !exp.vendor?.toLowerCase().includes(t) &&
                    !exp.note?.toLowerCase().includes(t)
                ) return false;
            }

            return true;
        });
    }, [expenses, period, fromDate, toDate, filterCategory, search]);

    const filteredTotal = useMemo(
        () => filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
        [filteredExpenses],
    );

    const hasActiveFilters = period !== 'All Time' || fromDate || toDate || filterCategory || search;
    const hasMobileFilters = period !== 'All Time' || fromDate || toDate || filterCategory;

    const clearFilters = () => {
        setPeriod('All Time');
        setFromDate('');
        setToDate('');
        setFilterCategory('');
        setSearch('');
    };

    const columns = [
        {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (row) => new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        },
        {
            key: 'category',
            label: 'Category',
            sortable: true,
            render: (row) => (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                    {row.category}
                </span>
            )
        },
        { key: 'amount', label: 'Amount', sortable: true, render: (row) => <span className="font-black text-zinc-700 dark:text-zinc-300">{formatCurrency(row.amount)}</span> },
        { key: 'vendor', label: 'Vendor/Receiver', render: (row) => <span className="text-sm font-medium">{row.vendor || '-'}</span> },
        {
            key: 'paymentMethod', label: 'Type',
            render: (row) => {
                const methodStyles = {
                    Cash: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
                    UPI: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
                    Card: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
                    'Bank Transfer': 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
                };
                return (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${methodStyles[row.paymentMethod] || 'bg-gray-100 text-gray-600'}`}>
                        {row.paymentMethod}
                    </span>
                );
            }
        },
        {
            key: 'receipt',
            label: 'File',
            render: (row) => (
                <div className="flex items-center justify-center w-8">
                    {row.receiptUrl ? (
                        row.receiptUrl.toLowerCase().endsWith('.pdf') ? (
                            <FaFilePdf size={16} className="text-zinc-600" title="PDF Receipt" />
                        ) : (
                            <FaImage size={16} className="text-zinc-600" title="Image Receipt" />
                        )
                    ) : (
                        <FaTimesCircle size={14} className="text-gray-300 dark:text-gray-600" title="No Receipt" />
                    )}
                </div>
            )
        }
    ];

    return (
        <AppLayout title="Expenses" description="Monitor your gym's spending and financial health" icon={FaWallet} showGenderSwitch={false}>
            <div className="space-y-4 md:space-y-6">
                {/* ── Mobile top: Total + compact search / filter / add row ── */}
                <div className="md:hidden space-y-3">
                    <div className="flex items-baseline gap-2 text-sm px-1">
                        <span className="text-gray-500 dark:text-gray-400">Total:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(filteredTotal)}</span>
                        <span className="text-gray-300 dark:text-zinc-700">•</span>
                        <span className="text-gray-500 dark:text-gray-400">
                            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'entry' : 'entries'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Search expenses..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => { setDraft({ period, fromDate, toDate, category: filterCategory }); setSheetOpen(true); }}
                            aria-label="Filters"
                            className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${hasMobileFilters ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700'}`}
                        >
                            <FaSlidersH size={14} />
                            {hasMobileFilters && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-900 dark:border-white" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            aria-label="Add Expense"
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 text-white active:scale-95 transition-all shadow-sm"
                        >
                            <FaPlus size={14} />
                        </button>
                    </div>
                </div>

                {/* ── Desktop Header Actions ── */}
                <div className="hidden md:flex items-center justify-end gap-4">
                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleExport}
                                className="bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl font-medium border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2"
                            >
                                <FaFileExport /> Export ({selectedIds.length})
                            </button>
                        )}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-zinc-100 text-zinc-900 px-4 py-2.5 rounded-xl font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <FaPlus /> Add Expense
                        </button>
                    </div>
                </div>

                {/* ── Desktop Summary Cards ── */}
                <div className="hidden md:grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                                <FaWallet />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Monthly Expense</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary?.monthlyExpense)}</p>
                        <p className="text-xs text-gray-400 mt-1">Total this month</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <FaFilter />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Top Category</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
                            {summary?.categoryBreakdown?.[0]?._id || 'None'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Highest spending area</p>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden no-scrollbar">

                    {/* Title row — desktop only (topbar already shows "Expenses" on mobile) */}
                    <div className="hidden md:flex items-center justify-between p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                            <FaHistory className="text-gray-400" />
                            <h3 className="font-bold text-gray-900 dark:text-white">Expense History</h3>
                            {filteredExpenses.length !== expenses.length && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">({filteredExpenses.length} of {expenses.length})</span>
                            )}
                        </div>
                        {selectedIds.length > 0 && (
                            <span className="text-xs font-bold text-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded-full uppercase">
                                {selectedIds.length} Selected
                            </span>
                        )}
                    </div>

                    {/* ── Desktop filter bar ── */}
                    <div className="hidden md:flex items-center gap-3 p-4 border-b border-gray-100 dark:border-zinc-800 flex-wrap">
                        {/* Search */}
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Search expenses..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8 pr-3 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 w-44 transition-all"
                            />
                        </div>

                        <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

                        {/* Period pills */}
                        {['This Month', 'Last Month', 'This Year', 'All Time'].map(p => (
                            <button
                                key={p}
                                onClick={() => { setPeriod(p); setFromDate(''); setToDate(''); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${period === p && !fromDate && !toDate ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent' : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-zinc-400'}`}
                            >
                                {p}
                            </button>
                        ))}

                        <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

                        {/* Date range */}
                        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPeriod(''); }}
                            className="py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" placeholder="From" />
                        <span className="text-gray-400 text-xs">-</span>
                        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPeriod(''); }}
                            className="py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" placeholder="To" />

                        <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700" />

                        {/* Category */}
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                            className="py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all">
                            <option value="">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-xs text-gray-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white font-medium flex items-center gap-1 transition-colors">
                                <FaTimes size={10} /> Reset
                            </button>
                        )}
                    </div>

                    <DataTable
                        data={filteredExpenses}
                        columns={columns}
                        loading={loading}
                        showSelection={true}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        renderMobileCard={(row) => {
                            const methodStyles = {
                                Cash: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
                                UPI: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
                                Card: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
                                'Bank Transfer': 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
                            };
                            return (
                                <div className="flex items-start justify-between gap-3 pr-8">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-black text-gray-900 dark:text-white">{formatCurrency(row.amount)}</span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        {row.vendor && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">Paid to {row.vendor}</p>
                                        )}
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                                                {row.category}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${methodStyles[row.paymentMethod] || 'bg-gray-100 text-gray-600'}`}>
                                                {row.paymentMethod}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 shrink-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setViewingExpense(row); }}
                                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                            aria-label="View"
                                        >
                                            <FaEye size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingExpense(row); setIsAddModalOpen(true); }}
                                            className="p-2 text-zinc-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                            aria-label="Edit"
                                        >
                                            <FaEdit size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, id: row._id }); }}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            aria-label="Delete"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        }}
                        renderActions={(row) => (
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setViewingExpense(row)}
                                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                    title="View Details"
                                >
                                    <FaEye size={14} />
                                </button>
                                <button
                                    onClick={() => { setEditingExpense(row); setIsAddModalOpen(true); }}
                                    className="p-2 text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <FaEdit size={14} />
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, id: row._id })}
                                    className="p-2 text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        )}
                        emptyMessage="No expenses recorded yet"
                        emptyDescription="Click 'Add Expense' to start tracking your gym's spending."
                    />
                </div>
            </div>

            <AddExpenseModal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setEditingExpense(null); }}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: expenseKeys.all })}
                expense={editingExpense}
            />

            <ViewExpenseModal
                isOpen={!!viewingExpense}
                onClose={() => setViewingExpense(null)}
                expense={viewingExpense}
            />

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Expense"
                message="Are you sure you want to delete this expense entry? This cannot be undone."
                type="danger"
            />

            {/* Mobile bottom sheet */}
            <AnimatePresence>
                {sheetOpen && (
                    <>
                        <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSheetOpen(false)}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" />
                        <motion.div key="sh"
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl md:hidden max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full" />
                            </div>
                            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-zinc-800">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">Filters</h3>
                                <button onClick={() => setDraft({ period: 'All Time', fromDate: '', toDate: '', category: '' })}
                                    className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Reset all</button>
                            </div>
                            <div className="px-5 py-4 space-y-5">
                                {/* Period */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Period</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['This Month', 'Last Month', 'This Year', 'All Time'].map(p => (
                                            <button key={p} onClick={() => setDraft(d => ({ ...d, period: p, fromDate: '', toDate: '' }))}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${draft.period === p && !draft.fromDate ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent' : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700'}`}>
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Date range */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Date Range</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">From</label>
                                            <input type="date" value={draft.fromDate} onChange={e => setDraft(d => ({ ...d, fromDate: e.target.value, period: '' }))}
                                                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm focus:outline-none" />
                                        </div>
                                        <span className="text-gray-400 text-sm mt-4">—</span>
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">To</label>
                                            <input type="date" value={draft.toDate} onChange={e => setDraft(d => ({ ...d, toDate: e.target.value, period: '' }))}
                                                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm focus:outline-none" />
                                        </div>
                                    </div>
                                </div>
                                {/* Category */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Category</p>
                                    <select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white focus:outline-none">
                                        <option value="">All Categories</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="px-5 py-4 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    onClick={() => { setPeriod(draft.period || 'All Time'); setFromDate(draft.fromDate); setToDate(draft.toDate); setFilterCategory(draft.category); setSheetOpen(false); }}
                                    className="w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all"
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

export default Expenses;
