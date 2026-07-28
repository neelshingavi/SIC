import sharp from 'sharp';
import fs from 'fs/promises';

async function optimizeImages() {
  const targets = [
    { in: 'public/images/red-texture.jpg', out: 'public/images/red-texture', maxWidth: 1600 },
    { in: 'public/images/logo.png',        out: 'public/images/logo',        maxWidth: 300  },
    { in: 'public/images/red-curtain.png', out: 'public/images/red-curtain', maxWidth: 1600 },
  ];

  for (const t of targets) {
    try {
      await fs.access(t.in);
    } catch (e) {
      console.log(`${t.in} not found, skipping.`);
      continue;
    }
    
    console.log(`Optimizing ${t.in}...`);
    await sharp(t.in).resize({ width: t.maxWidth }).avif({ quality: 60 }).toFile(`${t.out}.avif`);
    await sharp(t.in).resize({ width: t.maxWidth }).webp({ quality: 75 }).toFile(`${t.out}.webp`);
    // logo also needs a small PNG fallback for older Safari
    if (t.in.endsWith('.png')) {
      await sharp(t.in).resize({ width: t.maxWidth }).png({ quality: 80, compressionLevel: 9 }).toFile(`${t.out}-optimized.png`);
    }
  }
  console.log('Optimization complete.');
}

optimizeImages().catch(console.error);
