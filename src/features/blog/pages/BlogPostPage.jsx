import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../landing/components/Navbar';
import Footer from '../../landing/components/Footer';
import FreeTrialModal from '../../landing/components/FreeTrialModal';
import useDocumentMeta from '../../../shared/hooks/useDocumentMeta';
import { usePostBySlug, useRelatedPosts } from '../hooks/useBlogPosts';
import PostHeader from '../components/PostHeader';
import PostBody from '../components/PostBody';
import RelatedPosts from '../components/RelatedPosts';
import NotFoundPage from '../../landing/pages/NotFoundPage';
import '../../landing/styles/landing.css';

const SITE_URL = 'https://www.n3fitbook.in';

/**
 * Renders a single blog post. Hooks Article JSON-LD into the document head
 * via a side-effect hook, so each post gets per-page rich-result eligibility.
 */
export default function BlogPostPage() {
    const { slug } = useParams();
    const [trialOpen, setTrialOpen] = useState(false);
    const post = usePostBySlug(slug);
    const related = useRelatedPosts(post, 3);

    // Always call useDocumentMeta unconditionally (rules of hooks). When the
    // slug doesn't match a real post we set noindex so search engines don't
    // accidentally index the 404 we'll render below.
    useDocumentMeta({
        title: post ? `${post.title} · N3FitBook Blog` : 'Post not found · N3FitBook Blog',
        description: post?.description,
        canonical: post ? `${SITE_URL}/blog/${post.slug}` : `${SITE_URL}/blog`,
        ogTitle: post?.title,
        ogDescription: post?.description,
        ogImage: post ? `${SITE_URL}${post.ogImage}` : `${SITE_URL}/og-image.png`,
        ogType: 'article',
        robots: post ? undefined : 'noindex, follow',
    });

    // Article JSON-LD — appended once on mount, removed on unmount. Lives
    // here rather than in useDocumentMeta because it's per-page and
    // structurally different (its own <script type="application/ld+json"> tag).
    useEffect(() => {
        if (!post) return;
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'blog-post-jsonld';
        script.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.updated || post.date,
            author: {
                '@type': 'Organization',
                name: post.author,
                url: post.authorUrl,
            },
            publisher: {
                '@type': 'Organization',
                name: 'N3FitBook',
                url: SITE_URL,
                logo: {
                    '@type': 'ImageObject',
                    url: `${SITE_URL}/n3fitbook-512.png`,
                },
            },
            image: `${SITE_URL}${post.ogImage}`,
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
            keywords: (post.tags || []).join(', '),
        });
        document.head.appendChild(script);
        return () => { script.remove(); };
    }, [post]);

    if (!post) {
        // Renders the existing 404 component (already noindex). Address bar
        // keeps showing /blog/<slug> so the user / crawler can see what they
        // tried to visit.
        return <NotFoundPage />;
    }

    return (
        <div className="landing-page-wrapper min-h-screen">
            <Navbar onOpenTrial={() => setTrialOpen(true)} />

            <article className="max-w-3xl mx-auto px-6 py-16">
                <PostHeader post={post} />
                <PostBody markdown={post.body} />

                <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                        Run a gym? Try N3FitBook.
                    </h3>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto">
                        Members, billing, attendance, and WhatsApp reminders — all in one place. 14-day free trial, no card needed.
                    </p>
                    <button
                        type="button"
                        onClick={() => setTrialOpen(true)}
                        className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition"
                    >
                        Start free trial
                    </button>
                </div>

                <RelatedPosts posts={related} />

                <div className="mt-12 text-center">
                    <Link
                        to="/blog"
                        className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    >
                        ← Back to all posts
                    </Link>
                </div>
            </article>

            <Footer />
            <FreeTrialModal isOpen={trialOpen} onClose={() => setTrialOpen(false)} />
        </div>
    );
}
