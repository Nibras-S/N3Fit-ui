import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FaSave, FaCog, FaMoneyBillWave } from 'react-icons/fa';
import PageHeader from '../components/ui/PageHeader';
import AppLayout from '../layout/AppLayout';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        subscriptionPrices: {
            "1-Month": 0,
            "2-Month": 0,
            "3-Month": 0,
            "6-Month": 0,
            "12-Month": 0
        },
        defaultPaymentMethod: "Cash"
    });

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        fetchSettings();
    }, [backendUrl]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${backendUrl}/api/settings`);
            if (res.data) {
                setSettings(prev => ({
                    ...prev,
                    ...res.data,
                    subscriptionPrices: { ...prev.subscriptionPrices, ...res.data.subscriptionPrices }
                }));
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
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
            await axios.put(`${backendUrl}/api/settings`, settings);
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
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
            <div className="max-w-4xl mx-auto">
                <Toaster position="top-right" />

                <PageHeader
                    title="Settings"
                />

                <div className="grid gap-6">
                    {/* Subscription Pricing Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-700/30">
                            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaMoneyBillWave className="text-green-500" />
                                Subscription Pricing
                            </h2>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-600 px-2 py-1 rounded border border-gray-200 dark:border-slate-500">Default Charges</span>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(settings.subscriptionPrices).map((duration) => (
                                    <div key={duration} className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-600 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 group">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                                            {duration.replace('-', ' ')} Plan
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">₹</span>
                                            <input
                                                type="number"
                                                value={settings.subscriptionPrices[duration]}
                                                onChange={(e) => handlePriceChange(duration, e.target.value)}
                                                className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none font-semibold text-gray-900 dark:text-white"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Settings;
