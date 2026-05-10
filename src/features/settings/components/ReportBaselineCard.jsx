import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaChartLine, FaUndo, FaHistory } from 'react-icons/fa';
import {
    useReportBaseline,
    useBaselineHistory,
    useClearBaselineMutation,
} from '../hooks/useSettingsQueries';
import { formatDateIST, formatDateTimeIST } from '../../../shared/lib/timezone';
import ResetBaselineModal from './ResetBaselineModal';

/**
 * Card on the Settings → Reports tab. Shows the current baseline state plus
 * Reset / Clear actions and the audit history table.
 */
const ReportBaselineCard = () => {
    const [resetOpen, setResetOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const { data: baseline } = useReportBaseline();
    const { data: history = [], isLoading: historyLoading } = useBaselineHistory();
    const clearMutation = useClearBaselineMutation();

    const handleClear = async () => {
        if (!window.confirm('Clear the baseline? Reports will go back to showing all-time data.')) return;
        try {
            await clearMutation.mutateAsync({});
            toast.success('Baseline cleared. Reports show all data again.');
        } catch (err) {
            // toast already shown by interceptor
        }
    };

    const isActive = !!baseline?.baselineDate;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-6">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                    <FaChartLine />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Report Baseline</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Hide transactions and expenses dated before a chosen date from reports and dashboards.
                        Members, dues, and per-member history stay unchanged.
                    </p>
                </div>
            </div>

            {/* Current state */}
            <div className={`px-4 py-3 rounded-xl border ${isActive
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40'
                : 'bg-gray-50 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-800'}`}>
                {isActive ? (
                    <>
                        <p className="text-sm text-blue-900 dark:text-blue-200">
                            Reports currently show data since <strong>{formatDateIST(baseline.baselineDate)}</strong>.
                        </p>
                        {baseline.lastReset?.performedBy?.name && (
                            <p className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-1">
                                Last set by {baseline.lastReset.performedBy.name} on {formatDateTimeIST(baseline.lastReset.createdAt)}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        No baseline set. Reports show all-time data.
                    </p>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => setResetOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors shadow-sm"
                >
                    {isActive ? 'Change Baseline' : 'Reset Reports'}
                </button>
                {isActive && (
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={clearMutation.isPending}
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                        <FaUndo className="text-xs" /> Clear Baseline
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => setHistoryOpen((v) => !v)}
                    className="px-4 py-2 rounded-xl text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors inline-flex items-center gap-1.5"
                >
                    <FaHistory className="text-xs" /> {historyOpen ? 'Hide' : 'Past resets'}
                </button>
            </div>

            {historyOpen && (
                <div className="border-t border-gray-100 dark:border-zinc-800 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Past resets</h4>
                    {historyLoading ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500">Loading…</p>
                    ) : history.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500">No resets yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                        <th className="py-2 pr-3 font-semibold">When</th>
                                        <th className="py-2 pr-3 font-semibold">By</th>
                                        <th className="py-2 pr-3 font-semibold">Action</th>
                                        <th className="py-2 pr-3 font-semibold">Previous</th>
                                        <th className="py-2 pr-3 font-semibold">New</th>
                                        <th className="py-2 pr-3 font-semibold">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                                    {history.map((row) => (
                                        <tr key={row._id} className="text-gray-600 dark:text-gray-300">
                                            <td className="py-2 pr-3 whitespace-nowrap">{formatDateTimeIST(row.createdAt)}</td>
                                            <td className="py-2 pr-3 whitespace-nowrap">{row.performedBy?.name || '—'}</td>
                                            <td className="py-2 pr-3 whitespace-nowrap">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.type === 'reset_baseline'
                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'}`}>
                                                    {row.type === 'reset_baseline' ? 'Reset' : 'Cleared'}
                                                </span>
                                            </td>
                                            <td className="py-2 pr-3 whitespace-nowrap">{row.previousBaselineDate ? formatDateIST(row.previousBaselineDate) : '—'}</td>
                                            <td className="py-2 pr-3 whitespace-nowrap">{row.newBaselineDate ? formatDateIST(row.newBaselineDate) : '—'}</td>
                                            <td className="py-2 pr-3 max-w-xs truncate">{row.reason || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <ResetBaselineModal
                isOpen={resetOpen}
                onClose={() => setResetOpen(false)}
                currentBaseline={baseline?.baselineDate}
            />
        </div>
    );
};

export default ReportBaselineCard;
