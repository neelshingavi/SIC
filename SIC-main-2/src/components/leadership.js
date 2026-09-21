import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createIcons, Mail } from 'lucide';
import { LEADERSHIP_TEAM, getMemberPhoto } from '../data/leadership.js';

const LINKEDIN_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
`;

// Derives width-variant filenames (e.g. /images/team_image.avif ->
// /images/team_image-300.avif) matching scripts/generate-responsive-images.js output.
function withWidth(path, width) {
  const idx = path.lastIndexOf('.');
  return `${path.slice(0, idx)}-${width}${path.slice(idx)}`;
}

function buildSrcset(path, widths) {
  return widths.map((w) => `${withWidth(path, w)} ${w}w`).join(', ');
}

const CARD_WIDTHS = [300, 600, 900];
// Leadership cards run 5-across on desktop (~220-280px) down to 2-across on
// phones (~40-45vw) — see .leadership-grid breakpoints in style.css.
const CARD_SIZES = '(max-width: 768px) 42vw, (max-width: 1400px) 22vw, 220px';

function renderPhoto(member) {
  const photo = getMemberPhoto(member);
  return `
    <picture>
      <source srcset="${buildSrcset(photo.avif, CARD_WIDTHS)}" sizes="${CARD_SIZES}" type="image/avif">
      <source srcset="${buildSrcset(photo.webp, CARD_WIDTHS)}" sizes="${CARD_SIZES}" type="image/webp">
      <img src="${photo.png}" alt="${member.name}" width="400" height="533" loading="lazy">
    </picture>
  `;
}

function renderActionButtons(member) {
  const buttons = [];

  if (member.linkedin) {
    buttons.push(`
      <a
        href="${member.linkedin}"
        class="profile-action-btn profile-action-btn--linkedin"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn profile of ${member.name}"
      >
        ${LINKEDIN_ICON}
      </a>
    `);
  }

  if (member.email) {
    const emailHref = member.email.startsWith('mailto:') ? member.email : `mailto:${member.email}`;
    buttons.push(`
      <a
        href="${emailHref}"
        class="profile-action-btn profile-action-btn--mail"
        aria-label="Email ${member.name}"
      >
        <i data-lucide="mail"></i>
      </a>
    `);
  }

  if (!buttons.length) return '';

  return `<div class="profile-actions" aria-label="Contact links for ${member.name}">${buttons.join('')}</div>`;
}

function renderCard(member) {
  return `
    <article class="profile-card" tabindex="0" role="group" aria-label="${member.name}, ${member.role}">
      <div class="profile-img-wrapper">
        ${renderPhoto(member)}
      </div>
      <div class="profile-card-overlay" aria-hidden="true"></div>
      <div class="profile-info">
        <h4>${member.name}</h4>
        <p>${member.role}</p>
        ${renderActionButtons(member)}
      </div>
    </article>
  `;
}

export function initLeadership(reduceMotion = false) {
  const grid = document.getElementById('leadership-grid');
  if (!grid) return;

  grid.innerHTML = LEADERSHIP_TEAM.map(renderCard).join('');

  // Render Lucide mail icons only within the newly injected grid
  // (avoids re-processing existing page icons)
  createIcons({
    icons: { Mail },
    attrs: {
      'stroke-width': 2,
    },
    nameAttr: 'data-lucide',
  });

  const cards = grid.querySelectorAll('.profile-card');
  if (!cards.length) return;

  if (!reduceMotion) {
    gsap.fromTo(
      cards,
      { y: 50, opacity: 0, scale: 0.92 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.07,
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
        },
      }
    );
  } else {
    gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
  }
}

export function destroyLeadership() {
  ScrollTrigger.getAll().forEach((trigger) => {
    if (trigger.vars?.trigger === document.getElementById('leadership-grid')) {
      trigger.kill();
    }
  });
}
