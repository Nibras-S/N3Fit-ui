import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { formatDateIST } from '../../../shared/lib/timezone';
import TagPills from './TagPills';

/**
 * Top of a /blog/:slug page — back link, title, byline, tags. Visual style
 * intentionally simple so the prose below is the focal point.
 */
export default function PostHeader({ post }) {
    return (
        <header className="mb-8">
            <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6"
            >
                <FaArrowLeft className="text-xs" /> All posts
            </Link>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white leading-tight mb-4">
                {post.title}
            </h1>

            <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed mb-5">
                {post.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400 mb-5">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{post.author}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={post.date}>{formatDateIST(post.date)}</time>
                {post.updated && post.updated !== post.date && (
                    <>
                        <span aria-hidden="true">·</span>
                        <span className="italic">Updated {formatDateIST(post.updated)}</span>
                    </>
                )}
                <span aria-hidden="true">·</span>
                <span>{post.readTimeMinutes} min read</span>
            </div>

            <TagPills tags={post.tags} />
        </header>
    );
}
