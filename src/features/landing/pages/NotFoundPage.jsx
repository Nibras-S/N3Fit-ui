import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FreeTrialModal from '../components/FreeTrialModal';
import useDocumentMeta from '../../../shared/hooks/useDocumentMeta';
import '../styles/landing.css';

/**
 * Custom 404 page. Replaces the previous wildcard-redirect-to-/ behaviour, which
 * looked OK to humans but ate every "did you mean..." signal Google relies on
 * to surface the right page (and gave bots a 200 OK on a soft-404, which they
 * eventually start ignoring).
 *
 * The robots meta tag explicitly tells crawlers not to index this page or
 * follow links from it — they should never have arrived here in the first place.
 */
export default function NotFoundPage() {
    const [trialOpen, setTrialOpen] = useState(false);

    useDocumentMeta({
        title: 'Page not found — N3FitBook',
        description: "We couldn't find the page you were looking for. Try the homepage or visit our gym management features.",
        canonical: 'https://www.n3fitbook.in/',
        robots: 'noindex, follow',
    });

    return (
        <div className="landing-page-wrapper min-h-screen">
            <Navbar onOpenTrial={() => setTrialOpen(true)} />

            <main className="max-w-3xl mx-auto px-6 py-24 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">404</p>
                <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-zinc-900">Page not found</h1>
                <p className="mt-4 text-base text-zinc-600">
                    The link may be broken or the page may have moved. Try one of these instead:
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link to="/" className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition">
                        Go to homepage
                    </Link>
                    <Link to="/blog" className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-800 font-semibold hover:bg-zinc-50 transition">
                        Read the blog
                    </Link>
                    <button
                        type="button"
                        onClick={() => setTrialOpen(true)}
                        className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-800 font-semibold hover:bg-zinc-50 transition"
                    >
                        Start free trial
                    </button>
                </div>

                <div className="mt-12 text-sm text-zinc-500">
                    Looking for something specific? Try the{' '}
                    <Link to="/" className="underline hover:text-zinc-900">features overview</Link>,{' '}
                    <Link to="/privacy" className="underline hover:text-zinc-900">privacy policy</Link>, or{' '}
                    <Link to="/terms" className="underline hover:text-zinc-900">terms of service</Link>.
                </div>
            </main>

            <Footer />
            <FreeTrialModal isOpen={trialOpen} onClose={() => setTrialOpen(false)} />
        </div>
    );
}
