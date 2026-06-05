import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from '../../auth/context/AuthContext';
import AppLayout from '../../../shared/components/layout/AppLayout';
import { PageSkeleton } from '../../../shared/components/ui/Skeleton';
import { ButtonSpinner } from '../../../shared/components/ui/Skeleton';
import PageHeader from '../../../shared/components/layout/PageHeader';
import { DatePicker } from '../../../shared/components/ui/DatePicker';
import {
    FaArrowLeft, FaSave, FaBuilding, FaEnvelope, FaPhone,
    FaMapMarkerAlt, FaCrown,
    FaUsers, FaUserShield, FaExclamationTriangle,
    FaEdit, FaTrash, FaLock, FaToggleOn, FaToggleOff, FaCogs,
    FaLink, FaUserPlus
} from "react-icons/fa";
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';
import { motion } from "framer-motion";

const GymDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { api } = useAuth();

    // Check if we should start in edit mode
    const searchParams = new URLSearchParams(location.search);
    const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [gym, setGym] = useState(null);
    const [plans, setPlans] = useState([]);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Feature management state
    const [gymFeatures, setGymFeatures] = useState({
        profilePhoto: true,
        expenses: true,
        announcements: true,
        archiveExpired: true,
        whatsappNotifications: false,
        memberImport: false,
        memberExport: false,
        autoWhatsappReminders: false,
    });
    const [updatingFeatures, setUpdatingFeatures] = useState(false);

    // Linked admins state
    const [linkedAdmins, setLinkedAdmins] = useState([]);
    const [linkEmail, setLinkEmail] = useState('');
    const [linkLoading, setLinkLoading] = useState(false);
    const [linkedAdminsLoading, setLinkedAdminsLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        saaSPlan: "",
        subscriptionStatus: "",
        subscriptionExpiry: "",
        isActive: true
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [gymRes, plansRes] = await Promise.all([
                api.get(`/superadmin/gyms/${id}`),
                api.get('/superadmin/plans')
            ]);

            setGym(gymRes.data);
            setPlans(plansRes.data);

            // Populate form
            setForm({
                name: gymRes.data.name || "",
                contactEmail: gymRes.data.contactEmail || "",
                contactPhone: gymRes.data.contactPhone || "",
                address: gymRes.data.address || "",
                saaSPlan: gymRes.data.saaSPlan?._id || "",
                subscriptionStatus: gymRes.data.subscriptionStatus || "trial",
                subscriptionExpiry: gymRes.data.subscriptionExpiry ? new Date(gymRes.data.subscriptionExpiry).toISOString().split('T')[0] : "",
                isActive: gymRes.data.isActive
            });

            if (gymRes.data.features) {
                setGymFeatures(gymRes.data.features);
            }
        } catch (err) {
            toast.error("Failed to load gym details");
            navigate("/superadmin");
        } finally {
            setLoading(false);
        }
    }, [api, id, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchLinkedAdmins = useCallback(async () => {
        setLinkedAdminsLoading(true);
        try {
            const res = await api.get(`/superadmin/gyms/${id}/linked-admins`);
            setLinkedAdmins(res.data || []);
        } catch (err) {
            // non-critical
        } finally {
            setLinkedAdminsLoading(false);
        }
    }, [api, id]);

    useEffect(() => {
        fetchLinkedAdmins();
    }, [fetchLinkedAdmins]);

    const handleLinkAdmin = async (e) => {
        e.preventDefault();
        if (!linkEmail.trim()) return;
        setLinkLoading(true);
        try {
            await api.post(`/superadmin/gyms/${id}/link-admin`, { email: linkEmail.trim().toLowerCase() });
            toast.success('Admin linked successfully');
            setLinkEmail('');
            fetchLinkedAdmins();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to link admin');
        } finally {
            setLinkLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await api.put(`/superadmin/gyms/${id}`, form);
            toast.success("Fit Club updated successfully!");
            setIsEditing(false); // Back to view mode
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update gym");
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateFeatures = async (key) => {
        const updatedFeatures = { ...gymFeatures, [key]: !gymFeatures[key] };
        setUpdatingFeatures(true);
        try {
            await api.put(`/superadmin/gyms/${id}/features`, updatedFeatures);
            setGymFeatures(updatedFeatures);
            toast.success("Feature permissions updated");
        } catch (err) {
            toast.error("Failed to update features");
        } finally {
            setUpdatingFeatures(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/superadmin/gyms/${id}`);
            toast.success("Fit Club moved to Recycling Bin");
            navigate("/superadmin");
        } catch (err) {
            toast.error("Failed to delete gym");
        }
    };

    if (loading) {
        return (
            <AppLayout showGenderSwitch={false}>
                <PageSkeleton stats={3} tableRows={5} />
            </AppLayout>
        );
    }

    return (
        <AppLayout showGenderSwitch={false}>
            <div className="max-w-4xl mx-auto pb-20">
                {/* Navigation & Header */}
                <button
                    onClick={() => navigate("/superadmin")}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <PageHeader
                        title={gym.name}
                        subtitle={`Fit Club Management — ${gym.gymCode}`}
                    />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${isEditing ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/20"}`}
                        >
                            {isEditing ? <><FaLock size={14} /> Cancel Edit</> : <><FaEdit size={14} /> Edit Details</>}
                        </button>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${gym.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-500"}`}>
                            <span className={`w-2 h-2 rounded-full ${gym.isActive ? "bg-green-500" : "bg-zinc-900"}`}></span>
                            {gym.isActive ? "Active" : "Suspended"}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Info Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit}
                            className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/20 dark:shadow-none space-y-6"
                        >
                            <div className="flex items-center gap-3 border-b border-gray-50 dark:border-zinc-800 pb-4 mb-2">
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-zinc-900">
                                    <FaBuilding size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Basic Information</h3>
                                    <p className="text-xs text-gray-500">Edit core fit club profile and contact details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fit Club Display Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-red-500/10 focus:border-zinc-900 transition-all outline-none"
                                        />
                                    ) : (
                                        <p className="px-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-white font-medium border border-transparent">{form.name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Email</label>
                                        <div className="relative">
                                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={form.contactEmail}
                                                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                                                    className="w-full pl-12 pr-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-red-500/10 focus:border-zinc-900 transition-all outline-none"
                                                />
                                            ) : (
                                                <p className="pl-12 pr-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-white font-medium border border-transparent">{form.contactEmail || "No email provided"}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Phone</label>
                                        <div className="relative">
                                            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={form.contactPhone}
                                                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                                                    className="w-full pl-12 pr-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-red-500/10 focus:border-zinc-900 transition-all outline-none"
                                                />
                                            ) : (
                                                <p className="pl-12 pr-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-white font-medium border border-transparent">{form.contactPhone || "No phone provided"}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Physical Address</label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />
                                        {isEditing ? (
                                            <textarea
                                                rows={2}
                                                value={form.address}
                                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                                className="w-full pl-12 pr-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-red-500/10 focus:border-zinc-900 transition-all outline-none resize-none"
                                            />
                                        ) : (
                                            <p className="pl-12 pr-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-white font-medium border border-transparent leading-relaxed">{form.address || "No address provided"}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 border-b border-gray-50 dark:border-zinc-800 pb-4 mt-6">
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600">
                                    <FaCrown size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Subscription & Plan</h3>
                                    <p className="text-xs text-gray-500">Manage billing plans and feature access</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">SaaS Plan</label>
                                    {isEditing ? (
                                        <select
                                            value={form.saaSPlan}
                                            onChange={(e) => setForm({ ...form, saaSPlan: e.target.value })}
                                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-red-500/10 focus:border-zinc-900 transition-all outline-none appearance-none"
                                        >
                                            <option value="">No Plan (Limited Access)</option>
                                            {plans.map(p => (
                                                <option key={p._id} value={p._id}>{p.name} (Max {p.maxMembers} members)</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="px-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-white font-medium border border-transparent flex items-center gap-2">
                                            <FaCrown className="text-amber-500 text-xs" />
                                            {gym.saaSPlan?.name || "No Active Plan"}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Platform Status</label>
                                    {isEditing ? (
                                        <select
                                            value={form.isActive}
                                            onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-red-500/10 focus:border-zinc-900 transition-all outline-none"
                                        >
                                            <option value="true">Active & Functional</option>
                                            <option value="false">Suspended / Restricted</option>
                                        </select>
                                    ) : (
                                        <p className="px-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-white font-medium border border-transparent">
                                            {form.isActive ? "Active & Functional" : "Suspended / Restricted"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subscription Type</label>
                                    {isEditing ? (
                                        <div className="flex bg-gray-50 dark:bg-zinc-950 p-1.5 rounded-2xl border border-gray-100 dark:border-zinc-800">
                                            {['trial', 'active', 'inactive'].map(status => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, subscriptionStatus: status })}
                                                    className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-xl transition-all ${form.subscriptionStatus === status ? "bg-white dark:bg-zinc-900 text-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="px-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-white font-bold uppercase text-xs border border-transparent">{form.subscriptionStatus}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                                    <div className="relative">
                                        {isEditing ? (
                                            <DatePicker
                                                value={form.subscriptionExpiry || ''}
                                                onChange={(e) => setForm({ ...form, subscriptionExpiry: e.target.value })}
                                                className="!bg-gray-50 dark:!bg-zinc-950 !rounded-2xl !py-3 !pl-10 !pr-5 !border-gray-200 dark:!border-zinc-800"
                                            />
                                        ) : (
                                            <p className="pl-12 pr-5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/50 text-gray-900 dark:text-white font-medium border border-transparent">
                                                {form.subscriptionExpiry ? new Date(form.subscriptionExpiry).toLocaleDateString() : "Never expires"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full py-4 mt-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-zinc-900/25 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {updating ? (
                                        <ButtonSpinner />
                                    ) : (
                                        <>
                                            <FaSave />
                                            Save All Changes
                                        </>
                                    )}
                                </button>
                            )}
                        </motion.form>

                        {/* Feature Status Section */}
                        <motion.div
                            id="features"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/20 dark:shadow-none space-y-6"
                        >
                            <div className="flex items-center justify-between border-b border-gray-50 dark:border-zinc-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-zinc-900">
                                        <FaCogs size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Feature Permissions</h3>
                                        <p className="text-xs text-gray-500">Enable or disable specific modules for this fit club</p>
                                    </div>
                                </div>
                                {updatingFeatures && (
                                    <span className="w-4 h-4 block bg-gray-400 rounded-full animate-pulse inline-block"></span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                {[
                                    { key: 'profilePhoto', label: 'Member Profile Photos', icon: '👤', desc: 'Allow admins to upload member photos' },
                                    { key: 'expenses', label: 'Expense Tracking', icon: '💰', desc: 'Enable expense and cash flow management' },
                                    { key: 'announcements', label: 'WhatsApp Announcements', icon: '📢', desc: 'Enable bulk WhatsApp messaging' },
                                    { key: 'archiveExpired', label: 'Auto-Archive Expired', icon: '📦', desc: 'Automatically archive memberships' },
                                    { key: 'whatsappNotifications', label: 'WhatsApp Notifications', icon: '💬', desc: 'Auto-send payment & expiry reminders' },
                                    { key: 'memberImport', label: 'CSV Member Import', icon: '📤', desc: 'Allow bulk importing members via CSV wizard' },
                                    { key: 'memberExport', label: 'CSV Member Export', icon: '📥', desc: 'Allow exporting selected members to a CSV file' },
                                    { key: 'autoWhatsappReminders', label: 'Auto WhatsApp Reminders', icon: '🔔', desc: 'Auto-send at 3 days before, on expiry day, and 3 days after' },
                                    { key: 'simplePayments', label: 'Simple Payments', icon: '⚡', desc: 'Skip the payment-method breakdown — renew/enroll records as paid instantly' },
                                ].map((feature) => (
                                    <button
                                        key={feature.key}
                                        disabled={updatingFeatures}
                                        onClick={() => handleUpdateFeatures(feature.key)}
                                        className={`flex items-start justify-between p-4 rounded-2xl border transition-all text-left group ${gymFeatures[feature.key]
                                            ? "bg-zinc-50/50 border-zinc-200 dark:bg-zinc-800/30 dark:border-zinc-700"
                                            : "bg-gray-50/50 border-gray-100 dark:bg-zinc-950/50 dark:border-zinc-800"
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div>
                                                <p className={`font-bold text-sm ${gymFeatures[feature.key] ? "text-zinc-700 dark:text-zinc-500" : "text-gray-600 dark:text-gray-400"}`}>
                                                    {feature.label}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{feature.desc}</p>
                                            </div>
                                        </div>
                                        <div className="mt-0.5">
                                            {gymFeatures[feature.key] ? (
                                                <FaToggleOn className="text-zinc-900 text-2xl" />
                                            ) : (
                                                <FaToggleOff className="text-gray-300 text-2xl" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Linked Admins */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-50 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/10">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl text-zinc-900">
                                        <FaLink size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Linked Admins</h3>
                                        <p className="text-xs text-gray-500">Gym admins with access to this fit club (multi-gym)</p>
                                    </div>
                                </div>
                                <form onSubmit={handleLinkAdmin} className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Enter admin email to link..."
                                        value={linkEmail}
                                        onChange={(e) => setLinkEmail(e.target.value)}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 dark:focus:border-zinc-600 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={linkLoading || !linkEmail.trim()}
                                        className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-40 transition-all"
                                    >
                                        {linkLoading ? <ButtonSpinner /> : <FaUserPlus size={12} />}
                                        Link
                                    </button>
                                </form>
                            </div>
                            <div className="divide-y divide-gray-50 dark:divide-zinc-800">
                                {linkedAdminsLoading ? (
                                    <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
                                ) : linkedAdmins.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="text-sm text-gray-400">No linked admins yet.</p>
                                    </div>
                                ) : (
                                    linkedAdmins.map((user) => {
                                        const isPrimary = user.gymId?.toString() === id;
                                        return (
                                            <div key={user._id} className="p-5 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 text-sm uppercase shrink-0">
                                                        {user.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {isPrimary && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                                                            Primary
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>

                        {/* Staff Members List */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center bg-gray-50/30 dark:bg-zinc-800/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl text-zinc-900">
                                        <FaUsers size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Staff Members</h3>
                                        <p className="text-xs text-gray-500">List of active staff accounts for this fit club</p>
                                    </div>
                                </div>
                                <span className="bg-zinc-100 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-300 px-3 py-1 rounded-full text-xs font-bold">
                                    {gym.staff?.length || 0} Accounts
                                </span>
                            </div>

                            <div className="divide-y divide-gray-50 dark:divide-zinc-800">
                                {gym.staff && gym.staff.length > 0 ? (
                                    gym.staff.map((member, i) => (
                                        <div key={member._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 font-bold uppercase overflow-hidden">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{member.name}</p>
                                                    <p className="text-xs text-gray-500 break-all">{member.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 text-right">
                                                <div className="hidden sm:block">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Joined</p>
                                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                                        {new Date(member.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                    </p>
                                                </div>
                                                <div className="hidden sm:block">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Last Login</p>
                                                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium italic">
                                                        {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "Never"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center">
                                        <p className="text-sm text-gray-400">No staff accounts found.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar Stats & Info */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/20">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 dark:border-zinc-800 pb-2">Admin Details</h4>
                            {gym.admin ? (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-600 flex items-center justify-center text-white font-bold text-xl ring-4 ring-zinc-100 dark:ring-zinc-800/30">
                                            {gym.admin.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{gym.admin.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <FaUserShield className="text-[10px]" />
                                                Fit Club Administrator
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-500 font-medium tracking-tight">Email Address</span>
                                            <FaEnvelope size={10} className="text-gray-300" />
                                        </div>
                                        <p className="text-xs font-mono font-bold text-gray-900 dark:text-white truncate">{gym.admin.email}</p>
                                    </div>
                                    <div className="text-[10px] text-gray-400 space-y-1 mb-4">
                                        <p>Created: {new Date(gym.admin.createdAt).toLocaleDateString()}</p>
                                        <p>Last Login: {gym.admin.lastLogin ? new Date(gym.admin.lastLogin).toLocaleString() : "Never"}</p>
                                    </div>

                                    <button
                                        onClick={handleDelete}
                                        className="w-full py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all active:scale-95"
                                    >
                                        <FaTrash size={12} />
                                        Delete Fit Club Account
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 text-center">
                                    <FaExclamationTriangle className="mx-auto text-amber-500 mb-2" />
                                    <p className="text-xs font-bold text-gray-500">No Admin Found</p>
                                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">System administrator account for this fit club might have been deleted.</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <FaUsers size={120} />
                            </div>
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 relative z-10">Current Statistics</h4>

                            <div className="space-y-6 relative z-10">
                                <div className="flex justify-between items-center group">
                                    <div>
                                        <p className="text-3xl font-black">{gym.stats?.memberCount || 0}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Members</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-zinc-900/20 transition-colors">
                                        <FaUsers size={16} className="text-zinc-500" />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center group">
                                    <div>
                                        <p className="text-3xl font-black">{gym.stats?.staffCount || 0}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active Staff</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-zinc-900/20 transition-colors">
                                        <FaUserShield size={16} className="text-zinc-400" />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5 mt-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                                Member Capacity
                                            </div>
                                            <span className="text-gray-400">{gym.stats?.memberCount || 0} / {gym.saaSPlan?.maxMembers || "∞"}</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                                            <div
                                                className="h-full bg-gradient-to-r from-zinc-900 to-red-400 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.min(100, (gym.stats?.memberCount / (gym.saaSPlan?.maxMembers || 1)) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[9px] text-gray-500">
                                            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-green-500"></span> {gym.stats?.activeMembers || 0} Active</span>
                                            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-zinc-900"></span> {gym.stats?.inactiveMembers || 0} Inactive</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                                Staff Capacity
                                            </div>
                                            <span className="text-gray-400">{gym.stats?.staffCount || 0} / {gym.saaSPlan?.maxStaff || "∞"}</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                                            <div
                                                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.min(100, (gym.stats?.staffCount / (gym.saaSPlan?.maxStaff || 1)) * 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-gray-500">Using {((gym.stats?.staffCount / (gym.saaSPlan?.maxStaff || 1)) * 100).toFixed(0)}% of staff allowance</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    title="Soft Delete Fit Club"
                    message={`Are you sure you want to deactivate ${gym.name}? It will be moved to the Recycling Bin and will no longer be able to access the platform.`}
                    confirmText="Delete Fit Club"
                    cancelText="Keep Fit Club"
                />
            </div>
        </AppLayout>
    );
};

export default GymDetails;
