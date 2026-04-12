import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from '../../auth/context/AuthContext';
import AppLayout from '../../../shared/components/layout/AppLayout';
import { TableSkeleton } from '../../../shared/components/ui/Skeleton';
import { ButtonSpinner } from '../../../shared/components/ui/Skeleton';
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';
import {
    FaPlus, FaEdit, FaTrash, FaUserShield, FaUsers, FaUserCheck, FaUserTimes,
    FaTimes, FaEye, FaEyeSlash, FaSearch, FaFilePdf, FaFileImage, FaPaperclip,
    FaArchive, FaUndo, FaCalendarAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Mirrors VALID_PERMISSIONS in N3Fit-api/src/config/permissions.js — keep in
// sync if a new feature is added. Each entry maps a sidebar/feature module
// to a checkbox in the staff form so admins can grant access per item.
const AVAILABLE_PERMISSIONS = [
    { key: "dashboard", label: "Dashboard", desc: "View dashboard & analytics" },
    { key: "members", label: "Members", desc: "View & manage members" },
    { key: "payments", label: "Payments", desc: "Handle transactions & invoices" },
    { key: "expenses", label: "Expenses", desc: "Record and view expenses" },
    { key: "reports", label: "Reports", desc: "View reports & analytics" },
    { key: "staff", label: "Staff", desc: "Manage other staff members" },
    { key: "settings", label: "Settings", desc: "Edit gym profile & settings" },
    { key: "notifications", label: "Notifications", desc: "View alerts & notifications" },
    { key: "whatsapp", label: "WhatsApp", desc: "Send WhatsApp notifications" },
    { key: "announcements", label: "Announcements", desc: "Post announcements" },
];

const StaffManagement = () => {
    const { api } = useAuth();
    // Both lists are kept around so the stats cards (which always summarise
    // the active roster) stay accurate even while the user is browsing the
    // archive bin.
    const [activeStaff, setActiveStaff] = useState([]);
    const [archivedStaff, setArchivedStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    // 'active' shows the working roster, 'archived' shows the soft-delete bin.
    // The two views fetch from the same endpoint with different query flags.
    const [view, setView] = useState('active');
    const staff = view === 'archived' ? archivedStaff : activeStaff;
    const archivedCount = archivedStaff.length;

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null); // null = create, object = edit
    const [formData, setFormData] = useState({
        name: "", email: "", password: "", permissions: ["members", "payments"], joiningDate: "", hasLogin: true,
    });
    const [idProofFile, setIdProofFile] = useState(null); // newly selected File
    const [existingIdProofUrl, setExistingIdProofUrl] = useState(null); // already saved
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [restoringId, setRestoringId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const fetchStaff = useCallback(async () => {
        try {
            setLoading(true);
            // Fire both lists in parallel so the archive badge stays accurate
            // even when the user is viewing the active roster.
            const [activeRes, archivedRes] = await Promise.all([
                api.get('/gym/staff'),
                api.get('/gym/staff', { params: { archived: 'true' } }),
            ]);
            // response.data IS already the unwrapped payload — don't re-unwrap in feature code
            const unwrap = (res) => Array.isArray(res.data) ? res.data : [];
            setActiveStaff(unwrap(activeRes));
            setArchivedStaff(unwrap(archivedRes));
        } catch (err) {
            console.error('Failed to load staff', err);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    // Stats always describe the active roster, regardless of which view is on
    // screen. The third card switches between Inactive and Archived in JSX.
    const activeCount = activeStaff.filter(s => s.isActive).length;
    const inactiveCount = activeStaff.length - activeCount;

    // Filtered
    const filtered = staff.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    // Open modal
    const openCreateModal = () => {
        setEditingStaff(null);
        setFormData({
            name: "", email: "", password: "",
            permissions: ["members", "payments"],
            joiningDate: "",
            hasLogin: true,
        });
        setIdProofFile(null);
        setExistingIdProofUrl(null);
        setShowPassword(false);
        setModalOpen(true);
    };

    const openEditModal = (member) => {
        setEditingStaff(member);
        setFormData({
            name: member.name,
            email: member.email,
            password: "",
            permissions: member.permissions || ["members", "payments"],
            // The backend stores ISO timestamps; <input type="date"> needs YYYY-MM-DD.
            joiningDate: member.joiningDate ? new Date(member.joiningDate).toISOString().split('T')[0] : "",
        });
        setIdProofFile(null);
        setExistingIdProofUrl(member.idProofUrl || null);
        setModalOpen(true);
    };

    const backendOrigin = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/api\/v1\/?$/, '');
    const idProofHref = (url) => (url?.startsWith('http') ? url : `${backendOrigin}${url}`);

    const handleIdProofChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowed.includes(file.type)) {
            toast.error('ID proof must be a JPG, PNG, or PDF');
            e.target.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('ID proof must be under 5 MB');
            e.target.value = '';
            return;
        }
        setIdProofFile(file);
    };

    // Submit form
    //
    // We always send multipart/form-data when an ID proof file is attached so
    // the same endpoint works whether or not a document is uploaded. The
    // backend's multer middleware is a no-op for JSON requests, so attaching
    // the file is the only thing that flips the wire format.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingStaff) {
                if (idProofFile) {
                    const fd = new FormData();
                    fd.append('name', formData.name);
                    fd.append('permissions', JSON.stringify(formData.permissions));
                    fd.append('joiningDate', formData.joiningDate || '');
                    fd.append('idProof', idProofFile);
                    await api.put(`/gym/staff/${editingStaff._id}`, fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                } else {
                    await api.put(`/gym/staff/${editingStaff._id}`, {
                        name: formData.name,
                        permissions: formData.permissions,
                        joiningDate: formData.joiningDate || null,
                    });
                }
                toast.success("Staff updated!");
            } else {
                if (idProofFile) {
                    const fd = new FormData();
                    fd.append('name', formData.name);
                    fd.append('hasLogin', formData.hasLogin ? 'true' : 'false');
                    if (formData.hasLogin) {
                        fd.append('email', formData.email);
                        fd.append('password', formData.password);
                    }
                    fd.append('role', 'staff');
                    fd.append('permissions', JSON.stringify(formData.permissions));
                    fd.append('joiningDate', formData.joiningDate || '');
                    fd.append('idProof', idProofFile);
                    await api.post('/auth/register', fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                } else {
                    await api.post('/auth/register', {
                        name: formData.name,
                        hasLogin: formData.hasLogin,
                        email: formData.hasLogin ? formData.email : undefined,
                        password: formData.hasLogin ? formData.password : undefined,
                        role: 'staff',
                        permissions: formData.permissions,
                        joiningDate: formData.joiningDate || null,
                    });
                }
                toast.success("Staff member added!");
            }
            setModalOpen(false);
            fetchStaff();
        } catch (err) {
            const details = err.response?.data?.error?.details;
            if (details?.length) {
                details.forEach(d => toast.error(`${d.field}: ${d.message}`));
            } else {
                toast.error(err.response?.data?.message || "Operation failed");
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle active
    const toggleActive = async (member) => {
        try {
            await api.put(`/gym/staff/${member._id}`, { isActive: !member.isActive });
            toast.success(member.isActive ? "Staff deactivated" : "Staff activated");
            fetchStaff();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    // Delete Trigger
    const handleDelete = (id) => {
        setConfirmDeleteId(id);
    };

    // Confirm Delete
    //
    // From the active view this is a soft archive (the backend keeps the row).
    // From the archive view it's a permanent delete via ?hard=true. The button
    // labels and confirmation copy below switch based on `view` accordingly.
    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            setDeletingId(confirmDeleteId);
            const url = view === 'archived'
                ? `/gym/staff/${confirmDeleteId}?hard=true`
                : `/gym/staff/${confirmDeleteId}`;
            await api.delete(url);
            toast.success(view === 'archived' ? 'Staff permanently deleted' : 'Staff archived');
            fetchStaff();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove staff');
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    // Restore an archived staff member back into the active roster. We leave
    // isActive=false on purpose so the admin reviews permissions before
    // re-enabling login.
    const handleRestore = async (id) => {
        try {
            setRestoringId(id);
            await api.post(`/gym/staff/${id}/restore`);
            toast.success('Staff restored — re-enable login from the active list');
            fetchStaff();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to restore staff');
        } finally {
            setRestoringId(null);
        }
    };

    // Permission toggle
    const togglePermission = (key) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(key)
                ? prev.permissions.filter(p => p !== key)
                : [...prev.permissions, key]
        }));
    };

    if (loading) {
        return (
            <AppLayout showGenderSwitch={false}>
                <div className="p-6"><TableSkeleton rows={6} cols={5} /></div>
            </AppLayout>
        );
    }

    return (
        <AppLayout showGenderSwitch={false}>
            <Toaster position="top-right" />
            <div className="space-y-6 pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {view === 'archived'
                                ? 'Soft-deleted staff. Restore to bring them back into the roster.'
                                : "Manage your fit club's team members"}
                        </p>
                    </div>
                    {view === 'active' && (
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 active:scale-95 transition-all shadow-lg shadow-zinc-900/25 text-sm"
                        >
                            <FaPlus size={12} /> Add Staff
                        </button>
                    )}
                </div>

                {/* View tabs — Active vs Archived */}
                <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                    <button
                        onClick={() => setView('active')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            view === 'active'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-500 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        <FaUsers size={12} /> Active
                    </button>
                    <button
                        onClick={() => setView('archived')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            view === 'archived'
                                ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        <FaArchive size={12} /> Archived
                        {archivedCount > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                                view === 'archived'
                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                    : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'
                            }`}>
                                {archivedCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-700/50 flex items-center justify-center">
                                <FaUsers className="text-zinc-900 dark:text-zinc-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeStaff.length}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Staff</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <FaUserCheck className="text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                view === 'archived'
                                    ? 'bg-amber-100 dark:bg-amber-900/30'
                                    : 'bg-zinc-100 dark:bg-zinc-700/50'
                            }`}>
                                {view === 'archived'
                                    ? <FaArchive className="text-amber-600 dark:text-amber-400" />
                                    : <FaUserTimes className="text-zinc-900 dark:text-zinc-500" />}
                            </div>
                            <div>
                                {view === 'archived' ? (
                                    <>
                                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{archivedCount}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Archived</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-500">{inactiveCount}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Inactive</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search staff..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                    />
                </div>

                {/* Staff Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Staff Member</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Permissions</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Joined</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((member) => (
                                    <tr key={member._id} className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${member.isActive ? "bg-zinc-100 dark:bg-zinc-700/50 text-zinc-900 dark:text-zinc-500" : "bg-gray-100 dark:bg-zinc-800 text-gray-400"}`}>
                                                    {member.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-900 dark:text-white text-sm">{member.name}</span>
                                                    {member.hasLogin === false && (
                                                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 font-medium">No Login</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{member.email || <span className="italic text-gray-300 dark:text-zinc-700">—</span>}</td>
                                        <td className="px-5 py-4">
                                            {view === 'archived' ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                                                    <FaArchive size={9} /> Archived
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => toggleActive(member)}
                                                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium cursor-pointer transition-colors ${member.isActive
                                                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                                                        : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                                                        }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? "bg-green-500" : "bg-zinc-900"}`}></span>
                                                    {member.isActive ? "Active" : "Inactive"}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-1.5 flex-wrap">
                                                {(member.permissions || []).map(p => (
                                                    <span key={p} className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 capitalize">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {/* Show the user-supplied joining date when present, otherwise
                                                fall back to the account-creation timestamp so the column is
                                                never blank for legacy rows. */}
                                            {member.joiningDate
                                                ? new Date(member.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : new Date(member.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            {!member.joiningDate && (
                                                <span className="block text-[10px] text-gray-400 italic">account created</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {view === 'archived' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleRestore(member._id)}
                                                            disabled={restoringId === member._id}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
                                                            title="Restore"
                                                        >
                                                            {restoringId === member._id ? (
                                                                <span className="w-3.5 h-3.5 block bg-current rounded-full opacity-60 animate-pulse"></span>
                                                            ) : (
                                                                <FaUndo size={13} />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(member._id)}
                                                            disabled={deletingId === member._id}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors disabled:opacity-50"
                                                            title="Delete permanently"
                                                        >
                                                            {deletingId === member._id ? (
                                                                <span className="w-3.5 h-3.5 block bg-current rounded-full opacity-60 animate-pulse"></span>
                                                            ) : (
                                                                <FaTrash size={13} />
                                                            )}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => openEditModal(member)}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <FaEdit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(member._id)}
                                                            disabled={deletingId === member._id}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50"
                                                            title="Archive"
                                                        >
                                                            {deletingId === member._id ? (
                                                                <span className="w-3.5 h-3.5 block bg-current rounded-full opacity-60 animate-pulse"></span>
                                                            ) : (
                                                                <FaArchive size={13} />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-gray-400">
                                            {view === 'archived' ? (
                                                <>
                                                    <FaArchive size={28} className="mx-auto mb-3 opacity-40" />
                                                    <p className="font-medium">Archive bin is empty</p>
                                                    <p className="text-xs mt-1">Archived staff members will appear here</p>
                                                </>
                                            ) : (
                                                <>
                                                    <FaUserShield size={28} className="mx-auto mb-3 opacity-40" />
                                                    <p className="font-medium">No staff members yet</p>
                                                    <p className="text-xs mt-1">Click "Add Staff" to invite your first team member</p>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-zinc-800">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                {view === 'archived' ? (
                                    <>
                                        <FaArchive size={28} className="mx-auto mb-3 opacity-40" />
                                        <p className="font-medium">Archive bin is empty</p>
                                        <p className="text-xs mt-1">Archived staff members will appear here</p>
                                    </>
                                ) : (
                                    <>
                                        <FaUserShield size={28} className="mx-auto mb-3 opacity-40" />
                                        <p className="font-medium">No staff members yet</p>
                                        <p className="text-xs mt-1">Click "Add Staff" to invite your first team member</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            filtered.map((member) => (
                                <div key={member._id} className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${member.isActive && view === 'active' ? "bg-zinc-100 dark:bg-zinc-700/50 text-zinc-900 dark:text-zinc-500" : "bg-gray-100 dark:bg-zinc-800 text-gray-400"}`}>
                                                {member.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{member.name}</p>
                                                    {member.hasLogin === false && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 font-medium">No Login</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{member.email || <span className="italic">No email</span>}</p>
                                                {member.joiningDate && (
                                                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                        <FaCalendarAlt size={8} />
                                                        Joined {new Date(member.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {view === 'archived' ? (
                                            <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                                                Archived
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => toggleActive(member)}
                                                className={`text-xs px-3 py-1.5 rounded-full font-medium ${member.isActive
                                                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                                    : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-500"
                                                    }`}
                                            >
                                                {member.isActive ? "Active" : "Inactive"}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1.5 flex-wrap">
                                            {(member.permissions || []).map(p => (
                                                <span key={p} className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 capitalize">{p}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {view === 'archived' ? (
                                                <>
                                                    <button onClick={() => handleRestore(member._id)} disabled={restoringId === member._id}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50">
                                                        {restoringId === member._id ? <span className="w-3.5 h-3.5 block bg-current rounded-full opacity-60 animate-pulse"></span> : <FaUndo size={13} />}
                                                    </button>
                                                    <button onClick={() => handleDelete(member._id)} disabled={deletingId === member._id}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors disabled:opacity-50">
                                                        {deletingId === member._id ? <span className="w-3.5 h-3.5 block bg-current rounded-full opacity-60 animate-pulse"></span> : <FaTrash size={13} />}
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => openEditModal(member)} className="p-2 rounded-lg text-gray-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(member._id)} disabled={deletingId === member._id}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50">
                                                        {deletingId === member._id ? <span className="w-3.5 h-3.5 block bg-current rounded-full opacity-60 animate-pulse"></span> : <FaArchive size={13} />}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Add/Edit Modal ─── */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-zinc-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {editingStaff ? "Edit Staff" : "Add New Staff"}
                                </h3>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <FaTimes size={14} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                {!editingStaff && (
                                    <>
                                        {/* Login Access Toggle */}
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">App Login Access</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {formData.hasLogin ? 'Staff can log in to the app' : 'Roster-only — no app access'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, hasLogin: !p.hasLogin, email: '', password: '' }))}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.hasLogin ? 'bg-zinc-900 dark:bg-white' : 'bg-gray-300 dark:bg-zinc-700'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-900 shadow transition-transform ${formData.hasLogin ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>

                                        {formData.hasLogin && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                                        placeholder="staff@example.com"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={formData.password}
                                                            onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                                                            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                                            placeholder="Enter password"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Joining Date — optional reference for HR records */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                                        <FaCalendarAlt className="text-zinc-700 text-xs" /> Joining Date
                                        <span className="text-xs font-normal text-gray-400">(optional)</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.joiningDate}
                                        onChange={(e) => setFormData(p => ({ ...p, joiningDate: e.target.value }))}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        When this person actually joined the team — distinct from when their app account was created.
                                    </p>
                                </div>

                                {/* ID Proof Upload — PDF or image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                                        <FaPaperclip className="text-zinc-700 text-xs" /> ID Proof Document
                                        <span className="text-xs font-normal text-gray-400">(PDF / JPG / PNG, max 5 MB)</span>
                                    </label>

                                    {existingIdProofUrl && !idProofFile && (
                                        <div className="mb-2 flex items-center justify-between gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                                            <a
                                                href={idProofHref(existingIdProofUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs text-zinc-900 dark:text-zinc-500 hover:underline truncate"
                                            >
                                                {existingIdProofUrl.toLowerCase().endsWith('.pdf')
                                                    ? <FaFilePdf className="shrink-0" />
                                                    : <FaFileImage className="shrink-0" />}
                                                <span className="truncate">View current ID proof</span>
                                            </a>
                                            <span className="text-[10px] text-gray-400 shrink-0">replace below</span>
                                        </div>
                                    )}

                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-900 transition-colors">
                                        <input
                                            type="file"
                                            accept=".pdf,image/jpeg,image/jpg,image/png"
                                            onChange={handleIdProofChange}
                                            className="hidden"
                                        />
                                        <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-500 flex items-center justify-center shrink-0">
                                            {idProofFile?.type === 'application/pdf'
                                                ? <FaFilePdf />
                                                : idProofFile
                                                    ? <FaFileImage />
                                                    : <FaPaperclip />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                                {idProofFile?.name || 'Click to upload ID proof'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {idProofFile
                                                    ? `${(idProofFile.size / 1024).toFixed(1)} KB`
                                                    : 'Aadhaar, PAN, License — PDF or image'}
                                            </p>
                                        </div>
                                        {idProofFile && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setIdProofFile(null); }}
                                                className="p-1.5 rounded-md text-gray-400 hover:text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                                                title="Remove"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        )}
                                    </label>
                                </div>

                                {/* Permissions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
                                    <div className="space-y-2">
                                        {AVAILABLE_PERMISSIONS.map(perm => (
                                            <label
                                                key={perm.key}
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.permissions.includes(perm.key)
                                                    ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30"
                                                    : "border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-600"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions.includes(perm.key)}
                                                    onChange={() => togglePermission(perm.key)}
                                                    className="w-4 h-4 rounded border-gray-300 text-zinc-900 focus:ring-red-500"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{perm.label}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{perm.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <ButtonSpinner />
                                        ) : editingStaff ? "Save Changes" : "Add Staff"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Archive / Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title={view === 'archived' ? 'Permanently Delete Staff' : 'Archive Staff Member'}
                message={view === 'archived'
                    ? 'This will permanently delete the staff record. Historical references (expenses, transactions) may show "Unknown user". This cannot be undone.'
                    : "This staff member will be moved to the archive. They'll be hidden from rosters and dropdowns, but you can restore them anytime from the Archived tab."}
                confirmText={view === 'archived' ? 'Delete Permanently' : 'Move to Archive'}
                cancelText="Cancel"
                type="danger"
            />
        </AppLayout>
    );
};

export default StaffManagement;
