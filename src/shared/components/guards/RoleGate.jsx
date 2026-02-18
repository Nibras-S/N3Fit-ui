import { useAuth } from '../../../features/auth/context/AuthContext';

/**
 * Inline role-based rendering gate.
 * Shows children only if current user has the specified role(s).
 *
 * @example
 * <RoleGate roles={['gymadmin']}>
 *   <button>Admin Only</button>
 * </RoleGate>
 */
const RoleGate = ({ roles = [], children, fallback = null }) => {
    const { user } = useAuth();

    if (!user) return fallback;
    if (roles.length > 0 && !roles.includes(user.role)) return fallback;

    return children;
};

export default RoleGate;
