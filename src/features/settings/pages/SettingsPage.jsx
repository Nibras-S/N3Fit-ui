import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../shared/services/api';
import toast from 'react-hot-toast';
import {
    FaSave, FaCog, FaMoneyBillWave, FaSun, FaMoon,
    FaBuilding, FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt,
    FaBarcode, FaCrown, FaCalendarAlt, FaUser, FaEye, FaEyeSlash,
    FaChevronRight, FaSignOutAlt, FaShieldAlt, FaUsers, FaCheckCircle, FaTimes,
    FaChartLine
} from 'react-icons/fa';
import AppLayout from '../../../shared/components/layout/AppLayout';
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';
import { FormSkeleton } from '../../../shared/components/ui/Skeleton';
import { ButtonSpinner } from '../../../shared/components/ui/Skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useAuth } from '../../auth/context/AuthContext';
import ReportBaselineCard from '../components/ReportBaselineCard';

const SettingItem = ({ icon, title, subtitle, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-4 px-4 py-5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left group border-none outline-none"
    >
        <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <div className="flex-1">
            <h5 className="font-bold text-gray-900 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{title}</h5>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">{subtitle}</p>
        </div>
        <FaChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-zinc-900 dark:group-hover:text-white transition-transform group-hover:translate-x-1" size={12} />
    </button>
);

const Settings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { user, logout, refreshUser } = useAuth();
    const queryClient = useQueryClient();
    const fileInputRef = React.useRef(null);

    const [isEditingPricing, setIsEditingPricing] = useState(false);
    const [isEditingBranding, setIsEditingBranding] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingMembers, setIsEditingMembers] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => {
        const t = searchParams.get('tab');
        // Whitelist of tab names so an arbitrary URL can't open a non-existent tab.
        return ['profile', 'gym', 'billing', 'members', 'appearance', 'reports'].includes(t) ? t : 'main';
    });

    // Keep ?tab= in sync with the active tab so the banner's "Manage" deep link
    // and the back/forward buttons behave naturally.
    useEffect(() => {
        const next = new URLSearchParams(searchParams);
        if (activeTab === 'main') next.delete('tab');
        else next.set('tab', activeTab);
        if (next.toString() !== searchParams.toString()) {
            setSearchParams(next, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
    const [profileForm, setProfileForm] = useState({ name: "", email: "" });
    const [showEmailWarning, setShowEmailWarning] = useState(false);

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
        archiveAfterDays: 90,
        plans: [] // New plans array
    });

    const [gym, setGym] = useState(null);
    const [gymForm, setGymForm] = useState({ name: "", contactEmail: "", contactPhone: "", address: "" });

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        fetchAllData();
        if (user) {
            setProfileForm({ name: user.name || "", email: user.email || "" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [settingsRes, gymRes] = await Promise.all([
                api.get("/settings"),
                api.get("/gym/profile")
            ]);

            // Handle both new { success, data: {...} } and old direct object shapes
            const settingsData = settingsRes.data?.data ?? settingsRes.data;
            if (settingsData && typeof settingsData === 'object' && !settingsData.success) {
                setSettings(prev => ({
                    ...prev,
                    ...settingsData,
                    subscriptionPrices: { ...prev.subscriptionPrices, ...settingsData.subscriptionPrices }
                }));
            }

            const gymData = gymRes.data?.data ?? gymRes.data;
            if (gymData && gymData._id) {
                setGym(gymData);
                setGymForm({
                    name: gymData.name || "",
                    contactEmail: gymData.contactEmail || "",
                    contactPhone: gymData.contactPhone || "",
                    address: gymData.address || "",
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };



    const saveSettings = async () => {
        try {
            setSaving(true);
            // Convert any empty-string inputs back to numbers before sending to the API
            const payload = {
                ...settings,
                admissionFee: settings.admissionFee === '' ? 0 : Number(settings.admissionFee),
                archiveAfterDays: settings.archiveAfterDays === '' ? 90 : Number(settings.archiveAfterDays),
                plans: settings.plans.map(p => ({
                    ...p,
                    duration: p.duration === '' ? 0 : Number(p.duration),
                    price:    p.price    === '' ? 0 : Number(p.price),
                })),
            };
            await api.put("/settings", payload);
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
            const res = await api.put("/gym/profile", gymForm);
            // response.data IS already the unwrapped payload — don't re-unwrap in feature code
            const gymData = res.data;
            if (gymData && gymData._id) setGym(gymData);
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
            const res = await api.post("/gym/logo", formData, {
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

    const emailChanged = profileForm.email && user?.email && profileForm.email.toLowerCase() !== user.email.toLowerCase();

    const handleProfileSave = async (e) => {
        if (e) e.preventDefault();
        // If email changed, show warning modal first
        if (emailChanged) {
            setShowEmailWarning(true);
            return;
        }
        await doProfileSave();
    };

    const doProfileSave = async () => {
        setSaving(true);
        try {
            await api.put("/auth/profile", {
                name: profileForm.name,
                email: profileForm.email,
            });
            if (emailChanged) {
                toast.success("Email changed — logging out...");
                setShowEmailWarning(false);
                // Short delay so the user sees the toast before redirect
                setTimeout(() => logout(), 1000);
            } else {
                toast.success("Profile updated!");
                setIsEditingProfile(false);
                refreshUser();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        if (e) e.preventDefault();
        if (!passwordData.newPassword) {
            toast.error("Please enter a new password");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setSaving(true);
        try {
            await api.put("/auth/profile", {
                password: passwordData.newPassword
            });
            toast.success("Password updated successfully!");
            setShowPasswordModal(false);
            setPasswordData({ newPassword: "", confirmPassword: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update password");
        } finally {
            setSaving(false);
        }
    };

    const statusColor = {
        active: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
        trial: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
        inactive: "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300",
    };

    if (loading) {
        return (
            <AppLayout title="Settings" description="Manage your account and preferences" icon={FaCog} showGenderSwitch={false}>
                <div className="p-6 max-w-2xl"><FormSkeleton fields={6} /></div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Settings" description="Manage your account and preferences" icon={FaCog} showGenderSwitch={false}>
            <div className={`mx-auto px-2 py-6 sm:py-10`}>

                {/* Back button for sub-pages */}
                {activeTab !== 'main' && (
                    <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
                        <button
                            onClick={() => {
                                setActiveTab('main');
                                setIsEditingBranding(false);
                                setIsEditingPricing(false);
                                setIsEditingProfile(false);
                                setIsEditingMembers(false);
                            }}
                            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-zinc-900 transition-colors"
                        >
                            <FaChevronRight className="rotate-180" size={12} />
                            Back to Settings
                        </button>
                    </div>
                )}

                {activeTab === 'main' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <SettingItem
                                icon={<FaUser />}
                                title="Profile Info"
                                subtitle="Update your personal information"
                                onClick={() => setActiveTab('profile')}
                            />
                            <div className="h-px bg-gray-50 dark:bg-zinc-800/50 mx-4"></div>

                            {(user?.role === 'gymadmin' || user?.role === 'staff') && (
                                <>
                                    <SettingItem
                                        icon={<FaBuilding />}
                                        title="Fit Club Info"
                                        subtitle="Manage fit club branding and details"
                                        onClick={() => setActiveTab('gym')}
                                    />
                                    <div className="h-px bg-gray-50 dark:bg-zinc-800/50 mx-4"></div>
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
                                    <div className="h-px bg-gray-50 dark:bg-zinc-800/50 mx-4"></div>
                                </>
                            )}

                            <SettingItem
                                icon={<FaMoneyBillWave />}
                                title="Payment Setting"
                                subtitle="Manage pricing and billing"
                                onClick={() => setActiveTab('billing')}
                            />
                            <div className="h-px bg-gray-50 dark:bg-zinc-800/50 mx-4"></div>

                            {user?.role === 'gymadmin' && (
                                <>
                                    <SettingItem
                                        icon={<FaUsers />}
                                        title="Member Settings"
                                        subtitle="Archive rules and member defaults"
                                        onClick={() => setActiveTab('members')}
                                    />
                                    <div className="h-px bg-gray-50 dark:bg-zinc-800/50 mx-4"></div>

                                    <SettingItem
                                        icon={<FaChartLine />}
                                        title="Reports"
                                        subtitle="Reset reports baseline · audit history"
                                        onClick={() => setActiveTab('reports')}
                                    />
                                    <div className="h-px bg-gray-50 dark:bg-zinc-800/50 mx-4"></div>
                                </>
                            )}

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
                            className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-900 dark:hover:text-white transition-all duration-300 shadow-sm mt-8 border border-zinc-200"
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
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fit Club Branding</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your fit club's identity and information</p>
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
                                        ? 'bg-zinc-50 text-zinc-900 border-zinc-200 hover:bg-zinc-100'
                                        : 'bg-zinc-50 text-zinc-900 border-zinc-200 hover:bg-zinc-100'
                                        }`}
                                >
                                    {isEditingBranding ? 'Cancel' : 'Edit Profile'}
                                </button>
                            )}
                        </div>

                        {/* Logo + Quick Info */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-zinc-900 to-zinc-600 h-16 relative"></div>
                            <div className="px-6 pb-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
                                    <div
                                        className={`relative w-20 h-20 rounded-xl bg-white dark:bg-zinc-800 border-4 border-white dark:border-zinc-800 shadow-lg flex items-center justify-center overflow-hidden ${user?.role === 'gymadmin' && isEditingBranding ? 'cursor-pointer group' : ''}`}
                                        onClick={() => user?.role === 'gymadmin' && isEditingBranding && fileInputRef.current?.click()}
                                    >
                                        {gym?.logo ? (
                                            <img src={gym.logo.startsWith('http') ? gym.logo : `${backendUrl}${gym.logo}`} alt="Fit Club logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <FaBuilding size={28} className="text-gray-300 dark:text-gray-500" />
                                        )}
                                        {isEditingBranding && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {uploadingLogo ? (
                                                    <ButtonSpinner />
                                                ) : (
                                                    <FaCamera className="text-white" size={16} />
                                                )}
                                            </div>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                    </div>

                                    <div className="flex-1 pt-12">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{gym?.name}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Code: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-300">{gym?.gymCode}</span></p>
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
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
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
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-700/50 flex items-center justify-center">
                                        <FaBarcode className="text-zinc-900 dark:text-zinc-300" size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Club Code</p>
                                        <p className="font-bold font-mono text-gray-900 dark:text-white">{gym?.gymCode}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
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
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
                            <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/30">
                                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaBuilding className="text-zinc-700" />
                                    Fit Club Information
                                </h2>
                                {isEditingBranding && (
                                    <button
                                        onClick={handleGymSave}
                                        disabled={saving}
                                        className="text-sm bg-zinc-900 text-white px-3 py-1 rounded-lg hover:bg-zinc-800 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Info'}
                                    </button>
                                )}
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fit Club Name</label>
                                    {isEditingBranding ? (
                                        <input type="text" value={gymForm.name} onChange={(e) => setGymForm(p => ({ ...p, name: e.target.value }))}
                                            className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                            placeholder="Your Fit Club Name" />
                                    ) : (
                                        <p className="text-base font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-800/30 px-4 py-2 rounded-lg">{gymForm.name || "N/A"}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            <FaEnvelope className="inline mr-1.5 text-gray-400" size={11} /> Email
                                        </label>
                                        {isEditingBranding ? (
                                            <input type="email" value={gymForm.contactEmail} onChange={(e) => setGymForm(p => ({ ...p, contactEmail: e.target.value }))}
                                                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                                placeholder="info@yourgym.com" />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-800/30 px-4 py-2 rounded-lg">{gymForm.contactEmail || "N/A"}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            <FaPhone className="inline mr-1.5 text-gray-400" size={11} /> Phone
                                        </label>
                                        {isEditingBranding ? (
                                            <input type="text" value={gymForm.contactPhone} onChange={(e) => setGymForm(p => ({ ...p, contactPhone: e.target.value }))}
                                                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                                placeholder="9876543210" />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-800/30 px-4 py-2 rounded-lg">{gymForm.contactPhone || "N/A"}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        <FaMapMarkerAlt className="inline mr-1.5 text-gray-400" size={11} /> Address
                                    </label>
                                    {isEditingBranding ? (
                                        <textarea value={gymForm.address} onChange={(e) => setGymForm(p => ({ ...p, address: e.target.value }))}
                                            className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                            rows={2} placeholder="123 Main Street, City" />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-800/30 px-4 py-2 rounded-lg min-h-[40px]">{gymForm.address || "N/A"}</p>
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (isEditingProfile) {
                                            setProfileForm({ name: user?.name || "", email: user?.email || "" });
                                        }
                                        setIsEditingProfile(!isEditingProfile);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${isEditingProfile
                                        ? 'bg-zinc-50 text-zinc-900 border-zinc-200 hover:bg-zinc-100'
                                        : 'bg-zinc-50 text-zinc-900 border-zinc-200 hover:bg-zinc-100'
                                        }`}
                                >
                                    {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>

                        {/* Personal Profile Section with Photo - Redesigned */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-lg overflow-hidden mb-6 relative group">
                            <div className="bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 h-24 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.4),transparent)] animate-pulse"></div>
                            </div>
                            <div className="px-8 pb-8">
                                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 relative z-10">
                                    <div className="relative">
                                        <div
                                            className="relative w-28 h-28 rounded-full bg-white dark:bg-zinc-800 border-4 border-white dark:border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden group/photo ring-4 ring-zinc-900/10"
                                        >
                                            {user?.profileImage ? (
                                                <img src={user.profileImage.startsWith('http') ? user.profileImage : `${backendUrl}${user.profileImage}`} alt="User profile" className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-110" />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
                                                    <span className="text-4xl font-black text-zinc-900 dark:text-zinc-300">{user?.name?.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Always-visible edit button */}
                                        <button
                                            onClick={() => document.getElementById('user-photo-upload').click()}
                                            className="absolute bottom-0 right-0 w-9 h-9 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg flex items-center justify-center border-3 border-white dark:border-zinc-800 transition-all hover:scale-110 z-10"
                                        >
                                            <FaCamera size={13} />
                                        </button>
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
                                                    await api.post("/auth/profile/photo", formData, {
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
                                            <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                {user?.role}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium">{user?.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
                            <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/30">
                                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
                                        <FaUser className="text-zinc-900 dark:text-zinc-300" size={14} />
                                    </div>
                                    Account Details
                                </h2>
                                {isEditingProfile && (
                                    <button
                                        onClick={handleProfileSave}
                                        disabled={saving}
                                        className="text-sm bg-zinc-900 text-white px-3 py-1 rounded-lg hover:bg-zinc-800 disabled:opacity-50"
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
                                                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                                placeholder="Your Name"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-800/30 px-4 py-2 rounded-lg">{user?.name || "N/A"}</p>
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
                                                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                                placeholder="email@example.com"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-800/30 px-4 py-2 rounded-lg">{user?.email || "N/A"}</p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2 border-t border-gray-100 dark:border-zinc-800 pt-4 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordModal(true)}
                                            className="text-sm text-zinc-900 hover:text-zinc-800 font-medium flex items-center gap-2"
                                        >
                                            <FaCog size={12} /> Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(user?.role === 'gymadmin' || user?.role === 'staff') && activeTab === 'billing' && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
                        <div className="p-4 sm:p-6 border-b border-gray-50 dark:border-zinc-800 flex flex-row justify-between items-center gap-3 bg-gray-50/50 dark:bg-zinc-800/30">
                            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 min-w-0">
                                <FaMoneyBillWave className="text-green-500 shrink-0" />
                                <span className="truncate">Plan Management</span>
                            </h2>
                            <div className="flex items-center gap-2 flex-wrap">
                                {isEditingPricing && (
                                    <button
                                        onClick={saveSettings}
                                        disabled={saving}
                                        className="text-xs bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold flex items-center gap-1.5 shadow-md shadow-green-500/20 transition-all"
                                    >
                                        <FaSave size={11} />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                )}
                                {user?.role === 'gymadmin' && (
                                    <button
                                        onClick={() => {
                                            if (isEditingPricing) {
                                                fetchAllData();
                                            }
                                            setIsEditingPricing(!isEditingPricing);
                                        }}
                                        className={`text-xs px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${isEditingPricing
                                            ? 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                                            : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md shadow-zinc-900/20'
                                            }`}
                                    >
                                        {isEditingPricing ? (
                                            <><FaTimes size={10} /> Discard</>
                                        ) : (
                                            <><FaCog size={10} /> Edit Plans</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 border-b border-gray-50 dark:border-zinc-800">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FaCheckCircle className="text-zinc-700 dark:text-zinc-300" />
                                Admission Fee
                            </h3>
                            <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-700 transition-all hover:shadow-sm">
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                    One-time Admission Fee
                                </label>
                                {isEditingPricing ? (
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">₹</span>
                                        <input
                                            type="number"
                                            value={settings.admissionFee ?? ''}
                                            onChange={(e) => setSettings(prev => ({ ...prev, admissionFee: e.target.value === '' ? '' : parseInt(e.target.value, 10) }))}
                                            className="w-full pl-8 pr-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 transition-all outline-none font-semibold text-gray-900 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                        <span className="text-gray-400 font-medium">₹</span>
                                        {settings.admissionFee ? Number(settings.admissionFee).toLocaleString('en-IN') : 0}
                                    </p>
                                )}
                            </div>
                        </div>



                        <div className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaCalendarAlt className="text-zinc-700 dark:text-zinc-300" />
                                    Membership Plans
                                </h3>
                                {isEditingPricing && (
                                    <button
                                        onClick={() => {
                                            const customCount = (settings.plans || []).filter(p => !p.isDefault).length;
                                            const newPlan = { name: `Custom Plan ${customCount + 1}`, duration: 1, durationType: 'months', price: 0, isActive: true, isDefault: false };
                                            setSettings(prev => ({
                                                ...prev,
                                                plans: [...(prev.plans || []), newPlan]
                                            }));
                                        }}
                                        className="text-xs bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-1.5 font-semibold shadow-md shadow-zinc-900/20 transition-all self-start sm:self-auto"
                                    >
                                        <FaCrown size={10} /> Add Custom Plan
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {(settings.plans || []).map((plan, index) => (
                                    <div key={index} className={`p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 group transition-all ${plan.isDefault ? 'bg-gray-50 dark:bg-zinc-800/30 border-gray-100 dark:border-zinc-700' : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700/30'}`}>
                                        <div className="flex-1 w-full min-w-0">
                                            {isEditingPricing ? (
                                                <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center gap-3">
                                                    {/* Header row: name + mobile-only inline actions */}
                                                    <div className="flex items-center gap-2 sm:contents">
                                                        {plan.isDefault ? (
                                                            <div className="flex items-center gap-2 flex-1 sm:flex-none min-w-0">
                                                                <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{plan.name}</span>
                                                                <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded shrink-0">Default</span>
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
                                                                className="flex-1 sm:flex-none min-w-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded px-2 py-1 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                                                placeholder="Plan Name"
                                                            />
                                                        )}
                                                        {/* Mobile-only inline actions */}
                                                        <div className="flex items-center gap-2 sm:hidden shrink-0">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${plan.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                                                {plan.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    const newPlans = [...settings.plans];
                                                                    newPlans[index].isActive = !newPlans[index].isActive;
                                                                    setSettings({ ...settings, plans: newPlans });
                                                                }}
                                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${plan.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-700'}`}
                                                            >
                                                                <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform" style={{ transform: plan.isActive ? 'translateX(18px)' : 'translateX(2px)' }} />
                                                            </button>
                                                            {!plan.isDefault && (
                                                                <button
                                                                    onClick={() => {
                                                                        const newPlans = settings.plans.filter((_, i) => i !== index);
                                                                        setSettings({ ...settings, plans: newPlans });
                                                                    }}
                                                                    className="text-zinc-400 hover:text-zinc-700 p-1"
                                                                >
                                                                    <span className="text-xl leading-none">&times;</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Duration controls */}
                                                    {plan.isDefault ? (
                                                        <span className="text-xs text-gray-500">{plan.duration} {plan.durationType === 'days' ? (plan.duration > 1 ? 'Days' : 'Day') : plan.durationType === 'weeks' ? (plan.duration > 1 ? 'Weeks' : 'Week') : (plan.duration > 1 ? 'Months' : 'Month')}</span>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={plan.duration}
                                                                onChange={(e) => {
                                                                    const newPlans = [...settings.plans];
                                                                    newPlans[index].duration = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                                                    setSettings({ ...settings, plans: newPlans });
                                                                }}
                                                                className="w-16 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                                            />
                                                            <select
                                                                value={plan.durationType || 'months'}
                                                                onChange={(e) => {
                                                                    const newPlans = [...settings.plans];
                                                                    newPlans[index].durationType = e.target.value;
                                                                    setSettings({ ...settings, plans: newPlans });
                                                                }}
                                                                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                                            >
                                                                <option value="days">Days</option>
                                                                <option value="weeks">Weeks</option>
                                                                <option value="months">Months</option>
                                                            </select>
                                                        </div>
                                                    )}

                                                    {/* Price input */}
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                        <input
                                                            type="number"
                                                            value={plan.price}
                                                            onChange={(e) => {
                                                                const newPlans = [...settings.plans];
                                                                newPlans[index].price = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                                                setSettings({ ...settings, plans: newPlans });
                                                            }}
                                                            className="w-full pl-5 pr-2 py-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center gap-1">
                                                    <div className="flex items-center gap-2 sm:contents">
                                                        <div className="flex items-center gap-2 flex-1 sm:flex-none min-w-0">
                                                            <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{plan.name}</span>
                                                            {plan.isDefault && <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded shrink-0">Default</span>}
                                                            {!plan.isDefault && <span className="text-[9px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-700/50 text-zinc-700 px-1.5 py-0.5 rounded shrink-0">Custom</span>}
                                                        </div>
                                                        {/* Mobile-only ACTIVE/INACTIVE indicator */}
                                                        <span className={`sm:hidden text-[10px] font-bold uppercase tracking-wider shrink-0 ${plan.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                                            {plan.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{plan.duration} {plan.durationType === 'days' ? (plan.duration > 1 ? 'Days' : 'Day') : plan.durationType === 'weeks' ? (plan.duration > 1 ? 'Weeks' : 'Week') : (plan.duration > 1 ? 'Months' : 'Month')}</span>
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">₹{plan.price.toLocaleString('en-IN')}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Desktop-only side action block */}
                                        <div className="hidden sm:flex items-center gap-4 sm:ml-4">
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
                                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${plan.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-700'}`}
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
                                                    className="text-zinc-400 hover:text-zinc-700 p-1"
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

                {user?.role === 'gymadmin' && activeTab === 'members' && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/30">
                            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaUsers className="text-zinc-700" />
                                Member Settings
                            </h2>
                            {!isEditingMembers ? (
                                <button
                                    onClick={() => setIsEditingMembers(true)}
                                    className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors bg-white dark:bg-zinc-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-600"
                                >
                                    Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setIsEditingMembers(false); fetchAllData(); }}
                                        className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                setSaving(true);
                                                await api.put('/settings', {
                                                    archiveAfterDays: Number(settings.archiveAfterDays) || 90,
                                                });
                                                toast.success('Member settings saved!');
                                                setIsEditingMembers(false);
                                                queryClient.invalidateQueries({ queryKey: ['members'] });
                                            } catch (err) {
                                                toast.error('Failed to save member settings');
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                        disabled={saving}
                                        className="text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
                                    >
                                        {saving ? <ButtonSpinner /> : <FaSave size={10} />}
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Archive After Days */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Archive expired members after
                                </label>
                                {isEditingMembers ? (
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={settings.archiveAfterDays}
                                            onChange={(e) => setSettings(prev => ({ ...prev, archiveAfterDays: e.target.value }))}
                                            className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 dark:focus:border-zinc-500 outline-none transition-all"
                                        />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">days after expiry</span>
                                    </div>
                                ) : (
                                    <div className="px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/30 rounded-lg text-sm text-gray-900 dark:text-white font-medium">
                                        {settings.archiveAfterDays} days
                                    </div>
                                )}
                                <p className="mt-1.5 text-xs text-gray-400 dark:text-zinc-500">
                                    Members whose membership expired more than {settings.archiveAfterDays} days ago will be moved to the Archived section. Range: 1–365 days.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {user?.role === 'gymadmin' && activeTab === 'reports' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ReportBaselineCard />
                    </div>
                )}

                {(user?.role === 'gymadmin' || user?.role === 'staff') && activeTab === 'appearance' && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/30">
                            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaCog className="text-zinc-700" />
                                Appearance
                            </h2>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-700 px-2 py-1 rounded border border-gray-200 dark:border-zinc-500">Theme Settings</span>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 transition-all">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-200 dark:bg-zinc-700'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 flex items-center justify-center ${theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
                                            }`}
                                    >
                                        {theme === 'dark' ? (
                                            <FaMoon className="text-[10px] text-zinc-900" />
                                        ) : (
                                            <FaSun className="text-[10px] text-yellow-500" />
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password Change Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-300 flex items-center justify-center">
                                        <FaShieldAlt />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                >
                                    <FaTimes className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handlePasswordUpdate} className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all outline-none"
                                            placeholder="Enter new password"
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

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Confirm Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all outline-none"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-3 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Email Change Warning Modal */}
                <ConfirmModal
                    isOpen={showEmailWarning}
                    onClose={() => setShowEmailWarning(false)}
                    onConfirm={doProfileSave}
                    title="Change Login Email?"
                    message={`This will update your login email to "${profileForm.email}" and log you out from all devices.`}
                    confirmText="Change Email & Logout"
                    type="warning"
                    loading={saving}
                />
            </div>
        </AppLayout >
    );
};

export default Settings;
