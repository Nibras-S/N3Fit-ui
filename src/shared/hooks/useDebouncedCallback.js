import { useEffect, useRef, useCallback } from 'react';

/**
 * Debounce a callback. Returns a stable function that delays invocation
 * until `delay` ms have passed since the last call. Any pending timer is
 * cleared on unmount. Use for bursty triggers like socket events.
 *
 * @param {Function} callback - The function to debounce.
 * @param {number} delay - Delay in ms (default 300).
 * @returns {Function} Debounced wrapper with stable identity.
 */
export default function useDebouncedCallback(callback, delay = 300) {
    const callbackRef = useRef(callback);
    const timerRef = useRef(null);
    callbackRef.current = callback;

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    return useCallback((...args) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    }, [delay]);
}
