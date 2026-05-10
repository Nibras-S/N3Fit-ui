#!/usr/bin/env node
/*
 * Generates public/sitemap.xml from a static allowlist of public marketing
 * routes plus any future blog post slugs.
 *
 * Run automatically as part of `npm run build` (post-build, alongside
 * sw-inject.js). Run manually:  npm run generate-sitemap
 *
 * Auth-gated routes (the gym app, superadmin, etc.) are NEVER added — see
 * public/robots.txt for the exclusion list.
 *
 * To add a new public page: edit STATIC_ROUTES below.
 * To add a new blog post: drop an .mdx file in content/blog/ and re-run build.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const BUILD_DIR = path.join(ROOT, 'build');
const BLOG_DIR = path.join(ROOT, 'content', 'blog');
const SITE_URL = (process.env.REACT_APP_SITE_URL || 'https://www.n3fitbook.in').replace(/\/$/, '');

// Public marketing routes. `priority` is informational only — Google doesn't
// strictly use it, but the file format requires a value in [0.0, 1.0].
const STATIC_ROUTES = [
    { loc: '/',         changefreq: 'weekly',  priority: 1.0 },
    { loc: '/privacy',  changefreq: 'yearly',  priority: 0.4 },
    { loc: '/terms',    changefreq: 'yearly',  priority: 0.4 },
    { loc: '/blog',     changefreq: 'weekly',  priority: 0.8 },
];

function listBlogPosts() {
    if (!fs.existsSync(BLOG_DIR)) return [];
    const today = new Date().toISOString().slice(0, 10);

    return fs.readdirSync(BLOG_DIR)
        .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
        .map(f => {
            const filePath = path.join(BLOG_DIR, f);
            const { data } = matter(fs.readFileSync(filePath, 'utf8'));
            // Respect the frontmatter slug if set; fall back to the filename.
            const slug = data.slug || f.replace(/\.(mdx|md)$/, '');
            const date = data.date ? new Date(data.date).toISOString().slice(0, 10) : null;
            return {
                slug,
                loc: `/blog/${slug}`,
                lastmod: data.updated || date || fs.statSync(filePath).mtime.toISOString().slice(0, 10),
                changefreq: 'monthly',
                priority: 0.7,
                draft: data.draft === true,
                publishOn: date,
            };
        })
        .filter(p => !p.draft && (!p.publishOn || p.publishOn <= today))
        .map(({ draft, publishOn, slug, ...entry }) => entry);
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
    const fullUrl = `${SITE_URL}${loc}`;
    const lines = ['  <url>'];
    lines.push(`    <loc>${fullUrl}</loc>`);
    if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
    if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
    if (priority != null) lines.push(`    <priority>${priority.toFixed(1)}</priority>`);
    lines.push('  </url>');
    return lines.join('\n');
}

function main() {
    const today = new Date().toISOString().slice(0, 10);
    const staticEntries = STATIC_ROUTES.map(r => ({ ...r, lastmod: today }));
    const postEntries = listBlogPosts();
    const all = [...staticEntries, ...postEntries];

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        all.map(urlEntry).join('\n'),
        '</urlset>',
        '',
    ].join('\n');

    // Write to public/ so `npm start` dev server serves it, AND to build/ if
    // a build has run, so a deploy from build/ is up to date.
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
    if (fs.existsSync(BUILD_DIR)) {
        fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), xml);
    }

    console.log(`sitemap.xml: ${all.length} URLs (${staticEntries.length} static + ${postEntries.length} blog)`);
}

main();
