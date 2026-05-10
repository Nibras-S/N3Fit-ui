import { useEffect } from 'react';

/**
 * Injects one or more JSON-LD schemas as <script type="application/ld+json">
 * elements into <head> for the lifetime of the calling page. Removes them
 * cleanly on unmount so an unrelated page never inherits schemas from a
 * previous route.
 *
 * Usage:
 *   useStructuredData([
 *     softwareApplicationSchema(),
 *     faqPageSchema(faqs),
 *   ]);
 *
 * Each schema is serialised to its own <script> tag. Google parses each
 * tag independently, so combining unrelated schemas (e.g. SoftwareApplication
 * + FAQPage) into a single tag via @graph is unnecessary.
 *
 * Implementation note: we mount inside useEffect rather than at render time
 * because React 18 strict mode renders twice in dev — pushing into <head>
 * during render would briefly create duplicate tags.
 */
export default function useStructuredData(schemas) {
    useEffect(() => {
        const list = Array.isArray(schemas) ? schemas : [schemas];
        const nodes = list
            .filter(Boolean)
            .map((schema) => {
                const el = document.createElement('script');
                el.type = 'application/ld+json';
                el.dataset.seoSchema = String(schema['@type'] || 'unknown');
                el.textContent = JSON.stringify(schema);
                document.head.appendChild(el);
                return el;
            });

        return () => {
            nodes.forEach((n) => n.remove());
        };
        // The schemas array is rebuilt each render by the caller, but its
        // serialised form is stable for a given route. We intentionally serialise
        // it as the dep so schema-content changes (e.g. tag changes on a blog
        // post) trigger a re-injection.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(schemas)]);
}
