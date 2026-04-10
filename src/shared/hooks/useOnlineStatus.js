import { useEffect, useState } from 'react';

/**
 * useOnlineStatus — reactive wrapper around `navigator.onLine` plus a
 * lightweight "weak connection" probe.
 *
 * Returns:
 *   { online, status }
 *      online: boolean — true if the browser thinks we have any connection
 *      status: 'online' | 'offline' | 'weak'
 *               'online' = healthy
 *               'offline' = navigator.onLine === false
 *               'weak'    = browser says online but our last few API pings
 *                           crossed a latency threshold (>= 2.5s) or failed.
 *
 * The "weak" detection is a heuristic — we don't want a single timed-out
 * request to flap the indicator, so we only flip to 'weak' after two
 * consecutive bad pings, and back to 'online' after one good ping.
 *
 * Why a hook instead of context? The mobile header is the only consumer
 * right now, and the cost of running this everywhere is just a couple of
 * event listeners. Promote to context if a second consumer ever appears.
 */
export function useOnlineStatus() {
    const [online, setOnline] = useState(() =>
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );
    const [weak, setWeak] = useState(false);

    useEffect(() => {
        const handleOnline = () => { setOnline(true); setWeak(false); };
        const handleOffline = () => { setOnline(false); setWeak(false); };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Lightweight latency probe: every 30s, fetch a tiny static asset and
    // measure the round-trip. Two slow/failed responses in a row → weak.
    useEffect(() => {
        if (!online) return;
        let cancelled = false;
        let badStreak = 0;

        const probe = async () => {
            if (cancelled || !navigator.onLine) return;
            const start = performance.now();
            try {
                // Cache-bust so the SW doesn't serve a stale 200.
                await fetch(`/favicon.ico?_t=${Date.now()}`, {
                    method: 'HEAD',
                    cache: 'no-store',
                });
                const elapsed = performance.now() - start;
                if (elapsed > 2500) {
                    badStreak += 1;
                } else {
                    badStreak = 0;
                    if (!cancelled) setWeak(false);
                }
            } catch (_) {
                badStreak += 1;
            }
            if (badStreak >= 2 && !cancelled) setWeak(true);
        };

        // First probe after a short delay so we don't race with the
        // page's own initial requests.
        const initial = setTimeout(probe, 5_000);
        const interval = setInterval(probe, 30_000);
        return () => {
            cancelled = true;
            clearTimeout(initial);
            clearInterval(interval);
        };
    }, [online]);

    let status = 'online';
    if (!online) status = 'offline';
    else if (weak) status = 'weak';

    return { online, status };
}

export default useOnlineStatus;
