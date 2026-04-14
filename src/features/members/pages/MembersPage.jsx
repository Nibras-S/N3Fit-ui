import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/services/api';
import {
    useMembers,
    useMembersStats,
    useDeleteMember,
} from '../hooks/useMembersQueries';
import AppLayout from '../../../shared/components/layout/AppLayout';
import DataTable from '../../../shared/components/data/DataTable';
import { DatePicker } from '../../../shared/components/ui/DatePicker';
import EditMemberModal from '../components/EditMemberModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';
import CSVImportModal from '../components/ImportModal';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUsers, FaMale, FaFemale, FaSearch, FaEdit, FaTrash, FaSync,
    FaUserCheck, FaUserTimes, FaExclamationTriangle, FaWhatsapp,
    FaFileImport, FaUserPlus, FaRedo, FaTimesCircle, FaColumns,
    FaFileExport, FaCheck, FaFilter, FaPlus
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
    { key: 'msgCount', label: 'Messages Sent' },
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

    // ── UI state (search, sort, filters) ────────────────────────
    // Server state (members list, totals, loading) comes from useMembers
    // below — don't add useState for data that lives on the server.
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState('all');
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    // Draft state for the mobile filter sheet — selections are staged here
    // and only copied into genderFilter / visibleColumns when the user taps
    // "Show Results". Opening the sheet reseeds these from the committed
    // state, so backdrop-dismiss acts as an implicit cancel.
    const [draftGender, setDraftGender] = useState('all');
    const [draftVisibleColumns, setDraftVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
    // Default sort matches the per-tab reset below so first load and post-tab-
    // switch behave the same. Previously these two defaults disagreed and the
    // list silently re-sorted the moment you touched a tab.
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

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
                if (Array.isArray(parsed)) {
                    const valid = new Set(TOGGLEABLE_COLUMNS.map((c) => c.key));
                    return parsed.filter((k) => valid.has(k));
                }
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
    const [renewForm, setRenewForm] = useState({ plan: '', date: '', amount: '' });
    const [renewalTxn, setRenewalTxn] = useState(null); // transaction awaiting payment recording
    const [settings, setSettings] = useState(null);

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

    useEffect(() => {
        setPage(1);
    }, [genderFilter, sortConfig, limit]);

    // ── Fetch members via TanStack Query ────────────────────────
    // Filters are memoized so the query key stays stable between renders.
    // Cache invalidation on member:* socket events is handled app-wide by
    // RealtimeSync (app/RealtimeSync.jsx) — no per-page socket subscription
    // needed here.
    const membersFilters = useMemo(() => {
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
        return params;
    }, [page, limit, debouncedSearch, genderFilter, sortConfig, activeTab]);

    const membersQuery = useMembers(membersFilters);
    const members = membersQuery.data?.items ?? [];
    const totalRecords = membersQuery.data?.pagination?.total ?? 0;
    const loading = membersQuery.isFetching;
    const fetchMembers = membersQuery.refetch;

    // ── Fetch settings for plans ────────────────────────────────
    useEffect(() => {
        api.get(`/settings`)
            .then(res => {
                // response.data IS already the unwrapped payload — don't re-unwrap in feature code
                const settingsData = res.data;
                setSettings(settingsData);
            })
            .catch(err => console.error('Failed to load settings', err));
    }, [backendUrl]);

    // ── Expiring soon count (for warning FAB) ───────────────────
    // Also refetched by RealtimeSync on member:* events because reminders
    // and members share a lifecycle.
    const pendingRemindersQuery = useQuery({
        queryKey: ['reminders', 'with-status', 'pending-count'],
        queryFn: async () => {
            const res = await api.get('/reminders/with-status');
            const rows = Array.isArray(res.data) ? res.data : [];
            return rows.filter((u) => u.dews <= 4 && u.dews >= 0 && u.reminderStatus === 'Pending').length;
        },
    });
    const pendingCount = pendingRemindersQuery.data ?? 0;

    // ── Global member counts (tab-independent, for stats row) ───
    const activeTabStatus = (TAB_CONFIG.find(t => t.key === activeTab) || TAB_CONFIG[0]).status;
    const statsQuery = useMembersStats(activeTabStatus);
    const allStats = statsQuery.data ?? { total: 0, male: 0, female: 0 };

    // ── Sort ────────────────────────────────────────────────────
    const handleSort = (key) => setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));

    // ── Delete ──────────────────────────────────────────────────
    const deleteMemberMutation = useDeleteMember();
    const handleDeleteClick = () => {
        const { id } = deleteModal;
        deleteMemberMutation.mutate(id, {
            onSuccess: () => {
                toast.success('Member deleted');
                setDeleteModal({ isOpen: false, id: null, name: '' });
            },
            onError: () => {
                toast.error('Failed to delete');
            },
        });
    };

    // ── Renew ───────────────────────────────────────────────────
    const handleRenew = (memberId) => {
        if (renewingMemberId === memberId) {
            setRenewingMemberId(null);
        } else {
            setRenewForm({ plan: '', date: '', amount: '' });
            setRenewingMemberId(memberId);
        }
    };

    // Step 1: select plan+date+amount → backend creates Pending transaction
    const submitRenewal = async (memberId) => {
        if (!renewForm.plan || !renewForm.amount) {
            toast.error('Please select a plan and enter an amount');
            return;
        }
        const payload = { _isRenewal: true, plan: renewForm.plan, amount: Number(renewForm.amount) };
        if (renewForm.date) payload.date = renewForm.date;

        try {
            const res = await api.put(`/contacts/${memberId}`, payload);
            // Backend returns { member, transaction } for renewal
            const txn = res.data?.transaction || res.data;
            setRenewingMemberId(null);
            setRenewalTxn(txn); // open Step 2: RecordPaymentModal
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.response?.data?.error?.message ||
                'Failed to renew membership'
            );
        }
    };

    // Step 2 completion: payment recorded → refresh list
    const handleRenewalPaid = () => {
        setRenewalTxn(null);
        fetchMembers();
        toast.success('Membership renewed and payment recorded!');
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
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${row.dews > 0 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-500'}`}>
                    {row.dews > 0 ? 'Active' : 'Expired'}
                </span>
            ),
        },
        dews: {
            key: 'dews', label: 'Days Left', sortable: true,
            render: (row) => <span className={row.dews <= 0 ? 'text-zinc-700 font-medium' : 'text-gray-700 dark:text-gray-300'}>{row.dews <= 0 ? `${row.dews} (Expired)` : row.dews}</span>,
        },
        endDate: { key: 'endDate', label: 'End Date', sortable: true, render: (row) => <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(row.endDate)}</span> },
        createdAt: { key: 'createdAt', label: 'Joined On', sortable: true, render: (row) => <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(row.createdAt)}</span> },
        msgCount: {
            key: 'msgCount', label: 'Messages Sent', sortable: false,
            render: (row) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    (row.msgCount ?? 0) > 0
                        ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                        : 'text-gray-400 dark:text-gray-600'
                }`}>
                    {(row.msgCount ?? 0) > 0 ? `${row.msgCount} sent` : '0'}
                </span>
            ),
        },
    }), []);

    // Status is redundant on the Active / Expired tabs (every row has the
    // same status), so hide that toggle and column everywhere except the
    // All tab. This filters the canonical list without mutating the
    // persisted visibleColumns, so switching back to All restores it.
    const availableToggleableColumns = useMemo(
        () => (activeTab === 'all'
            ? TOGGLEABLE_COLUMNS
            : TOGGLEABLE_COLUMNS.filter(c => c.key !== 'status')),
        [activeTab]
    );

    const columns = useMemo(() => {
        const nameColumn = {
            key: 'name', label: 'Name', sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3 group">
                    {row.profileImage ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 dark:border-zinc-700 shadow-sm">
                            <img
                                src={row.profileImage.startsWith('http') ? row.profileImage : `${backendUrl}${row.profileImage}`}
                                alt={row.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${row.gender === 'Male' ? 'bg-zinc-100 dark:bg-zinc-700/50 text-zinc-900 dark:text-zinc-500' : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'}`}>
                            {row.name?.charAt(0)}
                        </div>
                    )}
                    <span className="font-medium text-gray-900 dark:text-gray-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-500 transition-colors">{row.name}</span>
                </div>
            ),
        };

        // Walk availableToggleableColumns (canonical order, minus columns
        // that are redundant on the current tab) and pick the ones enabled.
        const visibleSet = new Set(visibleColumns);
        const extras = availableToggleableColumns
            .filter(c => visibleSet.has(c.key))
            .map(c => columnRenderers[c.key])
            .filter(Boolean);

        return [nameColumn, ...extras];
    }, [visibleColumns, columnRenderers, backendUrl, availableToggleableColumns]);

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
            <button onClick={() => handleEditClick(row._id)} className="p-1.5 text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-lg" title="Edit">
                <FaEdit />
            </button>
            <button onClick={() => setDeleteModal({ isOpen: true, id: row._id, name: row.name })} className="p-1.5 text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-lg" title="Delete">
                <FaTrash />
            </button>
        </div>
    );

    // ── Mobile card ─────────────────────────────────────────────
    const renderMobileCard = (row) => {
        const visibleSet = new Set(visibleColumns);
        const showPhone = visibleSet.has('phone');
        // Everything except phone (which sits in the header subtitle) renders
        // as a label/value row in the metadata strip. availableToggleableColumns
        // drops status on Active / Expired tabs where it's redundant.
        const metaRows = availableToggleableColumns
            .filter(c => c.key !== 'phone' && visibleSet.has(c.key))
            .map(c => ({ key: c.key, label: c.label, value: columnRenderers[c.key]?.render(row) }))
            .filter(r => r.value != null);

        return (
            <>
                <div className="flex justify-between items-start mb-3 relative">
                    <div className="flex items-center gap-3 min-w-0">
                        {row.profileImage ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 dark:border-zinc-700 shadow-sm shrink-0">
                                <img
                                    src={row.profileImage.startsWith('http') ? row.profileImage : `${backendUrl}${row.profileImage}`}
                                    alt={row.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${row.gender === 'Male' ? 'bg-zinc-100 dark:bg-zinc-700/50 text-zinc-900 dark:text-zinc-500' : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'}`}>
                                {row.name?.charAt(0)}
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-white truncate">{row.name}</div>
                            {showPhone && row.phone && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{row.phone}</div>
                            )}
                        </div>
                    </div>

                    {row.phone && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleWhatsApp(row); }}
                            className="w-8 h-8 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center transition-colors shrink-0 ml-2"
                            title={whatsAppTitle(row)}
                        >
                            <FaWhatsapp size={16} />
                        </button>
                    )}
                </div>

                {metaRows.length > 0 && (
                    <div className="flex flex-col gap-1.5 mb-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
                        {metaRows.map(r => (
                            <div key={r.key} className="flex items-center justify-between gap-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">{r.label}</span>
                                <div className="text-sm text-right min-w-0 truncate">{r.value}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleRenew(row._id)} className="flex-1 py-1.5 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold rounded-full text-sm flex items-center justify-center gap-2 transition-colors shrink-0">
                        <FaRedo size={11} /> Renew
                    </button>
                    <button onClick={() => handleEditClick(row._id)} className="flex-1 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-500 font-semibold rounded-full text-sm flex items-center justify-center gap-2 transition-colors shrink-0">
                        <FaEdit /> Edit
                    </button>
                    <button onClick={() => setDeleteModal({ isOpen: true, id: row._id, name: row.name })} className="flex-1 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-500 font-semibold rounded-full text-sm flex items-center justify-center gap-2 transition-colors shrink-0">
                        <FaTrash /> Delete
                    </button>
                </div>
            </>
        );
    };

    // ── Selected Renewing Member for Modal ──────────────────────
    const renewingMember = members.find(m => m._id === renewingMemberId);

    const currentTab = TAB_CONFIG.find(t => t.key === activeTab) || TAB_CONFIG[0];

    // ── Empty state (no results after search) ──────────────────
    const EmptySearchState = () => (
        <div className="flex flex-col items-center justify-center py-24 px-6 relative overflow-hidden">
            {/* Concentric rings background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60 dark:opacity-40">
                <div className="absolute w-[200px] h-[200px] rounded-full border border-gray-200 dark:border-zinc-800" />
                <div className="absolute w-[360px] h-[360px] rounded-full border border-gray-200 dark:border-zinc-800" />
                <div className="absolute w-[520px] h-[520px] rounded-full border border-gray-200 dark:border-zinc-800 shadow-sm" />
                <div className="absolute w-[680px] h-[680px] rounded-full border border-gray-200 dark:border-zinc-800" />
            </div>

            {/* Scattered Avatars on the rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Inner Ring Avatars */}
                <img src="https://i.pravatar.cc/150?img=1" className="absolute w-8 h-8 rounded-full border-2 border-white dark:border-zinc-800 translate-x-[80px] -translate-y-[80px]" alt="avatar" />
                <img src="https://i.pravatar.cc/150?img=2" className="absolute w-7 h-7 rounded-full border-2 border-white dark:border-zinc-800 -translate-x-[90px] translate-y-[40px]" alt="avatar" />

                {/* Middle Ring Avatars */}
                <img src="https://i.pravatar.cc/150?img=3" className="absolute w-10 h-10 rounded-full border-2 border-white dark:border-zinc-800 translate-x-[150px] translate-y-[60px]" alt="avatar" />
                <img src="https://i.pravatar.cc/150?img=4" className="absolute w-8 h-8 rounded-full border-2 border-white dark:border-zinc-800 -translate-x-[160px] -translate-y-[100px]" alt="avatar" />
                <img src="https://i.pravatar.cc/150?img=5" className="absolute w-9 h-9 rounded-full border-2 border-white dark:border-zinc-800 -translate-x-[40px] translate-y-[160px]" alt="avatar" />

                {/* Outer Ring Avatars */}
                <img src="https://i.pravatar.cc/150?img=6" className="absolute w-8 h-8 rounded-full border-2 border-white dark:border-zinc-800 translate-x-[220px] -translate-y-[150px]" alt="avatar" />
                <img src="https://i.pravatar.cc/150?img=7" className="absolute w-7 h-7 rounded-full border-2 border-white dark:border-zinc-800 -translate-x-[240px] translate-y-[120px]" alt="avatar" />
            </div>

            {/* Center Icon */}
            <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 flex items-center justify-center mb-6 shadow-sm z-10">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center">
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
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all font-medium text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-2 text-sm"
                >
                    Clear search
                </button>
                <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-2 text-sm"
                >
                    <FaUserPlus size={12} /> Add member
                </button>
            </div>
        </div>
    );

    // Empty state (no members at all in tab)
    const EmptyTabState = () => (
        <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                {activeTab === 'inactive' ? <FaUserTimes className="text-gray-400" size={22} /> : <FaUsers className="text-gray-400" size={22} />}
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No {currentTab.label.toLowerCase()}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">There are no members in this category yet.</p>
            <button onClick={() => navigate('/register')} className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-zinc-200 transition-all flex items-center gap-2">
                <FaUserPlus size={12} /> Add member
            </button>
        </div>
    );

    return (
        <AppLayout title="Members" description="Manage your gym members, renewals, and contact details" icon={FaUsers} showGenderSwitch={false}>
            <Toaster position="top-right" containerStyle={{ top: 'calc(env(safe-area-inset-top) + 24px)' }} toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '10px' } }} />
            {/* ── Desktop Tab Bar ─────────────────────────────── */}
            <div className="hidden lg:block mb-6">
                <div className="flex items-end justify-between border-b border-gray-200 dark:border-zinc-800">
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
                                        ? 'border-zinc-900 text-zinc-900 dark:text-zinc-500 dark:border-white'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'
                                        }`}
                                >
                                    <Icon size={14} />
                                    {tab.label}
                                    {isActive && (
                                        <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-300">
                                            {allStats.total}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {/* Right: stats pills */}
                    <div className="flex items-center gap-4 pb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5"><FaUsers size={12} className="text-zinc-500" /> {allStats.total} total</span>
                        <span className="flex items-center gap-1.5"><FaMale size={12} className="text-zinc-500" /> {allStats.male} male</span>
                        <span className="flex items-center gap-1.5"><FaFemale size={12} className="text-pink-400" /> {allStats.female} female</span>
                    </div>
                </div>
            </div>

            {/* ── Mobile: simple tab pills ────────────────────── */}
            <div className="flex lg:hidden gap-2 mb-4 w-full">
                {TAB_CONFIG.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${isActive
                                ? 'bg-zinc-100 text-zinc-900 shadow-md shadow-zinc-200/50'
                                : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-800'
                                }`}
                        >
                            <Icon size={11} />
                            {tab.label.replace(' Members', '')}
                            {isActive && <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20">{allStats.total}</span>}
                        </button>
                    );
                })}
            </div>

            {/* ── Toolbar & Table Card (Combined Full Size) ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col mb-4">

                {/* Desktop Toolbar Header section */}
                <div className="hidden lg:flex flex-wrap gap-3 px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
                    {/* Search */}
                    <div className="relative flex-1 min-w-48 max-w-sm">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <FaTimesCircle size={14} />
                            </button>
                        )}
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto flex-wrap">
                        {/* Export to CSV — gated by feature flag, only on All Members tab */}
                        {activeTab === 'all' && hasFeature('memberExport') && (
                            <button
                                onClick={exportSelectedToCSV}
                                disabled={selectedIds.length === 0}
                                className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-500 rounded-lg text-sm font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                                className="p-2 text-gray-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-lg transition-colors border border-gray-200 dark:border-zinc-700"
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
                                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xl z-40 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Show columns</span>
                                            <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={availableToggleableColumns.every(c => visibleColumns.includes(c.key))}
                                                    onChange={(e) => setVisibleColumns(
                                                        e.target.checked ? availableToggleableColumns.map(c => c.key) : []
                                                    )}
                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-zinc-900 focus:ring-red-500"
                                                />
                                                Select All
                                            </label>
                                        </div>
                                        <div className="max-h-72 overflow-y-auto py-1">
                                            {/* Name is always shown — render disabled checkbox so the user knows */}
                                            <label className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed">
                                                <input type="checkbox" checked disabled className="w-4 h-4 rounded border-gray-300 text-zinc-900" />
                                                <span>Name</span>
                                                <span className="ml-auto text-[10px] uppercase">Required</span>
                                            </label>
                                            {availableToggleableColumns.map(col => {
                                                const checked = visibleColumns.includes(col.key);
                                                return (
                                                    <label
                                                        key={col.key}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={(e) => {
                                                                setVisibleColumns(prev => e.target.checked
                                                                    ? [...prev, col.key]
                                                                    : prev.filter(k => k !== col.key));
                                                            }}
                                                            className="w-4 h-4 rounded border-gray-300 text-zinc-900 focus:ring-red-500"
                                                        />
                                                        <span>{col.label}</span>
                                                        {checked && <FaCheck className="ml-auto text-zinc-700" size={10} />}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <div className="px-4 py-2 border-t border-gray-100 dark:border-zinc-800 flex justify-between">
                                            <button
                                                onClick={() => setVisibleColumns(DEFAULT_VISIBLE_COLUMNS)}
                                                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                            >
                                                Reset to default
                                            </button>
                                            <button
                                                onClick={() => setColumnChooserOpen(false)}
                                                className="text-xs font-medium text-zinc-900 hover:text-zinc-700"
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
                            className="p-2 text-gray-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-lg transition-colors border border-transparent dark:hover:border-zinc-700"
                            title="Refresh"
                        >
                            <FaSync size={13} className={loading ? 'animate-spin' : ''} />
                        </button>
                        {/* Gender filter */}
                        <div className="inline-flex bg-gray-100 dark:bg-zinc-800/50 rounded-lg p-1 border border-gray-100 dark:border-zinc-800">
                            {['all', 'Male', 'Female'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setGenderFilter(f)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${genderFilter === f
                                        ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                        }`}
                                >
                                    {f === 'all' ? 'All' : f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Toolbar */}
                <div className="flex lg:hidden gap-3 px-4 py-3 border-b border-gray-200 dark:border-zinc-800 items-center bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <FaTimesCircle size={14} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setDraftGender(genderFilter);
                            setDraftVisibleColumns(visibleColumns);
                            setIsFilterSheetOpen(true);
                        }}
                        className="w-10 h-10 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm shrink-0 active:bg-gray-50 transition-colors"
                    >
                        <FaFilter size={14} />
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-md shadow-zinc-900/25 active:scale-95 transition-all shrink-0"
                    >
                        <FaPlus size={16} />
                    </button>
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
                        hoverColor={activeTab === 'inactive' ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/20'}
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
            <div className="fixed bottom-24 right-4 z-10 lg:bottom-6 lg:right-6">
                <button
                    onClick={() => navigate('/inactivesoon')}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-gray-200 dark:border-zinc-800 hover:shadow-xl transition-shadow relative"
                    aria-label="Expiring Soon"
                >
                    <FaExclamationTriangle className="text-orange-500 text-xl" />
                    {pendingCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-900 px-1 text-xs font-bold text-white">
                            {pendingCount}
                        </span>
                    )}
                </button>
            </div>

            {/* ── STEP 1: Plan + Date + Amount ── */}
            {renewingMemberId && renewingMember && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <FaRedo className="text-zinc-900 dark:text-white" size={14} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white text-base">Renew Membership</h3>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{renewingMember.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setRenewingMemberId(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-400"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4">
                            {/* Plan selector */}
                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Plan</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {settings?.plans?.filter(p => p.isActive)?.map((p, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setRenewForm(f => ({ ...f, plan: p.name, amount: p.price }))}
                                            className={`flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all ${
                                                renewForm.plan === p.name
                                                    ? 'bg-zinc-900 border-zinc-900 text-white'
                                                    : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-zinc-400'
                                            }`}
                                        >
                                            <span className="text-xs font-black">{p.name}</span>
                                            <span className={`text-[11px] font-semibold mt-0.5 ${renewForm.plan === p.name ? 'text-zinc-300' : 'text-gray-400'}`}>
                                                ₹{Number(p.price).toLocaleString('en-IN')}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {!settings?.plans?.length && (
                                    <p className="text-xs text-gray-400 text-center py-3">No plans configured. Go to Settings to add plans.</p>
                                )}
                            </div>

                            {/* Amount override */}
                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Amount (₹)</label>
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus-within:border-zinc-900 transition-colors">
                                    <span className="text-gray-400 font-bold text-sm">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={renewForm.amount}
                                        onChange={(e) => setRenewForm(f => ({ ...f, amount: e.target.value }))}
                                        placeholder="0"
                                        className="flex-1 bg-transparent outline-none font-black text-lg text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Start date (optional) */}
                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                                    Start Date <span className="text-gray-300 normal-case font-normal">(optional — defaults to today)</span>
                                </label>
                                <DatePicker
                                    value={renewForm.date}
                                    onChange={(e) => setRenewForm(f => ({ ...f, date: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setRenewingMemberId(null)}
                                className="flex-1 py-3 rounded-xl font-black text-[11px] uppercase bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-200 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => submitRenewal(renewingMemberId)}
                                disabled={!renewForm.plan || !renewForm.amount}
                                className="flex-[2] py-3 rounded-xl font-black text-[11px] uppercase bg-zinc-900 hover:bg-zinc-800 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Continue to Payment →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Record Payment (RecordPaymentModal) ── */}
            {renewalTxn && (
                <RecordPaymentModal
                    transactionId={renewalTxn._id}
                    totalAmount={renewalTxn.amount}
                    paidSoFar={0}
                    memberName={renewalTxn.memberName}
                    onClose={() => { setRenewalTxn(null); fetchMembers(); }}
                    onPaid={handleRenewalPaid}
                />
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
            {/* Mobile Bottom Filter Sheet */}
            <AnimatePresence>
                {isFilterSheetOpen && (
                    <>
                        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setIsFilterSheetOpen(false)} />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="fixed inset-x-0 bottom-0 z-[70] bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl pb-safe flex flex-col max-h-[85vh] lg:hidden"
                        >
                            {/* Drag Handle */}
                            <div className="flex justify-center pt-3 pb-2 shrink-0">
                                <div className="w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="flex justify-between items-center px-6 pb-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
                                <h3 className="font-bold text-lg dark:text-white tracking-tight">Filters</h3>
                                <button
                                    onClick={() => {
                                        setDraftGender('all');
                                        setDraftVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-95 transition-all"
                                >
                                    Reset to Default
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                                {/* Gender Section */}
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 block">Gender</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['all', 'Male', 'Female'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setDraftGender(f)}
                                                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${draftGender === f
                                                    ? 'bg-zinc-900 border border-zinc-900 text-white shadow-zinc-900/20'
                                                    : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-600'
                                                    }`}
                                            >
                                                {f === 'all' ? 'All' : f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Columns to show */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Columns to show</label>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">Name is always shown</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableToggleableColumns.map(col => {
                                            const checked = draftVisibleColumns.includes(col.key);
                                            const toggle = () => setDraftVisibleColumns(prev => (
                                                prev.includes(col.key)
                                                    ? prev.filter(k => k !== col.key)
                                                    : [...prev, col.key]
                                            ));
                                            return (
                                                <label
                                                    key={col.key}
                                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer border select-none active:scale-[0.98] ${checked
                                                        ? 'bg-zinc-50 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700'
                                                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/40'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={toggle}
                                                        className="sr-only"
                                                    />
                                                    <div
                                                        aria-hidden="true"
                                                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors border shrink-0 ${checked ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900' : 'border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900'}`}
                                                    >
                                                        {checked && <FaCheck size={10} />}
                                                    </div>
                                                    <span className={`text-sm font-semibold truncate ${checked ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{col.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
                                <button
                                    onClick={() => {
                                        setGenderFilter(draftGender);
                                        setVisibleColumns(draftVisibleColumns);
                                        setIsFilterSheetOpen(false);
                                    }}
                                    className="w-full py-3.5 bg-zinc-900 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-zinc-900/20"
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

export default MembersPage;
