import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Pre-configured Axios instance for all API calls.
 * - Automatically attaches JWT from localStorage
 * - Redirects to /login on 401 responses
 */
const api = axios.create({
    baseURL: BACKEND_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ──────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('n3gym_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: unwrap API envelope + handle 401 ───────
api.interceptors.response.use(
    (response) => {
        // Auto-unwrap standardized { success: true, data: ... } responses
        if (response.data && typeof response.data === 'object' && response.data.success === true && 'data' in response.data) {
            response.data = response.data.data;
        }
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('n3gym_token');
            const path = window.location.pathname;
            if (path !== '/login' && path !== '/admin' && path !== '/') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
