import axios from 'axios';
import { showToast } from '../lib/toast';

/**
 * Axios API Instance — Fix 3 & Fix 6
 *
 * Key changes:
 *  - withCredentials: true  → sends httpOnly cookie automatically (no localStorage)
 *  - timeout: 15000         → avoids hanging requests
 *  - Comprehensive response interceptor handles ALL error types:
 *      network errors, timeouts, 401 (auto-redirect), 403, 5xx
 *  - NO Authorization header — cookie is sent automatically by browser
 *
 * Setup:  Add <ToastProvider /> once in App.js so toasts render correctly.
 * Env:    Set REACT_APP_API_BASE_URL in .env  (e.g. http://localhost:5000/api/v1)
 */

// REACT_APP_API_BASE_URL must be set explicitly — no localhost fallback in
// production builds. The dev fallback only triggers when NODE_ENV === 'development'.
const explicitBase = process.env.REACT_APP_API_BASE_URL;
let resolvedBase = explicitBase;
if (!resolvedBase) {
    if (process.env.NODE_ENV === 'development') {
        resolvedBase = 'http://localhost:5000/api/v1';
        // eslint-disable-next-line no-console
        console.warn('[api] REACT_APP_API_BASE_URL not set — defaulting to', resolvedBase);
    } else {
        // Fail loudly so a misbuilt prod bundle doesn't silently call localhost.
        throw new Error('REACT_APP_API_BASE_URL is required in production builds');
    }
}

const api = axios.create({
    baseURL: resolvedBase.replace(/\/$/, ''),
    timeout: 15000,          // 15 s — avoids hung requests
    withCredentials: true,   // send httpOnly cookie on every request
    headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST interceptor ────────────────────────────────────────────────────────
// No Authorization header needed — cookie is attached automatically by the browser
api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// ── RESPONSE interceptor ───────────────────────────────────────────────────────
//
// The backend now returns errors in the envelope:
//   { success: false, error: { code, message, details } }
// But older endpoints (and a few hand-rolled error paths) still return either
// `{ success: false, message: '...' }` or `{ error: '...' }` (string). The
// helper below extracts a plain string from any of those shapes — it MUST
// always return a string so that toast / JSX never receives an object.
function extractErrorString(data) {
    if (!data) return '';
    if (typeof data === 'string') return data;
    // New envelope: { success: false, error: { code, message } }
    if (data.error && typeof data.error === 'object' && data.error.message) {
        return String(data.error.message);
    }
    // Legacy: { success: false, error: 'string' }
    if (typeof data.error === 'string') return data.error;
    // Legacy: { success: false, message: 'string' }
    if (typeof data.message === 'string') return data.message;
    return '';
}

api.interceptors.response.use(
    (response) => {
        // Auto-unwrap standardized { success: true, data: ... } envelope.
        // response.data IS already the unwrapped payload — don't re-unwrap in feature code.
        if (
            response.data &&
            typeof response.data === 'object' &&
            response.data.success === true &&
            'data' in response.data
        ) {
            response.data = response.data.data;
        }
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            showToast.error('Request timed out. Please try again.');
        } else if (!error.response) {
            showToast.error('Network error. Please check your connection.');
        } else {
            const status = error.response.status;
            const message = extractErrorString(error.response.data);

            // Stash the extracted string back on the response so callers
            // doing `err.response.data.message` still get a usable value
            // even when the new envelope put it under `error.message`.
            if (error.response.data && typeof error.response.data === 'object') {
                error.response.data.message = message;
            }

            if (status === 401) {
                const path = window.location.pathname;
                if (path !== '/login' && path !== '/' && path !== '/admin') {
                    window.location.href = '/login';
                }
            } else if (status === 403) {
                showToast.error(message || 'You do not have permission to do this.');
            } else if (status === 422 || status === 400) {
                showToast.error(message || 'Please check the form and try again.');
            } else if (status >= 500) {
                showToast.error('Server error. Please try again later.');
            } else {
                showToast.error(message || 'Something went wrong.');
            }
        }
        return Promise.reject(error);
    }
);

export { extractErrorString };

export default api;
