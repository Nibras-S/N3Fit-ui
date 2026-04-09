/**
 * Frontend twin of N3Fit-api/src/shared/utils/timezone.js
 *
 * Every date in this app belongs to IST (Asia/Kolkata). Browsers run in
 * the user's local timezone, so naive `new Date(...).toLocaleDateString()`
 * shows the wrong day for anyone outside India. All date display & range
 * computation MUST go through this module.
 */

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Today's IST midnight as a Date (UTC instant). */
export function getISTMidnightUTC(at = Date.now()) {
    const ist = new Date(at + IST_OFFSET_MS);
    const midnight = Date.UTC(
        ist.getUTCFullYear(),
        ist.getUTCMonth(),
        ist.getUTCDate(),
    ) - IST_OFFSET_MS;
    return new Date(midnight);
}

/** Snap any date to its IST midnight. */
export function snapToISTMidnight(input) {
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return getISTMidnightUTC();
    return getISTMidnightUTC(d.getTime());
}

/**
 * Days remaining until `endDate`. Negative when expired.
 * Always agrees with the backend's `getDewsNow`.
 */
export function getDewsNow(endDate) {
    if (!endDate) return 0;
    const today = getISTMidnightUTC();
    return Math.round((new Date(endDate).getTime() - today.getTime()) / ONE_DAY_MS);
}

/**
 * Format a date for display in IST. Always passes `timeZone: 'Asia/Kolkata'`
 * so the result matches what the backend computed.
 */
export function formatDateIST(input, opts = {}) {
    if (!input) return '—';
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
        ...opts,
    });
}

/** "Apr 9, 2026 — 04:35 PM" — for receipts and audit views. */
export function formatDateTimeIST(input) {
    if (!input) return '—';
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
    });
}

/**
 * Convert a `<input type="date">` value (`YYYY-MM-DD`) into the UTC instant
 * that represents IST midnight of that day. Use this whenever submitting a
 * date-only field to the backend so both sides agree on the calendar day.
 */
export function fromDateInputToISO(value) {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(Date.UTC(y, m - 1, d) - IST_OFFSET_MS).toISOString();
}

/** Common preset date ranges, all computed in IST. */
export function getISTRange(preset) {
    const today = getISTMidnightUTC();
    const ist = new Date(today.getTime() + IST_OFFSET_MS);
    const y = ist.getUTCFullYear();
    const m = ist.getUTCMonth();
    const d = ist.getUTCDate();

    const startOfDay = today;
    const endOfDay = new Date(today.getTime() + ONE_DAY_MS - 1);

    switch (preset) {
        case 'today':
            return { start: startOfDay, end: endOfDay };
        case 'thisWeek': {
            const dayOfWeek = ist.getUTCDay() || 7; // Monday=1..Sunday=7
            const start = new Date(today.getTime() - (dayOfWeek - 1) * ONE_DAY_MS);
            return { start, end: endOfDay };
        }
        case 'thisMonth': {
            const start = new Date(Date.UTC(y, m, 1) - IST_OFFSET_MS);
            return { start, end: endOfDay };
        }
        case 'lastMonth': {
            const start = new Date(Date.UTC(y, m - 1, 1) - IST_OFFSET_MS);
            const end = new Date(Date.UTC(y, m, 1) - IST_OFFSET_MS - 1);
            return { start, end };
        }
        case 'thisYear': {
            const start = new Date(Date.UTC(y, 0, 1) - IST_OFFSET_MS);
            return { start, end: endOfDay };
        }
        default:
            return { start: startOfDay, end: endOfDay };
    }
}
