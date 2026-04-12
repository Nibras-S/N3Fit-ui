import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '../../auth/context/AuthContext';
import AppLayout from '../../../shared/components/layout/AppLayout';
import PageHeader from '../../../shared/components/layout/PageHeader';
import toast, { Toaster } from "react-hot-toast";
import {
    FaTrashRestore, FaTrash, FaBuilding, FaSearch,
    FaExclamationCircle, FaShieldAlt, FaCogs
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';

const SuperAdminSettings = () => {
    const { api } = useAuth();
    const [deletedGyms, setDeletedGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Restore Modal State
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [gymToRestore, setGymToRestore] = useState(null);

    const fetchDeletedGyms = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/superadmin/gyms/deleted');
            const data = Array.isArray(res.data?.data) ? res.data.data
                : Array.isArray(res.data?.gyms) ? res.data.gyms
                    : Array.isArray(res.data) ? res.data : [];
            setDeletedGyms(data);
        } catch (err) {
            toast.error("Failed to load deleted gyms");
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchDeletedGyms();
    }, [fetchDeletedGyms]);

    const handleRestore = async () => {
        if (!gymToRestore) return;
        try {
            await api.put(`/superadmin/gyms/${gymToRestore._id}/restore`);
            toast.success(`${gymToRestore.name} restored successfully`);
            fetchDeletedGyms();
        } catch (err) {
            toast.error("Failed to restore gym");
        }
    };

    const filtered = deletedGyms.filter(gym =>
        gym.name?.toLowerCase().includes(search.toLowerCase()) ||
        gym.gymCode?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout showGenderSwitch={false}>
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto pb-20">
                <PageHeader
                    title="Platform Settings"
                    subtitle="System configuration and data recovery"
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-500 font-bold text-sm text-left transition-all">
                            <FaTrash size={14} />
                            Recycling Bin
                        </button>
                        <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 font-medium text-sm text-left opacity-50 cursor-not-allowed">
                            <FaShieldAlt size={14} />
                            Security Controls
                        </button>
                        <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 font-medium text-sm text-left opacity-50 cursor-not-allowed">
                            <FaCogs size={14} />
                            System Config
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden">
                            <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recycling Bin</h3>
                                    <p className="text-xs text-gray-500">View and restore deactivated gym accounts</p>
                                </div>
                                <div className="relative">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                    <input
                                        type="text"
                                        placeholder="Search deleted gyms..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-zinc-900/10 outline-none w-full md:w-64 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50 dark:bg-zinc-950/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gym Info</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Code</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deleted On</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                                        {filtered.length > 0 ? (
                                            filtered.map((gym) => (
                                                <tr key={gym._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 font-bold text-xs">
                                                                {gym.name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{gym.name}</p>
                                                                <p className="text-[10px] text-gray-500">{gym.contactEmail}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-400">{gym.gymCode}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            {new Date(gym.updatedAt).toLocaleDateString()}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setGymToRestore(gym);
                                                                setIsRestoreModalOpen(true);
                                                            }}
                                                            className="px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-700/50 text-zinc-900 dark:text-zinc-500 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-all flex items-center gap-2 ml-auto"
                                                        >
                                                            <FaTrashRestore size={12} />
                                                            Restore
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-20 text-center">
                                                    <div className="max-w-xs mx-auto">
                                                        <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-950/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                                            <FaTrash size={24} />
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-400">No deleted gyms found</p>
                                                        <p className="text-xs text-gray-500 mt-1">Gyms you deactivate will appear here for 30 days before permanent deletion.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-3xl p-6 flex gap-4 items-start">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600">
                                <FaExclamationCircle size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm">Data Retention Policy</h4>
                                <p className="text-xs text-amber-800/70 dark:text-amber-400/60 mt-1 leading-relaxed">
                                    Soft-deleted gyms will be retained for 30 days. Restoring a gym will immediately reactivate its access and restore all associated member and staff data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <ConfirmModal
                    isOpen={isRestoreModalOpen}
                    onClose={() => setIsRestoreModalOpen(false)}
                    onConfirm={handleRestore}
                    title="Restore Gym Account"
                    message={`Are you sure you want to restore ${gymToRestore?.name}? This will reactivate the account and allow their users to log in again.`}
                    confirmText="Restore Gym"
                    cancelText="Keep in Bin"
                    type="info"
                />
            </div>
        </AppLayout>
    );
};

export default SuperAdminSettings;
