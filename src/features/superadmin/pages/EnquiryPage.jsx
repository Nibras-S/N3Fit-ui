import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaInbox, FaSearch, FaTimes } from 'react-icons/fa';
import AppLayout from '../../../shared/components/layout/AppLayout';
import api from '../../../shared/services/api';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'converted', label: 'Converted' },
    { value: 'closed', label: 'Closed' },
];

const STATUS_STYLES = {
    new:       'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    contacted: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    converted: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    closed:    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function EnquiryPage() {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Detail/edit panel
    const [selected, setSelected] = useState(null);
    const [notesDraft, setNotesDraft] = useState('');
    const [savingId, setSavingId] = useState(null);

    const fetchEnquiries = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (statusFilter !== 'all') params.status = statusFilter;
            const res = await api.get('/enquiries', { params });
            setEnquiries(res.data.data ?? res.data);
            setTotalPages(res.data.meta?.totalPages ?? 1);
        } catch {
            toast.error('Failed to load enquiries');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

    // Reset page on filter change
    useEffect(() => { setPage(1); }, [statusFilter]);

    const updateEnquiry = async (id, patch) => {
        setSavingId(id);
        try {
            await api.patch(`/enquiries/${id}`, patch);
            setEnquiries(prev =>
                prev.map(e => e._id === id ? { ...e, ...patch } : e)
            );
            if (selected?._id === id) setSelected(prev => ({ ...prev, ...patch }));
            toast.success('Updated');
        } catch {
            toast.error('Update failed');
        } finally {
            setSavingId(null);
        }
    };

    const handleStatusChange = (id, status) => updateEnquiry(id, { status });

    const saveNotes = () => {
        if (!selected) return;
        updateEnquiry(selected._id, { notes: notesDraft });
    };

    const openDetail = (enquiry) => {
        setSelected(enquiry);
        setNotesDraft(enquiry.notes ?? '');
    };

    const filtered = enquiries.filter(e =>
        !search ||
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase()) ||
        e.gymName?.toLowerCase().includes(search.toLowerCase()) ||
        e.phone?.includes(search)
    );

    return (
        <AppLayout title="Enquiries" icon={FaInbox}>
            <div className="p-4 md:p-6 space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search name, gym, email, phone…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/30 focus:border-zinc-900"
                        />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {STATUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setStatusFilter(opt.value)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${statusFilter === opt.value
                                    ? 'bg-zinc-900 text-white'
                                    : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-5">
                    {/* Table */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                            {loading ? (
                                <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
                            ) : filtered.length === 0 ? (
                                <div className="p-12 text-center">
                                    <FaInbox className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-sm text-gray-400">No enquiries found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40">
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name / Gym</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Contact</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Received</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                            {filtered.map(e => (
                                                <motion.tr
                                                    key={e._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    onClick={() => openDetail(e)}
                                                    className={`cursor-pointer transition-colors ${selected?._id === e._id
                                                        ? 'bg-zinc-100 dark:bg-zinc-800/30'
                                                        : 'hover:bg-gray-50 dark:hover:bg-zinc-800/40'
                                                    }`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">{e.name}</p>
                                                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{e.gymName}</p>
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                        <p className="text-gray-700 dark:text-gray-300">{e.email}</p>
                                                        <p className="text-xs text-gray-400">{e.phone}</p>
                                                    </td>
                                                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400 whitespace-nowrap">
                                                        {formatDate(e.createdAt)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <select
                                                            value={e.status}
                                                            disabled={savingId === e._id}
                                                            onClick={ev => ev.stopPropagation()}
                                                            onChange={ev => handleStatusChange(e._id, ev.target.value)}
                                                            className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer ${STATUS_STYLES[e.status]}`}
                                                        >
                                                            {STATUS_OPTIONS.filter(o => o.value !== 'all').map(o => (
                                                                <option key={o.value} value={o.value}>{o.label}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300"
                                >
                                    Prev
                                </button>
                                <span className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Detail panel */}
                    {selected && (
                        <motion.div
                            key={selected._id}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-72 shrink-0 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 space-y-4 self-start sticky top-6"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{selected.name}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{selected.gymName}</p>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400"
                                >
                                    <FaTimes size={13} />
                                </button>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                                    <p className="text-gray-700 dark:text-gray-300 break-all">{selected.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                                    <p className="text-gray-700 dark:text-gray-300">{selected.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Received</p>
                                    <p className="text-gray-700 dark:text-gray-300">{formatDate(selected.createdAt)}</p>
                                </div>
                                {selected.message && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-0.5">Message</p>
                                        <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-2">
                                            {selected.message}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 mb-1">Status</p>
                                <div className="flex gap-1.5 flex-wrap">
                                    {STATUS_OPTIONS.filter(o => o.value !== 'all').map(o => (
                                        <button
                                            key={o.value}
                                            onClick={() => handleStatusChange(selected._id, o.value)}
                                            disabled={savingId === selected._id}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${selected.status === o.value
                                                ? STATUS_STYLES[o.value]
                                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-600'
                                            }`}
                                        >
                                            {o.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 mb-1">Internal Notes</p>
                                <textarea
                                    value={notesDraft}
                                    onChange={e => setNotesDraft(e.target.value)}
                                    rows={4}
                                    maxLength={1000}
                                    placeholder="Add notes about this enquiry…"
                                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/30 focus:border-zinc-900 resize-none"
                                />
                                <button
                                    onClick={saveNotes}
                                    disabled={savingId === selected._id || notesDraft === (selected.notes ?? '')}
                                    className="mt-2 w-full py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors"
                                >
                                    Save Notes
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
