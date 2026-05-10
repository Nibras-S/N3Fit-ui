#!/usr/bin/env node
/*
 * Generates public/og-image.png — the 1200×630 social-share image that
 * appears when someone pastes n3fitbook.in into Slack, WhatsApp, LinkedIn,
 * Twitter, Facebook, etc.
 *
 * Run manually:  npm run generate-og-image
 *
 * The output is "good enough" for shipping — not award-winning. When you
 * have a designer-made version, drop it into public/og-image.png and stop
 * running this script. The dimensions, file path, and content-type stay
 * the same so the <meta property="og:image"> tag never needs to change.
 *
 * Brand palette pulled from landing.css:
 *   --landing-primary:      #18181b   (background)
 *   --landing-primary-light: #52525b   (subtle line)
 *   --landing-primary-50:    #f4f4f5   (text)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const LOGO = path.join(ROOT, 'public', 'n3fitbook-512.png');
const OUT = path.join(ROOT, 'public', 'og-image.png');

const W = 1200;
const H = 630;
const BG = '#18181b';
const TEXT = '#fafafa';
const ACCENT = '#52525b';
const LOGO_SIZE = 240;

async function main() {
    if (!fs.existsSync(LOGO)) {
        console.error(`Source logo not found: ${LOGO}`);
        process.exit(1);
    }

    // Render the brand logo white-on-transparent at the target size. The
    // source PNG is dark-on-light; we tint it via .negate() because the
    // existing rendition is already mostly black on transparent. If the
    // logo is already white, this is a no-op visually.
    const logoBuf = await sharp(LOGO)
        .resize(LOGO_SIZE, LOGO_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

    // Background + text rendered as one SVG. Pango (via librsvg) handles
    // the text shaping with system sans-serif — we don't embed a webfont
    // because most cloud hosts don't have one installed and base64-embedding
    // adds ~200KB to a static image we render once. If the typography looks
    // off, drop a designer-made PNG into public/og-image.png.
    const padX = 96;
    const titleY = H / 2 - 16;

    const svg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${BG}"/>
            <stop offset="100%" stop-color="#0a0a0b"/>
        </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>

    <!-- Subtle horizontal accent line under the title for visual rhythm -->
    <line x1="${padX}" y1="${titleY + 130}" x2="${padX + 60}" y2="${titleY + 130}"
          stroke="${ACCENT}" stroke-width="3" stroke-linecap="round"/>

    <!-- Wordmark -->
    <text x="${padX}" y="${titleY}" font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
          font-size="86" font-weight="700" fill="${TEXT}" letter-spacing="-2">N3FitBook</text>

    <!-- Tagline -->
    <text x="${padX}" y="${titleY + 56}" font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
          font-size="36" font-weight="400" fill="#a1a1aa" letter-spacing="-0.5">All-in-One Gym Management Platform</text>

    <!-- Sub-tagline / value prop -->
    <text x="${padX}" y="${titleY + 174}" font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
          font-size="22" font-weight="500" fill="#d4d4d8" letter-spacing="0.5">Members  ·  Billing  ·  Attendance  ·  WhatsApp Reminders</text>

    <!-- URL pinned bottom-left -->
    <text x="${padX}" y="${H - 60}" font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
          font-size="22" font-weight="500" fill="${ACCENT}">n3fitbook.in</text>
</svg>`);

    // Composite the logo on the right side of the SVG canvas.
    const logoX = W - padX - LOGO_SIZE;
    const logoY = (H - LOGO_SIZE) / 2;

    await sharp(svg)
        .composite([{ input: logoBuf, top: Math.round(logoY), left: Math.round(logoX) }])
        .png({ compressionLevel: 9 })
        .toFile(OUT);

    const size = fs.statSync(OUT).size;
    console.log(`og-image.png: ${W}×${H} (${(size / 1024).toFixed(1)} KB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
