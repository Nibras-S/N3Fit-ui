import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../../shared/services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gymFeatures, setGymFeatures] = useState({
        profilePhoto: true,
        expenses: true,
        announcements: true,
        archiveExpired: true,
        whatsappNotifications: false,
        memberImport: false,
    });

    // Load user on mount — cookie is sent automatically by the browser
    useEffect(() => {
        const loadUser = async () => {
            try {
                // Fix 3: paths are now relative to baseURL (/api/v1)
                // /auth/me → http://localhost:5000/api/v1/auth/me
                const res = await api.get('/auth/me');
                const userData = res.data;
                if (userData?.role || userData?.email) {
                    setUser(userData);
                    // Load gym features from the me endpoint (already embedded in response)
                    if (userData?.gym?.features) {
                        setGymFeatures(prev => ({ ...prev, ...userData.gym.features }));
                    } else {
                        // Fallback: fetch gym profile separately
                        try {
                            const gymRes = await api.get('/gym/profile');
                            if (gymRes.data?.features) {
                                setGymFeatures(prev => ({ ...prev, ...gymRes.data.features }));
                            }
                        } catch (_) {
                            // non-critical, use defaults
                        }
                    }
                }
            } catch (err) {
                // 401 means not logged in — clear user state silently
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    /**
     * Login — sends credentials, server sets httpOnly cookie.
     * No token is stored in localStorage or memory.
     */
    const login = async (email, password, gymCode) => {
        const payload = { email, password };
        if (gymCode) payload.gymCode = gymCode;

        // Fix 3 + path strip: /auth/login not /api/auth/login
        const res = await api.post('/auth/login', payload);
        const resData = res.data;

        // Server now returns { user: {...} } — no token in body (it's in the cookie)
        const userData = resData?.user || resData;
        if (userData?.role || userData?.email) {
            setUser(userData);
            // Load gym features
            if (userData?.gym?.features) {
                setGymFeatures(prev => ({ ...prev, ...userData.gym.features }));
            }
            return userData;
        }
        throw new Error('Login failed. Please try again.');
    };

    /**
     * Refresh current user profile from server.
     */
    const refreshUser = useCallback(async () => {
        try {
            const res = await api.get('/auth/me');
            const userData = res.data;
            if (userData?.role || userData?.email) {
                setUser(userData);
                if (userData?.gym?.features) {
                    setGymFeatures(prev => ({ ...prev, ...userData.gym.features }));
                }
                return userData;
            }
        } catch (err) {
            console.error('Failed to refresh user:', err);
        }
    }, []);

    /**
     * Logout — calls server to clear the httpOnly cookie.
     * This is the only reliable way to invalidate a cookie-based session.
     */
    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (_) {
            // ignore — we clear local state regardless
        }
        setUser(null);
    }, []);

    /**
     * Check if a feature toggle is enabled for the current gym.
     */
    const hasFeature = useCallback((featureName) => {
        return gymFeatures[featureName] !== false;
    }, [gymFeatures]);

    const value = {
        user,
        loading,
        login,
        refreshUser,
        logout,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'superadmin',
        isGymAdmin: user?.role === 'gymadmin',
        isStaff: user?.role === 'staff',
        gymFeatures,
        hasFeature,
        api, // Pre-configured axios instance
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { api };
export default AuthContext;
