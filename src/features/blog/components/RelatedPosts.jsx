import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateIST } from '../../../shared/lib/timezone';

/**
 * "Read next" section at the bottom of every post. Tag-overlap based; falls
 * back to most-recent if nothing overlaps.
 */
export default function RelatedPosts({ posts }) {
    if (!posts?.length) return null;

    return (
        <section className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
                Read next
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {posts.map(p => (
                    <Link
                        key={p.slug}
                        to={`/blog/${p.slug}`}
                        className="block p-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-md transition-shadow"
                    >
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                            {formatDateIST(p.date)} · {p.readTimeMinutes} min
                        </p>
                        <h3 className="font-semibold text-zinc-900 dark:text-white leading-snug">
                            {p.title}
                        </h3>
                    </Link>
                ))}
            </div>
        </section>
    );
}
