import React, { useState, useMemo } from 'react';
import { FaCalendarAlt, FaChevronDown } from 'react-icons/fa';

/**
 * DateRangeFilter — preset chips + optional custom range.
 *
 * The parent owns the state. We just emit `{ preset, startDate, endDate }`
 * via onChange when the user picks something. Dates are emitted as
 * YYYY-MM-DD strings (no Date objects) so they survive being put on a URL
 * query string and round-tripping back through useSearchParams.
 *
 * Why a controlled component? Each detail page wants its own filter that
 * scopes ITS data, so the parent must own startDate/endDate to thread it
 * into the API call.
 */

const PRESETS = [
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
    { key: 'last_7', label: 'Last 7 Days' },
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'this_year', label: 'This Year' },
    { key: 'last_year', label: 'Last Year' },
    { key: 'all_time', label: 'All Time' },
];

const toIso = (d) => d.toISOString().split('T')[0];

/**
 * Compute concrete startDate / endDate strings for a named preset.
 *
 * Returns `{ startDate: '', endDate: '' }` for 'all_time' so the API
 * treats it as no filter. All other presets return both bounds.
 */
export function computePresetRange(preset) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (preset) {
        case 'today': {
            return { startDate: toIso(today), endDate: toIso(today) };
        }
        case 'this_week': {
            // Monday-start week (Indian convention varies; Monday is the
            // safer default for gym ops because weekends are peak)
            const day = today.getDay(); // 0=Sun
            const offset = day === 0 ? -6 : 1 - day;
            const start = new Date(today);
            start.setDate(today.getDate() + offset);
            return { startDate: toIso(start), endDate: toIso(today) };
        }
        case 'last_7': {
            const start = new Date(today);
            start.setDate(today.getDate() - 6);
            return { startDate: toIso(start), endDate: toIso(today) };
        }
        case 'this_month': {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            return { startDate: toIso(start), endDate: toIso(today) };
        }
        case 'last_month': {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const end = new Date(today.getFullYear(), today.getMonth(), 0);
            return { startDate: toIso(start), endDate: toIso(end) };
        }
        case 'this_year': {
            const start = new Date(today.getFullYear(), 0, 1);
            return { startDate: toIso(start), endDate: toIso(today) };
        }
        case 'last_year': {
            const start = new Date(today.getFullYear() - 1, 0, 1);
            const end = new Date(today.getFullYear() - 1, 11, 31);
            return { startDate: toIso(start), endDate: toIso(end) };
        }
        case 'all_time':
        default:
            return { startDate: '', endDate: '' };
    }
}

const PRESET_LABEL = Object.fromEntries(PRESETS.map(p => [p.key, p.label]));

export default function DateRangeFilter({ value, onChange }) {
    // value: { preset, startDate, endDate }
    const [open, setOpen] = useState(false);
    const [draftStart, setDraftStart] = useState(value?.startDate || '');
    const [draftEnd, setDraftEnd] = useState(value?.endDate || '');

    const currentLabel = useMemo(() => {
        if (value?.preset === 'custom') {
            if (value.startDate && value.endDate) {
                return `${value.startDate} → ${value.endDate}`;
            }
            return 'Custom Range';
        }
        return PRESET_LABEL[value?.preset] || 'All Time';
    }, [value]);

    const pickPreset = (preset) => {
        const range = computePresetRange(preset);
        onChange({ preset, ...range });
        setOpen(false);
    };

    const applyCustom = () => {
        if (!draftStart || !draftEnd) return;
        if (draftStart > draftEnd) {
            // Swap silently — UX nicety, the alternative is a toast scolding
            onChange({ preset: 'custom', startDate: draftEnd, endDate: draftStart });
        } else {
            onChange({ preset: 'custom', startDate: draftStart, endDate: draftEnd });
        }
        setOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors min-w-[160px]"
            >
                <FaCalendarAlt size={12} className="text-zinc-600 shrink-0" />
                <span className="flex-1 text-left truncate">{currentLabel}</span>
                <FaChevronDown size={10} className="text-gray-400" />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xl z-40 overflow-hidden">
                        <div className="p-3 border-b border-gray-100 dark:border-zinc-800">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Quick range</p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {PRESETS.map(p => {
                                    const isActive = value?.preset === p.key;
                                    return (
                                        <button
                                            key={p.key}
                                            onClick={() => pickPreset(p.key)}
                                            className={`px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-colors ${
                                                isActive
                                                    ? 'bg-zinc-900 text-white'
                                                    : 'bg-gray-50 dark:bg-zinc-800/60 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Custom range</p>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">From</label>
                                    <input
                                        type="date"
                                        value={draftStart}
                                        onChange={(e) => setDraftStart(e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-md text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">To</label>
                                    <input
                                        type="date"
                                        value={draftEnd}
                                        onChange={(e) => setDraftEnd(e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-md text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                                    />
                                </div>
                                <button
                                    onClick={applyCustom}
                                    disabled={!draftStart || !draftEnd}
                                    className="w-full mt-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors"
                                >
                                    Apply Custom Range
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
