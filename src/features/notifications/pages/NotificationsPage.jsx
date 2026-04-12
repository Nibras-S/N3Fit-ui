import React, { useState, useEffect } from 'react';
import { FaBell, FaCheckDouble, FaExclamationTriangle, FaTrash, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../auth/context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import AppLayout from '../../../shared/components/layout/AppLayout';
import PageHeader from '../../../shared/components/layout/PageHeader';
import toast, { Toaster } from 'react-hot-toast';
import { TableSkeleton } from '../../../shared/components/ui/Skeleton';

const Notifications = () => {
    const {
        notifications,
        loading,
        markAsRead,
        markAllAsRead
    } = useNotifications();

    return (
        <AppLayout title="Notifications" description="Manage your messages and alerts" icon={FaBell} showGenderSwitch={false}>
            <div className="mx-auto pb-10">
                <Toaster position="top-right" />

                <div className="flex justify-end items-center mb-6">
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-zinc-900/25"
                        >
                            <FaCheckDouble size={14} /> Mark All as Read
                        </button>
                    )}
                </div>

                <div className="mt-8 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            
                            <p className="text-sm font-medium">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-20 text-center shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-600">
                                <FaBell size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No notifications yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">When you receive updates or warnings from the Super Admin, they will appear here.</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n._id}
                                className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all p-5 flex gap-5 group relative ${!n.isRead ? 'border-zinc-200 dark:border-zinc-800 ring-1 ring-red-50 dark:ring-red-900/10 shadow-md' : 'border-gray-100 dark:border-zinc-800 opacity-80'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'warning' ? 'bg-zinc-50 text-zinc-700 dark:bg-zinc-800/50' : 'bg-zinc-50 text-zinc-700 dark:bg-zinc-800/50'}`}>
                                    {n.type === 'warning' ? <FaExclamationTriangle size={20} /> : <FaBell size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${n.type === 'warning' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700/60 dark:text-zinc-500' : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700/60 dark:text-zinc-500'}`}>
                                            {n.type}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${!n.isRead ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-600 dark:text-gray-400 font-medium'}`}>
                                        {n.message}
                                    </p>
                                </div>
                                {!n.isRead && (
                                    <button
                                        onClick={() => markAsRead(n._id)}
                                        className="p-2 text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-lg transition-colors"
                                        title="Mark as read"
                                    >
                                        <FaCheckDouble size={16} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Notifications;
