import { io } from 'socket.io-client';

// Single socket.io instance for the whole app.
// Import this singleton instead of calling io() directly in components/contexts.
const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: false,
});

const redirectRevokedSessionToLogin = () => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem('n3fit:auth-hint');
        window.localStorage.removeItem('n3fb-tq-cache');
    } catch (_) {
        /* storage disabled; the reload still clears in-memory state */
    }
    const path = window.location.pathname;
    if (path !== '/login' && path !== '/' && path !== '/admin') {
        window.location.href = '/login';
    }
};

// Handshake auth: the backend rejects sockets whose JWT cookie is missing or
// invalid. When that happens we get a `connect_error`. Treat it the same way
// the axios interceptor treats a 401 — bounce to /login so the user can
// reauth. Guard with the same path exclusion list the interceptor uses so
// public pages don't loop.
socket.on('connect_error', (err) => {
    // eslint-disable-next-line no-console
    console.warn('[socket] connect_error:', err?.message || err);
    const code = err?.data?.code;
    const isAuthError = code === 'UNAUTHORIZED' ||
        /unauthor|expired|invalid session|not authenticated/i.test(err?.message || '');
    if (isAuthError) redirectRevokedSessionToLogin();
});

// Archive/deactivate actions emit this before the backend force-disconnects
// the user's existing socket. Clear all client-side session hints and cached
// tenant data immediately instead of waiting for the next HTTP request.
socket.on('session_revoked', () => {
    redirectRevokedSessionToLogin();
});

export default socket;
