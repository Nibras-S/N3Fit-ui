import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../shared/services/api';
import { queryClient, PERSIST_KEY } from '../../../shared/lib/queryClient';

const AuthContext = createContext(null);

// Non-sensitive hint stored in localStorage so the guards can render
// optimistically on reload AND so a returning user with a still-valid JWT
// cookie is recognised after the browser window is closed and reopened.
//
// It MUST be localStorage, not localStorage: localStorage is wiped the
// moment the window/tab closes, which made the mount effect below skip
// /auth/me and force a needless re-login on every reopen — even though the
// httpOnly JWT cookie is persistent (maxAge 7 days) and still valid.
//
// The httpOnly JWT cookie remains the ONLY source of truth for
// authentication. This hint only carries {_id, role, name} to choose the
// placeholder UI while /auth/me is in flight; if that background
// verification fails (401), the hint is cleared and the guards redirect to
// /login.
const AUTH_HINT_KEY = 'n3fit:auth-hint';

function readAuthHint() {
    try {
        const raw = localStorage.getItem(AUTH_HINT_KEY);
        if (!raw) return null;
        const hint = JSON.parse(raw);
        if (!hint || typeof hint !== 'object') return null;
        return hint;
    } catch (_) {
        return null;
    }
}

function writeAuthHint(userData) {
    try {
        if (!userData) {
            localStorage.removeItem(AUTH_HINT_KEY);
            return;
        }
        // Only a minimal shape — enough for the guards to decide layout +
        // redirect target. Never persist anything sensitive.
        const hint = {
            _id: userData._id,
            role: userData.role,
            name: userData.name,
        };
        localStorage.setItem(AUTH_HINT_KEY, JSON.stringify(hint));
    } catch (_) {
        /* storage disabled — fall back to blocking path */
    }
}

// Kick off dynamic imports for the most likely next route based on role so
// the chunk is already parsed by the time the Navigate redirect lands. Same
// import specifiers as routes.jsx — webpack resolves to identical chunks.
function prefetchPostLoginRoutes(role) {
    const schedule = (fn) => {
        if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
            return window.requestIdleCallback(fn, { timeout: 2000 });
        }
        return setTimeout(fn, 300);
    };
    schedule(() => {
        try {
            if (role === 'superadmin') {
                import('../../superadmin/pages/SuperAdminDashboard');
                import('../../superadmin/pages/GymDetailsPage');
            } else {
                // Prefetch the high-traffic nav targets so switching tabs does
                // NOT flash the full-screen Suspense skeleton (the lazy chunk is
                // already parsed by the time the route mounts). New Member
                // (/register) is included specifically because it's a common
                // jump that previously always cold-loaded.
                import('../../members/pages/MembersPage');
                import('../../members/pages/RegisterMemberPage');
                import('../../members/pages/BirthdaysPage');
                import('../../settings/pages/SettingsPage');
                if (role !== 'staff') {
                    import('../../dashboard/pages/DashboardPage');
                    import('../../expenses/pages/ExpensesPage');
                    import('../../transactions/pages/TransactionsPage');
                }
            }
        } catch (_) {
            /* webpack errors on dynamic import fall through silently */
        }
    });
}

