import gsap from 'gsap';

let cursorDot = null;
let cursorOutline = null;
let moveHandler = null;
let downHandler = null;
let upHandler = null;
let magneticListeners = [];

export function initCursor(reduceMotion = false) {
  cursorDot = document.querySelector('.cursor-dot');
  cursorOutline = document.querySelector('.cursor-outline');

  // Disable on touch devices or if reduced motion is preferred
  const isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
  if (!cursorDot || !cursorOutline || reduceMotion || isTouch) {
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorOutline) cursorOutline.style.display = 'none';
    return;
  }

  const outlineX = gsap.quickTo(cursorOutline, "x", { duration: 0.15, ease: "power2.out" });
  const outlineY = gsap.quickTo(cursorOutline, "y", { duration: 0.15, ease: "power2.out" });

  moveHandler = (e) => {
    gsap.set(cursorDot, { x: e.clientX, y: e.clientY });
    outlineX(e.clientX);
    outlineY(e.clientY);
  };

  downHandler = () => cursorOutline.classList.add('clicking');
  upHandler = () => cursorOutline.classList.remove('clicking');

  document.addEventListener('mousemove', moveHandler, { passive: true });
  document.addEventListener('mousedown', downHandler);
  document.addEventListener('mouseup', upHandler);

  const magneticElements = document.querySelectorAll('.nav-link, .btn-nav, .logo, .link-arrow, .btn-primary, .profile-card, .portfolio-item, .footer-links a');
  
  magneticElements.forEach((el) => {
    const enter = () => {
      cursorDot.classList.add('hidden');
      if (el.classList.contains('portfolio-item')) {
        cursorOutline.classList.add('view-mode');
      } else if (el.classList.contains('profile-card')) {
        cursorOutline.classList.add('profile-mode');
      } else {
        cursorOutline.classList.add('hovered');
      }
    };

    const leave = () => {
      cursorDot.classList.remove('hidden');
      cursorOutline.classList.remove('hovered');
      cursorOutline.classList.remove('view-mode');
      cursorOutline.classList.remove('profile-mode');
      if (!el.classList.contains('profile-card') && !el.classList.contains('portfolio-item')) {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      }
    };

    const move = (e) => {
      if (el.classList.contains('portfolio-item') || el.classList.contains('profile-card')) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.5, ease: 'power2.out' });
    };

    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    el.addEventListener('mousemove', move);

    magneticListeners.push({ el, enter, leave, move });
  });
}

export function destroyCursor() {
  if (moveHandler) document.removeEventListener('mousemove', moveHandler);
  if (downHandler) document.removeEventListener('mousedown', downHandler);
  if (upHandler) document.removeEventListener('mouseup', upHandler);

  magneticListeners.forEach(({ el, enter, leave, move }) => {
    el.removeEventListener('mouseenter', enter);
    el.removeEventListener('mouseleave', leave);
    el.removeEventListener('mousemove', move);
  });
  magneticListeners = [];
}
