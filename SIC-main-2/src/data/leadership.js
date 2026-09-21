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
    role: 'public relations head',
    linkedin: '',
    email: '',
    photo: {
      avif: '/images/council/siddhant-patil.avif',
      webp: '/images/council/siddhant-patil.webp',
      png: '/images/council/siddhant-patil.png',
    },
  },
  {
    name: 'Tanvi Malviya',
    role: 'general secretary',
    linkedin: '',
    email: '',
    photo: {
      avif: '/images/council/tanvi-malviya.avif',
      webp: '/images/council/tanvi-malviya.webp',
      png: '/images/council/tanvi-malviya.png',
    },
  },
  {
    name: 'Ameya Surve',
    role: 'President',
    linkedin: '',
    email: '',
    photo: {
      avif: '/images/council/ameya-surve.avif',
      webp: '/images/council/ameya-surve.webp',
      png: '/images/council/ameya-surve.png',
    },
  },
  {
    name: 'Neel Shingavi',
    role: 'Technical Head',
    linkedin: '',
    email: '',
    photo: {
      avif: '/images/council/neel-shingavi.avif',
      webp: '/images/council/neel-shingavi.webp',
      png: '/images/council/neel-shingavi.png',
    },
  },
  {
    name: 'Shrawani Chowkone',
    role: 'Video Editing Head',
    linkedin: '',
    email: '',
    photo: {
      avif: '/images/council/shrawani-chowkone.avif',
      webp: '/images/council/shrawani-chowkone.webp',
      png: '/images/council/shrawani-chowkone.png',
    },
  },
  {
    name: 'Aditya Birajdar',
    role: 'Events Head',
    linkedin: '',
    email: '',
    photo: {
      avif: '/images/council/aditya-birajdar.avif',
      webp: '/images/council/aditya-birajdar.webp',
      png: '/images/council/aditya-birajdar.png',
    },
  },
  {
    name: 'Shrawani Nikam',
    role: 'Social Media Head',
    linkedin: '',
    email: '',
    photo: {
      avif: '/images/council/shrawani-nikam.avif',
      webp: '/images/council/shrawani-nikam.webp',
      png: '/images/council/shrawani-nikam.png',
    },
  },
  {
    name: 'Ahan Mhadgut',
    role: 'Content Head',
    linkedin: '',
    email: '',
    photo: {
      avif: '/images/council/ahan-mhadgut.avif',
      webp: '/images/council/ahan-mhadgut.webp',
      png: '/images/council/ahan-mhadgut.png',
    },
  },
  {
    name: 'Amisha Mamtani',
    role: 'Marketing Head',
    linkedin: '',
    email: '',
    photo: {
      avif: '/images/council/amisha-mamtani.avif',
      webp: '/images/council/amisha-mamtani.webp',
      png: '/images/council/amisha-mamtani.png',
    },
  },
  {
    name: 'Anushtubh Ghasing',
    role: 'Marketing Head',
    linkedin: '',
    email: '',
    photo: {
      avif: '/images/council/anushtubh-ghasing.avif',
      webp: '/images/council/anushtubh-ghasing.webp',
      png: '/images/council/anushtubh-ghasing.png',
    },
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
