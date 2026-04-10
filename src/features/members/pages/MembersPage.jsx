import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../shared/services/api';
import AppLayout from '../../../shared/components/layout/AppLayout';
import DataTable from '../../../shared/components/data/DataTable';
import { DatePicker } from '../../../shared/components/ui/DatePicker';
import EditMemberModal from '../components/EditMemberModal';
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';
import CSVImportModal from '../components/ImportModal';
import PageHeader from '../../../shared/components/layout/PageHeader';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import {
    FaUsers, FaMale, FaFemale, FaSearch, FaEdit, FaTrash, FaSync,
    FaUserCheck, FaUserTimes, FaExclamationTriangle, FaWhatsapp,
    FaFileImport, FaUserPlus, FaRedo, FaTimesCircle, FaColumns,
    FaFileExport, FaCheck
} from 'react-icons/fa';

// Columns the user can toggle on/off via the column chooser. The Name column
// is intentionally not in this list — it's always shown. Order here is the
// order they'll render in the table when enabled.
const TOGGLEABLE_COLUMNS = [
    { key: 'phone', label: 'Phone' },
    { key: 'plan', label: 'Plan' },
    { key: 'gender', label: 'Gender' },
    { key: 'status', label: 'Status' },
    { key: 'dews', label: 'Days Left' },
    { key: 'endDate', label: 'End Date' },
    { key: 'createdAt', label: 'Joined On' },
];

// Sensible defaults — what shows out of the box. Start Date is intentionally
// excluded: after a renewal the backend overwrites `member.date` with the new
// renewal start, so the column was misleading users into thinking it was the
// original join date. Use the "Joined On" column (createdAt) for that.
const DEFAULT_VISIBLE_COLUMNS = ['phone', 'status', 'dews', 'endDate'];

const COLUMN_PREF_KEY = 'n3fit:members:visibleColumns';

