#!/usr/bin/env node
/*
 * Generates public/rss.xml (and build/rss.xml when a build exists) by reading
 * content/blog/*.md directly via gray-matter. Mirrors the source-of-truth
 * approach used by generate-sitemap.js — no dependency on posts.generated.js,
 * so order of npm script execution doesn't matter.
 *
 * RSS 2.0 with Atom self-link extension. Discoverable via the
 * <link rel="alternate" type="application/rss+xml" href="/rss.xml"> tag in
 * public/index.html.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const BUILD_DIR = path.join(ROOT, 'build');
const BLOG_DIR = path.join(ROOT, 'content', 'blog');
const SITE_URL = (process.env.REACT_APP_SITE_URL || 'https://www.n3fitbook.in').replace(/\/$/, '');
const FEED_URL = `${SITE_URL}/rss.xml`;
const BLOG_URL = `${SITE_URL}/blog`;

const FEED_TITLE = 'N3FitBook Blog';
const FEED_DESCRIPTION = 'Gym management, member retention, and SaaS for Indian gyms.';
const FEED_LANGUAGE = 'en-in';

function escapeXml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function rfc822(dateStr) {
    return new Date(`${dateStr}T00:00:00+05:30`).toUTCString();
}

function loadPosts() {
    if (!fs.existsSync(BLOG_DIR)) return [];
    const today = new Date().toISOString().slice(0, 10);

    return fs.readdirSync(BLOG_DIR)
        .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
        .map(f => {
            const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, f), 'utf8'));
            const slug = data.slug || f.replace(/\.(md|mdx)$/, '');
            const date = new Date(data.date).toISOString().slice(0, 10);
            return {
                slug,
                title: String(data.title || ''),
                description: String(data.description || ''),
                date,
                author: data.author || 'N3FitBook Team',
                authorUrl: data.authorUrl || 'https://www.n3fitbook.in',
                tags: Array.isArray(data.tags) ? data.tags : [],
                draft: data.draft === true,
            };
        })
        .filter(p => !p.draft && p.date <= today)
        .sort((a, b) => b.date.localeCompare(a.date));
}

function postEntry(p) {
    const url = `${SITE_URL}/blog/${p.slug}`;
    return [
        '    <item>',
        `      <title>${escapeXml(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(p.date)}</pubDate>`,
        `      <description>${escapeXml(p.description)}</description>`,
        ...(p.author ? [`      <author>noreply@n3fitbook.in (${escapeXml(p.author)})</author>`] : []),
        ...(p.tags || []).map(t => `      <category>${escapeXml(t)}</category>`),
        '    </item>',
    ].join('\n');
}

function main() {
    const posts = loadPosts();
    const lastBuild = posts[0]?.date
        ? rfc822(posts[0].date)
        : new Date().toUTCString();

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '  <channel>',
        `    <title>${escapeXml(FEED_TITLE)}</title>`,
        `    <link>${BLOG_URL}</link>`,
        `    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />`,
        `    <description>${escapeXml(FEED_DESCRIPTION)}</description>`,
        `    <language>${FEED_LANGUAGE}</language>`,
        `    <lastBuildDate>${lastBuild}</lastBuildDate>`,
        ...posts.map(postEntry),
        '  </channel>',
        '</rss>',
        '',
    ].join('\n');

    fs.writeFileSync(path.join(PUBLIC_DIR, 'rss.xml'), xml);
    if (fs.existsSync(BUILD_DIR)) {
        fs.writeFileSync(path.join(BUILD_DIR, 'rss.xml'), xml);
    }
    console.log(`rss.xml: ${posts.length} item(s)`);
}

main();
