import React, { useState, useEffect, useCallback, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../layout/AppLayout";
import {
    FaSave, FaBuilding, FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt,
    FaBarcode, FaCrown, FaCalendarAlt, FaCheckCircle
} from "react-icons/fa";

const GymProfile = () => {
    const { api, user } = useAuth();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [gym, setGym] = useState(null);
    const [form, setForm] = useState({ name: "", contactEmail: "", contactPhone: "", address: "" });

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const fetchProfile = useCallback(async () => {
        try {
            const res = await api.get("/api/gym/profile");
            setGym(res.data);
            setForm({
                name: res.data.name || "",
                contactEmail: res.data.contactEmail || "",
                contactPhone: res.data.contactPhone || "",
                address: res.data.address || "",
            });
        } catch (err) {
            toast.error("Failed to load gym profile");
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put("/api/gym/profile", form);
            setGym(res.data);
            toast.success("Profile updated!");
        } catch (err) {
            toast.error("Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Logo must be under 5MB");
            return;
        }
        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append("logo", file);
            const res = await api.post("/api/gym/logo", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setGym(prev => ({ ...prev, logo: res.data.logo }));
            toast.success("Logo updated!");
        } catch (err) {
            toast.error("Failed to upload logo");
        } finally {
            setUploadingLogo(false);
        }
    };

    const statusColor = {
        active: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
        trial: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
        inactive: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
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
            <div className="max-w-4xl mx-auto space-y-6 pb-10">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gym Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your gym's branding and information</p>
                </div>

                {/* Logo + Quick Info */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-24 relative"></div>
                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
                            {/* Logo */}
                            <div
                                className="relative w-20 h-20 rounded-xl bg-white dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center overflow-hidden cursor-pointer group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {gym?.logo ? (
                                    <img src={gym.logo.startsWith('http') ? gym.logo : `${backendUrl}${gym.logo}`} alt="Gym logo" className="w-full h-full object-cover" />
                                ) : (
                                    <FaBuilding size={28} className="text-gray-300 dark:text-gray-500" />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {uploadingLogo ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <FaCamera className="text-white" size={16} />
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                            </div>

                            <div className="flex-1 pt-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{gym?.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Code: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{gym?.gymCode}</span></p>
                            </div>

                            {/* Status badges */}
                            <div className="flex gap-2">
                                <span className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${statusColor[gym?.subscriptionStatus] || statusColor.trial}`}>
                                    {gym?.subscriptionStatus || "trial"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Plan & Subscription Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <FaCrown className="text-purple-600 dark:text-purple-400" size={14} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Current Plan</p>
                                <p className="font-bold text-gray-900 dark:text-white">{gym?.saaSPlan?.name || "Free Trial"}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <FaBarcode className="text-blue-600 dark:text-blue-400" size={14} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Gym Code</p>
                                <p className="font-bold font-mono text-gray-900 dark:text-white">{gym?.gymCode}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <FaCalendarAlt className="text-amber-600 dark:text-amber-400" size={14} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Subscription Expiry</p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {gym?.subscriptionExpiry
                                        ? new Date(gym.subscriptionExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                        : "—"
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaBuilding className="text-blue-500" size={14} />
                            Gym Information
                        </h3>
                    </div>
                    <div className="p-5 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gym Name</label>
                            <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Your Gym Name" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    <FaEnvelope className="inline mr-1.5 text-gray-400" size={11} /> Email
                                </label>
                                <input type="email" value={form.contactEmail} onChange={(e) => setForm(p => ({ ...p, contactEmail: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="info@yourgym.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    <FaPhone className="inline mr-1.5 text-gray-400" size={11} /> Phone
                                </label>
                                <input type="text" value={form.contactPhone} onChange={(e) => setForm(p => ({ ...p, contactPhone: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="9876543210" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                <FaMapMarkerAlt className="inline mr-1.5 text-gray-400" size={11} /> Address
                            </label>
                            <textarea value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                rows={2} placeholder="123 Main Street, City" />
                        </div>
                    </div>
                    <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : <FaSave size={13} />}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default GymProfile;
