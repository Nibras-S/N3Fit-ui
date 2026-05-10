import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../landing/components/Navbar';
import Footer from '../../landing/components/Footer';
import FreeTrialModal from '../../landing/components/FreeTrialModal';
import useDocumentMeta from '../../../shared/hooks/useDocumentMeta';
import { useAllPosts, useAllTags } from '../hooks/useBlogPosts';
import PostCard from '../components/PostCard';
import '../../landing/styles/landing.css';

export default function BlogIndexPage() {
    const [trialOpen, setTrialOpen] = useState(false);
    const posts = useAllPosts();
    const tags = useAllTags();

    useDocumentMeta({
        title: 'Blog · N3FitBook',
        description: 'Practical guides and analysis on gym management, member retention, and SaaS for Indian gyms.',
        canonical: 'https://www.n3fitbook.in/blog',
        ogTitle: 'N3FitBook Blog — Gym Management, Retention, SaaS',
        ogDescription: 'Practical guides for Indian gym owners — billing, attendance, WhatsApp reminders, retention.',
        ogImage: 'https://www.n3fitbook.in/og-image.png',
        ogType: 'website',
    });

    return (
        <div className="landing-page-wrapper min-h-screen">
            <Navbar onOpenTrial={() => setTrialOpen(true)} />

            <main className="max-w-5xl mx-auto px-6 py-16">
                <header className="mb-12">
                    <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Blog</p>
                    <h1 className="mt-2 text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white leading-tight">
                        Build a better gym business.
                    </h1>
                    <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl">
                        Practical guides on running, billing, and growing a fitness business in India.
                        Written by the N3FitBook team — no fluff, no AI filler.
                    </p>
                </header>

                {tags.length > 0 && (
                    <nav aria-label="Browse by topic" className="mb-10 flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 self-center mr-2">
                            Topics:
                        </span>
                        {tags.slice(0, 12).map(({ tag, count }) => (
                            <Link
                                key={tag}
                                to={`/blog/tag/${encodeURIComponent(tag)}`}
                                className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                {tag}
                                <span className="ml-1 text-zinc-400">({count})</span>
                            </Link>
                        ))}
                    </nav>
                )}

                {posts.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-lg text-zinc-500 dark:text-zinc-400">
                            No posts yet — first one drops soon.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {posts.map(post => (
                            <PostCard key={post.slug} post={post} />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
            <FreeTrialModal isOpen={trialOpen} onClose={() => setTrialOpen(false)} />
        </div>
    );
}
