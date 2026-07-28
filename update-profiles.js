import fs from 'fs/promises';

async function updateProfileCards() {
  const htmlPath = './index.html';
  let html = await fs.readFile(htmlPath, 'utf8');

  // We want to insert the link before the closing </a> of the profile card.
  // Profile card has `<div class="profile-info"> ... </div></a>`
  html = html.replace(
    /(<\/div>)\s*(<\/a>\s*<!-- end profile card -->)/g,
    `$1\n              <a href="https://www.linkedin.com/in/neel-shingavi/" target="_blank" class="expanded-linkedin-link" onclick="event.stopPropagation()">View LinkedIn &rarr;</a>\n            $2`
  );
  
  // Wait, there's no <!-- end profile card --> comment. 
  // Let's just look at the exact structure: 
  // <div class="profile-info">
  //   <h4>Neel Shingavi</h4>
  //   <p>Overall Coordinator</p>
  // </div>
  // </a>
  html = html.replace(
    /(<div class="profile-info">[\s\S]*?<\/div>)\s*<\/a>/g,
    `$1\n              <a href="https://www.linkedin.com/in/neel-shingavi/" target="_blank" class="expanded-linkedin-link" onclick="event.stopPropagation()">View LinkedIn &rarr;</a>\n            </a>`
  );

  await fs.writeFile(htmlPath, html);
  console.log('Profile cards updated with LinkedIn link.');
}

updateProfileCards().catch(console.error);
