import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/services/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    FaSave, FaCog, FaMoneyBillWave, FaSun, FaMoon,
    FaBuilding, FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt,
    FaBarcode, FaCrown, FaCalendarAlt, FaUser, FaEye, FaEyeSlash,
    FaChevronRight, FaSignOutAlt, FaShieldAlt, FaBell, FaDownload, FaUsers, FaCheckCircle
} from 'react-icons/fa';
import PageHeader from '../../../shared/components/layout/PageHeader';
import AppLayout from '../../../shared/components/layout/AppLayout';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useAuth } from '../../auth/context/AuthContext';

const SettingItem = ({ icon, title, subtitle, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-4 px-4 py-5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left group border-none outline-none"
    >
        <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <div className="flex-1">
            <h5 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h5>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">{subtitle}</p>
        </div>
        <FaChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-1" size={12} />
    </button>
);

const Settings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { api, user, login, logout, refreshUser } = useAuth();
    const [showPhotoMenu, setShowPhotoMenu] = useState(false);
    const fileInputRef = React.useRef(null);

    const [isEditingPricing, setIsEditingPricing] = useState(false);
    const [isEditingBranding, setIsEditingBranding] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [activeTab, setActiveTab] = useState('main');

    const [showPassword, setShowPassword] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

    const [settings, setSettings] = useState({
        subscriptionPrices: {
            "1-Month": 0,
            "2-Month": 0,
            "3-Month": 0,
            "6-Month": 0,
            "12-Month": 0
        },
        defaultPaymentMethod: "Cash",
        admissionFee: 0,
        plans: [] // New plans array
    });

    const [gym, setGym] = useState(null);
    const [gymForm, setGymForm] = useState({ name: "", contactEmail: "", contactPhone: "", address: "" });

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        fetchAllData();
        if (user) {
            setProfileForm({ name: user.name || "", email: user.email || "", password: "", confirmPassword: "" });
        }
    }, [backendUrl, user]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [settingsRes, gymRes] = await Promise.all([
                api.get("/api/settings"),
                api.get("/api/gym/profile")
            ]);

            if (settingsRes.data) {
                setSettings(prev => ({
                    ...prev,
                    ...settingsRes.data,
                    subscriptionPrices: { ...prev.subscriptionPrices, ...settingsRes.data.subscriptionPrices }
                }));
            }

            if (gymRes.data) {
                setGym(gymRes.data);
                setGymForm({
                    name: gymRes.data.name || "",
                    contactEmail: gymRes.data.contactEmail || "",
                    contactPhone: gymRes.data.contactPhone || "",
                    address: gymRes.data.address || "",
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (duration, price) => {
        setSettings(prev => ({
            ...prev,
            subscriptionPrices: {
                ...prev.subscriptionPrices,
                [duration]: parseInt(price) || 0
            }
        }));
    };

    const saveSettings = async () => {
        try {
            setSaving(true);
            await api.put("/api/settings", settings);
            toast.success("Pricing updated successfully!");
            setIsEditingPricing(false);
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save pricing");
        } finally {
            setSaving(false);
        }
    };

    const handleGymSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put("/api/gym/profile", gymForm);
            setGym(res.data);
            toast.success("Gym profile updated!");
            setIsEditingBranding(false);
        } catch (err) {
            toast.error("Failed to save gym profile");
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

    const handleProfileSave = async (e) => {
        if (e) e.preventDefault();

        if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setSaving(true);
        try {
            const res = await api.put("/api/auth/profile", {
                name: profileForm.name,
                email: profileForm.email,
                password: profileForm.password || undefined // Only send if not empty
            });
            if (res.data.success) {
                toast.success("Profile updated!");
                setIsEditingProfile(false);
                setShowPasswordFields(false); // Hide password fields
                // Clear password fields
                setProfileForm(prev => ({ ...prev, password: "", confirmPassword: "" }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
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
                    <div className="loading-spinner w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout showGenderSwitch={false}>
            <div className={`max-w-4xl mx-auto px-2 py-6 sm:py-10`}>
                <Toaster position="top-right" />

                {/* Dynamic Header */}
                <div className="mb-6 sm:mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center gap-4">
                        {activeTab !== 'main' && (
                            <button
                                onClick={() => {
                                    setActiveTab('main');
                                    setIsEditingBranding(false);
                                    setIsEditingPricing(false);
                                    setIsEditingProfile(false);
                                }}
                                className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <FaChevronRight className="rotate-180" size={14} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
                            <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
                        </div>
                    </div>
                </div>

                {activeTab === 'main' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                            <SettingItem
                                icon={<FaUser />}
                                title="Profile Info"
                                subtitle="Update your personal information"
                                onClick={() => setActiveTab('profile')}
                            />
                            <div className="h-px bg-gray-50 dark:bg-slate-700/50 mx-4"></div>

                            {(user?.role === 'gymadmin' || user?.role === 'staff') && (
                                <>
                                    <SettingItem
                                        icon={<FaBuilding />}
                                        title="Gym Info"
                                        subtitle="Manage gym branding and details"
                                        onClick={() => setActiveTab('gym')}
                                    />
                                    <div className="h-px bg-gray-50 dark:bg-slate-700/50 mx-4"></div>
                                </>
                            )}

                            {user?.role === 'gymadmin' && (
                                <>
                                    <SettingItem
                                        icon={<FaUsers />}
                                        title="Staff Management"
                                        subtitle="Manage staff accounts"
                                        onClick={() => navigate('/staff')}
                                    />
                                    <div className="h-px bg-gray-50 dark:bg-slate-700/50 mx-4"></div>
                                </>
                            )}

                            <SettingItem
                                icon={<FaMoneyBillWave />}
                                title="Payment Setting"
                                subtitle="Manage pricing and billing"
                                onClick={() => setActiveTab('billing')}
                            />
                            <div className="h-px bg-gray-50 dark:bg-slate-700/50 mx-4"></div>

                            <SettingItem
                                icon={<FaSun />}
                                title="Appearance"
                                subtitle="App theme and display settings"
                                onClick={() => setActiveTab('appearance')}
                            />
                        </div>


                        {/* Sign Out Button */}
                        <button
                            onClick={logout}
                            className="w-full bg-white dark:bg-slate-800 border-2 border-red-50 dark:border-red-900/10 text-red-500 dark:text-red-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all duration-300 shadow-sm mt-8 border border-red-100"
                        >
                            <FaSignOutAlt /> Sign Out
                        </button>

                        <div className="text-center py-6">
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                Service Center v1.0.0
                            </p>
                        </div>
                    </div>
                )}
                {(user?.role === 'gymadmin' || user?.role === 'staff') && activeTab === 'gym' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gym Branding</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your gym's identity and information</p>
                            </div>
                            {user?.role === 'gymadmin' && (
                                <button
                                    onClick={() => {
                                        if (isEditingBranding) {
                                            setGymForm({
                                                name: gym?.name || "",
                                                contactEmail: gym?.contactEmail || "",
                                                contactPhone: gym?.contactPhone || "",
                                                address: gym?.address || "",
                                            });
                                        }
                                        setIsEditingBranding(!isEditingBranding);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${isEditingBranding
                                        ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                        : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                                        }`}
                                >
                                    {isEditingBranding ? 'Cancel' : 'Edit Profile'}
                                </button>
                            )}
                        </div>

                        {/* Logo + Quick Info */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-16 relative"></div>
                            <div className="px-6 pb-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
                                    <div
                                        className={`relative w-20 h-20 rounded-xl bg-white dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center overflow-hidden ${user?.role === 'gymadmin' && isEditingBranding ? 'cursor-pointer group' : ''}`}
                                        onClick={() => user?.role === 'gymadmin' && isEditingBranding && fileInputRef.current?.click()}
                                    >
                                        {gym?.logo ? (
                                            <img src={gym.logo.startsWith('http') ? gym.logo : `${backendUrl}${gym.logo}`} alt="Gym logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <FaBuilding size={28} className="text-gray-300 dark:text-gray-500" />
                                        )}
                                        {isEditingBranding && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {uploadingLogo ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <FaCamera className="text-white" size={16} />
                                                )}
                                            </div>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                    </div>

                                    <div className="flex-1 pt-12">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{gym?.name}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Code: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{gym?.gymCode}</span></p>
                                    </div>

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
                                        <p className="font-bold text-gray-900 dark:text-white truncate">{gym?.saaSPlan?.name || "Free Trial"}</p>
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
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Expiry</p>
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

                        {/* Gym Information Form */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                            <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-700/30">
                                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaBuilding className="text-blue-500" />
                                    Gym Information
                                </h2>
                                {isEditingBranding && (
                                    <button
                                        onClick={handleGymSave}
                                        disabled={saving}
                                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Info'}
                                    </button>
                                )}
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Gym Name</label>
                                    {isEditingBranding ? (
                                        <input type="text" value={gymForm.name} onChange={(e) => setGymForm(p => ({ ...p, name: e.target.value }))}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Your Gym Name" />
                                    ) : (
                                        <p className="text-base font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700/30 px-4 py-2 rounded-lg">{gymForm.name || "N/A"}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            <FaEnvelope className="inline mr-1.5 text-gray-400" size={11} /> Email
                                        </label>
                                        {isEditingBranding ? (
                                            <input type="email" value={gymForm.contactEmail} onChange={(e) => setGymForm(p => ({ ...p, contactEmail: e.target.value }))}
                                                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="info@yourgym.com" />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700/30 px-4 py-2 rounded-lg">{gymForm.contactEmail || "N/A"}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            <FaPhone className="inline mr-1.5 text-gray-400" size={11} /> Phone
                                        </label>
                                        {isEditingBranding ? (
                                            <input type="text" value={gymForm.contactPhone} onChange={(e) => setGymForm(p => ({ ...p, contactPhone: e.target.value }))}
                                                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="9876543210" />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700/30 px-4 py-2 rounded-lg">{gymForm.contactPhone || "N/A"}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        <FaMapMarkerAlt className="inline mr-1.5 text-gray-400" size={11} /> Address
                                    </label>
                                    {isEditingBranding ? (
                                        <textarea value={gymForm.address} onChange={(e) => setGymForm(p => ({ ...p, address: e.target.value }))}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            rows={2} placeholder="123 Main Street, City" />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700/30 px-4 py-2 rounded-lg min-h-[40px]">{gymForm.address || "N/A"}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.role === 'staff' ? 'Staff Details' : 'Personal Profile'}</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your own account information</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (isEditingProfile) {
                                        setProfileForm({ name: user?.name || "", email: user?.email || "", password: "", confirmPassword: "" });
                                        setShowPasswordFields(false);
                                    }
                                    setIsEditingProfile(!isEditingProfile);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${isEditingProfile
                                    ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                    : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                                    }`}
                            >
                                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>

                        {/* Personal Profile Section with Photo - Redesigned */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-lg overflow-hidden mb-6 relative group">
                            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 h-24 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.4),transparent)] animate-pulse"></div>
                            </div>
                            <div className="px-8 pb-8">
                                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 relative z-10">
                                    <div className="relative">
                                        <div
                                            className="relative w-28 h-28 rounded-full bg-white dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden group/photo ring-4 ring-indigo-500/10"
                                        >
                                            {user?.profileImage ? (
                                                <img src={user.profileImage.startsWith('http') ? user.profileImage : `${backendUrl}${user.profileImage}`} alt="User profile" className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-110" />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                                    <span className="text-4xl font-black text-indigo-500 dark:text-indigo-400">{user?.name?.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Always-visible edit button */}
                                        <button
                                            onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                                            className="absolute bottom-0 right-0 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center border-3 border-white dark:border-slate-800 transition-all hover:scale-110 z-10"
                                        >
                                            <FaCamera size={13} />
                                        </button>
                                        {/* Dropdown menu */}
                                        {showPhotoMenu && (
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 py-2 w-48 z-50">
                                                <button
                                                    onClick={() => {
                                                        setShowPhotoMenu(false);
                                                        document.getElementById('user-photo-upload').click();
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                                                >
                                                    <FaCamera size={12} className="text-blue-500" />
                                                    Upload New Photo
                                                </button>
                                                {user?.profileImage && (
                                                    <button
                                                        onClick={async () => {
                                                            setShowPhotoMenu(false);
                                                            try {
                                                                await api.delete("/api/auth/profile/photo");
                                                                await refreshUser();
                                                                toast.success("Profile photo removed");
                                                            } catch (err) {
                                                                toast.error("Failed to remove photo");
                                                            }
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                                                    >
                                                        <span className="text-lg leading-none">&times;</span>
                                                        Remove Current
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <input
                                            id="user-photo-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                if (file.size > 5 * 1024 * 1024) {
                                                    toast.error("Photo must be under 5MB");
                                                    return;
                                                }
                                                const formData = new FormData();
                                                formData.append("profileImage", file);
                                                try {
                                                    await api.post("/api/auth/profile/photo", formData, {
                                                        headers: { "Content-Type": "multipart/form-data" }
                                                    });
                                                    await refreshUser();
                                                    toast.success("Profile photo updated!");
                                                } catch (err) {
                                                    toast.error("Failed to upload photo");
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1 pt-4 text-center sm:text-left">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{user?.name}</h2>
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                {user?.role}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium">{user?.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                            <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-700/30">
                                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <FaUser className="text-indigo-600 dark:text-indigo-400" size={14} />
                                    </div>
                                    Account Details
                                </h2>
                                {isEditingProfile && (
                                    <button
                                        onClick={handleProfileSave}
                                        disabled={saving}
                                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                )}
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                                        {isEditingProfile ? (
                                            <input
                                                type="text"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                                                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Your Name"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700/30 px-4 py-2 rounded-lg">{user?.name || "N/A"}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            <FaEnvelope className="inline mr-1.5 text-gray-400" size={11} /> Email Address
                                        </label>
                                        {isEditingProfile ? (
                                            <input
                                                type="email"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                                                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="email@example.com"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700/30 px-4 py-2 rounded-lg">{user?.email || "N/A"}</p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2 border-t border-gray-100 dark:border-slate-700 pt-4 mt-2">
                                        {!showPasswordFields ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditingProfile(true);
                                                    setShowPasswordFields(true);
                                                }}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                                            >
                                                <FaCog size={12} /> Change Password
                                            </button>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                        <FaCog size={12} className="text-gray-400" /> Change Password
                                                    </h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowPasswordFields(false);
                                                            setProfileForm(prev => ({ ...prev, password: "", confirmPassword: "" }));
                                                        }}
                                                        className="text-xs text-red-500 hover:text-red-600"
                                                    >
                                                        Cancel Change
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">New Password</label>
                                                        <div className="relative">
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                value={profileForm.password}
                                                                onChange={(e) => setProfileForm(p => ({ ...p, password: e.target.value }))}
                                                                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                                placeholder="Enter new password"
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
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Confirm Password</label>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={profileForm.confirmPassword}
                                                            onChange={(e) => setProfileForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                            placeholder="Confirm new password"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(user?.role === 'gymadmin' || user?.role === 'staff') && activeTab === 'billing' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-700/30">
                            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaMoneyBillWave className="text-green-500" />
                                Plan Management
                            </h2>
                            <div className="flex items-center gap-3">
                                {isEditingPricing && (
                                    <button
                                        onClick={saveSettings}
                                        disabled={saving}
                                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded border border-green-700 hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Pricing'}
                                    </button>
                                )}
                                {user?.role === 'gymadmin' && (
                                    <button
                                        onClick={() => {
                                            if (isEditingPricing) {
                                                // Reset settings if needed, but usually we just toggle
                                                fetchAllData();
                                            }
                                            setIsEditingPricing(!isEditingPricing);
                                        }}
                                        className={`text-xs px-3 py-1.5 rounded border transition-colors ${isEditingPricing
                                            ? 'bg-red-50 text-red-600 border-red-200'
                                            : 'bg-blue-50 text-blue-600 border-blue-200'
                                            }`}
                                    >
                                        {isEditingPricing ? 'Cancel' : 'Edit Charges'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-b border-gray-50 dark:border-slate-700">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FaCheckCircle className="text-blue-500" />
                                Admission Fee
                            </h3>
                            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-600 transition-all hover:shadow-sm">
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                    One-time Admission Fee
                                </label>
                                {isEditingPricing ? (
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">₹</span>
                                        <input
                                            type="number"
                                            value={settings.admissionFee || 0}
                                            onChange={(e) => setSettings(prev => ({ ...prev, admissionFee: parseInt(e.target.value) || 0 }))}
                                            className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none font-semibold text-gray-900 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                        <span className="text-gray-400 font-medium">₹</span>
                                        {settings.admissionFee ? settings.admissionFee.toLocaleString('en-IN') : 0}
                                    </p>
                                )}
                            </div>
                        </div>



                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaCalendarAlt className="text-purple-500" />
                                    Membership Plans
                                </h3>
                                {isEditingPricing && (
                                    <button
                                        onClick={() => {
                                            const customCount = (settings.plans || []).filter(p => !p.isDefault).length;
                                            const newPlan = { name: `Custom Plan ${customCount + 1}`, duration: 1, price: 0, isActive: true, isDefault: false };
                                            setSettings(prev => ({
                                                ...prev,
                                                plans: [...(prev.plans || []), newPlan]
                                            }));
                                        }}
                                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"
                                    >
                                        <FaCrown size={10} /> Add Custom Plan
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {(settings.plans || []).map((plan, index) => (
                                    <div key={index} className={`p-4 rounded-xl border flex items-center justify-between group transition-all ${plan.isDefault ? 'bg-gray-50 dark:bg-slate-700/30 border-gray-100 dark:border-slate-600' : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30'}`}>
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                            {isEditingPricing ? (
                                                <>
                                                    {plan.isDefault ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-900 dark:text-white text-sm">{plan.name}</span>
                                                            <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded">Default</span>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={plan.name}
                                                            onChange={(e) => {
                                                                const newPlans = [...settings.plans];
                                                                newPlans[index].name = e.target.value;
                                                                setSettings({ ...settings, plans: newPlans });
                                                            }}
                                                            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded px-2 py-1 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                            placeholder="Plan Name"
                                                        />
                                                    )}
                                                    {plan.isDefault ? (
                                                        <span className="text-xs text-gray-500">{plan.duration} Month{plan.duration > 1 ? 's' : ''}</span>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={plan.duration}
                                                                onChange={(e) => {
                                                                    const newPlans = [...settings.plans];
                                                                    newPlans[index].duration = parseInt(e.target.value) || 0;
                                                                    setSettings({ ...settings, plans: newPlans });
                                                                }}
                                                                className="w-16 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                            />
                                                            <span className="text-xs text-gray-500">months</span>
                                                        </div>
                                                    )}
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                        <input
                                                            type="number"
                                                            value={plan.price}
                                                            onChange={(e) => {
                                                                const newPlans = [...settings.plans];
                                                                newPlans[index].price = parseInt(e.target.value) || 0;
                                                                setSettings({ ...settings, plans: newPlans });
                                                            }}
                                                            className="w-full pl-5 pr-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{plan.name}</span>
                                                        {plan.isDefault && <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded">Default</span>}
                                                        {!plan.isDefault && <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-500 px-1.5 py-0.5 rounded">Custom</span>}
                                                    </div>
                                                    <span className="text-xs text-gray-500">{plan.duration} Month{plan.duration > 1 ? 's' : ''}</span>
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">₹{plan.price.toLocaleString('en-IN')}</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 ml-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${plan.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {plan.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                {isEditingPricing && (
                                                    <button
                                                        onClick={() => {
                                                            const newPlans = [...settings.plans];
                                                            newPlans[index].isActive = !newPlans[index].isActive;
                                                            setSettings({ ...settings, plans: newPlans });
                                                        }}
                                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${plan.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}
                                                    >
                                                        <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" style={{ transform: plan.isActive ? 'translateX(18px)' : 'translateX(2px)' }} />
                                                    </button>
                                                )}
                                            </div>
                                            {isEditingPricing && !plan.isDefault && (
                                                <button
                                                    onClick={() => {
                                                        const newPlans = settings.plans.filter((_, i) => i !== index);
                                                        setSettings({ ...settings, plans: newPlans });
                                                    }}
                                                    className="text-red-400 hover:text-red-500 p-1"
                                                >
                                                    <span className="text-xl leading-none">&times;</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(!settings.plans || settings.plans.length === 0) && (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No plans configured. Click "Edit" and then "Add Custom Plan" to create one.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {(user?.role === 'gymadmin' || user?.role === 'staff') && activeTab === 'appearance' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-700/30">
                            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaCog className="text-blue-500" />
                                Appearance
                            </h2>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-600 px-2 py-1 rounded border border-gray-200 dark:border-slate-500">Theme Settings</span>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600 transition-all">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 flex items-center justify-center ${theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
                                            }`}
                                    >
                                        {theme === 'dark' ? (
                                            <FaMoon className="text-[10px] text-blue-600" />
                                        ) : (
                                            <FaSun className="text-[10px] text-yellow-500" />
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout >
    );
};

export default Settings;
