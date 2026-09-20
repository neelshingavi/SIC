// scripts/generate-responsive-images.js
// Generates width-variant AVIF/WebP sources for photo assets so mobile
// devices download an image sized for their viewport instead of the
// same file shipped to a 1920px desktop.
//
// Run once (and again whenever a source photo changes):
//   npm run images:responsive
//
// Output naming matches what index.html / leadership.js expect:
//   about_image-400.avif, about_image-800.avif, about_image-1200.avif, etc.

import sharp from 'sharp';
import fs from 'fs/promises';

// Each target's `widths` should cover: smallest realistic mobile display
// size, a mid/tablet size, and the largest size the image is ever shown
// at on desktop (no point generating anything larger than that).
const targets = [
  {
    in: 'public/images/about_image.png',
    out: 'public/images/about_image',
    widths: [400, 800, 1200], // shown up to ~600px in the About 2-col grid, 2x for retina
  },
  {
    in: 'public/images/startup_image.png',
    out: 'public/images/startup_image',
    widths: [480, 800, 1200], // 85vw on phones, 45vw on desktop (up to ~900px on large screens)
  },
  {
    in: 'public/images/team_image.png',
    out: 'public/images/team_image',
    widths: [300, 600, 900], // leadership cards are small (~170–300px) even on desktop
  },
];

async function generate() {
  for (const t of targets) {
    try {
      await fs.access(t.in);
    } catch {
      console.log(`${t.in} not found, skipping.`);
      continue;
    }

    console.log(`Generating responsive sources for ${t.in}...`);
    for (const width of t.widths) {
      await sharp(t.in)
        .resize({ width, withoutEnlargement: true })
        .avif({ quality: 60 })
        .toFile(`${t.out}-${width}.avif`);

      await sharp(t.in)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(`${t.out}-${width}.webp`);
    }
  }
  console.log('Responsive image generation complete.');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
