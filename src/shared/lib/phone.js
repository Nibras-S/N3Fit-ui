/**
 * Frontend twin of N3Fit-api/src/shared/utils/phone.js
 *
 * Storage convention: `91XXXXXXXXXX` (12 digits, no `+`, no spaces).
 * The form layer normalises before sending to the API; the display layer
 * formats back to `+91 98765 43210`.
 */

export const PHONE_REGEX = /^91\d{10}$/;

export function normalizePhone(input) {
    if (input === null || input === undefined) return null;
    const cleaned = String(input).replace(/\D/g, '');
    if (!cleaned) return null;

    if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned;
    if (cleaned.length === 10) return `91${cleaned}`;
    if (cleaned.length === 11 && cleaned.startsWith('0')) return `91${cleaned.slice(1)}`;
    if (cleaned.length === 13 && cleaned.startsWith('091')) return cleaned.slice(1);
    return null;
}

export function isValidIndianPhone(input) {
    const n = normalizePhone(input);
    return n !== null && PHONE_REGEX.test(n);
}

/** `919876543210` → `+91 98765 43210` */
export function formatPhoneForDisplay(stored) {
    const n = normalizePhone(stored);
    if (!n) return stored || '—';
    return `+91 ${n.slice(2, 7)} ${n.slice(7)}`;
}

/** Build a wa.me link, normalising the number first. */
export function buildWhatsAppLink(phone, message = '') {
    const n = normalizePhone(phone);
    if (!n) return null;
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${n}${text}`;
}
