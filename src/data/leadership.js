/**
 * Leadership team — source of truth for the Leadership & Advisory grid.
 * Fields marked empty stay empty; UI hides missing LinkedIn / email buttons.
 */
export const LEADERSHIP_TEAM = [
  {
    name: 'Siddhant Patil',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: 'https://www.linkedin.com/in/neel-shingavi/',
    email: 'mailto:placeholder@domain.com',
    photo: {
      avif: '/images/team_image.avif',
      webp: '/images/team_image.webp',
      png: '/images/team_image.png',
    },
  },
  {
    name: 'Tanvi Malviya',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: 'https://www.linkedin.com/in/snehadesai/',
    email: 'mailto:placeholder@domain.com',
  },
  {
    name: 'Ameya Surve',
    role: 'President',
    linkedin: 'https://www.linkedin.com/in/priyamehta/',
    email: 'mailto:placeholder@domain.com',
  },
  {
    name: 'Neel Shingavi',
    role: 'Technical Head',
    linkedin: 'https://www.linkedin.com/in/ananyasingh/',
    email: 'mailto:placeholder@domain.com',
  },
  {
    name: 'Shrawani Chowkone',
    role: 'Video Editing',
    linkedin: 'https://www.linkedin.com/in/kavyajoshi/',
    email: 'mailto:placeholder@domain.com',
  },
  {
    name: 'Aditya Birajdar',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: 'https://www.linkedin.com/in/neel-shingavi/',
    email: 'mailto:placeholder@domain.com',
  },
  {
    name: 'Shrawani Nikam',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: 'https://www.linkedin.com/in/snehadesai/',
    email: 'mailto:placeholder@domain.com',
  },
  {
    name: 'Ahan Mhadgut',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: 'https://www.linkedin.com/in/priyamehta/',
    email: 'mailto:placeholder@domain.com',
  },
  {
    name: 'Amisha Mamtani',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: 'https://www.linkedin.com/in/ananyasingh/',
    email: 'mailto:placeholder@domain.com',
  },
  {
    name: 'Anushtubh Ghasing',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: 'https://www.linkedin.com/in/kavyajoshi/',
    email: 'mailto:placeholder@domain.com',
  },
];

const DEFAULT_PHOTO = {
  avif: '/images/team_image.avif',
  webp: '/images/team_image.webp',
  png: '/images/team_image.png',
};

export function getMemberPhoto(member) {
  return member.photo ?? DEFAULT_PHOTO;
}
