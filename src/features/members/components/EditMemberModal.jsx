import React, { useState, useEffect } from 'react';
import api from '../../../shared/services/api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FaMale, FaFemale, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '../../../shared/components/ui/DatePicker';

/**
 * Convert a stored UTC instant (e.g. "2026-04-07T18:30:00.000Z" = IST midnight
 * of Apr 8) to the YYYY-MM-DD calendar day in IST. Using toISOString() here is
 * wrong because it returns the *UTC* day, which is one day behind for any
 * date stored at IST midnight — that's the off-by-one bug in the edit modal.
 */
const toISTDateInputValue = (input) => {
    if (!input) return '';
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '';
    // en-CA gives YYYY-MM-DD, which matches what <input type="date"> expects.
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

const EditMemberModal = ({ memberId, onClose, onUpdate }) => {
    const [formData, setFormData] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);
    const { hasFeature } = useAuth();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [memberRes, settingsRes] = await Promise.all([
                    api.get(`/contacts/${memberId}`),
                    api.get(`/settings`)
                ]);
                const memberData = memberRes.data;
                setFormData(memberData);
                setOriginalData({ ...memberData });

                const settingsData = settingsRes.data?.data ?? settingsRes.data;
                setSettings(settingsData);
            } catch (error) {
                toast.error('Failed to load member data');
                onClose();
            } finally {
                setLoading(false);
            }
        };
        if (memberId) fetchData();
    }, [memberId, backendUrl, onClose]);

    // Compute planDays from settings for a given plan name
    const computePlanDays = (planName) => {
        if (!settings?.plans) return null;
        const plan = settings.plans.find(p => p.name === planName);
        if (!plan) return null;
        const type = plan.durationType || 'months';
        if (type === 'days') return plan.duration;
        if (type === 'weeks') return plan.duration * 7;
        return plan.duration * 30; // months
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Detect if this is a renewal (plan or amount changed)
            const planChanged = formData.plan !== originalData.plan;
            const amountChanged = formData.amount !== originalData.amount;
            const isRenewal = planChanged || amountChanged;

            const updateData = {
                name: formData.name,
                phone: formData.phone,
                plan: formData.plan,
                gender: formData.gender,
                date: formData.date,
                // Payment status/method only sent for plain edits; renewals
                // always create a Pending transaction and go through the
                // MembershipCard → RecordPaymentModal flow.
                ...(isRenewal ? {} : {
                    paymentStatus: formData.paymentStatus,
                    paymentMethod: formData.paymentMethod,
                }),
            };

            if (isRenewal) {
                updateData._isRenewal = true;
                updateData.amount = formData.amount ? parseInt(formData.amount) : 0;
                updateData.discount = formData.discount ? parseInt(formData.discount) : 0;

                // Compute planDays from settings
                const planDays = computePlanDays(formData.plan);
                if (planDays) updateData.planDays = planDays;
            }

            const res = await api.put(`/contacts/${formData._id}`, updateData);
            const responseData = res.data;

            if (isRenewal && responseData?.transaction) {
                // Renewal: navigate to MembershipCard so staff can record payment
                toast.success('Membership renewed! Record payment below.');
                onClose();
                const txnParam = `?txn=${responseData.transaction._id}`;
                navigate(`/members/${formData._id}/card${txnParam}`);
            } else {
                toast.success('Member updated successfully');
                if (onUpdate) onUpdate(updateData);
                onClose();
            }
        } catch (error) {
            // The axios interceptor already toasts the actual server error.
            // Don't add a generic "Failed to update member" on top of it.
            console.error("Update error:", error);
        }
    };

    // Get active plans from settings, fallback to hardcoded
    const getPlans = () => {
        if (settings?.plans && settings.plans.length > 0) {
            return settings.plans.filter(p => p.isActive).map(p => ({
                value: p.name,
                label: p.name,
                duration: p.duration,
                durationType: p.durationType || 'months',
            }));
        }
        return [
            { value: "1-Month", label: "1 Month" },
            { value: "2-Month", label: "2 Months" },
            { value: "3-Month", label: "3 Months" },
            { value: "6-Month", label: "6 Months" },
            { value: "12-Month", label: "1 Year" },
        ];
    };

    if (loading) return null;
    if (!formData) return null;

    const plans = getPlans();

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Member</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <FaTimes className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Profile Photo Preview — only if feature enabled */}
                    {hasFeature('profilePhoto') && (
                        <div className="flex justify-center mb-2">
                            {formData.profileImage ? (
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-md">
                                    <img
                                        src={formData.profileImage.startsWith('http') ? formData.profileImage : `${backendUrl}${formData.profileImage}`}
                                        alt={formData.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${formData.gender === 'Male' ? 'bg-zinc-100 text-red-600' : 'bg-pink-100 text-pink-600'}`}>
                                    {formData.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all outline-none"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Phone Number</label>
                        <PhoneInput
                            country="in"
                            value={formData.phone}
                            onlyCountries={['in']}
                            onChange={(value) => setFormData({ ...formData, phone: value })}
                            inputClass="!w-full !py-2.5 !px-4 !h-auto !rounded-xl !bg-gray-50 dark:!bg-slate-900 !border-gray-200 dark:!border-slate-700 !text-gray-900 dark:!text-white !text-sm"
                            buttonClass="!bg-gray-50 dark:!bg-slate-900 !border-gray-200 dark:!border-slate-700 !rounded-l-xl"
                            dropdownClass="!bg-white dark:!bg-slate-800 !text-gray-900 dark:!text-white"
                        />
                    </div>

                    {/* Plan — loaded from settings */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Membership Plan</label>
                        <select
                            value={formData.plan}
                            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all outline-none"
                        >
                            {plans.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Gender</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${formData.gender === 'Male' ? 'border-zinc-900 bg-zinc-50 dark:bg-zinc-800/50 text-red-600 dark:text-red-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                                <input type="radio" value="Male" checked={formData.gender === "Male"} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="hidden" />
                                <FaMale /> Male
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${formData.gender === 'Female' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                                <input type="radio" value="Female" checked={formData.gender === "Female"} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="hidden" />
                                <FaFemale /> Female
                            </label>
                        </div>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Start Date</label>
                        <DatePicker
                            value={toISTDateInputValue(formData.date)}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="!bg-gray-50 dark:!bg-slate-900 border-gray-200 dark:border-slate-700"
                        />
                    </div>

                    {/* Payment Info Section */}
                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Payment Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Status</label>
                                <select
                                    value={formData.paymentStatus || 'Paid'}
                                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                                >
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Partial">Partial</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Method</label>
                                <select
                                    value={formData.paymentMethod || 'Cash'}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Card">Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Amount (Overwrite if needed)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">₹</span>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={formData.amount || ''}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-8 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors text-sm shadow-lg shadow-red-500/30"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMemberModal;
