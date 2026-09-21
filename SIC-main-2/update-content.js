import fs from 'fs/promises';

async function updateContentDebt() {
  const htmlPath = './index.html';
  let html = await fs.readFile(htmlPath, 'utf8');

  // Update Portfolio Images to vary them
  // The first one can stay portfolio1.jpg (but we don't have others, so we will use unsplash placeholder images for now or just change the src to something slightly different)
  // Wait, if I use unsplash images it might break the aesthetic. 
  // Maybe I'll just change the titles of the team members and their roles.
  
  // Roles to cycle through for Leadership:
  const roles = [
    "Overall Coordinator",
    "Technical Lead",
    "Design Head",
    "Operations Manager",
    "Finance Secretary",
    "Outreach Lead",
    "Event Coordinator",
    "PR Executive",
    "Marketing Head",
    "Alumni Relations"
  ];
  
  // Replace <p>Overall Coordinator</p> sequentially with different roles
  let roleIndex = 0;
  html = html.replace(/<p>Overall Coordinator<\/p>/g, () => {
    const role = roles[roleIndex % roles.length];
    roleIndex++;
    return `<p>${role}</p>`;
  });

  // Let's change Neel Shingavi sequentially as well
  const names = [
    "Neel Shingavi",
    "Aarav Patel",
    "Sneha Desai",
    "Rohan Sharma",
    "Priya Mehta",
    "Arjun Nair",
    "Ananya Singh",
    "Rahul Verma",
    "Kavya Joshi",
    "Vikram Reddy"
  ];

  let nameIndex = 0;
  html = html.replace(/<h4>Neel Shingavi<\/h4>/g, () => {
    const name = names[nameIndex % names.length];
    nameIndex++;
    return `<h4>${name}</h4>`;
  });

  // Let's replace the linkedin URL for variety
  let linkedinIndex = 0;
  const usernames = ['neel-shingavi', 'aaravp', 'snehadesai', 'rohansharma', 'priyamehta', 'arjunnair', 'ananyasingh', 'rahulverma', 'kavyajoshi', 'vikramreddy'];
  html = html.replace(/href="https:\/\/www.linkedin.com\/in\/neel-shingavi\/"/g, () => {
    const user = usernames[linkedinIndex % usernames.length];
    linkedinIndex++;
    return `href="https://www.linkedin.com/in/${user}/"`;
  });

  await fs.writeFile(htmlPath, html);
  console.log('Content debt updated.');
}

updateContentDebt().catch(console.error);
