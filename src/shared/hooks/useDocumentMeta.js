import { useEffect } from 'react';

/**
 * Per-page meta tag manager. Sets <title>, description, canonical, Open Graph,
 * and Twitter Card on mount; restores the previous values on unmount so the
 * SPA's previous page bleeds through cleanly when you navigate away.
 *
 * Why a custom hook instead of react-helmet-async:
 *   - Adds zero dependencies to the bundle.
 *   - The marketing surface is small (~5 public pages today, ~20 with the
 *     blog). A 40-line hook is more than enough.
 *   - The `useEffect` order matches React's natural commit order, so the
 *     <title> updates exactly once per route change with no flicker.
 *
 * Usage:
 *   useDocumentMeta({
 *     title: 'Gym Management Software | N3FitBook',
 *     description: 'Stop losing revenue to fragmented gym tools…',
 *     canonical: 'https://n3fitbook.in/',
 *     ogImage: 'https://n3fitbook.in/og-image.png',
 *     ogType: 'website',           // 'website' | 'article' | 'product'
 *     twitterCard: 'summary_large_image',
 *   });
 *
 * Notes:
 *   - Pass an absolute URL for `canonical` and `ogImage`. Relative paths
 *     break some social unfurl crawlers.
 *   - Bots execute JS and pick up these tags. SSR is not needed.
 */
export default function useDocumentMeta({
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    twitterSite,
    keywords,
    robots,
} = {}) {
    useEffect(() => {
        const restorers = [];

        if (title) {
            const previous = document.title;
            document.title = title;
            restorers.push(() => { document.title = previous; });
        }

        const upsertMeta = (selector, attrs) => {
            let el = document.head.querySelector(selector);
            const created = !el;
            if (!el) {
                el = document.createElement('meta');
                Object.entries(attrs.identity).forEach(([k, v]) => el.setAttribute(k, v));
                document.head.appendChild(el);
            }
            const previousContent = el.getAttribute('content');
            el.setAttribute('content', attrs.content);
            restorers.push(() => {
                if (created) el.remove();
                else if (previousContent === null) el.removeAttribute('content');
                else el.setAttribute('content', previousContent);
            });
        };

        const upsertLink = (selector, attrs) => {
            let el = document.head.querySelector(selector);
            const created = !el;
            if (!el) {
                el = document.createElement('link');
                Object.entries(attrs.identity).forEach(([k, v]) => el.setAttribute(k, v));
                document.head.appendChild(el);
            }
            const previousHref = el.getAttribute('href');
            el.setAttribute('href', attrs.href);
            restorers.push(() => {
                if (created) el.remove();
                else if (previousHref === null) el.removeAttribute('href');
                else el.setAttribute('href', previousHref);
            });
        };

        if (description) {
            upsertMeta('meta[name="description"]', {
                identity: { name: 'description' },
                content: description,
            });
        }

        if (keywords) {
            upsertMeta('meta[name="keywords"]', {
                identity: { name: 'keywords' },
                content: keywords,
            });
        }

        if (robots) {
            upsertMeta('meta[name="robots"]', {
                identity: { name: 'robots' },
                content: robots,
            });
        }

        if (canonical) {
            upsertLink('link[rel="canonical"]', {
                identity: { rel: 'canonical' },
                href: canonical,
            });
        }

        // Open Graph — the title and description tags are independent of the
        // page <title> so social cards can use richer copy than the SERP.
        const ogPairs = {
            'og:title': ogTitle ?? title,
            'og:description': ogDescription ?? description,
            'og:type': ogType,
            'og:url': canonical,
            'og:image': ogImage,
            'og:site_name': 'N3FitBook',
        };
        Object.entries(ogPairs).forEach(([property, content]) => {
            if (!content) return;
            upsertMeta(`meta[property="${property}"]`, {
                identity: { property },
                content,
            });
        });

        // Twitter Card — twitter:* falls back to og:* if unset, but the card
        // type itself must be specified.
        upsertMeta('meta[name="twitter:card"]', {
            identity: { name: 'twitter:card' },
            content: twitterCard,
        });
        if (twitterSite) {
            upsertMeta('meta[name="twitter:site"]', {
                identity: { name: 'twitter:site' },
                content: twitterSite,
            });
        }

        return () => {
            // Restore in reverse order so an OG tag that was created during
            // mount is removed before its placeholder restorer for description runs.
            for (let i = restorers.length - 1; i >= 0; i--) restorers[i]();
        };
    }, [
        title, description, canonical, ogTitle, ogDescription, ogImage,
        ogType, twitterCard, twitterSite, keywords, robots,
    ]);
}
