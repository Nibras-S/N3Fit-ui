/**
 * Display formatters.
 *
 * The date helpers always render in IST regardless of the user's browser
 * timezone — see ./timezone.js for the math. Phone formatting goes through
 * ./phone.js so it always agrees with the backend's `91XXXXXXXXXX` storage.
 */

import { formatDateIST, formatDateTimeIST } from './timezone';
import { formatPhoneForDisplay } from './phone';

/**
 * Format a number as Indian Rupee currency.
 * @param {number} value
 * @returns {string} e.g. "₹1,23,456"
 */
export function formatCurrency(value) {
    if (value == null || isNaN(value)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format a date for display in IST.
 * Replaces the old browser-local formatter so users outside India see the
 * same day the backend computed.
 */
export function formatDate(dateInput) {
    return formatDateIST(dateInput);
}

/** Date + time variant for receipts. */
export function formatDateTime(dateInput) {
    return formatDateTimeIST(dateInput);
}

/**
 * Format a phone number for display. Accepts the canonical
 * `91XXXXXXXXXX` storage form and renders it as `+91 98765 43210`.
 */
export function formatPhone(phone) {
    return formatPhoneForDisplay(phone);
}

// Re-export the IST formatter directly for callers that want the explicit name.
export { formatDateIST, formatDateTimeIST };
