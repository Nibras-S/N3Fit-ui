#!/usr/bin/env node
/*
 * Generates favicon.ico (multi-size Microsoft ICO) and 16/32 PNG hints from
 * public/n3fitbook-192.png. Run manually when the logo changes:
 *   npm run generate-favicons
 *
 * Why a real ICO matters: the file at /favicon.ico is what Google, Bing, and
 * social-link unfurl crawlers request *first*, regardless of <link rel="icon">
 * tags in the HTML. If that path returns the SPA's index.html (which happens
 * on hosts with a catch-all rewrite when no real file exists), crawlers fall
 * back to the generic globe icon in search results.
 *
 * Output:
 *   public/favicon.ico         — proper ICO container with 16/32/48/96 PNG entries
 *   public/favicon-32x32.png   — explicit hint for the most-common tab size
 *   public/favicon-16x16.png   — for legacy browsers / address-bar usage
 *
 * Why 96 alongside 48: Google's favicon-in-search picker prefers icons that
 * are a multiple of 48 and >= 48px. Including 96 gives crisper rendering on
 * high-DPI listings without bloating the ICO meaningfully.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public', 'n3fitbook-192.png');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ICO_SIZES = [16, 32, 48, 96];
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

async function renderPng(size) {
    return sharp(SRC)
        .resize(size, size, { fit: 'contain', background: TRANSPARENT })
        .png()
        .toBuffer();
}

/**
 * Build a Microsoft ICO file with PNG-encoded entries (the modern PNG-in-ICO
 * variant supported since Vista). Hand-rolled to avoid an extra npm dep —
 * the format is small and well-specified:
 *   https://en.wikipedia.org/wiki/ICO_(file_format)
 */
function packIco(buffers, sizes) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);            // reserved
    header.writeUInt16LE(1, 2);            // type: 1 = icon
    header.writeUInt16LE(buffers.length, 4); // image count

    const dir = Buffer.alloc(16 * buffers.length);
    let offset = header.length + dir.length;
    for (let i = 0; i < buffers.length; i++) {
        const s = sizes[i] >= 256 ? 0 : sizes[i];
        const buf = buffers[i];
        const e = i * 16;
        dir.writeUInt8(s, e);                // width
        dir.writeUInt8(s, e + 1);            // height
        dir.writeUInt8(0, e + 2);            // palette (none)
        dir.writeUInt8(0, e + 3);            // reserved
        dir.writeUInt16LE(1, e + 4);         // color planes
        dir.writeUInt16LE(32, e + 6);        // bits/pixel
        dir.writeUInt32LE(buf.length, e + 8); // image size
        dir.writeUInt32LE(offset, e + 12);   // image offset
        offset += buf.length;
    }
    return Buffer.concat([header, dir, ...buffers]);
}

async function main() {
    if (!fs.existsSync(SRC)) {
        console.error(`Source image not found: ${SRC}`);
        process.exit(1);
    }

    const pngs = await Promise.all(ICO_SIZES.map(renderPng));
    const ico = packIco(pngs, ICO_SIZES);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), ico);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-32x32.png'), pngs[1]);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-16x16.png'), pngs[0]);

    console.log('favicon.ico         :', ico.length, 'bytes (', ICO_SIZES.join(' + '), ')');
    console.log('favicon-32x32.png   :', pngs[1].length, 'bytes');
    console.log('favicon-16x16.png   :', pngs[0].length, 'bytes');
}

main().catch(err => { console.error(err); process.exit(1); });
