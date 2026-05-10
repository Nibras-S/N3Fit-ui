import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { formatDateIST } from '../../../shared/lib/timezone';
import TagPills from './TagPills';

/**
 * Card on the /blog index. Title links to the full post; tags link to tag pages.
 */
export default function PostCard({ post }) {
    return (
        <article className="group flex flex-col gap-3 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <time dateTime={post.date}>{formatDateIST(post.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readTimeMinutes} min read</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white leading-tight">
                <Link to={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                </Link>
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {post.description}
            </p>
            <TagPills tags={post.tags} />
            <div className="mt-2">
                <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-200 hover:gap-2 transition-all"
                >
                    Read more <FaArrowRight className="text-xs" />
                </Link>
            </div>
        </article>
    );
}
