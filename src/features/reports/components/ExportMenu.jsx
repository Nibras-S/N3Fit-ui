import React, { useState, useRef } from 'react';
import { FaFileCsv, FaFileExcel, FaFilePdf, FaDownload, FaChevronDown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { exportToCSV, exportToExcel, exportToPDF } from '../lib/exporters';

/**
 * ExportMenu — small "actions" dropdown for the three export formats.
 *
 * Props:
 *   getExportData() — function returning { filename, columns, rows, title, subtitle }.
 *                     We accept a function (not the data directly) so the
 *                     parent doesn't have to recompute the export payload on
 *                     every render — only when the user actually clicks export.
 *   disabled        — true when there's nothing to export
 *
 * Callers don't need to know which library does what; they just describe
 * "what should the spreadsheet look like" and pick a format. The thunking
 * keeps the parent's render path cheap even for huge tables.
 */
export default function ExportMenu({ getExportData, disabled = false, label = 'Export' }) {
    const [open, setOpen] = useState(false);
    // Whether the menu should open upward to avoid being clipped by the
    // viewport bottom. Computed at click-time, not on render, because we
    // need a measurement of the *current* button position.
    const [openUpward, setOpenUpward] = useState(false);
    const buttonRef = useRef(null);

    const toggleOpen = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Menu is roughly 220px tall (3 items × ~60px + padding). If the
            // button is closer than that to the bottom, flip the menu upward.
            const spaceBelow = window.innerHeight - rect.bottom;
            setOpenUpward(spaceBelow < 240);
        }
        setOpen(o => !o);
    };

    const handleExport = (format) => {
        setOpen(false);
        if (disabled) return;
        let data;
        try {
            data = getExportData();
        } catch (err) {
            toast.error('Could not prepare export data');
            return;
        }
        if (!data || !data.rows || data.rows.length === 0) {
            toast.error('Nothing to export');
            return;
        }

        try {
            if (format === 'csv') exportToCSV(data);
            else if (format === 'excel') exportToExcel(data);
            else if (format === 'pdf') exportToPDF(data);
            toast.success(`${data.rows.length} record${data.rows.length === 1 ? '' : 's'} exported`);
        } catch (err) {
            if (err?.message === 'POPUP_BLOCKED') {
                toast.error('Pop-up blocked. Please allow pop-ups for this site.');
            } else {
                toast.error('Export failed');
            }
        }
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={toggleOpen}
                disabled={disabled}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <FaDownload size={11} className="text-blue-500" />
                <span>{label}</span>
                <FaChevronDown size={9} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                    <div className={`absolute right-0 w-52 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl z-40 overflow-hidden ${
                        openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
                    }`}>
                        <button
                            onClick={() => handleExport('excel')}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left"
                        >
                            <FaFileExcel className="text-green-600" />
                            <div className="flex-1">
                                <div className="font-medium">Excel</div>
                                <div className="text-[10px] text-gray-400">.xls spreadsheet</div>
                            </div>
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-t border-gray-100 dark:border-slate-700 text-left"
                        >
                            <FaFileCsv className="text-blue-600" />
                            <div className="flex-1">
                                <div className="font-medium">CSV</div>
                                <div className="text-[10px] text-gray-400">comma-separated</div>
                            </div>
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-slate-700 text-left"
                        >
                            <FaFilePdf className="text-red-600" />
                            <div className="flex-1">
                                <div className="font-medium">PDF</div>
                                <div className="text-[10px] text-gray-400">printable document</div>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
