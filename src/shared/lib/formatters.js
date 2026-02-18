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
 * Format a date string to "DD MMM YYYY" (e.g. "17 Feb 2026").
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
    if (!dateInput) return '—';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Format a 10-digit phone number for display.
 * @param {string} phone
 * @returns {string} e.g. "98765 43210"
 */
export function formatPhone(phone) {
    if (!phone) return '—';
    const cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
}
