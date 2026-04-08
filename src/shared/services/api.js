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

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || '/api/v1',
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
api.interceptors.response.use(
    (response) => {
        // Auto-unwrap standardized { success: true, data: ... } envelope
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
            // Request timed out (15 s exceeded)
            showToast.error('Request timed out. Please try again.');
        } else if (!error.response) {
            // No response at all — network failure, DNS fail, CORS crash, server down
            showToast.error('Network error. Please check your connection.');
        } else {
            const status = error.response.status;
            const message = error.response.data?.message || error.response.data?.error;

            if (status === 401) {
                // Session expired or not authenticated — send to login
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

export default api;
