import { useEffect, useRef } from 'react';
import { useNotifications } from '../../features/notifications/context/NotificationContext';

/**
 * useGymSocket — subscribe to one or more gym-scoped socket events.
 *
 * Registers listeners on the shared socket from NotificationContext and
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
    const { socket } = useNotifications();
    // Keep a stable ref to the callback so we don't re-register listeners
    // on every render when the caller passes an inline function.
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const sock = socket?.current;
        if (!sock) return;

        const handlers = events.map((event) => {
            const handler = (data) => callbackRef.current(event, data);
            sock.on(event, handler);
            return { event, handler };
        });

        return () => {
            handlers.forEach(({ event, handler }) => sock.off(event, handler));
        };
        // Re-register only when the socket instance or event list changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, events.join(',')]);
};

export default useGymSocket;
