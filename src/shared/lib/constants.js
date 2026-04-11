// ── Backend URL ──────────────────────────────────────────────────
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// ── User Roles ───────────────────────────────────────────────────
export const ROLES = Object.freeze({
    SUPER_ADMIN: 'superadmin',
    GYM_ADMIN: 'gymadmin',
    STAFF: 'staff',
});

// ── Member Status ────────────────────────────────────────────────
export const MEMBER_STATUS = Object.freeze({
    ACTIVE: 'Active',
    INACTIVE: 'InActive',
});

// ── Gender ───────────────────────────────────────────────────────
export const GENDERS = Object.freeze(['Male', 'Female', 'Other']);

// ── Payment Methods & Statuses ───────────────────────────────────
// Single source of truth — kept aligned with the backend's enums in
// N3Fit-api/src/modules/transaction/transaction.validation.js
export const PAYMENT_METHODS = Object.freeze(['Cash', 'UPI', 'Card', 'Bank Transfer']);
export const PAYMENT_STATUSES = Object.freeze(['Paid', 'Pending', 'Partial', 'Refunded']);

export const PAYMENT_METHOD_COLORS = Object.freeze({
    Cash: '#10b981',
    UPI: '#6366f1',
    Card: '#8b5cf6',
    'Bank Transfer': '#06b6d4',
});

// ── Plan Durations ───────────────────────────────────────────────
export const PLAN_DURATIONS = Object.freeze([
    { label: '1 Month', value: '1-Month', days: 30 },
    { label: '2 Months', value: '2-Month', days: 60 },
    { label: '3 Months', value: '3-Month', days: 90 },
    { label: '6 Months', value: '6-Month', days: 180 },
    { label: '12 Months', value: '12-Month', days: 365 },
]);

// ── Pagination Defaults ──────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 500;

// ── Storage Keys ─────────────────────────────────────────────────
export const TOKEN_KEY = 'n3gym_token';
