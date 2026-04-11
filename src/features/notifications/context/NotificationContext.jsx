import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user, api } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeWarning, setActiveWarning] = useState(null);
    const [loading, setLoading] = useState(false);
    const socket = useRef(null);

    const fetchNotifications = async () => {
        if (!user || user.role === 'superadmin') return;
        setLoading(true);
        try {
            const res = await api.get('/notifications/my');
            // Handle both new { success, data: [] } and old { success, notifications: [] } shapes
            const data = Array.isArray(res.data?.data) ? res.data.data
                : Array.isArray(res.data?.notifications) ? res.data.notifications
                    : Array.isArray(res.data) ? res.data : [];
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const checkWarning = async () => {
        if (!user || user.role === 'superadmin') return;
        try {
            const res = await api.get('/notifications/active-warning');
            // Handle both new { success, data: {...} } and old direct object shapes
            const warning = res.data?.data ?? res.data?.warning ?? (res.data?.success === undefined ? res.data : null);
            if (warning && warning._id) {
                setActiveWarning(warning);
            }
        } catch (err) {
            console.error('Failed to fetch warning', err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

            // Clear active warning if this was it
            if (activeWarning && activeWarning._id === id) {
                setActiveWarning(null);
            }
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unread = notifications.filter(n => !n.isRead);
            if (unread.length === 0) return;
            await Promise.all(unread.map(n => api.patch(`/notifications/${n._id}/read`)));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setActiveWarning(null);
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    useEffect(() => {
        // Always tear down any existing socket before deciding what to do.
        // Prevents accumulating connections when `user` changes (e.g. login,
        // role swap, profile refresh).
        if (socket.current) {
            socket.current.removeAllListeners();
            socket.current.disconnect();
            socket.current = null;
        }

        // Only run for non-superadmin users
        if (!user || user.role === 'superadmin') {
            setNotifications([]);
            setUnreadCount(0);
            setActiveWarning(null);
            return undefined;
        }

        fetchNotifications();
        checkWarning();

        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
        const sock = io(backendUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });
        socket.current = sock;

        sock.on('connect', () => {
            if (user.gymId) sock.emit('join_gym', user.gymId);
        });

        sock.on('new_notification', (notif) => {
            setNotifications((prev) => {
                if (prev.some((n) => n._id === notif._id)) return prev;
                return [notif, ...prev];
            });

            if (notif.type === 'warning') setActiveWarning(notif);

            toast.success('New notification received!', { icon: '🔔', duration: 4000 });
        });

        sock.on('notification_read', ({ notificationId, userId }) => {
            if (userId === user._id) {
                setNotifications((prev) => prev.map((n) =>
                    n._id === notificationId ? { ...n, isRead: true } : n,
                ));
            }
        });

        return () => {
            sock.removeAllListeners();
            sock.disconnect();
            if (socket.current === sock) socket.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.isRead).length);
    }, [notifications]);

    const value = {
        notifications,
        unreadCount,
        activeWarning,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        setActiveWarning,
        socket, // expose for useGymSocket hook
    };

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
