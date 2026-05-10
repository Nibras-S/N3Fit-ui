import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

/**
 * Renders the markdown body of a blog post. Internal links (starting with /
 * or #) become React Router Links so navigation stays SPA-fast; external
 * links open in a new tab with proper rel attributes.
 *
 * The Tailwind classes here build a Typography-like ruleset without the
 * @tailwindcss/typography plugin. Keep it minimal — readability over
 * design flourish.
 */

const components = {
    h2: ({ node, children, ...props }) => (
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mt-12 mb-4 leading-tight" {...props}>{children}</h2>
    ),
    h3: ({ node, children, ...props }) => (
        <h3 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-white mt-8 mb-3 leading-tight" {...props}>{children}</h3>
    ),
    h4: ({ node, children, ...props }) => (
        <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mt-6 mb-2" {...props}>{children}</h4>
    ),
    p: ({ node, ...props }) => (
        <p className="text-base text-zinc-700 dark:text-zinc-200 leading-relaxed my-4" {...props} />
    ),
    a: ({ node, href = '', children, ...props }) => {
        const isInternal = href.startsWith('/') || href.startsWith('#');
        if (isInternal) {
            return (
                <Link to={href} className="text-zinc-900 dark:text-zinc-100 underline underline-offset-2 hover:no-underline" {...props}>
                    {children}
                </Link>
            );
        }
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-900 dark:text-zinc-100 underline underline-offset-2 hover:no-underline"
                {...props}
            >
                {children}
            </a>
        );
    },
    ul: ({ node, ...props }) => (
        <ul className="list-disc list-outside pl-6 my-4 space-y-1.5 text-zinc-700 dark:text-zinc-200" {...props} />
    ),
    ol: ({ node, ...props }) => (
        <ol className="list-decimal list-outside pl-6 my-4 space-y-1.5 text-zinc-700 dark:text-zinc-200" {...props} />
    ),
    li: ({ node, ...props }) => (
        <li className="leading-relaxed" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
        <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 my-6 italic text-zinc-600 dark:text-zinc-400" {...props} />
    ),
    code: ({ node, inline, className, children, ...props }) => {
        if (inline) {
            return (
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-sm font-mono text-zinc-900 dark:text-zinc-100" {...props}>
                    {children}
                </code>
            );
        }
        return (
            <pre className="my-6 p-4 rounded-xl bg-zinc-900 dark:bg-zinc-950 text-zinc-100 overflow-x-auto text-sm font-mono">
                <code {...props}>{children}</code>
            </pre>
        );
    },
    table: ({ node, ...props }) => (
        <div className="my-6 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse" {...props} />
        </div>
    ),
    th: ({ node, ...props }) => (
        <th className="px-3 py-2 border-b-2 border-zinc-300 dark:border-zinc-700 font-semibold text-zinc-900 dark:text-white" {...props} />
    ),
    td: ({ node, ...props }) => (
        <td className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200" {...props} />
    ),
    hr: ({ node, ...props }) => (
        <hr className="my-10 border-zinc-200 dark:border-zinc-800" {...props} />
    ),
    img: ({ node, ...props }) => (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img className="my-6 rounded-xl max-w-full h-auto" loading="lazy" {...props} />
    ),
};

export default function PostBody({ markdown }) {
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {markdown}
        </ReactMarkdown>
    );
}
