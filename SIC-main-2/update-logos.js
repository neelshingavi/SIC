import fs from 'fs/promises';

async function updateLogos() {
  const htmlPath = './index.html';
  let html = await fs.readFile(htmlPath, 'utf8');

  html = html.replace(
    /<img src="\/images\/logo\.png"([^>]+)>/g,
    `<picture>
      <source srcset="/images/logo.avif" type="image/avif">
      <source srcset="/images/logo.webp" type="image/webp">
      <img src="/images/logo-optimized.png"$1>
    </picture>`
  );

  await fs.writeFile(htmlPath, html);
  console.log('Logo HTML updated.');
}

updateLogos().catch(console.error);
