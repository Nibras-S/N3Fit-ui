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
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    EXPIRED: 'expired',
});

// ── Pagination Defaults ──────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;

// ── Storage Keys ─────────────────────────────────────────────────
export const TOKEN_KEY = 'n3gym_token';
