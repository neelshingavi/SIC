import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function convertImages() {
  const imagesDir = './public/images';
  const files = ['about_image.png', 'startup_image.png', 'team_image.png'];
  
  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    try {
      await fs.access(filePath);
    } catch (e) {
      console.log(`${file} not found, skipping.`);
      continue;
    }
    
    const parsed = path.parse(filePath);
    const webpPath = path.join(imagesDir, `${parsed.name}.webp`);
    const avifPath = path.join(imagesDir, `${parsed.name}.avif`);
    
    console.log(`Converting ${file} to WebP and AVIF...`);
    
    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(webpPath);
      
    await sharp(filePath)
      .avif({ quality: 75 })
      .toFile(avifPath);
      
    console.log(`Finished ${file}`);
  }
}

convertImages().catch(console.error);
