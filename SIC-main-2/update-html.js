import fs from 'fs/promises';

async function updateHtml() {
  const htmlPath = './index.html';
  let html = await fs.readFile(htmlPath, 'utf8');

  // Replace about_image.png
  html = html.replace(
    /<img src="\/images\/about_image\.png"([^>]+)>/g,
    `<picture>
      <source srcset="/images/about_image.avif" type="image/avif">
      <source srcset="/images/about_image.webp" type="image/webp">
      <img src="/images/about_image.png"$1>
    </picture>`
  );

  // Replace startup_image.png
  html = html.replace(
    /<img src="\/images\/startup_image\.png"([^>]+)>/g,
    `<picture>
      <source srcset="/images/startup_image.avif" type="image/avif">
      <source srcset="/images/startup_image.webp" type="image/webp">
      <img src="/images/startup_image.png"$1>
    </picture>`
  );

  // Replace team_image.png
  html = html.replace(
    /<img src="\/images\/team_image\.png"([^>]+)>/g,
    `<picture>
      <source srcset="/images/team_image.avif" type="image/avif">
      <source srcset="/images/team_image.webp" type="image/webp">
      <img src="/images/team_image.png"$1>
    </picture>`
  );

  await fs.writeFile(htmlPath, html);
  console.log('HTML updated.');
}

updateHtml().catch(console.error);
