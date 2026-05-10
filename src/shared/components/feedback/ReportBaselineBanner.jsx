import React from 'react';
import { Link } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa';
import { useReportBaseline } from '../../../features/settings/hooks/useSettingsQueries';
import { formatDateIST } from '../../lib/timezone';

/**
 * Subtle banner shown at the top of report pages when a "Reset Reports"
 * baseline is active. Renders nothing when the gym hasn't reset (the default).
 */
export default function ReportBaselineBanner() {
    const { data, isLoading } = useReportBaseline();
    if (isLoading || !data?.baselineDate) return null;

    return (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-sm text-blue-900 dark:text-blue-200">
            <FaInfoCircle className="text-blue-500 dark:text-blue-400 shrink-0" />
            <span className="flex-1">
                Reports show data since <strong>{formatDateIST(data.baselineDate)}</strong>
                {data.lastReset?.performedBy?.name && (
                    <span className="text-blue-700/70 dark:text-blue-300/70">
                        {' '}· reset by {data.lastReset.performedBy.name}
                    </span>
                )}
            </span>
            <Link
                to="/settings?tab=reports"
                className="text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline whitespace-nowrap"
            >
                Manage
            </Link>
        </div>
    );
}
