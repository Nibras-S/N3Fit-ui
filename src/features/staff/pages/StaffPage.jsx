import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from '../../auth/context/AuthContext';
import AppLayout from '../../../shared/components/layout/AppLayout';
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';
import {
    FaPlus, FaEdit, FaTrash, FaUserShield, FaUsers, FaUserCheck, FaUserTimes,
    FaTimes, FaEye, FaEyeSlash, FaSearch
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AVAILABLE_PERMISSIONS = [
    { key: "members", label: "Members", desc: "View & manage members" },
    { key: "payments", label: "Payments", desc: "Handle transactions" },
    { key: "reports", label: "Reports", desc: "View reports & analytics" },
];

const StaffManagement = () => {
    const { api } = useAuth();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null); // null = create, object = edit
    const [formData, setFormData] = useState({
        name: "", email: "", password: "", permissions: ["members", "payments"]
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const fetchStaff = useCallback(async () => {
        try {
            const res = await api.get("/api/gym/staff");
            const data = Array.isArray(res.data?.data) ? res.data.data
                : Array.isArray(res.data?.staff) ? res.data.staff
                    : Array.isArray(res.data) ? res.data : [];
            setStaff(data);
        } catch (err) {
            toast.error("Failed to load staff");
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    // Stats
    const activeCount = staff.filter(s => s.isActive).length;
    const inactiveCount = staff.length - activeCount;

    // Filtered
    const filtered = staff.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    // Open modal
    const openCreateModal = () => {
        setEditingStaff(null);
        setFormData({ name: "", email: "", password: "", permissions: ["members", "payments"] });
        setShowPassword(false);
        setModalOpen(true);
    };

    const openEditModal = (member) => {
        setEditingStaff(member);
        setFormData({
            name: member.name,
            email: member.email,
            password: "",
            permissions: member.permissions || ["members", "payments"]
        });
        setModalOpen(true);
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingStaff) {
                await api.put(`/api/gym/staff/${editingStaff._id}`, {
                    name: formData.name,
                    permissions: formData.permissions,
                });
                toast.success("Staff updated!");
            } else {
                await api.post("/api/auth/register", {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: "staff",
                    permissions: formData.permissions,
                });
                toast.success("Staff member added!");
            }
            setModalOpen(false);
            fetchStaff();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle active
    const toggleActive = async (member) => {
        try {
            await api.put(`/api/gym/staff/${member._id}`, { isActive: !member.isActive });
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
    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            setDeletingId(confirmDeleteId);
            await api.delete(`/api/gym/staff/${confirmDeleteId}`);
            toast.success("Staff removed");
            fetchStaff();
        } catch (err) {
            toast.error("Failed to remove staff");
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
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
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
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
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your fit club's team members</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/25 text-sm"
                    >
                        <FaPlus size={12} /> Add Staff
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <FaUsers className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{staff.length}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Staff</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
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
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <FaUserTimes className="text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{inactiveCount}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Inactive</p>
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>

                {/* Staff Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
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
                                    <tr key={member._id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${member.isActive ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-slate-700 text-gray-400"}`}>
                                                    {member.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white text-sm">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{member.email}</td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => toggleActive(member)}
                                                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium cursor-pointer transition-colors ${member.isActive
                                                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                                                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? "bg-green-500" : "bg-red-500"}`}></span>
                                                {member.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-1.5 flex-wrap">
                                                {(member.permissions || []).map(p => (
                                                    <span key={p} className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 capitalize">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(member.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(member)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member._id)}
                                                    disabled={deletingId === member._id}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deletingId === member._id ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <FaTrash size={13} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-gray-400">
                                            <FaUserShield size={28} className="mx-auto mb-3 opacity-40" />
                                            <p className="font-medium">No staff members yet</p>
                                            <p className="text-xs mt-1">Click "Add Staff" to invite your first team member</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-700">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <FaUserShield size={28} className="mx-auto mb-3 opacity-40" />
                                <p className="font-medium">No staff members yet</p>
                                <p className="text-xs mt-1">Click "Add Staff" to invite your first team member</p>
                            </div>
                        ) : (
                            filtered.map((member) => (
                                <div key={member._id} className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${member.isActive ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-slate-700 text-gray-400"}`}>
                                                {member.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{member.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleActive(member)}
                                            className={`text-xs px-3 py-1.5 rounded-full font-medium ${member.isActive
                                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                                }`}
                                        >
                                            {member.isActive ? "Active" : "Inactive"}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1.5 flex-wrap">
                                            {(member.permissions || []).map(p => (
                                                <span key={p} className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 capitalize">{p}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openEditModal(member)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                                <FaEdit size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(member._id)} disabled={deletingId === member._id}
                                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                                                {deletingId === member._id ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div> : <FaTrash size={13} />}
                                            </button>
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
                            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {editingStaff ? "Edit Staff" : "Add New Staff"}
                                </h3>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <FaTimes size={14} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                {!editingStaff && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                                                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

                                {/* Permissions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
                                    <div className="space-y-2">
                                        {AVAILABLE_PERMISSIONS.map(perm => (
                                            <label
                                                key={perm.key}
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.permissions.includes(perm.key)
                                                    ? "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10"
                                                    : "border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions.includes(perm.key)}
                                                    onChange={() => togglePermission(perm.key)}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                                        className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : editingStaff ? "Save Changes" : "Add Staff"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title="Remove Staff Member"
                message="Are you sure you want to remove this staff member? This action cannot be undone."
                confirmText="Remove Staff"
                cancelText="Cancel"
                type="danger"
            />
        </AppLayout>
    );
};

export default StaffManagement;
