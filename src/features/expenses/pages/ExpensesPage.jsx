import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../../shared/services/api';
import AppLayout from '../../../shared/components/layout/AppLayout';
import DataTable from '../../../shared/components/data/DataTable';
import AddExpenseModal from '../components/AddExpenseModal';
import ViewExpenseModal from '../components/ViewExpenseModal';
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';
import {
    FaWallet, FaHistory, FaPlus, FaFilter, FaArrowDown,
    FaChartPie, FaMoneyBillWave, FaTrash, FaEdit, FaFileExport,
    FaPaperclip, FaTimesCircle, FaCheckCircle, FaFilePdf, FaImage, FaEye, FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useGymSocket from '../../../shared/hooks/useGymSocket';

const CATEGORIES = [
    'Rent', 'Electricity', 'Water', 'Staff Salary', 'Equipment',
    'Maintenance', 'Marketing', 'Cleaning', 'Internet', 'Software', 'Others'
];

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer'];

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const Expenses = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === 'staff' && !user.permissions?.includes('expenses')) {
            navigate('/members');
        }
    }, [user]);

    const [expenses, setExpenses] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [viewingExpense, setViewingExpense] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    // Filters
    const [filterMonth, setFilterMonth] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('');

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [expensesRes, summaryRes] = await Promise.all([
                api.get(`/expenses`),
                api.get(`/expenses/summary`)
            ]);
            setExpenses(expensesRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            toast.error('Failed to fetch expense data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useGymSocket(['expense:created', 'expense:updated', 'expense:deleted'], fetchData);

    const handleDelete = async () => {
        try {
            await api.delete(`/expenses/${deleteModal.id}`);
            toast.success('Expense deleted');
            fetchData();
            setDeleteModal({ isOpen: false, id: null });
            setSelectedIds(prev => prev.filter(id => id !== deleteModal.id));
        } catch (error) {
            toast.error('Failed to delete expense');
        }
    };

    const handleExport = () => {
        if (selectedIds.length === 0) {
            toast.error('Please select at least one expense to export');
            return;
        }

        const selectedExpenses = expenses.filter(exp => selectedIds.includes(exp._id));

        // CSV Header
        const headers = ['Date', 'Category', 'Amount', 'Vendor', 'Method', 'Note'];

        // CSV Rows
        const rows = selectedExpenses.map(exp => [
            new Date(exp.date).toLocaleDateString('en-IN'),
            exp.category,
            exp.amount,
            exp.vendor || 'N/A',
            exp.paymentMethod,
            (exp.note || '').replace(/,/g, ';') // Avoid commas in note breaking CSV
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
        return expenses.filter(exp => {
            const expDate = new Date(exp.date);
            if (filterMonth !== '' && expDate.getMonth() !== parseInt(filterMonth)) return false;
            if (filterCategory && exp.category !== filterCategory) return false;
            if (filterPaymentMethod && exp.paymentMethod !== filterPaymentMethod) return false;
            return true;
        });
    }, [expenses, filterMonth, filterCategory, filterPaymentMethod]);

    const hasActiveFilters = filterMonth !== '' || filterCategory || filterPaymentMethod;

    const clearFilters = () => {
        setFilterMonth('');
        setFilterCategory('');
        setFilterPaymentMethod('');
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
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 text-red-600 dark:text-red-400">
                    {row.category}
                </span>
            )
        },
        { key: 'amount', label: 'Amount', sortable: true, render: (row) => <span className="font-black text-red-600 dark:text-red-400">{formatCurrency(row.amount)}</span> },
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
                            <FaFilePdf size={16} className="text-red-500" title="PDF Receipt" />
                        ) : (
                            <FaImage size={16} className="text-red-500" title="Image Receipt" />
                        )
                    ) : (
                        <FaTimesCircle size={14} className="text-gray-300 dark:text-gray-600" title="No Receipt" />
                    )}
                </div>
            )
        }
    ];

    return (
        <AppLayout title="Expense Tracker" description="Monitor your gym's spending and financial health" icon={FaWallet} showGenderSwitch={false}>
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleExport}
                                className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl font-medium border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                            >
                                <FaFileExport /> Export ({selectedIds.length})
                            </button>
                        )}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-brand-50 text-brand-600 px-4 py-2.5 rounded-xl font-bold hover:bg-brand-100 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <FaPlus /> Add Expense
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-red-600 dark:text-red-400 flex items-center justify-center">
                                <FaWallet />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Monthly Expense</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary?.monthlyExpense)}</p>
                        <p className="text-xs text-gray-400 mt-1">Total this month</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
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
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden no-scrollbar">
                    <div className="p-5 border-b border-gray-100 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaHistory className="text-gray-400" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Expense History</h3>
                                {filteredExpenses.length !== expenses.length && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">({filteredExpenses.length} of {expenses.length})</span>
                                )}
                            </div>
                            {selectedIds.length > 0 && (
                                <span className="text-xs font-bold text-red-600 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded-full uppercase">
                                    {selectedIds.length} Selected
                                </span>
                            )}
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-zinc-400 dark:focus:border-slate-500 transition-colors"
                            >
                                <option value="">All Months</option>
                                {MONTHS.map((m, i) => (
                                    <option key={m} value={i}>{m}</option>
                                ))}
                            </select>

                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-zinc-400 dark:focus:border-slate-500 transition-colors"
                            >
                                <option value="">All Categories</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <select
                                value={filterPaymentMethod}
                                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-zinc-400 dark:focus:border-slate-500 transition-colors"
                            >
                                <option value="">All Types</option>
                                {PAYMENT_METHODS.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium"
                                >
                                    <FaTimes size={10} /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <DataTable
                        data={filteredExpenses}
                        columns={columns}
                        loading={loading}
                        showSelection={true}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        renderActions={(row) => (
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setViewingExpense(row)}
                                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    title="View Details"
                                >
                                    <FaEye size={14} />
                                </button>
                                <button
                                    onClick={() => { setEditingExpense(row); setIsAddModalOpen(true); }}
                                    className="p-2 text-red-600 hover:bg-zinc-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <FaEdit size={14} />
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, id: row._id })}
                                    className="p-2 text-red-600 hover:bg-zinc-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                onRefresh={fetchData}
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
        </AppLayout>
    );
};

export default Expenses;
