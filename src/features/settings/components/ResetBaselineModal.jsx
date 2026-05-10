import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaTimes, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';
import { DatePicker } from '../../../shared/components/ui/DatePicker';
import { useResetBaselineMutation } from '../hooks/useSettingsQueries';
import { getTodayDateInputIST, formatDateIST } from '../../../shared/lib/timezone';

/**
 * Confirmation modal for the "Reset Reports" action. Strongly worded so admins
 * understand exactly what does and doesn't change. Defaults the baseline date
 * to today's IST calendar date; admins can pick an earlier date if they want
 * to retroactively hide older reports too.
 */
const ResetBaselineModal = ({ isOpen, onClose, currentBaseline }) => {
    const [baselineDate, setBaselineDate] = useState(getTodayDateInputIST());
    const [reason, setReason] = useState('');
    const mutation = useResetBaselineMutation();

    useEffect(() => {
        if (isOpen) {
            setBaselineDate(getTodayDateInputIST());
            setReason('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!baselineDate) {
            toast.error('Pick a baseline date');
            return;
        }
        try {
            await mutation.mutateAsync({ baselineDate, reason: reason.trim() });
            toast.success('Reports reset successfully');
            onClose();
        } catch (err) {
            // Global axios interceptor already showed a toast.
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 sm:p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <FaExclamationTriangle />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reset Reports</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <FaTimes className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Plain-language explanation. Strong wording is intentional —
                        admins must know this is a reporting filter, not data deletion. */}
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>This will <strong>hide transactions and expenses</strong> dated before the chosen date from reports and dashboards.</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-500 dark:text-gray-400 text-xs">
                            <li><strong>No data is deleted.</strong> Every transaction stays in the database.</li>
                            <li>Members, dues, and renewals are <strong>not affected</strong>.</li>
                            <li>Per-member transaction history on the member profile is unaffected.</li>
                            <li>You can change or clear this baseline anytime.</li>
                        </ul>
                    </div>

                    {currentBaseline && (
                        <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-xs text-blue-800 dark:text-blue-300">
                            Current baseline: <strong>{formatDateIST(currentBaseline)}</strong>. Setting a new date will overwrite it (the previous value is kept in the audit log).
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2">
                            <FaCalendarAlt className="text-amber-500 text-xs" /> Hide reports before
                        </label>
                        <DatePicker
                            value={baselineDate}
                            onChange={(e) => setBaselineDate(e.target.value)}
                            max={getTodayDateInputIST()}
                            required
                        />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                            Default: today. Pick any earlier date if you want to roll the cutoff further back.
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                            Reason <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={2}
                            maxLength={500}
                            placeholder="e.g. Starting fresh for FY 2026-27"
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200 transition-all outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={mutation.isPending}
                            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Resetting…' : 'Confirm Reset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetBaselineModal;
