import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../../../shared/services/api';
import AppLayout from '../../../shared/components/layout/AppLayout';
import DataTable from '../../../shared/components/data/DataTable';
import { FaSearch, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useGymSocket from '../../../shared/hooks/useGymSocket';

const STATUS_TABS = [
    { key: 'all', label: 'All' },
    { key: 'Paid', label: 'Paid' },
    { key: 'Partial', label: 'Partial' },
    { key: 'Pending', label: 'Pending' },
];

const METHOD_OPTIONS = ['all', 'Cash', 'UPI', 'Card', 'Bank Transfer'];

const TransactionsPage = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'transactionDate', direction: 'desc' });

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
        return [...filtered].sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            if (sortConfig.key === 'transactionDate') {
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
    }, [transactions, searchTerm, statusFilter, methodFilter, sortConfig]);

    const handleSort = (key) =>
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;

    const statusBadge = (status) => {
        const map = {
            Paid:    'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
            Pending: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
            Partial: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
        };
        const dot = { Paid: 'bg-green-500', Pending: 'bg-yellow-500', Partial: 'bg-orange-500' };
        return (
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${map[status] || 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dot[status] || 'bg-gray-400'}`} />
                {status}
            </span>
        );
    };

    const methodBadge = (method) => {
        const map = {
            Cash:           'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
            UPI:            'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400',
            Card:           'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400',
            'Bank Transfer':'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
            Split:          'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
        };
        return (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[method] || 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                {method || 'Unknown'}
            </span>
        );
    };

    const columns = [
        {
            key: 'memberName', label: 'Member', sortable: true,
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700/50 text-red-600 dark:text-red-400 flex items-center justify-center text-xs font-bold shrink-0">
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
            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 text-sm font-medium"
        >
            Invoice
        </button>
    );

    const renderMobileCard = (row) => (
        <>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-700/50 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold shrink-0">
                        {row.memberName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{row.memberName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(row.transactionDate)} · {row.plan}</p>
                    </div>
                </div>
                {statusBadge(row.paymentStatus)}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(row.amount)}</span>
                    {methodBadge(row.paymentMethod)}
                </div>
                <button
                    onClick={() => navigate(`/invoice/${row._id}`)}
                    className="text-rose-500 text-xs font-medium"
                >
                    Invoice →
                </button>
            </div>
        </>
    );

    return (
        <AppLayout showGenderSwitch={false}>
            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
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

                {/* Search */}
                <div className="relative">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search by member, plan…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Status tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {STATUS_TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                                statusFilter === key
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-sm'
                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Method chips */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {METHOD_OPTIONS.map((m) => (
                        <button
                            key={m}
                            onClick={() => setMethodFilter(m)}
                            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                                methodFilter === m
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-rose-300 dark:hover:border-rose-500'
                            }`}
                        >
                            {m === 'all' ? 'All Methods' : m}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <DataTable
                        data={filteredTransactions}
                        columns={columns}
                        loading={loading}
                        emptyMessage="No transactions found"
                        emptyDescription={searchTerm ? 'Try a different search term' : 'No transactions yet'}
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
