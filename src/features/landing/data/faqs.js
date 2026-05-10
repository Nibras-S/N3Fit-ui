/**
 * Single source of truth for the homepage FAQ. Imported by:
 *   - features/landing/components/FAQ.jsx       (renders the visible accordion)
 *   - features/landing/pages/LandingPage.jsx    (emits FAQPage JSON-LD)
 *
 * Keeping the strings in one place means the rich-result snippet on Google
 * always matches what visitors see — Google penalises FAQPage schemas whose
 * Q&A doesn't appear in the page body, so the two surfaces must stay in sync.
 */
export const faqs = [
    {
        q: 'Is N3FitBook cloud-based?',
        a: "Yes! N3FitBook is 100% cloud-based. Access your gym's data from any device — laptop, tablet, or phone — securely from anywhere.",
    },
    {
        q: 'Does N3FitBook support multi-branch gyms?',
        a: 'Absolutely! Our Premium plan supports unlimited branches. Manage all locations from a single Super Admin dashboard with per-branch analytics.',
    },
    {
        q: 'Can I migrate data from Excel or another software?',
        a: 'Yes, we offer free CSV/Excel data import. Upload your member list and N3FitBook auto-maps the fields. Our team assists with complex migrations.',
    },
    {
        q: 'How does the WhatsApp integration work?',
        a: 'N3FitBook connects to the WhatsApp Cloud API to send automated renewal reminders, bulk announcements, and personalized birthday wishes — all from your dashboard.',
    },
    {
        q: 'Is there a free trial?',
        a: 'Yes, we offer a 14-day free trial on all plans with full access to features. No credit card required. Cancel anytime.',
    },
];
