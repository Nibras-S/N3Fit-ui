import { useState, useEffect } from 'react';

/**
 * Subscribe to a CSS media query.
 * @param {string} query - e.g. '(min-width: 768px)'
 * @returns {boolean} Whether the media query currently matches
 */
export default function useMediaQuery(query) {
    const [matches, setMatches] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false
    );

    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);
        mql.addEventListener('change', handler);
        setMatches(mql.matches);
        return () => mql.removeEventListener('change', handler);
    }, [query]);

    return matches;
}
