import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resets window scroll to the top on every pathname change. Hash links
// (e.g. /settings#billing) are left alone so in-page anchors still work.
export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) return;
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [pathname, hash]);

    return null;
}
