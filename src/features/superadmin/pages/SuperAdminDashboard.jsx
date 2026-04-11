import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from '../../auth/context/AuthContext';
import AppLayout from '../../../shared/components/layout/AppLayout';
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';
import {
    FaPlus, FaBuilding, FaUsers, FaRupeeSign, FaChartLine, FaToggleOn, FaToggleOff,
    FaTimes, FaSearch, FaGlobe, FaCogs, FaEdit, FaTrash, FaEye, FaEyeSlash
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const SuperAdminDashboard = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [gyms, setGyms] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Create gym modal
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        name: "", contactEmail: "", contactPhone: "", address: "",
        adminName: "", adminEmail: "", adminPassword: "", saaSPlanId: ""
    });

    // Deletion Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [gymToDelete, setGymToDelete] = useState(null);

    const fetchAll = useCallback(async () => {
        try {
            const [analyticsRes, gymsRes, plansRes] = await Promise.all([
                api.get('/superadmin/analytics'),
                api.get('/superadmin/gyms'),
                api.get('/superadmin/plans'),
            ]);
            setAnalytics(analyticsRes.data);
            setGyms(gymsRes.data);
            setPlans(plansRes.data);
        } catch (err) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const formatCurrency = (v) => `₹${(v || 0).toLocaleString("en-IN")}`;

    const filtered = gyms.filter(g =>
        g.name?.toLowerCase().includes(search.toLowerCase()) ||
        g.gymCode?.toLowerCase().includes(search.toLowerCase())
    );

    // Toggle gym active
    const toggleGym = async (gym) => {
        try {
            await api.put(`/superadmin/gyms/${gym._id}`, { isActive: !gym.isActive });
            toast.success(gym.isActive ? `${gym.name} deactivated` : `${gym.name} activated`);
            fetchAll();
        } catch (err) {
            toast.error("Failed to update gym");
        }
    };

    // Create gym
    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/superadmin/gyms', form);
            toast.success("Gym created successfully!");
            setModalOpen(false);
            setForm({ name: "", contactEmail: "", contactPhone: "", address: "", adminName: "", adminEmail: "", adminPassword: "", saaSPlanId: "" });
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create gym");
        } finally {
            setSubmitting(false);
        }
    };


    // Delete gym (soft delete)
    const handleDelete = async () => {
        if (!gymToDelete) return;
        try {
            await api.delete(`/superadmin/gyms/${gymToDelete._id}`);
            toast.success(`${gymToDelete.name} deleted successfully`);
            fetchAll();
        } catch (err) {
            toast.error("Failed to delete gym");
        }
    };

    if (loading) {
        return (
            <AppLayout showGenderSwitch={false}>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Overview</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Super Admin — Fit management platform</p>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 active:scale-95 transition-all shadow-lg shadow-zinc-900/25 text-sm"
                    >
                        <FaPlus size={12} /> Create Gym
                    </button>
                </div>

                {/* Stats Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-red-950 to-rose-950 p-6 rounded-2xl text-white shadow-lg">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2 opacity-75">
                                <FaBuilding size={12} />
                                <p className="text-xs uppercase">Total Fit Clubs</p>
                            </div>
                            <p className="text-2xl font-bold">{analytics?.totalGyms || 0}</p>
                            <p className="text-xs opacity-60 mt-1">{analytics?.activeGyms || 0} active</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2 opacity-75">
                                <FaUsers size={12} />
                                <p className="text-xs uppercase">Total Members</p>
                            </div>
                            <p className="text-2xl font-bold">{(analytics?.totalMembers || 0).toLocaleString()}</p>
                            <p className="text-xs opacity-60 mt-1">across all fit clubs</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2 opacity-75">
                                <FaRupeeSign size={12} />
                                <p className="text-xs uppercase">Total Revenue</p>
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(analytics?.totalRevenue)}</p>
                            <p className="text-xs opacity-60 mt-1">platform-wide</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2 opacity-75">
                                <FaGlobe size={12} />
                                <p className="text-xs uppercase">Total Users</p>
                            </div>
                            <p className="text-2xl font-bold">{analytics?.totalUsers || 0}</p>
                            <p className="text-xs opacity-60 mt-1">admins + staff</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2 opacity-75">
                                <FaChartLine size={12} />
                                <p className="text-xs uppercase">Inactive</p>
                            </div>
                            <p className="text-2xl font-bold text-red-300">{analytics?.inactiveGyms || 0}</p>
                            <p className="text-xs opacity-60 mt-1">fit clubs paused</p>
                        </div>
                    </div>
                </div>

                {/* Plan Distribution */}
                {analytics?.gymsByPlan?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {analytics.gymsByPlan.map((p, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{p._id || "No Plan"}</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{p.count}</p>
                                <p className="text-xs text-gray-400">fit clubs</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Search */}
                <div className="relative max-w-sm">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search fit clubs..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                    />
                </div>

                {/* Gyms Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Gym</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Code</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Plan</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Members</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Staff</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Created</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((gym) => (
                                    <tr
                                        key={gym._id}
                                        onClick={() => navigate(`/superadmin/gyms/${gym._id}`)}
                                        className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer group/row"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${gym.isActive ? "bg-zinc-100 dark:bg-zinc-700/50 text-red-600 dark:text-red-400" : "bg-gray-100 dark:bg-slate-700 text-gray-400"}`}>
                                                    {gym.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-900 dark:text-white text-sm block">{gym.name}</span>
                                                    {gym.contactEmail && <span className="text-xs text-gray-400">{gym.contactEmail}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-mono px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">{gym.gymCode}</span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{gym.saaSPlan?.name || "—"}</td>
                                        <td className="px-5 py-4 text-sm font-semibold text-gray-800 dark:text-white">{gym.stats?.memberCount || 0}</td>
                                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{gym.stats?.staffCount || 0}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${gym.isActive
                                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                                : "bg-zinc-50 dark:bg-zinc-800/50 text-red-700 dark:text-red-400"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${gym.isActive ? "bg-green-500" : "bg-zinc-900"}`}></span>
                                                {gym.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(gym.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => navigate(`/superadmin/gyms/${gym._id}?edit=true`)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                                    title="Edit Details"
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setGymToDelete(gym);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete Fit Club"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                                <div className="w-[1px] h-4 bg-gray-100 dark:bg-slate-700 mx-1"></div>
                                                <button
                                                    onClick={() => navigate(`/superadmin/gyms/${gym._id}#features`)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Manage Features"
                                                >
                                                    <FaCogs size={16} />
                                                </button>
                                                <button
                                                    onClick={() => toggleGym(gym)}
                                                    className={`p-2 rounded-lg transition-colors ${gym.isActive
                                                        ? "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                        : "text-red-400 hover:bg-zinc-50 dark:hover:bg-red-900/20"
                                                        }`}
                                                    title={gym.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {gym.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-12 text-gray-400">
                                            <FaBuilding size={28} className="mx-auto mb-3 opacity-40" />
                                            <p className="font-medium">No gyms found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ─── Create Gym Modal ─── */}
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
                            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Create New Fit Club</h3>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <FaTimes size={14} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="p-5 space-y-4">
                                {/* Gym Details */}
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fit Club Details</p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Fit Club Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                        placeholder="FitZone Gym"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Email</label>
                                        <input
                                            type="email"
                                            value={form.contactEmail}
                                            onChange={(e) => setForm(p => ({ ...p, contactEmail: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                            placeholder="info@gym.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                                        <input
                                            type="text"
                                            value={form.contactPhone}
                                            onChange={(e) => setForm(p => ({ ...p, contactPhone: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
                                    <input
                                        type="text"
                                        value={form.address}
                                        onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                        placeholder="123 Main Street, City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">SaaS Plan</label>
                                    <select
                                        value={form.saaSPlanId}
                                        onChange={(e) => setForm(p => ({ ...p, saaSPlanId: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                    >
                                        <option value="">No plan (free trial)</option>
                                        {plans.map(p => (
                                            <option key={p._id} value={p._id}>{p.name} — {formatCurrency(p.price)}/mo</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Admin Account */}
                                <div className="border-t border-gray-100 dark:border-slate-700 pt-4 mt-4">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Admin Account</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Admin Name</label>
                                    <input
                                        type="text"
                                        value={form.adminName}
                                        onChange={(e) => setForm(p => ({ ...p, adminName: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                        placeholder="Gym Owner Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Admin Email *</label>
                                    <input
                                        type="email"
                                        value={form.adminEmail}
                                        onChange={(e) => setForm(p => ({ ...p, adminEmail: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                        placeholder="admin@newgym.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Admin Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={form.adminPassword}
                                            onChange={(e) => setForm(p => ({ ...p, adminPassword: e.target.value }))}
                                            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
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
                                        className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : "Create Fit Club"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Deactivate Fit Club"
                message={`Are you sure you want to deactivate ${gymToDelete?.name}? This will move them to the Recycling Bin.`}
                confirmText="Deactivate"
                cancelText="Keep Active"
            />
        </AppLayout>
    );
};

export default SuperAdminDashboard;
