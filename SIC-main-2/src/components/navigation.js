import gsap from 'gsap';
import { Observer } from 'gsap/Observer';

let navObserver = null;
let drawerListeners = [];

function scrambleTextElement(el, targetText, duration = 400) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / duration;
    if (progress < 1) {
      el.textContent = targetText.split('').map((c, i) => {
        if (c === ' ') return ' ';
        return Math.random() < progress ? targetText[i] : chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      requestAnimationFrame(step);
    } else {
      el.textContent = targetText;
    }
  }
  requestAnimationFrame(step);
}

export function initNavigation(lenis = null, reduceMotion = false) {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    navObserver = Observer.create({
      target: window,
      type: 'wheel,touch,scroll',
      onUp: () => gsap.to(navbar, { yPercent: 0, duration: 0.4, ease: 'power2.out' }),
      onDown: (self) => {
        if (self.scrollY() > 120) {
          gsap.to(navbar, { yPercent: -100, duration: 0.4, ease: 'power2.in' });
        }
      },
    });
  }

  if (!reduceMotion) {
    document.querySelectorAll('.nav-link').forEach((link) => {
      const handler = () => scrambleTextElement(link, link.textContent, 400);
      link.addEventListener('mouseenter', handler);
      drawerListeners.push({ el: link, type: 'mouseenter', handler });
    });
  }

  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('mobile-drawer');
  let drawerOpen = false;

  if (hamburger && drawer) {
    function closeDrawerA11y() {
      if (!drawerOpen) return;
      drawerOpen = false;
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      gsap.to('.hamburger span:nth-child(1)', { rotation: 0, y: 0, duration: 0.3, ease: 'power2.out' });
      gsap.to('.hamburger span:nth-child(2)', { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to('.hamburger span:nth-child(3)', { rotation: 0, y: 0, duration: 0.3, ease: 'power2.out' });

      gsap.to(drawer, { xPercent: 100, duration: 0.6, ease: 'power4.inOut' });
      document.body.style.overflow = '';
      if (lenis) lenis.start();
      hamburger.focus();
      document.removeEventListener('keydown', onDrawerKeydown);
    }

    function onDrawerKeydown(e) {
      if (e.key === 'Escape') closeDrawerA11y();
      if (e.key === 'Tab') {
        const focusables = drawer.querySelectorAll('a, button, [tabindex]');
        const list = Array.from(focusables);
        if (!list.length) return;
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    const hamClick = () => {
      if (drawerOpen) {
        closeDrawerA11y();
      } else {
        drawerOpen = true;
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        drawer.setAttribute('aria-hidden', 'false');
        gsap.to('.hamburger span:nth-child(1)', { rotation: 45, y: 7, duration: 0.3, ease: 'power2.inOut' });
        gsap.to('.hamburger span:nth-child(2)', { opacity: 0, duration: 0.15, ease: 'power2.in' });
        gsap.to('.hamburger span:nth-child(3)', { rotation: -45, y: -7, duration: 0.3, ease: 'power2.inOut' });

        gsap.to(drawer, { xPercent: 0, duration: 0.6, ease: 'power4.inOut' });
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();

        document.addEventListener('keydown', onDrawerKeydown);
        const firstLink = drawer.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    };

    hamburger.addEventListener('click', hamClick);
    drawerListeners.push({ el: hamburger, type: 'click', handler: hamClick });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawerA11y);
      drawerListeners.push({ el: link, type: 'click', handler: closeDrawerA11y });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    const anchorClick = function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, {
            offset: -80,
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    anchor.addEventListener('click', anchorClick);
    drawerListeners.push({ el: anchor, type: 'click', handler: anchorClick });
  });
}

export function destroyNavigation() {
  if (navObserver) {
    navObserver.kill();
    navObserver = null;
  }
  drawerListeners.forEach(({ el, type, handler }) => {
    el.removeEventListener(type, handler);
  });
  drawerListeners = [];
}
