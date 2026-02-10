import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FaMale, FaFemale, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EditMemberModal = ({ memberId, onClose, onUpdate }) => {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/contacts/${memberId}`);
                setFormData(response.data);
            } catch (error) {
                toast.error('Failed to load member data');
                onClose();
            } finally {
                setLoading(false);
            }
        };
        if (memberId) fetchMember();
    }, [memberId, backendUrl, onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Calculate new Expiry Date if Logic Requires:
            // This logic mirrors the original AllMembers.jsx logic
            // Note: If user manually changes date, we might want to respect that?
            // For now, let's keep the logic: updates endDate based on plan AND startDate

            const today = new Date(); today.setHours(0, 0, 0, 0);

            // Only recalculate if plan changes? Or always?
            // The original logic seemed to recalculate DEWS based on plan always.
            // Let's stick to the original logic to ensure consistency.

            const daysToAdd = { '1-Month': 30, '2-Month': 60, '3-Month': 90 }[formData.plan] || 0;
            const startDate = new Date(formData.date); startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + daysToAdd); endDate.setHours(0, 0, 0, 0);

            // Calculate DEWS (Days Expired / Withstanding)
            // dews > 0 means Active (Days remaining)
            // dews < 0 means Expired (Days overdue)
            // original logic: 
            // const dews = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            const dews = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            const updateData = {
                ...formData,
                endDate: endDate.toISOString(),
                status: dews >= 0 ? "Active" : "InActive",
                dews,
                // Ensure specific fields are numbers/strings as needed
                amount: formData.amount ? parseInt(formData.amount) : 0
            };

            await axios.put(`${backendUrl}/api/contacts/${formData._id}`, updateData);

            toast.success('Member updated successfully');
            if (onUpdate) onUpdate(updateData);
            onClose();
        } catch (error) {
            console.error("Update error:", error);
            toast.error('Failed to update member');
        }
    };

    if (loading) return null; // Or a spinner
    if (!formData) return null;

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
                    {/* Name */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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

                    {/* Plan */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Membership Plan</label>
                        <select
                            value={formData.plan}
                            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        >
                            <option value="1-Month">1 Month</option>
                            <option value="2-Month">2 Months</option>
                            <option value="3-Month">3 Months</option>
                            <option value="6-Month">6 Months</option>
                            <option value="1-Year">1 Year</option>
                        </select>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Gender</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${formData.gender === 'Male' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
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
                        <input
                            type="date"
                            value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                                        className="w-full pl-8 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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
                            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm shadow-lg shadow-blue-500/30"
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
