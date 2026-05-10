/**
 * JSON-LD schema builders for n3fitbook.in.
 *
 * Each function returns a plain JS object that gets serialised to a
 * <script type="application/ld+json"> tag at runtime via the
 * useStructuredData hook (or hand-injected into index.html for the
 * Organization + WebSite globals that should ship on every page).
 *
 * Reference: https://schema.org and https://developers.google.com/search/docs/appearance/structured-data
 */

const SITE_URL = 'https://www.n3fitbook.in';
const LOGO_URL = `${SITE_URL}/n3fitbook-512.png`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Top-level Organization schema. Ships once globally (in index.html). Tells
 * Google "this is the entity behind n3fitbook.in" so the Knowledge Panel and
 * branded search results pull from one canonical record.
 *
 * The N3FitBook product Instagram is the only N3FitBook-branded social handle
 * today; the parent company N3 Global Tech has its own X / Instagram /
 * LinkedIn profiles, captured under parentOrganization so search engines
 * understand the brand relationship without confusing visitors.
 */
export function organizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'N3FitBook',
        legalName: 'N3FitBook',
        url: SITE_URL,
        logo: LOGO_URL,
        image: OG_IMAGE,
        description: "Complete gym management software for India — members, billing, attendance, expenses & WhatsApp reminders in one platform.",
        sameAs: [
            'https://www.instagram.com/n3fitbook',
        ],
        parentOrganization: {
            '@type': 'Organization',
            name: 'N3 Global Tech',
            url: 'https://www.n3global.tech',
            sameAs: [
                'https://x.com/N3Globaltech',
                'https://www.instagram.com/n3globaltech',
                'https://www.linkedin.com/company/n3-global-tech',
            ],
        },
        contactPoint: {
            '@type': 'ContactPoint',
            email: 'contact@n3global.tech',
            contactType: 'customer support',
            areaServed: 'IN',
            availableLanguage: ['English', 'Hindi', 'Malayalam'],
        },
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Kannur',
            addressRegion: 'Kerala',
            addressCountry: 'IN',
        },
    };
}

/**
 * WebSite schema. Identifies the site as a single web property and (when a
 * search endpoint exists) declares a SearchAction so Google can offer a
 * sitelinks search box. We don't have an internal search yet — the
 * potentialAction is omitted; add it when a search route ships.
 */
export function webSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'N3FitBook',
        description: 'Gym management software for India.',
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-IN',
    };
}

/**
 * SoftwareApplication schema for the homepage. Eligible for Google's
 * software-product rich result (price + rating snippet in SERP).
 *
 * `aggregateRating` is intentionally omitted until we have real review data;
 * shipping a fake rating triggers a manual penalty. Add it once we collect
 * 3+ legitimate reviews on G2 or Capterra.
 */
export function softwareApplicationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#software`,
        name: 'N3FitBook',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Gym Management Software',
        operatingSystem: 'Web, iOS, Android',
        url: SITE_URL,
        image: OG_IMAGE,
        description: 'All-in-one gym management platform with member CRM, billing, attendance, and WhatsApp reminders. Built for Indian gyms.',
        publisher: { '@id': `${SITE_URL}/#organization` },
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            description: '14-day free trial, no credit card required.',
            url: `${SITE_URL}/#pricing`,
        },
        featureList: [
            'Member management',
            'Billing and invoicing',
            'Attendance tracking',
            'WhatsApp renewal reminders',
            'Expense tracking',
            'Multi-staff role-based access',
            'Multi-branch support',
            'Daily and monthly reports',
        ],
    };
}

/**
 * FAQPage schema. The questions/answers MUST match what's visible on the page
 * — Google has explicitly stated they devalue or penalise FAQPage schemas
 * whose content is not present in the page body. Both this builder and the
 * visible FAQ component import from features/landing/data/faqs.js.
 */
export function faqPageSchema(faqs) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faqs`,
        mainEntity: faqs.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: a,
            },
        })),
    };
}

/**
 * BreadcrumbList schema. For pages where the hierarchy adds context to a
 * crawler — Privacy and Terms today, blog post pages can add it later if we
 * decide to. Pass an array of { name, url } items in left-to-right order
 * (root → leaf).
 */
export function breadcrumbSchema(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.name,
            item: item.url,
        })),
    };
}
