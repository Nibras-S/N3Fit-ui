import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Renders a horizontal list of clickable tag pills. Used on post cards and
 * post headers. Each pill links to /blog/tag/<tag>.
 */
export default function TagPills({ tags = [], size = 'sm' }) {
    if (!tags.length) return null;
    const cls = size === 'lg'
        ? 'text-sm px-3 py-1'
        : 'text-xs px-2 py-0.5';

    return (
        <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
                <Link
                    key={tag}
                    to={`/blog/tag/${encodeURIComponent(tag)}`}
                    className={`${cls} rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors`}
                >
                    {tag}
                </Link>
            ))}
        </div>
    );
}
