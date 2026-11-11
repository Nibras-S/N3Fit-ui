import { useEffect, useRef } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import socket from './useSocket';

/**
 * useGymSocket — subscribe to one or more gym-scoped socket events.
 *
 * Registers listeners on the shared singleton before it connects and
 * calls `callback` whenever any of the specified events arrive.
 * Listeners are cleaned up automatically when the component unmounts or
 * when `events` / `callback` change.
 *
 * Usage:
 *   useGymSocket(['transaction:created', 'transaction:updated'], refetch);
 *
 * @param {string[]} events   - Socket event names to listen for
 * @param {Function} callback - Called with (eventName, data) on each event
 */
const useGymSocket = (events, callback) => {
    const { user } = useAuth();
    const enabled = !!user && user.role !== 'superadmin';
    const userId = user?.id || user?._id;
    const gymId = user?.activeGymId || user?.gymId;
    const eventKey = events.join(',');
    // Keep a stable ref to the callback so we don't re-register listeners
    // on every render when the caller passes an inline function.
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        if (!enabled) return;

        const handlers = eventKey.split(',').filter(Boolean).map((event) => {
            const handler = (data) => callbackRef.current(event, data);
            socket.on(event, handler);
            return { event, handler };
        });

        return () => {
            handlers.forEach(({ event, handler }) => socket.off(event, handler));
        };
    }, [enabled, userId, gymId, eventKey]);
};

export default useGymSocket;
