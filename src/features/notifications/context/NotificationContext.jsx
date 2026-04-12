import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

    const fetchNotifications = async () => {
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
    };

    const checkWarning = async () => {
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
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

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
        // Disconnect the singleton from any previous session before re-connecting.
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        if (!user || user.role === 'superadmin') {
            setNotifications([]);
            setUnreadCount(0);
            setActiveWarning(null);
            return undefined;
        }

        fetchNotifications();
        checkWarning();

        // Use the singleton socket — never call io() directly in feature code
        socket.connect();
        socketRef.current = socket;

        socket.on('connect', () => {
            if (user.gymId) socket.emit('join_gym', user.gymId);
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

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
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
        socket: socketRef, // expose ref for useGymSocket hook
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
