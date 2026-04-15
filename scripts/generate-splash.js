#!/usr/bin/env node
/*
 * Generates iOS apple-touch-startup-image PNGs from public/n3fitbook.svg.
 * Run manually when the logo changes: `npm run generate-splash`.
 *
 * Each PNG is a #262626 canvas with the logo centered at ~35% of the
 * shorter edge — matches manifest.background_color and the in-app sidebar,
 * so the launch screen blends seamlessly into the app shell.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SRC_SVG = path.join(ROOT, 'public', 'n3fitbook.svg');
const OUT_DIR = path.join(ROOT, 'public', 'splash');
const BG = { r: 0x26, g: 0x26, b: 0x26, alpha: 1 };
const LOGO_RATIO = 0.35;

const DEVICES = [
    { name: 'iphone-14-pro-max', w: 1290, h: 2796 },
    { name: 'iphone-14-pro', w: 1179, h: 2556 },
    { name: 'iphone-14-plus', w: 1284, h: 2778 },
    { name: 'iphone-14', w: 1170, h: 2532 },
    { name: 'iphone-13-mini', w: 1125, h: 2436 },
    { name: 'iphone-11-pro-max', w: 1242, h: 2688 },
    { name: 'iphone-11', w: 828, h: 1792 },
    { name: 'iphone-8-plus', w: 1242, h: 2208 },
    { name: 'iphone-8', w: 750, h: 1334 },
    { name: 'ipad-pro-12', w: 2048, h: 2732 },
    { name: 'ipad-pro-11', w: 1668, h: 2388 },
    { name: 'ipad-mini', w: 1536, h: 2048 },
];

async function main() {
    if (!fs.existsSync(SRC_SVG)) {
        console.error(`Source SVG not found: ${SRC_SVG}`);
        process.exit(1);
    }
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const svg = fs.readFileSync(SRC_SVG);

    for (const d of DEVICES) {
        const logoSize = Math.round(Math.min(d.w, d.h) * LOGO_RATIO);
        const logoPng = await sharp(svg, { density: 384 })
            .resize(logoSize, logoSize, { fit: 'contain', background: BG })
            .png()
            .toBuffer();

        const outFile = path.join(OUT_DIR, `${d.name}.png`);
        await sharp({
            create: {
                width: d.w,
                height: d.h,
                channels: 4,
                background: BG,
            },
        })
            .composite([{ input: logoPng, gravity: 'center' }])
            .png({ compressionLevel: 9, adaptiveFiltering: true })
            .toFile(outFile);

        const bytes = fs.statSync(outFile).size;
        console.log(`  ${d.name}.png  ${d.w}x${d.h}  ${(bytes / 1024).toFixed(1)} KB`);
    }

    console.log(`\nWrote ${DEVICES.length} splash images to ${path.relative(ROOT, OUT_DIR)}/`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
