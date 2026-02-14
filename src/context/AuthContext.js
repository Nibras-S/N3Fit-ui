import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const backendUrl = process.env.REACT_APP_BACKEND_URL;

// Create axios instance with auth interceptor
const api = axios.create({ baseURL: backendUrl });

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
    });

    // Set up axios interceptor
    useEffect(() => {
        const interceptor = api.interceptors.request.use((config) => {
            const storedToken = localStorage.getItem('n3gym_token');
            if (storedToken) {
                config.headers.Authorization = `Bearer ${storedToken}`;
            }
            return config;
        });

        return () => api.interceptors.request.eject(interceptor);
    }, []);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/api/auth/me');
                if (res.data?.success) {
                    setUser(res.data.user);
                    // Fetch gym features for non-superadmin users
                    if (res.data.user.role !== 'superadmin') {
                        try {
                            const gymRes = await api.get('/api/gym/profile');
                            if (gymRes.data?.features) {
                                setGymFeatures(gymRes.data.features);
                            }
                        } catch (err) {
                            console.error('Failed to load gym features:', err);
                        }
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
        if (res.data?.success) {
            localStorage.setItem('n3gym_token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data.user;
        }
        throw new Error('Login failed');
    };

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
        if (user?.role === 'superadmin') return true;
        return gymFeatures[featureName] !== false;
    }, [user, gymFeatures]);

    const value = {
        user,
        token,
        loading,
        login,
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
