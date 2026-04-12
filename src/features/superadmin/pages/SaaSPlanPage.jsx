import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from '../../auth/context/AuthContext';
import AppLayout from '../../../shared/components/layout/AppLayout';
import { TableSkeleton } from '../../../shared/components/ui/Skeleton';
import { ButtonSpinner } from '../../../shared/components/ui/Skeleton';
import {
    FaPlus, FaEdit, FaTimes, FaCrown, FaCheck, FaUsers, FaUserShield
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const SaaSPlanManagement = () => {
    const { api } = useAuth();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "", price: "", billingCycle: "monthly",
        maxStaff: 2, maxMembers: 100, features: ""
    });

    const fetchPlans = useCallback(async () => {
        try {
            const res = await api.get('/superadmin/plans');
            // response.data IS already the unwrapped payload — don't re-unwrap in feature code
            const data = Array.isArray(res.data) ? res.data : [];
            setPlans(data);
        } catch (err) {
            toast.error("Failed to load plans");
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => { fetchPlans(); }, [fetchPlans]);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "", price: "", billingCycle: "monthly", maxStaff: 2, maxMembers: 100, features: "" });
        setModalOpen(true);
    };

    const openEdit = (plan) => {
        setEditing(plan);
        setForm({
            name: plan.name,
            price: plan.price,
            billingCycle: plan.billingCycle || "monthly",
            maxStaff: plan.maxStaff || 2,
            maxMembers: plan.maxMembers || 100,
            features: (plan.features || []).join(", ")
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                price: Number(form.price),
                maxStaff: Number(form.maxStaff),
                maxMembers: Number(form.maxMembers),
                features: form.features ? form.features.split(",").map(f => f.trim()).filter(Boolean) : []
            };
            if (editing) {
                await api.put(`/superadmin/plans/${editing._id}`, payload);
                toast.success("Plan updated!");
            } else {
                await api.post('/superadmin/plans', payload);
                toast.success("Plan created!");
            }
            setModalOpen(false);
            fetchPlans();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (v) => `₹${(v || 0).toLocaleString("en-IN")}`;

    const tierColors = [
        { bg: "from-zinc-800 to-red-600", light: "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-500" },
        { bg: "from-purple-500 to-purple-600", light: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" },
        { bg: "from-amber-500 to-amber-600", light: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" },
        { bg: "from-emerald-500 to-emerald-600", light: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" },
    ];

    if (loading) {
        return (
            <AppLayout showGenderSwitch={false}>
                <div className="p-6"><TableSkeleton rows={8} cols={4} /></div>
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SaaS Plans</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage subscription tiers for your platform</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 active:scale-95 transition-all shadow-lg shadow-zinc-900/25 text-sm"
                    >
                        <FaPlus size={12} /> New Plan
                    </button>
                </div>

                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {plans.map((plan, i) => {
                        const color = tierColors[i % tierColors.length];
                        return (
                            <motion.div
                                key={plan._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden group"
                            >
                                {/* Price Header */}
                                <div className={`bg-gradient-to-r ${color.bg} p-5 text-white relative`}>
                                    <div className="absolute top-3 right-3">
                                        <button
                                            onClick={() => openEdit(plan)}
                                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                                        >
                                            <FaEdit size={12} />
                                        </button>
                                    </div>
                                    <FaCrown className="mb-2 opacity-80" size={18} />
                                    <h3 className="text-lg font-bold">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                                        <span className="text-sm opacity-80">/{plan.billingCycle === "yearly" ? "yr" : "mo"}</span>
                                    </div>
                                </div>

                                {/* Limits */}
                                <div className="p-5 space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color.light}`}>
                                            <FaUserShield size={12} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{plan.maxStaff} Staff</p>
                                            <p className="text-xs text-gray-400">max accounts</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color.light}`}>
                                            <FaUsers size={12} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{plan.maxMembers.toLocaleString()} Members</p>
                                            <p className="text-xs text-gray-400">max capacity</p>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    {plan.features?.length > 0 && (
                                        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-2">
                                            {plan.features.map((f, j) => (
                                                <div key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <FaCheck className="text-green-500 shrink-0" size={10} />
                                                    <span>{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}

                    {plans.length === 0 && (
                        <div className="col-span-full text-center py-16 text-gray-400">
                            <FaCrown size={32} className="mx-auto mb-3 opacity-40" />
                            <p className="font-medium">No plans yet</p>
                            <p className="text-xs mt-1">Create your first subscription plan</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Create/Edit Modal ─── */}
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
                            className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {editing ? "Edit Plan" : "Create Plan"}
                                </h3>
                                <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    <FaTimes size={14} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Plan Name *</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                        placeholder="Pro" required />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (₹) *</label>
                                        <input type="number" value={form.price} onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                            placeholder="999" required min="0" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Billing Cycle</label>
                                        <select value={form.billingCycle} onChange={(e) => setForm(p => ({ ...p, billingCycle: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all">
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Staff</label>
                                        <input type="number" value={form.maxStaff} onChange={(e) => setForm(p => ({ ...p, maxStaff: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                            min="1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Members</label>
                                        <input type="number" value={form.maxMembers} onChange={(e) => setForm(p => ({ ...p, maxMembers: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                            min="1" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Features</label>
                                    <textarea value={form.features} onChange={(e) => setForm(p => ({ ...p, features: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-none"
                                        rows={3} placeholder="Dashboard, Reports, SMS Reminders (comma-separated)" />
                                    <p className="text-xs text-gray-400 mt-1">Separate features with commas</p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setModalOpen(false)}
                                        className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitting}
                                        className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {submitting ? <ButtonSpinner />
                                            : editing ? "Save Changes" : "Create Plan"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
};

export default SaaSPlanManagement;
