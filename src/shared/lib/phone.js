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

/** True when the app is running as an installed PWA (standalone display). */
function isStandalonePWA() {
    if (typeof window === 'undefined') return false;
    const mql = window.matchMedia && window.matchMedia('(display-mode: standalone)');
    // navigator.standalone is the iOS "Add to Home Screen" signal.
    return (mql && mql.matches) || window.navigator.standalone === true;
}

/**
 * Open a WhatsApp chat to `phone`, pre-filling `message`.
 *
 * The method depends on context, specifically to fix a PWA bug:
 *
 * - Installed PWA (standalone): hand the OS the `whatsapp://` app scheme via
 *   location.href. Because it's a custom (non-http) scheme, the OS opens the
 *   WhatsApp app directly — there is NO intermediate wa.me web page, so no
 *   in-app browser tab is spawned, and the PWA is not navigated away. When the
 *   user returns from WhatsApp the PWA is exactly as they left it, with no
 *   leftover browser window. (The old `window.open('https://wa.me/…','_blank')`
 *   opened an in-app browser on the wa.me page that lingered after return.)
 *
 * - Normal browser / desktop: use the wa.me web URL in a new tab. It works
 *   everywhere and degrades gracefully if WhatsApp isn't installed, where the
 *   custom scheme would silently do nothing.
 *
 * @param {string} phone   any format — normalised to 91XXXXXXXXXX
 * @param {string} message PLAIN text (do NOT pre-encode — encoded here once)
 * @returns {boolean} false if the number couldn't be resolved to any digits
 */
export function openWhatsApp(phone, message = '') {
    // Prefer canonical normalisation; fall back to raw digits so a number that
    // doesn't fit the Indian format still behaves exactly as the old code did.
    const n = normalizePhone(phone) || String(phone || '').replace(/\D/g, '');
    if (!n) return false;
    const text = message ? encodeURIComponent(message) : '';

    if (isStandalonePWA()) {
        window.location.href = `whatsapp://send?phone=${n}${text ? `&text=${text}` : ''}`;
    } else {
        window.open(`https://wa.me/${n}${text ? `?text=${text}` : ''}`, '_blank', 'noopener');
    }
    return true;
}
