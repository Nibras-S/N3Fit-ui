import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../../shared/services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('n3gym_token'));
    const [loading, setLoading] = useState(true);
    const [gymFeatures, setGymFeatures] = useState({
        profilePhoto: true,
        expenses: true,
        announcements: true,
        archiveExpired: true,
        whatsappNotifications: false,
        memberImport: false,
    });

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/api/auth/me');
                // After auto-unwrap interceptor, res.data IS the user object directly
                const userData = res.data;
                if (userData?.role || userData?.email) {
                    setUser(userData);
                    // Fetch gym features
                    try {
                        const gymRes = await api.get('/api/gym/profile');
                        const gymData = gymRes.data;
                        if (gymData?.features) {
                            setGymFeatures(prev => ({ ...prev, ...gymData.features }));
                        }
                    } catch (err) {
                        console.error('Failed to load gym features:', err);
                    }
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                localStorage.removeItem('n3gym_token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [token]);

    const login = async (email, password, gymCode) => {
        const payload = { email, password };
        if (gymCode) payload.gymCode = gymCode;
        const res = await api.post('/api/auth/login', payload);
        // After auto-unwrap interceptor, res.data IS { token, user } directly
        const resData = res.data;
        if (resData?.token && resData?.user) {
            localStorage.setItem('n3gym_token', resData.token);
            setToken(resData.token);
            setUser(resData.user);
            return resData.user;
        }
        throw new Error('Login failed');
    };

    const refreshUser = useCallback(async () => {
        try {
            const res = await api.get('/api/auth/me');
            // After auto-unwrap, res.data IS the user object
            const userData = res.data;
            if (userData?.role || userData?.email) {
                setUser(userData);
                return userData;
            }
        } catch (err) {
            console.error('Failed to refresh user:', err);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('n3gym_token');
        setToken(null);
        setUser(null);
    }, []);

    /**
     * Check if a feature is enabled for the current gym.
     * Superadmins always have all features enabled.
     */
    const hasFeature = useCallback((featureName) => {
        // Respect the toggle even for superadmins so they can test/manage correctly
        return gymFeatures[featureName] !== false;
    }, [gymFeatures]);

    const value = {
        user,
        token,
        loading,
        login,
        refreshUser,
        logout,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'superadmin',
        isGymAdmin: user?.role === 'gymadmin',
        isStaff: user?.role === 'staff',
        api, // Pre-configured axios instance
        gymFeatures,
        hasFeature,
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
