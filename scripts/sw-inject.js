#!/usr/bin/env node
/* eslint-disable no-console */
// Post-build step: rewrite build/service-worker.js so the PWA precaches the
// real hashed JS/CSS bundles emitted by react-scripts. Without this the SW
// only caches index.html + logos, and every cold launch still re-downloads
// the entire app shell from the network.
//
// Flow:
//   1. Read build/asset-manifest.json (CRA writes this — keyed by logical path)
//   2. Pick the .js and .css files under build/static/ (hashed, immutable)
//   3. Prepend `self.__PRECACHE_MANIFEST__ = [...]` to build/service-worker.js
//   4. Replace the __BUILD_ID__ token with a timestamp so the activate handler
//      evicts the previous version's cache on every deploy
//
// The SW itself reads `self.__PRECACHE_MANIFEST__ || []` so at dev time (no
// injection, just the file served from /public) the worker still installs
// with the static shell and a noop hashed-list.

const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '..', 'build');
const manifestPath = path.join(buildDir, 'asset-manifest.json');
const swPath = path.join(buildDir, 'service-worker.js');

if (!fs.existsSync(buildDir)) {
    console.error('[sw-inject] build/ not found — run react-scripts build first.');
    process.exit(1);
}
if (!fs.existsSync(manifestPath)) {
    console.error('[sw-inject] build/asset-manifest.json not found.');
    process.exit(1);
}
if (!fs.existsSync(swPath)) {
    console.error('[sw-inject] build/service-worker.js not found.');
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const files = manifest.files || {};

// Only precache immutable hashed assets under /static/. Skip sourcemaps, the
// HTML template, and anything outside /static/ (those are handled by the
// static precache list in the SW source).
const hashed = Object.values(files)
    .filter((url) => typeof url === 'string')
    .filter((url) => url.startsWith('/static/'))
    .filter((url) => /\.(js|css)$/.test(url))
    .sort();

const buildId = `${Date.now()}`;

const original = fs.readFileSync(swPath, 'utf8');
const withBuildId = original.replace(/__BUILD_ID__/g, buildId);

const precacheAssign = `self.__PRECACHE_MANIFEST__ = ${JSON.stringify(hashed)};\n`;
const rewritten = precacheAssign + withBuildId;

fs.writeFileSync(swPath, rewritten, 'utf8');

console.log(`[sw-inject] cache: fit-${buildId}`);
console.log(`[sw-inject] injected ${hashed.length} hashed assets into service-worker.js`);
