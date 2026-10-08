import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import socket from '../../../shared/hooks/useSocket';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user, api } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeWarning, setActiveWarning] = useState(null);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!user || user.role === 'superadmin') return;
        setLoading(true);
        try {
            const res = await api.get('/notifications/my');
            // response.data IS already the unwrapped payload — don't re-unwrap in feature code
            const data = Array.isArray(res.data) ? res.data : [];
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [user, api]);

    const checkWarning = useCallback(async () => {
        if (!user || user.role === 'superadmin') return;
        try {
            const res = await api.get('/notifications/active-warning');
            // response.data IS already the unwrapped payload — don't re-unwrap in feature code
            const warning = res.data;
            if (warning && warning._id) {
                setActiveWarning(warning);
            }
        } catch (err) {
            console.error('Failed to fetch warning', err);
        }
    }, [user, api]);

    const markAsRead = useCallback(async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

            if (activeWarning && activeWarning._id === id) {
                setActiveWarning(null);
            }
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    }, [api, activeWarning]);

    const markAllAsRead = useCallback(async () => {
        try {
            const unread = notifications.filter(n => !n.isRead);
            if (unread.length === 0) return;
            await Promise.all(unread.map(n => api.patch(`/notifications/${n._id}/read`)));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setActiveWarning(null);
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    }, [api, notifications]);

    useEffect(() => {
        // Disconnect the singleton from any previous session before re-connecting.
        if (socketRef.current) {
            socketRef.current.off('connect');
            socketRef.current.off('new_notification');
            socketRef.current.off('notification_read');
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        if (!user || user.role === 'superadmin') {
            setNotifications([]);
            setUnreadCount(0);
            setActiveWarning(null);
            return undefined;
        }

        // Defer socket handshake + initial fetches until the browser is
        // idle so the first paint is not held up by WebSocket negotiation.
        // `requestIdleCallback` with a 1s deadline, fallback to setTimeout
        // for Safari / older browsers.
        let cancelled = false;
        const schedule = (fn) => {
            if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
                return window.requestIdleCallback(fn, { timeout: 1000 });
            }
            return setTimeout(fn, 200);
        };
        const cancel = (handle) => {
            if (handle == null) return;
            if (typeof window !== 'undefined' && typeof window.cancelIdleCallback === 'function') {
                try { window.cancelIdleCallback(handle); return; } catch (_) { /* fall through */ }
            }
            clearTimeout(handle);
        };

        const handle = schedule(() => {
            if (cancelled) return;

            fetchNotifications();
            checkWarning();

            // Use the singleton socket — never call io() directly in feature code
            socket.connect();
            socketRef.current = socket;

            socket.on('connect', () => {
                socket.emit('join_gym');
            });

            socket.on('new_notification', (notif) => {
                setNotifications((prev) => {
                    if (prev.some((n) => n._id === notif._id)) return prev;
                    return [notif, ...prev];
                });

                if (notif.type === 'warning') setActiveWarning(notif);

                toast.success('New notification received!', { icon: '🔔', duration: 4000 });
            });

            socket.on('notification_read', ({ notificationId, userId }) => {
                if (userId === user._id) {
                    setNotifications((prev) => prev.map((n) =>
                        n._id === notificationId ? { ...n, isRead: true } : n,
                    ));
                }
            });
        });

        return () => {
            cancelled = true;
            cancel(handle);
            if (socketRef.current) {
                socketRef.current.off('connect');
                socketRef.current.off('new_notification');
                socketRef.current.off('notification_read');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.isRead).length);
    }, [notifications]);

    const value = useMemo(() => ({
        notifications,
        unreadCount,
        activeWarning,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        setActiveWarning,
        socket: socketRef, // expose ref for useGymSocket hook
    }), [notifications, unreadCount, activeWarning, loading, fetchNotifications, markAsRead, markAllAsRead]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