const TAB_CONFIG = [
    { key: 'active', label: 'Active Members', icon: FaUserCheck, status: 'Active' },
    { key: 'inactive', label: 'Expired Members', icon: FaUserTimes, status: 'InActive' },
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

    // ── Column chooser state (persisted) ────────────────────────
    const [visibleColumns, setVisibleColumns] = useState(() => {
        try {
            const stored = localStorage.getItem(COLUMN_PREF_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (_) { /* ignore corrupt prefs */ }
        return DEFAULT_VISIBLE_COLUMNS;
    });
    const [columnChooserOpen, setColumnChooserOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(COLUMN_PREF_KEY, JSON.stringify(visibleColumns));
        } catch (_) { /* localStorage may be unavailable */ }
    }, [visibleColumns]);

    // ── Row selection state (used by All Members tab) ───────────
    const [selectedIds, setSelectedIds] = useState([]);

    // Reset selection on tab change so the export button doesn't carry stale
    // ids across tabs.
    useEffect(() => { setSelectedIds([]); }, [activeTab]);

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
    // ── Global member counts (tab-independent, for stats row) ───
    const [allStats, setAllStats] = useState({ total: 0, male: 0, female: 0 });

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

            const response = await api.get(`/contacts/`, { params });
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
        api.get(`/settings`)
            .then(res => {
                const settingsData = res.data?.data ?? res.data;
                setSettings(settingsData);
            })
            .catch(err => console.error('Failed to load settings', err));
    }, [backendUrl]);

    // ── Fetch expiring soon count ───────────────────────────────
    useEffect(() => {
        api.get(`/reminders/with-status`)
            .then((res) => {
                const filtered = res.data
                    .filter((u) => u.dews <= 4 && u.dews >= 0)
                    .filter((u) => u.reminderStatus === 'Pending');
                setPendingCount(filtered.length);
            })
            .catch((err) => console.error('Error fetching pending:', err));
    }, [backendUrl]);

    // ── Stats: from current page pagination meta ──────────────────
    const stats = useMemo(() => ({
        total: paginationMeta.total ?? totalRecords,
        male: paginationMeta.male ?? 0,
        female: paginationMeta.female ?? 0,
    }), [paginationMeta, totalRecords]);

    // ── Fetch global stats (all-time, not filtered by gender/search) ──
    useEffect(() => {
        const tabCfg = TAB_CONFIG.find(t => t.key === activeTab) || TAB_CONFIG[0];
        api.get('/contacts/', { params: { status: tabCfg.status, page: 1, limit: 1 } })
            .then(res => {
                const p = res.data?.data?.pagination || res.data?.pagination || {};
                setAllStats({
                    total: p.total || 0,
                    male: p.male || 0,
                    female: p.female || 0,
                });
            })
            .catch(() => { });
    }, [activeTab]);

    // ── Sort ────────────────────────────────────────────────────
    const handleSort = (key) => setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));

    // ── Delete ──────────────────────────────────────────────────
    const handleDeleteClick = async () => {
        const { id, name } = deleteModal;
        try {
            await api.delete(`/contacts/${id}`);
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

        // Build a clean payload — drop empty strings and coerce numerics
        // so the backend Joi schema accepts the request even when the user
        // didn't pick a date.
        const payload = { _isRenewal: true };
        if (renewForm.plan) payload.plan = renewForm.plan;
        if (renewForm.date) payload.date = renewForm.date;
        if (renewForm.amount !== '' && renewForm.amount !== null) {
            payload.amount = Number(renewForm.amount);
        }
        if (renewForm.paymentMethod) payload.paymentMethod = renewForm.paymentMethod;
        if (renewForm.paymentStatus) payload.paymentStatus = renewForm.paymentStatus;

        try {
            await api.put(`/contacts/${memberId}`, payload);
            toast.success('Membership renewed successfully');
            setRenewingMemberId(null);
            fetchMembers(); // refresh
        } catch (error) {
            const detail = error.response?.data?.message
                || error.response?.data?.error?.message
                || 'Failed to renew membership';
            toast.error(detail);
        }
    };

    // ── WhatsApp ────────────────────────────────────────────────
    // Build a status-aware message so the gym owner can fire off a manual
    // ping without retyping. Three buckets:
    //   - expired   (dews <= 0): renewal nudge with days overdue
    //   - expiring  (dews 1..7): friendly heads-up
    //   - active    (otherwise): generic check-in
    const buildWhatsAppMessage = (member) => {
        const name = member.name || 'there';
        const dews = typeof member.dews === 'number' ? member.dews : null;
        if (dews !== null && dews <= 0) {
            const overdue = Math.abs(dews);
            return `Hi ${name}, your gym membership expired ${overdue === 0 ? 'today' : `${overdue} day${overdue === 1 ? '' : 's'} ago`}. Please renew to continue your fitness journey with us! 💪`;
        }
        if (dews !== null && dews <= 7) {
            return `Hi ${name}, just a heads-up — your gym membership expires in ${dews} day${dews === 1 ? '' : 's'}. Renew early to avoid any break in your routine. 💪`;
        }
        return `Hi ${name}, hope you're enjoying your workouts! Let us know if you need anything from the gym team. 💪`;
    };

    const handleWhatsApp = (member) => {
        if (!member.phone) return;
        const digits = member.phone.replace(/[^\d]/g, '');
        const phone = digits.length === 10 ? `91${digits}` : digits;
        const message = buildWhatsAppMessage(member);
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    // ── Export selected to CSV ──────────────────────────────────
    // Builds a CSV from the currently-loaded members whose _id is in
    // selectedIds. We don't hit the backend — the rows the user just selected
    // are already in memory, so this stays a fast client-side action.
    const exportSelectedToCSV = () => {
        if (selectedIds.length === 0) {
            toast.error('Select at least one member to export');
            return;
        }
        const selectedSet = new Set(selectedIds);
        const rows = members.filter(m => selectedSet.has(m._id));
        if (rows.length === 0) {
            toast.error('No matching rows on this page');
            return;
        }

        // CSV escaping: wrap any field that contains a comma, quote, or
        // newline in double quotes and double up internal quotes.
        const escape = (val) => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
            return str;
        };

        const headers = [
            'Name', 'Phone', 'Plan', 'Gender', 'Status', 'Days Left',
            'Start Date', 'End Date', 'Joined On',
            'Amount', 'Discount', 'Payment Method', 'Payment Status',
        ];
        const lines = [headers.join(',')];

        for (const m of rows) {
            const status = m.dews > 0 ? 'Active' : 'Expired';
            lines.push([
                escape(m.name),
                escape(m.phone),
                escape(m.plan),
                escape(m.gender),
                escape(status),
                escape(m.dews),
                escape(formatDate(m.date)),
                escape(formatDate(m.endDate)),
                escape(formatDate(m.createdAt)),
                escape(m.amount ?? ''),
                escape(m.discount ?? ''),
                escape(m.paymentMethod ?? ''),
                escape(m.paymentStatus ?? ''),
            ].join(','));
        }

        // BOM so Excel opens UTF-8 (₹, names with accents) correctly.
        const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `members-${timestamp}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`Exported ${rows.length} member${rows.length === 1 ? '' : 's'}`);
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
    // Renderers for every toggleable column live here, keyed by column key.
    // The Name column is always rendered first and isn't part of this map.
    const columnRenderers = useMemo(() => ({
        phone: { key: 'phone', label: 'Phone', sortable: true, render: (row) => <span className="text-gray-500 dark:text-gray-400">{row.phone}</span> },
        plan: { key: 'plan', label: 'Plan', sortable: true, render: (row) => <span className="text-gray-700 dark:text-gray-300">{row.plan || '-'}</span> },
        gender: { key: 'gender', label: 'Gender', sortable: false, render: (row) => <span className="text-gray-500 dark:text-gray-400">{row.gender || '-'}</span> },
        status: {
            key: 'status', label: 'Status',
            render: (row) => (
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${row.dews > 0 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                    {row.dews > 0 ? 'Active' : 'Expired'}
                </span>
            ),
        },
        dews: {
            key: 'dews', label: 'Days Left', sortable: true,
            render: (row) => <span className={row.dews <= 0 ? 'text-red-500 font-medium' : 'text-gray-700 dark:text-gray-300'}>{row.dews <= 0 ? `${row.dews} (Expired)` : row.dews}</span>,
        },
        endDate: { key: 'endDate', label: 'End Date', sortable: true, render: (row) => <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(row.endDate)}</span> },
        createdAt: { key: 'createdAt', label: 'Joined On', sortable: true, render: (row) => <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(row.createdAt)}</span> },
    }), []);

    const columns = useMemo(() => {
        const nameColumn = {
            key: 'name', label: 'Name', sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3 group">
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
            ),
        };

        // Walk TOGGLEABLE_COLUMNS (which preserves the canonical column order)
        // and pick the ones the user has enabled.
        const visibleSet = new Set(visibleColumns);
        const extras = TOGGLEABLE_COLUMNS
            .filter(c => visibleSet.has(c.key))
            .map(c => columnRenderers[c.key])
            .filter(Boolean);

        return [nameColumn, ...extras];
    }, [visibleColumns, columnRenderers, backendUrl]);

    // ── Actions ─────────────────────────────────────────────────
    // stopPropagation on the wrapper so clicks on action buttons don't bubble
    // up to the row's onClick (which navigates to the member detail page).
    const whatsAppTitle = (row) => {
        if (typeof row.dews !== 'number') return 'Send WhatsApp';
        if (row.dews <= 0) return 'WhatsApp: expired reminder';
        if (row.dews <= 7) return 'WhatsApp: expiring soon';
        return 'WhatsApp: send message';
    };

    const renderActions = (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => handleRenew(row._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 rounded-lg transition-colors"
                title="Renew Membership"
            >
                <FaRedo size={11} /> Renew
            </button>
            {row.phone && (
                <button
                    onClick={() => handleWhatsApp(row)}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                    title={whatsAppTitle(row)}
                >
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
                <div className="flex items-center gap-3">
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
            <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => handleRenew(row._id)} className="flex-1 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                    <FaRedo size={11} /> Renew
                </button>
                {row.phone && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleWhatsApp(row); }}
                        className="py-2 px-3 bg-green-50 dark:bg-green-900/20 text-green-600 font-medium rounded-lg text-sm flex items-center justify-center"
                        title={whatsAppTitle(row)}
                    >
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

    const currentTab = TAB_CONFIG.find(t => t.key === activeTab) || TAB_CONFIG[0];

    // ── Empty state (no results after search) ──────────────────
    const EmptySearchState = () => (
        <div className="flex flex-col items-center justify-center py-24 px-6 relative overflow-hidden">
            {/* Concentric rings background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60 dark:opacity-40">
                <div className="absolute w-[200px] h-[200px] rounded-full border border-gray-200 dark:border-slate-700" />
                <div className="absolute w-[360px] h-[360px] rounded-full border border-gray-200 dark:border-slate-700" />
                <div className="absolute w-[520px] h-[520px] rounded-full border border-gray-200 dark:border-slate-700 shadow-sm" />
                <div className="absolute w-[680px] h-[680px] rounded-full border border-gray-200 dark:border-slate-700" />
            </div>

            {/* Scattered Avatars on the rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Inner Ring Avatars */}
                <img src="https://i.pravatar.cc/150?img=1" className="absolute w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 translate-x-[80px] -translate-y-[80px]" alt="avatar" />
                <img src="https://i.pravatar.cc/150?img=2" className="absolute w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 -translate-x-[90px] translate-y-[40px]" alt="avatar" />

                {/* Middle Ring Avatars */}
                <img src="https://i.pravatar.cc/150?img=3" className="absolute w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 translate-x-[150px] translate-y-[60px]" alt="avatar" />
                <img src="https://i.pravatar.cc/150?img=4" className="absolute w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 -translate-x-[160px] -translate-y-[100px]" alt="avatar" />
                <img src="https://i.pravatar.cc/150?img=5" className="absolute w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 -translate-x-[40px] translate-y-[160px]" alt="avatar" />

                {/* Outer Ring Avatars */}
                <img src="https://i.pravatar.cc/150?img=6" className="absolute w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 translate-x-[220px] -translate-y-[150px]" alt="avatar" />
                <img src="https://i.pravatar.cc/150?img=7" className="absolute w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 -translate-x-[240px] translate-y-[120px]" alt="avatar" />
            </div>

            {/* Center Icon */}
            <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 flex items-center justify-center mb-6 shadow-sm z-10">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center">
                    <FaSearch className="text-gray-400" size={18} />
                </div>
            </div>

            {/* Text */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1.5 z-10">No users found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 z-10 w-full max-w-sm">
                Your search for <span className="font-semibold text-gray-700 dark:text-gray-300">"{searchTerm}"</span> did not match any members.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 z-10">
                <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all font-medium text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-2 text-sm"
                >
                    Clear search
                </button>
                <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 text-sm"
                >
                    <FaUserPlus size={12} /> Add member
                </button>
            </div>
        </div>
    );

    // Empty state (no members at all in tab)
    const EmptyTabState = () => (
        <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                {activeTab === 'inactive' ? <FaUserTimes className="text-gray-400" size={22} /> : <FaUsers className="text-gray-400" size={22} />}
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No {currentTab.label.toLowerCase()}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">There are no members in this category yet.</p>
            <button onClick={() => navigate('/register')} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2">
                <FaUserPlus size={12} /> Add member
            </button>
        </div>
    );

    return (
        <AppLayout title="Members" description="Manage your gym members, renewals, and contact details" icon={FaUsers} showGenderSwitch={false}>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '10px' } }} />
            {/* ── Desktop Tab Bar ─────────────────────────────── */}
            <div className="hidden lg:block mb-6">
                <div className="flex items-end justify-between border-b border-gray-200 dark:border-slate-700">
                    {/* Tabs */}
                    <div className="flex gap-1">
                        {TAB_CONFIG.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${isActive
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'
                                        }`}
                                >
                                    <Icon size={14} />
                                    {tab.label}
                                    {isActive && (
                                        <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                            {allStats.total}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {/* Right: stats pills */}
                    <div className="flex items-center gap-4 pb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5"><FaUsers size={12} className="text-blue-400" /> {allStats.total} total</span>
                        <span className="flex items-center gap-1.5"><FaMale size={12} className="text-blue-400" /> {allStats.male} male</span>
                        <span className="flex items-center gap-1.5"><FaFemale size={12} className="text-pink-400" /> {allStats.female} female</span>
                    </div>
                </div>
            </div>

            {/* ── Mobile: simple tab pills ────────────────────── */}
            <div className="flex lg:hidden gap-2 mb-4 overflow-x-auto pb-1">
                {TAB_CONFIG.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
                                }`}
                        >
                            <Icon size={11} />
                            {tab.label}
                            {isActive && <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20">{allStats.total}</span>}
                        </button>
                    );
                })}
            </div>

            {/* ── Toolbar & Table Card (Combined Full Size) ── */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col mb-4">

                {/* Toolbar Header section */}
                <div className="flex flex-wrap gap-3 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                    {/* Search */}
                    <div className="relative flex-1 min-w-48 max-w-sm">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <FaTimesCircle size={14} />
                            </button>
                        )}
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto flex-wrap">
                        {/* New Member — primary action, always visible on every tab so
                            admins don't have to bounce off into an empty state to enroll. */}
                        <button
                            onClick={() => navigate('/register')}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/25"
                            title="Enroll a new member"
                        >
                            <FaUserPlus size={13} /><span className="hidden sm:inline">New Member</span>
                        </button>

                        {/* Export to CSV — gated by feature flag, only on All Members tab */}
                        {activeTab === 'all' && hasFeature('memberExport') && (
                            <button
                                onClick={exportSelectedToCSV}
                                disabled={selectedIds.length === 0}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                title={selectedIds.length === 0 ? 'Select members to export' : `Export ${selectedIds.length} selected`}
                            >
                                <FaFileExport size={13} />
                                <span className="hidden sm:inline">Export{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}</span>
                            </button>
                        )}
                        {activeTab === 'all' && hasFeature('memberImport') && (
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-bold border border-green-100 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all"
                            >
                                <FaFileImport size={13} /><span className="hidden sm:inline">Import</span>
                            </button>
                        )}

                        {/* Column chooser */}
                        <div className="relative">
                            <button
                                onClick={() => setColumnChooserOpen(o => !o)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-gray-200 dark:border-slate-600"
                                title="Choose columns"
                            >
                                <FaColumns size={13} />
                            </button>
                            {columnChooserOpen && (
                                <>
                                    {/* Click-outside backdrop */}
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setColumnChooserOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl z-40 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Show columns</span>
                                            <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns.length === TOGGLEABLE_COLUMNS.length}
                                                    onChange={(e) => setVisibleColumns(
                                                        e.target.checked ? TOGGLEABLE_COLUMNS.map(c => c.key) : []
                                                    )}
                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                Select All
                                            </label>
                                        </div>
                                        <div className="max-h-72 overflow-y-auto py-1">
                                            {/* Name is always shown — render disabled checkbox so the user knows */}
                                            <label className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed">
                                                <input type="checkbox" checked disabled className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                                                <span>Name</span>
                                                <span className="ml-auto text-[10px] uppercase">Required</span>
                                            </label>
                                            {TOGGLEABLE_COLUMNS.map(col => {
                                                const checked = visibleColumns.includes(col.key);
                                                return (
                                                    <label
                                                        key={col.key}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={(e) => {
                                                                setVisibleColumns(prev => e.target.checked
                                                                    ? [...prev, col.key]
                                                                    : prev.filter(k => k !== col.key));
                                                            }}
                                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span>{col.label}</span>
                                                        {checked && <FaCheck className="ml-auto text-blue-500" size={10} />}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-700 flex justify-between">
                                            <button
                                                onClick={() => setVisibleColumns(DEFAULT_VISIBLE_COLUMNS)}
                                                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                            >
                                                Reset to default
                                            </button>
                                            <button
                                                onClick={() => setColumnChooserOpen(false)}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={fetchMembers} disabled={loading}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent dark:hover:border-slate-700"
                            title="Refresh"
                        >
                            <FaSync size={13} className={loading ? 'animate-spin' : ''} />
                        </button>
                        {/* Gender filter */}
                        <div className="inline-flex bg-gray-100 dark:bg-slate-700/50 rounded-lg p-1 border border-gray-100 dark:border-slate-700">
                            {['all', 'Male', 'Female'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setGenderFilter(f)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${genderFilter === f
                                        ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                        }`}
                                >
                                    {f === 'all' ? 'All' : f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table or Empty State (integrated into the card) */}
                {!loading && members.length === 0 ? (
                    <div className="w-full">
                        {searchTerm ? <EmptySearchState /> : <EmptyTabState />}
                    </div>
                ) : (
                    <DataTable
                        data={members}
                        columns={columns}
                        loading={loading}
                        emptyMessage={`No ${currentTab.label.toLowerCase()} found`}
                        emptyDescription={searchTerm ? 'Try a different search' : 'No members in this category'}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        renderActions={renderActions}
                        renderMobileCard={renderMobileCard}
                        onRowClick={(row) => navigate(`/members/${row._id}`)}
                        showSelection={activeTab === 'all'}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        hoverColor={activeTab === 'inactive' ? 'hover:bg-red-50 dark:hover:bg-red-900/10' : 'hover:bg-blue-50 dark:hover:bg-blue-900/10'}
                        gender={genderFilter}
                        serverSide={true}
                        count={totalRecords}
                        page={page}
                        onPageChange={setPage}
                        onRowsPerPageChange={setLimit}
                        rowsPerPage={limit}
                        className="rounded-none border-none shadow-none" // removes inner bounding box so it sits flush
                    />
                )}
            </div>

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
                                    {settings?.plans?.filter(p => p.isActive)?.map((p, i) => (
                                        <option key={i} value={p.name}>{p.name} (₹{p.price})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                    <DatePicker
                                        value={renewForm.date}
                                        onChange={(e) => setRenewForm({ ...renewForm, date: e.target.value })}
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
