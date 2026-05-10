import { posts } from '../posts.generated';

/**
 * Blog content is static at build time — no API, no TanStack Query, no
 * sockets. These helpers are plain functions that read the auto-generated
 * manifest. They live as a "hook" file for consistency with the rest of the
 * features/ tree, but none of them actually call React hooks.
 */

export function useAllPosts() {
    return posts;
}

export function useFeaturedPosts(count = 3) {
    return posts.slice(0, count);
}

export function usePostBySlug(slug) {
    return posts.find(p => p.slug === slug) || null;
}

export function usePostsByTag(tag) {
    if (!tag) return [];
    return posts.filter(p => (p.tags || []).includes(tag));
}

export function useAllTags() {
    const counts = new Map();
    posts.forEach(p => (p.tags || []).forEach(t => {
        counts.set(t, (counts.get(t) || 0) + 1);
    }));
    return Array.from(counts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * Find up to `count` posts that share at least one tag with `post`. Falls
 * back to most-recent posts if no tag overlaps.
 */
export function useRelatedPosts(post, count = 3) {
    if (!post) return [];
    const candidates = posts.filter(p => p.slug !== post.slug);
    const tagged = candidates.filter(p =>
        (p.tags || []).some(t => (post.tags || []).includes(t)),
    );
    const ordered = tagged.length >= count ? tagged : [...tagged, ...candidates.filter(p => !tagged.includes(p))];
    return ordered.slice(0, count);
}
