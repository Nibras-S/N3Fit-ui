import React, { useState, useMemo } from 'react';
import api from '../../../shared/services/api';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';

/**
 * EditEndDateModal
 *
 * Lets gym staff add days to a member's membership end date and records the
 * change with a mandatory reason for the audit trail.
 *
 * Props:
 *   isOpen     – boolean
 *   onClose    – () => void
 *   member     – { _id, name, endDate, dews }
 *   onSuccess  – () => void  (called after a successful update)
 */
const EditEndDateModal = ({ isOpen, onClose, member, onSuccess }) => {
    const [daysToAdd, setDaysToAdd] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const fmt = (d) =>
        d
            ? new Date(d).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
              })
            : '-';

    const preview = useMemo(() => {
        const days = parseInt(daysToAdd, 10);
        if (!days || days <= 0 || !member?.endDate) return null;
        const base = new Date(member.endDate);
        const next = new Date(base);
        next.setDate(base.getDate() + days);
        const newDews = Math.round((next - Date.now()) / 86400000);
        return { date: next, dews: newDews };
    }, [daysToAdd, member?.endDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!preview) return;
        if (reason.trim().length < 3) {
            toast.error('Please enter a reason (min 3 characters)');
            return;
        }
        setLoading(true);
        try {
            await api.put(`/contacts/${member._id}/end-date`, {
                endDate: preview.date.toISOString(),
                reason: reason.trim(),
            });
            toast.success('Membership end date updated');
            onSuccess();
            handleClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update end date');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setDaysToAdd('');
        setReason('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 max-h-[92vh] sm:max-h-[90vh] flex flex-col animate-sheet-up sm:animate-modal-in">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-zinc-900" />
                        <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                            Extend Membership
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5 flex-1 overflow-y-auto custom-scrollbar" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}>
                    {/* Current info */}
                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Member</span>
                            <span className="font-medium text-gray-900 dark:text-white">{member?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Current End Date</span>
                            <span className="font-medium text-gray-900 dark:text-white">{fmt(member?.endDate)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Days Remaining</span>
                            <span className={`font-bold ${(member?.dews ?? 0) > 0 ? 'text-green-600 dark:text-green-400' : 'text-zinc-900 dark:text-zinc-500'}`}>
                                {member?.dews ?? 0} days
                            </span>
                        </div>
                    </div>

                    {/* Days input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Days to Add
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="3650"
                            value={daysToAdd}
                            onChange={(e) => setDaysToAdd(e.target.value)}
                            placeholder="e.g. 7"
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/30 focus:border-zinc-900 transition-all text-sm"
                            required
                        />
                    </div>

                    {/* Live preview */}
                    {preview && (
                        <div className="bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/30 rounded-xl p-4 space-y-2 text-sm">
                            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-300 uppercase tracking-wide">Preview</p>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">New End Date</span>
                                <span className="font-bold text-gray-900 dark:text-white">{fmt(preview.date)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">New Days Remaining</span>
                                <span className={`font-bold ${preview.dews > 0 ? 'text-green-600 dark:text-green-400' : 'text-zinc-700'}`}>
                                    {preview.dews} days
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Reason <span className="text-gray-400 font-normal">(required)</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Member was on leave for 14 days"
                            rows={3}
                            maxLength={500}
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/30 focus:border-zinc-900 transition-all text-sm resize-none"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">{reason.length}/500</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!preview || loading}
                            className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                        >
                            {loading ? 'Saving…' : 'Update End Date'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEndDateModal;