export const AuthProvider = ({ children }) => {
    // Hydrate synchronously from the session hint so first paint doesn't
    // wait for /auth/me. `user` here is a lightweight stub until the real
    // /auth/me response lands (it typically has _id/role/name only, no
    // gym.features) — components that need the full object should read
    // `initialAuthChecked` and wait.
    const [user, setUser] = useState(() => readAuthHint());
    // `loading` only gates actions that genuinely need the verified user
    // (not first paint). Starts `true` on first mount regardless of hint
    // so the background verification is visible to components that care.
    const [loading, setLoading] = useState(true);
    // Tracks whether /auth/me has actually resolved this session. Guards
    // use `user` for optimistic render but fall back to this flag when
    // they need certainty.
    const [initialAuthChecked, setInitialAuthChecked] = useState(false);
    const [gymFeatures, setGymFeatures] = useState({
        profilePhoto: true,
        expenses: true,
        announcements: true,
        archiveExpired: true,
        whatsappNotifications: false,
        memberImport: false,
    });

    // Verify session on mount — cookie is sent automatically by the browser.
    // First paint does NOT wait on this: guards render using the session
    // hint, and this effect hydrates the real user data in the background.
    useEffect(() => {
        // Public visitors (landing, /privacy, /terms) have no session hint
        // because they were never logged in. Skip the /auth/me round-trip
        // entirely — otherwise it hangs for the request timeout when the
        // backend is slow or unreachable, blocking guards downstream.
        if (!readAuthHint()) {
            setLoading(false);
            setInitialAuthChecked(true);
            return;
        }
        const loadUser = async () => {
            try {
                const res = await api.get('/auth/me');
                const userData = res.data;
                if (userData?.role || userData?.email) {
                    setUser(userData);
                    writeAuthHint(userData);
                    prefetchPostLoginRoutes(userData.role);
                    if (userData?.gym?.features) {
                        setGymFeatures(prev => ({ ...prev, ...userData.gym.features }));
                    } else if (userData?.role !== 'superadmin') {
                        try {
                            const gymRes = await api.get('/gym/profile');
                            if (gymRes.data?.features) {
                                setGymFeatures(prev => ({ ...prev, ...gymRes.data.features }));
                            }
                        } catch (_) {
                            /* non-critical, use defaults */
                        }
                    }
                } else {
                    setUser(null);
                    writeAuthHint(null);
                }
            } catch (err) {
                // 401 means the session cookie is gone or expired — clear
                // the hint so the guards stop rendering optimistically and
                // redirect to /login on the next render.
                setUser(null);
                writeAuthHint(null);
            } finally {
                setLoading(false);
                setInitialAuthChecked(true);
            }
        };
        loadUser();
    }, []);

    /**
     * Login — sends credentials, server sets httpOnly cookie.
     * No token is stored in localStorage or memory.
     */
    const login = useCallback(async (email, password, gymCode) => {
        const payload = { email, password };
        if (gymCode) payload.gymCode = gymCode;

        // Fix 3 + path strip: /auth/login not /api/auth/login
        const res = await api.post('/auth/login', payload);
        const resData = res.data;

        // Server now returns { user: {...} } — no token in body (it's in the cookie)
        const userData = resData?.user || resData;
        if (userData?.role || userData?.email) {
            setUser(userData);
            writeAuthHint(userData);
            prefetchPostLoginRoutes(userData.role);
            // Load gym features
            if (userData?.gym?.features) {
                setGymFeatures(prev => ({ ...prev, ...userData.gym.features }));
            }
            return userData;
        }
        throw new Error('Login failed. Please try again.');
    }, []);

    /**
     * Refresh current user profile from server.
     */
    const refreshUser = useCallback(async () => {
        try {
            const res = await api.get('/auth/me');
            const userData = res.data;
            if (userData?.role || userData?.email) {
                setUser(userData);
                writeAuthHint(userData);
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
        writeAuthHint(null);
        // Wipe TQ cache (in-memory + persisted) so the next user on this
        // browser never sees the previous tenant's data hydrated from
        // localStorage. Must stay in sync with PERSIST_KEY in queryClient.js.
        try {
            queryClient.clear();
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(PERSIST_KEY);
            }
        } catch (_) { /* storage disabled — nothing to clean */ }
    }, []);

    /**
     * Switch active gym context (multi-gym admins only).
     * Calls the backend which re-issues the cookie with updated activeGymId.
     * Returns the updated user object.
     */
    const switchGym = useCallback(async (gymId) => {
        const res = await api.post('/auth/switch-gym', { gymId });
        // After switching, reload the full user profile so all context is fresh
        const meRes = await api.get('/auth/me');
        const userData = meRes.data;
        if (userData?.role || userData?.email) {
            setUser(userData);
            writeAuthHint(userData);
            if (userData?.gym?.features) {
                setGymFeatures(prev => ({ ...prev, ...userData.gym.features }));
            }
        }
        return res.data;
    }, []);

    /**
     * Check if a feature toggle is enabled for the current gym.
     */
    const hasFeature = useCallback((featureName) => {
        return gymFeatures[featureName] !== false;
    }, [gymFeatures]);

    const value = useMemo(() => ({
        user,
        loading,
        initialAuthChecked,
        login,
        refreshUser,
        logout,
        switchGym,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'superadmin',
        isGymAdmin: user?.role === 'gymadmin',
        isStaff: user?.role === 'staff',
        isMultiGym: (user?.allGyms?.length ?? 0) > 1,
        gymFeatures,
        hasFeature,
        api, // Pre-configured axios instance
    }), [user, loading, initialAuthChecked, login, refreshUser, logout, switchGym, gymFeatures, hasFeature]);

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
