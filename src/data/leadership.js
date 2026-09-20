/**
 * Leadership team — source of truth for the Leadership & Advisory grid.
 * Fields marked empty stay empty; UI hides missing LinkedIn / email buttons.
 *
 * FIXME: 7/10 roles are still 'XYZ Role'. linkedin/email are intentionally
 * blank (not guessed) until real, verified handles are collected for each
 * person — do not fill these with plausible-looking placeholders; a wrong
 * guess sends visitors to a stranger's LinkedIn profile or bounces email.
 * Update with real data before launch.
 */
export const LEADERSHIP_TEAM = [
  {
    name: 'Siddhant Patil',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: '',
    email: '',
    photo: {
      avif: '/images/team_image.avif',
      webp: '/images/team_image.webp',
      png: '/images/team_image.png',
    },
  },
  {
    name: 'Tanvi Malviya',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: '',
    email: '',
  },
  {
    name: 'Ameya Surve',
    role: 'President',
    linkedin: '',
    email: '',
  },
  {
    name: 'Neel Shingavi',
    role: 'Technical Head',
    linkedin: '',
    email: '',
  },
  {
    name: 'Shrawani Chowkone',
    role: 'Video Editing',
    linkedin: '',
    email: '',
  },
  {
    name: 'Aditya Birajdar',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: '',
    email: '',
  },
  {
    name: 'Shrawani Nikam',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: '',
    email: '',
  },
  {
    name: 'Ahan Mhadgut',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: '',
    email: '',
  },
  {
    name: 'Amisha Mamtani',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: '',
    email: '',
  },
  {
    name: 'Anushtubh Ghasing',
    role: 'XYZ Role', // TODO: fill in role
    linkedin: '',
    email: '',
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
