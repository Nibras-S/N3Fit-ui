import { io } from 'socket.io-client';

// Single socket.io instance for the whole app.
// Import this singleton instead of calling io() directly in components/contexts.
const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: false,
});

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
    if (isAuthError && typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/' && path !== '/admin') {
            window.location.href = '/login';
        }
    }
});

export default socket;
