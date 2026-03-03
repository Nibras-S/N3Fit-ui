import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../shared/services/api';
import AppLayout from '../../../shared/components/layout/AppLayout';
import PageHeader from '../../../shared/components/layout/PageHeader';
import DataTable from '../../../shared/components/data/DataTable';
import EditMemberModal from '../components/EditMemberModal';
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';
import CSVImportModal from '../components/ImportModal';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import {
    FaUsers, FaMale, FaFemale, FaSearch, FaEdit, FaTrash, FaSync,
    FaUserCheck, FaUserTimes, FaExclamationTriangle, FaWhatsapp,
    FaFileImport, FaUserPlus, FaRedo
} from 'react-icons/fa';

const TAB_CONFIG = [
    { key: 'active', label: 'Active', icon: FaUserCheck, status: 'Active' },
    { key: 'inactive', label: 'Expired', icon: FaUserTimes, status: 'InActive' },
    { key: 'all', label: 'All Members', icon: FaUsers, status: 'all' },
];

const MembersPage = () => {
    const { hasFeature } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // ── Tab state from URL ──────────────────────────────────────
    const activeTab = searchParams.get('tab') || 'active';
    const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

    // ── Data state ──────────────────────────────────────────────
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [paginationMeta, setPaginationMeta] = useState({});
    const [loading, setLoading] = useState(true);

    // ── Modals & Inline Actions ──────────────────────────────────
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // ── Inline Renewal State ────────────────────────────────────
    const [renewingMemberId, setRenewingMemberId] = useState(null);
    const [renewForm, setRenewForm] = useState({
        plan: '',
        date: '',
        amount: '',
        paymentMethod: 'Cash',
        paymentStatus: 'Paid',
    });
    const [settings, setSettings] = useState(null);

    // ── Expiring Soon count (for warning FAB) ───────────────────
    const [pendingCount, setPendingCount] = useState(0);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    // ── Search debounce ─────────────────────────────────────────
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // ── Reset state on tab change ───────────────────────────────
    useEffect(() => {
        setSearchTerm('');
        setDebouncedSearch('');
        setGenderFilter('all');
        setSortConfig({ key: 'createdAt', direction: 'desc' });
        setPage(1);
    }, [activeTab]);

    // ── Fetch members ───────────────────────────────────────────
    const fetchMembers = async () => {
        setLoading(true);
        try {
            const tabCfg = TAB_CONFIG.find(t => t.key === activeTab) || TAB_CONFIG[0];
            const params = {
                page,
                limit,
                status: tabCfg.status,
                search: debouncedSearch,
                gender: genderFilter,
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction,
            };
            if (tabCfg.key === 'all') params.includeExpired = true;

            const response = await api.get(`${backendUrl}/api/contacts/`, { params });
            // API returns { success, data: { data: [...], pagination: {...} } }
            const payload = response.data?.data || response.data || {};
            const data = payload.data || payload || [];
            const pagination = payload.pagination || {};

            setMembers(Array.isArray(data) ? data : []);
            setTotalRecords(pagination.total || 0);
            setPaginationMeta(pagination);
        } catch (error) {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [backendUrl, page, limit, debouncedSearch, genderFilter, sortConfig, activeTab]);

    // ── Fetch settings for plans ────────────────────────────────
    useEffect(() => {
        api.get(`${backendUrl}/api/settings`)
            .then(res => {
                const settingsData = res.data?.data ?? res.data;
                setSettings(settingsData);
            })
            .catch(err => console.error('Failed to load settings', err));
    }, [backendUrl]);

    // ── Fetch expiring soon count ───────────────────────────────
    useEffect(() => {
        api.get(`${backendUrl}/api/reminders/with-status`)
            .then((res) => {
                const filtered = res.data
                    .filter((u) => u.dews <= 4 && u.dews >= 0)
                    .filter((u) => u.reminderStatus === 'Pending');
                setPendingCount(filtered.length);
            })
            .catch((err) => console.error('Error fetching pending:', err));
    }, [backendUrl]);

    // ── Stats (from pagination meta) ────────────────────────────
    const stats = useMemo(() => ({
        total: totalRecords,
        male: paginationMeta.male || 0,
        female: paginationMeta.female || 0,
    }), [totalRecords, paginationMeta]);

    // ── Sort ────────────────────────────────────────────────────
    const handleSort = (key) => setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));

    // ── Delete ──────────────────────────────────────────────────
    const handleDeleteClick = async () => {
        const { id, name } = deleteModal;
        try {
            await api.delete(`${backendUrl}/api/contacts/${id}`);
            setMembers(prev => prev.filter(u => u._id !== id));
            toast.success('Member deleted');
            setDeleteModal({ isOpen: false, id: null, name: '' });
        } catch {
            toast.error('Failed to delete');
        }
    };

    // ── Renew ───────────────────────────────────────────────────
    const handleRenew = (memberId) => {
        if (renewingMemberId === memberId) {
            setRenewingMemberId(null); // toggle off
        } else {
            setRenewForm({
                plan: '',
                date: '',
                amount: '',
                paymentMethod: 'Cash',
                paymentStatus: 'Paid',
            });
            setRenewingMemberId(memberId);
        }
    };

    const submitRenewal = async (memberId) => {
        if (!renewForm.plan || !renewForm.amount) {
            toast.error('Please select a plan and enter an amount');
            return;
        }

        try {
            await api.put(`${backendUrl}/api/contacts/${memberId}`, { ...renewForm, _isRenewal: true });
            toast.success('Membership renewed successfully');
            setRenewingMemberId(null);
            fetchMembers(); // refresh
        } catch (error) {
            toast.error('Failed to renew membership');
        }
    };

    // ── WhatsApp ────────────────────────────────────────────────
    const handleWhatsApp = (member) => {
        if (!member.phone) return;
        const digits = member.phone.replace(/[^\d]/g, '');
        const phone = digits.length === 10 ? `91${digits}` : digits;
        const message = `Hi ${member.name}, your gym membership has expired. Please renew to continue enjoying our services! 💪`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    // ── Edit ────────────────────────────────────────────────────
    const handleEditClick = (userId) => {
        setEditData(userId);
        setIsEditing(true);
    };

    const handleUpdateSuccess = () => {
        setIsEditing(false);
        fetchMembers();
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

    // ── Column definitions ──────────────────────────────────────
    const columns = useMemo(() => {
        const base = [
            {
                key: 'name', label: 'Name', sortable: true,
                render: (row) => (
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30 p-1 -m-1 rounded-lg transition-colors group"
                        onClick={() => navigate(`/members/${row._id}`)}
                    >
                        {row.profileImage ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 dark:border-slate-600 shadow-sm">
                                <img
                                    src={row.profileImage.startsWith('http') ? row.profileImage : `${backendUrl}${row.profileImage}`}
                                    alt={row.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${row.gender === 'Male' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'}`}>
                                {row.name?.charAt(0)}
                            </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{row.name}</span>
                    </div>
                )
            },
            { key: 'phone', label: 'Phone', sortable: true, render: (row) => <span className="text-gray-500 dark:text-gray-400">{row.phone}</span> },
        ];

        // All Members tab gets a Status column
        if (activeTab === 'all') {
            base.push({
                key: 'status', label: 'Status',
                render: (row) => (
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${row.dews > 0 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                        {row.dews > 0 ? 'Active' : 'Expired'}
                    </span>
                )
            });
        }
        // Note: dews <= 0 = Expired per backend pre-save hook (status = 'InActive' when dews <= 0)

        base.push(
            {
                key: 'dews', label: 'Days Left', sortable: true,
                render: (row) => <span className={row.dews <= 0 ? 'text-red-500 font-medium' : 'text-gray-700 dark:text-gray-300'}>{row.dews <= 0 ? `${row.dews} (Expired)` : row.dews}</span>
            },
            { key: 'date', label: 'Start Date', sortable: true, render: (row) => <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(row.date)}</span> },
            { key: 'endDate', label: 'End Date', sortable: true, render: (row) => <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(row.endDate)}</span> },
        );

        return base;
    }, [activeTab, backendUrl, navigate]);

    // ── Actions ─────────────────────────────────────────────────
    const renderActions = (row) => (
        <div className="flex gap-2">
            <button
                onClick={() => handleRenew(row._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 rounded-lg transition-colors"
                title="Renew Membership"
            >
                <FaRedo size={11} /> Renew
            </button>
            {activeTab === 'expired' && row.phone && (
                <button onClick={() => handleWhatsApp(row)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="WhatsApp">
                    <FaWhatsapp />
                </button>
            )}
            <button onClick={() => handleEditClick(row._id)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Edit">
                <FaEdit />
            </button>
            <button onClick={() => setDeleteModal({ isOpen: true, id: row._id, name: row.name })} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                <FaTrash />
            </button>
        </div>
    );

    // ── Mobile card ─────────────────────────────────────────────
    const renderMobileCard = (row) => (
        <>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3" onClick={() => navigate(`/members/${row._id}`)}>
                    {row.profileImage ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 dark:border-slate-600 shadow-sm">
                            <img
                                src={row.profileImage.startsWith('http') ? row.profileImage : `${backendUrl}${row.profileImage}`}
                                alt={row.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${row.gender === 'Male' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'}`}>
                            {row.name?.charAt(0)}
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{row.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{row.phone}</div>
                    </div>
                </div>
                {activeTab === 'all' && (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.dews > 0 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                        {row.dews > 0 ? 'Active' : 'Expired'}
                    </span>
                )}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span className={row.dews <= 0 ? 'text-red-500 font-medium' : ''}>{row.dews <= 0 ? `${row.dews} days (Expired)` : `${row.dews} days`}</span>
                <span>{formatDate(row.endDate)}</span>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                <button onClick={() => handleRenew(row._id)} className="flex-1 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                    <FaRedo size={11} /> Renew
                </button>
                {activeTab === 'expired' && row.phone && (
                    <button onClick={() => handleWhatsApp(row)} className="py-2 px-3 bg-green-50 dark:bg-green-900/20 text-green-600 font-medium rounded-lg text-sm flex items-center justify-center">
                        <FaWhatsapp />
                    </button>
                )}
                <button onClick={() => handleEditClick(row._id)} className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium rounded-lg text-sm flex items-center justify-center gap-2">
                    <FaEdit /> Edit
                </button>
                <button onClick={() => setDeleteModal({ isOpen: true, id: row._id, name: row.name })} className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-lg text-sm flex items-center justify-center gap-2">
                    <FaTrash /> Delete
                </button>
            </div>
        </>
    );

    // ── Selected Renewing Member for Modal ──────────────────────
    const renewingMember = members.find(m => m._id === renewingMemberId);

    // ── Tab title for header ────────────────────────────────────
    const currentTab = TAB_CONFIG.find(t => t.key === activeTab) || TAB_CONFIG[0];

    return (
        <AppLayout showGenderSwitch={false}>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '10px' } }} />

            {/* Page Header */}
            <PageHeader
                title={currentTab.label}
                gender={genderFilter}
                stats={[
                    { label: 'Total', value: stats.total, icon: FaUsers },
                    { label: 'Male', value: stats.male, icon: FaMale },
                    { label: 'Female', value: stats.female, icon: FaFemale },
                ]}
            />




            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-72">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>}
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        {activeTab === 'all' && hasFeature('memberImport') && (
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-bold border border-green-100 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all"
                            >
                                <FaFileImport size={14} />
                                <span className="hidden sm:inline">Import CSV</span>
                            </button>
                        )}
                        <button
                            onClick={fetchMembers}
                            disabled={loading}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30"
                            title="Refresh"
                        >
                            <FaSync className={loading ? 'animate-spin' : ''} />
                        </button>
                        <div className="inline-flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                            {['all', 'Male', 'Female'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setGenderFilter(tab)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${genderFilter === tab ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                                >
                                    {tab === 'all' ? 'All' : tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={members}
                columns={columns}
                loading={loading}
                emptyMessage={`No ${currentTab.label.toLowerCase()} members found`}
                emptyDescription={searchTerm ? 'Try a different search' : 'No members in this category'}
                sortConfig={sortConfig}
                onSort={handleSort}
                renderActions={renderActions}
                renderMobileCard={renderMobileCard}
                hoverColor={activeTab === 'expired' ? 'hover:bg-red-50 dark:hover:bg-red-900/10' : 'hover:bg-blue-50 dark:hover:bg-blue-900/10'}
                gender={genderFilter}
                serverSide={true}
                count={totalRecords}
                page={page}
                onPageChange={setPage}
                onRowsPerPageChange={setLimit}
                rowsPerPage={limit}
            />

            {/* Expiring Soon FAB */}
            <div className="fixed bottom-20 right-4 z-10 md:bottom-6 md:right-6">
                <button
                    onClick={() => navigate('/inactivesoon')}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-shadow relative"
                    aria-label="Expiring Soon"
                >
                    <FaExclamationTriangle className="text-orange-500 text-xl" />
                    {pendingCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                            {pendingCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Modals */}
            {renewingMemberId && renewingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaRedo className="text-blue-500" /> Renew {renewingMember.name}
                            </h3>
                            <button onClick={() => setRenewingMemberId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
                                <select
                                    value={renewForm.plan}
                                    onChange={(e) => {
                                        const newPlan = e.target.value;
                                        const planObj = settings?.plans?.find(p => p.name === newPlan);
                                        setRenewForm({
                                            ...renewForm,
                                            plan: newPlan,
                                            amount: planObj ? planObj.price : '',
                                        });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Select Plan...</option>
                                    {settings?.plans?.map((p, i) => (
                                        <option key={i} value={p.name}>{p.name} (₹{p.price})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={renewForm.date}
                                        onChange={(e) => setRenewForm({ ...renewForm, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={renewForm.amount}
                                        onChange={(e) => setRenewForm({ ...renewForm, amount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                                <select
                                    value={renewForm.paymentMethod}
                                    onChange={(e) => setRenewForm({ ...renewForm, paymentMethod: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Card">Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 flex gap-3 dark:bg-slate-800/50 justify-end">
                            <button
                                onClick={() => setRenewingMemberId(null)}
                                className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => submitRenewal(renewingMemberId)}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
                            >
                                Renew Membership
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleDeleteClick}
                title="Delete Member"
                message={`Are you sure you want to delete ${deleteModal.name}? This action cannot be undone.`}
                type="danger"
            />

            {isEditing && editData && (
                <EditMemberModal
                    memberId={editData}
                    onClose={() => setIsEditing(false)}
                    onUpdate={handleUpdateSuccess}
                />
            )}

            <CSVImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onRefresh={fetchMembers}
            />
        </AppLayout>
    );
};

export default MembersPage;
