import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

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
            const res = await api.get('/api/notifications/my');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const checkWarning = async () => {
        if (!user || user.role === 'superadmin') return;
        try {
            const res = await api.get('/api/notifications/active-warning');
            if (res.data) {
                setActiveWarning(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch warning', err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/api/notifications/${id}/read`);
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
            await Promise.all(unread.map(n => api.patch(`/api/notifications/${n._id}/read`)));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setActiveWarning(null);
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    useEffect(() => {
        // Only run for non-superadmin users
        if (user && user.role !== 'superadmin') {
            fetchNotifications();
            checkWarning();

            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
            socket.current = io(backendUrl, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            socket.current.on('connect', () => {
                if (user.gymId) {
                    socket.current.emit('join_gym', user.gymId);
                }
            });

            socket.current.on('new_notification', (notif) => {
                setNotifications(prev => {
                    if (prev.some(n => n._id === notif._id)) return prev;
                    return [notif, ...prev];
                });

                if (notif.type === 'warning') {
                    setActiveWarning(notif);
                }

                toast.success('New notification received!', {
                    icon: '🔔',
                    duration: 4000
                });
            });

            socket.current.on('notification_read', ({ notificationId, userId }) => {
                if (userId === user._id) {
                    setNotifications(prev => prev.map(n =>
                        n._id === notificationId ? { ...n, isRead: true } : n
                    ));
                }
            });

            return () => {
                if (socket.current) socket.current.disconnect();
            };
        } else {
            // Reset state for superadmin or logged out users
            setNotifications([]);
            setUnreadCount(0);
            setActiveWarning(null);
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
            }
        }
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
        setActiveWarning
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
