import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../landing/components/Navbar';
import Footer from '../../landing/components/Footer';
import FreeTrialModal from '../../landing/components/FreeTrialModal';
import useDocumentMeta from '../../../shared/hooks/useDocumentMeta';
import { usePostsByTag } from '../hooks/useBlogPosts';
import PostCard from '../components/PostCard';
import '../../landing/styles/landing.css';

const SITE_URL = 'https://www.n3fitbook.in';

export default function BlogTagPage() {
    const { tag: rawTag } = useParams();
    const tag = decodeURIComponent(rawTag || '');
    const [trialOpen, setTrialOpen] = useState(false);
    const posts = usePostsByTag(tag);

    // Tag pages are thin (filtered duplicates of post content) — explicit
    // noindex keeps Google focused on the post pages themselves while still
    // letting the navigation work for humans.
    useDocumentMeta({
        title: `Posts tagged "${tag}" · N3FitBook Blog`,
        description: `Articles about ${tag} on the N3FitBook blog.`,
        canonical: `${SITE_URL}/blog/tag/${encodeURIComponent(tag)}`,
        robots: 'noindex, follow',
    });

    return (
        <div className="landing-page-wrapper min-h-screen">
            <Navbar onOpenTrial={() => setTrialOpen(true)} />

            <main className="max-w-5xl mx-auto px-6 py-16">
                <Link
                    to="/blog"
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                    ← All posts
                </Link>

                <header className="mt-4 mb-12">
                    <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Topic</p>
                    <h1 className="mt-2 text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white leading-tight">
                        {tag}
                    </h1>
                    <p className="mt-3 text-zinc-500 dark:text-zinc-400">
                        {posts.length} post{posts.length === 1 ? '' : 's'}
                    </p>
                </header>

                {posts.length === 0 ? (
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 py-12 text-center">
                        No posts under this topic yet.
                    </p>
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
