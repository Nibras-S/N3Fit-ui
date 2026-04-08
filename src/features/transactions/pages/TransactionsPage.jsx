import React, { useEffect, useState, useMemo } from 'react';
import api from '../../../shared/services/api';
import AppLayout from '../../../shared/components/layout/AppLayout';
import DataTable from '../../../shared/components/data/DataTable';
import { FaSearch, FaFilter, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TransactionsPage = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'transactionDate', direction: 'desc' });
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/transactions`);
                setTransactions(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                toast.error('Failed to load transactions');
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [backendUrl]);

    const filteredTransactions = useMemo(() => {
        let filtered = transactions;
        if (statusFilter !== 'all') filtered = filtered.filter(t => t.paymentStatus === statusFilter);
        if (methodFilter !== 'all') filtered = filtered.filter(t => t.paymentMethod === methodFilter);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                t.memberName?.toLowerCase().includes(term) ||
                t.plan?.toLowerCase().includes(term) ||
                t.paymentMethod?.toLowerCase().includes(term)
            );
        }
        filtered = [...filtered].sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            if (['transactionDate'].includes(sortConfig.key)) {
                valA = new Date(valA || 0);
                valB = new Date(valB || 0);
            } else if (sortConfig.key === 'amount') {
                valA = Number(valA) || 0;
                valB = Number(valB) || 0;
            } else {
                valA = String(valA || '').toLowerCase();
                valB = String(valB || '').toLowerCase();
            }
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [transactions, searchTerm, statusFilter, methodFilter, sortConfig]);

    const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;

    const columns = [
        {
            key: 'memberName', label: 'Member', sortable: true,
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                        {row.memberName?.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{row.memberName}</span>
                </div>
            )
        },
        { key: 'transactionDate', label: 'Date', sortable: true, render: (row) => <span className="text-gray-500 text-sm">{formatDate(row.transactionDate)}</span> },
        { key: 'plan', label: 'Plan', sortable: true, render: (row) => <span className="text-sm text-gray-600 dark:text-gray-300">{row.plan}</span> },
        { key: 'amount', label: 'Amount', sortable: true, render: (row) => <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(row.amount)}</span> },
        {
            key: 'paymentMethod', label: 'Method',
            render: (row) => (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${row.paymentMethod === 'Cash' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                    row.paymentMethod === 'UPI' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                    }`}>
                    {row.paymentMethod || 'Unknown'}
                </span>
            )
        },
        {
            key: 'paymentStatus', label: 'Status',
            render: (row) => (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${row.paymentStatus === 'Paid' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                    row.paymentStatus === 'Pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.paymentStatus === 'Paid' ? 'bg-green-500' : row.paymentStatus === 'Pending' ? 'bg-yellow-500' : 'bg-orange-500'}`}></span>
                    {row.paymentStatus}
                </span>
            )
        }
    ];

    const renderActions = (row) => (
        <button
            onClick={() => navigate(`/invoice/${row._id}`)}
            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
        >
            Invoice
        </button>
    );

    const renderMobileCard = (row) => (
        <>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                        {row.memberName?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{row.memberName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(row.transactionDate)} • {row.plan}</p>
                    </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${row.paymentStatus === 'Paid' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                    row.paymentStatus === 'Pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                    }`}>
                    {row.paymentStatus}
                </span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(row.amount)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${row.paymentMethod === 'Cash' ? 'bg-green-50 text-green-700' :
                        row.paymentMethod === 'UPI' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>{row.paymentMethod}</span>
                </div>
                <button
                    onClick={() => navigate(`/invoice/${row._id}`)}
                    className="text-blue-500 text-xs font-medium"
                >
                    Invoice
                </button>
            </div>
        </>
    );

    // Unique methods and statuses for filters
    const methods = [...new Set(transactions.map(t => t.paymentMethod).filter(Boolean))];
    const statuses = [...new Set(transactions.map(t => t.paymentStatus).filter(Boolean))];

    return (
        <AppLayout showGenderSwitch={false}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">All Transactions</h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{filteredTransactions.length} of {transactions.length} transactions</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by member, plan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>}
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="all">All Status</option>
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="all">All Methods</option>
                                {methods.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <DataTable
                        data={filteredTransactions}
                        columns={columns}
                        loading={loading}
                        emptyMessage="No transactions found"
                        emptyDescription={searchTerm ? 'Try a different search' : 'No transactions yet'}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        renderActions={renderActions}
                        renderMobileCard={renderMobileCard}
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default TransactionsPage;
