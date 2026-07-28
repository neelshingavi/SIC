// =====================================================================
// SIC PICT — Main Application Bootstrapper
// Modularized, resilient, and performant subsystem orchestration
// =====================================================================

import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import Lenis from 'lenis';
import { createIcons, ArrowRight, Rocket, Lightbulb, Users, CheckCircle } from 'lucide';
import { initGrain } from './grain.js';
import { initHeroDistortion } from './hero-distortion.js';
import { initPortfolioDistortion } from './portfolio-distortion.js';
import { initConstellation } from './constellation.js';
import { initEcosystem } from './ecosystem.js';
import { sound } from './sound.js';

import { initCursor, destroyCursor } from './cursor.js';
import { initMetrics, destroyMetrics } from './metrics.js';
import { initPortfolio, destroyPortfolio } from './portfolio.js';
import { initNavigation, destroyNavigation } from './navigation.js';

gsap.registerPlugin(ScrollTrigger, Flip, Observer);

// =====================================================================
// GLOBAL ACCESSIBILITY & MOTION
// =====================================================================
let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
rmQuery.addEventListener('change', (e) => {
  reduceMotion = e.matches;
});

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

createIcons({ icons: { ArrowRight, Rocket, Lightbulb, Users, CheckCircle } });

// =====================================================================
// VANILLA FALLBACK UTILITIES
// =====================================================================
function splitTextNodes(element) {
  if (!element) return { words: [], revert: () => {} };
  const words = element.textContent.trim().split(/\s+/);
  element.innerHTML = '';
  const wordElements = [];
  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.textContent = word + (index < words.length - 1 ? '\u00A0' : '');
    element.appendChild(span);
    wordElements.push(span);
  });
  return {
    words: wordElements,
    revert: () => {
      element.innerHTML = '';
      element.textContent = words.join(' ');
    }
  };
}

function initDrawSVG(paths) {
  paths.forEach(path => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
  });
}

function animateDrawSVG(paths, vars) {
  const { duration, ease, stagger, scrollTrigger, onComplete } = vars;
  return gsap.to(paths, {
    strokeDashoffset: 0,
    duration, ease, stagger, scrollTrigger, onComplete
  });
}

// =====================================================================
// CONSOLE EASTER EGG
// =====================================================================
if (import.meta.env.DEV) {
  console.log('%c SIC PICT ', 'background:#8E1619;color:#D2A855;font-size:20px;font-weight:bold;padding:8px 16px;border-radius:4px;');
  console.log('%cLike reading code? So do we. Join the tech team → mailto:sic@pict.edu', 'color:#D2A855;font-size:13px;');
}

// =====================================================================
// SMOOTH SCROLLING (Lenis)
// =====================================================================
let lenis = null;
function updateLenis(time) {
  if (lenis) lenis.raf(time * 1000);
}

if (!reduceMotion) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(updateLenis);
  gsap.ticker.lagSmoothing(0);
}

// =====================================================================
// PRELOADER
// =====================================================================
const preloader = document.getElementById('preloader');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const loaderContent = document.querySelector('.loader-content');
const skipBtn = document.getElementById('skip-intro');
const seenIntro = sessionStorage.getItem('sic_intro_seen');

let introSkipped = false;
let curtainTl;
let loadingTween;

function skipToMain() {
  if (introSkipped) return;
  introSkipped = true;
  
  if (loadingTween) loadingTween.kill();
  if (curtainTl) curtainTl.kill();

  curtainTl = gsap.timeline({
    onComplete: () => {
      if (preloader) preloader.style.display = 'none';
      gsap.set('.curtain-left', { xPercent: -101 });
      gsap.set('.curtain-right', { xPercent: 101 });
      initAnimations();
    }
  });

  curtainTl
    .set('.curtain-left', { xPercent: -101 })
    .set('.curtain-right', { xPercent: 101 })
    .to('.curtain-left', { xPercent: 0, duration: 0.6, ease: 'power3.inOut' }, 0)
    .to('.curtain-right', { xPercent: 0, duration: 0.6, ease: 'power3.inOut' }, 0)
    .set(preloader, { opacity: 0 })
    .to('.curtain-left', { xPercent: -101, duration: 0.8, ease: 'expo.inOut' }, '+=0.1')
    .to('.curtain-right', { xPercent: 101, duration: 0.8, ease: 'expo.inOut' }, '<');

  sessionStorage.setItem('sic_intro_seen', '1');
}

if (seenIntro || reduceMotion) {
  if (preloader) preloader.style.display = 'none';
  window.addEventListener('load', initAnimations);
} else {
  if (skipBtn) {
    skipBtn.addEventListener('click', skipToMain);
    gsap.to(skipBtn, { opacity: 1, delay: 0.8, duration: 0.4 });
  }

  let progressObj = { val: 0 };
  
  loadingTween = gsap.to(progressObj, {
    val: 90,
    duration: 3,
    ease: 'power1.out',
    onUpdate: () => {
      if (introSkipped) return;
      if (progressText) progressText.innerText = Math.floor(progressObj.val) + '%';
      if (progressBar) progressBar.style.width = progressObj.val + '%';
    }
  });

  window.addEventListener('load', () => {
    if (introSkipped) return;
    if (loadingTween) loadingTween.kill();
    
    gsap.to(progressObj, {
      val: 100,
      duration: 0.4,
      ease: 'power2.out',
      onUpdate: () => {
        if (introSkipped) return;
        if (progressText) progressText.innerText = Math.floor(progressObj.val) + '%';
        if (progressBar) progressBar.style.width = progressObj.val + '%';
      },
      onComplete: finishPreloader
    });
  });
}

function finishPreloader() {
  if (introSkipped) return;

  gsap.to(loaderContent, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      if (introSkipped) return;
      if (loaderContent) loaderContent.style.display = 'none';

      const introContainer = document.querySelector('.intro-animation-container');
      if (introContainer) {
        introContainer.style.display = 'flex';

        const lines = document.querySelectorAll('.intro-line');
        lines.forEach(line => {
          const text = line.textContent.trim();
          line.innerHTML = '';
          const span = document.createElement('span');
          span.className = 'intro-text';
          span.textContent = text;
          line.appendChild(span);
        });

        const tl = gsap.timeline({
          onComplete: () => {
            if (introSkipped) return;
            const heroContainer = document.querySelector('.hero-container');

            if (heroContainer) {
              gsap.set(heroContainer, { scale: 1.1 });
            }

            curtainTl = gsap.timeline({
              onComplete: () => {
                if (preloader) preloader.style.display = 'none';
                gsap.set('.curtain-left', { xPercent: -101 });
                gsap.set('.curtain-right', { xPercent: 101 });
                sessionStorage.setItem('sic_intro_seen', '1');
                initAnimations();
              }
            });

            curtainTl
              .set('.curtain-left', { xPercent: -101 })
              .set('.curtain-right', { xPercent: 101 })
              .to('.curtain-left', { xPercent: 0, duration: 0.5, ease: 'power3.inOut' }, 0)
              .to('.curtain-right', { xPercent: 0, duration: 0.5, ease: 'power3.inOut' }, 0)
              .set(preloader, { display: 'none' })
              .to('.curtain-left', { xPercent: -101, duration: 1.2, ease: 'expo.inOut' }, '+=0.05')
              .to('.curtain-right', { xPercent: 101, duration: 1.2, ease: 'expo.inOut' }, '<');

            if (heroContainer) {
              curtainTl.to(heroContainer, {
                scale: 1,
                duration: 1.4,
                ease: 'expo.inOut'
              }, '<');
            }
          }
        });

        tl.fromTo('.intro-line .intro-text', {
          yPercent: 120,
          rotation: 5,
          opacity: 0
        }, {
          yPercent: 0,
          rotation: 0,
          opacity: 1,
          duration: 1.4,
          ease: 'expo.out',
          stagger: 0.15
        })
          .to('.intro-line .intro-text', {
            yPercent: -120,
            rotation: -3,
            opacity: 0,
            duration: 0.9,
            ease: 'expo.in',
            stagger: 0.1,
            delay: 0.5
          });
      } else {
        if (preloader) preloader.style.opacity = '0';
        setTimeout(() => {
          if (preloader) preloader.style.display = 'none';
          initAnimations();
        }, 600);
      }
    }
  });
}

// =====================================================================
// SUBSYSTEM ORCHESTRATOR
// =====================================================================
function initAnimations() {
  initWebGL();
  initEcosystem();
  initHero();
  initHeadings();
  initMetrics(reduceMotion);
  initPortfolio(reduceMotion);
  initCursor(reduceMotion);
  initNavigation(lenis, reduceMotion);
  initParallax();
  initLeadership();
  initForm();
  initEasterEggsAndSounds();
  initScrollReveals();
  initVelocityMarquees();
  setupRefreshWatchers();
}

function initWebGL() {
  if (reduceMotion || !supportsWebGL()) return;
  
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    ScrollTrigger.create({
      trigger: heroEl,
      start: 'top bottom',
      once: true,
      onEnter: () => initGrain(0.045)
    });

    if (window.innerWidth > 992) {
      ScrollTrigger.create({
        trigger: heroEl,
        start: 'top bottom',
        once: true,
        onEnter: () => initHeroDistortion(heroEl)
      });
    }
  }

  const constellationCanvas = document.getElementById('constellation-canvas');
  if (constellationCanvas) {
    ScrollTrigger.create({
      trigger: constellationCanvas,
      start: 'top bottom',
      once: true,
      onEnter: () => initConstellation(constellationCanvas)
    });
  }
  
  document.querySelectorAll('.portfolio-img').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      once: true,
      onEnter: () => initPortfolioDistortion(el)
    });
  });
}

function initHero() {
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle) return;

  let mm = gsap.matchMedia();
  mm.add("(min-width: 992px)", () => {
    if (reduceMotion) {
      gsap.set('.hero-kicker, .hero-subtitle, .hero-actions a, .hero-title', { opacity: 1, y: 0 });
      return;
    }

    const heroTl = gsap.timeline();
    heroTl.fromTo('.hero-kicker',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    const splitObj = splitTextNodes(heroTitle);
    heroTl.from(splitObj.words, {
      y: 60,
      rotationZ: 6,
      opacity: 0,
      duration: 1.4,
      ease: 'expo.out',
      stagger: 0.08,
      onComplete: () => splitObj.revert()
    }, '-=0.5');

    heroTl.fromTo('.hero-subtitle',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
      '-=0.7'
    )
      .fromTo('.hero-actions a',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out' },
        '-=0.5'
      );
  });

  mm.add("(max-width: 991px)", () => {
    if (reduceMotion) {
      gsap.set('.hero-actions a', { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo('.hero-actions a',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out', delay: 0.5 }
    );
  });
}

function initHeadings() {
  const sectionHeadings = document.querySelectorAll('.section-heading');
  sectionHeadings.forEach(heading => {
    if (heading.closest('.hero')) return;

    if (!reduceMotion) {
      const splitObj = splitTextNodes(heading);
      gsap.from(splitObj.words, {
        y: 60,
        rotationZ: 8,
        opacity: 0,
        duration: 1.4,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: {
          trigger: heading,
          start: 'top 90%',
        },
        onComplete: () => splitObj.revert()
      });
    } else {
      gsap.set(heading, { opacity: 1, y: 0 });
    }
  });
}

function initParallax() {
  if (reduceMotion) return;

  const parallaxElements = document.querySelectorAll('[data-speed]');
  parallaxElements.forEach(el => {
    const speed = parseFloat(el.getAttribute('data-speed'));
    gsap.fromTo(el,
      { yPercent: -15 * speed },
      {
        yPercent: 15 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  });

  const imgBackdrop = document.querySelector('.img-backdrop');
  if (imgBackdrop) {
    gsap.to(imgBackdrop, {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-visual',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  requestAnimationFrame(() => {
    const checkIcons = document.querySelectorAll('.feature-list .icon-gold svg');
    checkIcons.forEach(svg => {
      const paths = svg.querySelectorAll('path, circle, polyline');
      if (paths.length > 0) {
        initDrawSVG(paths);
        animateDrawSVG(paths, {
          duration: 1.2,
          ease: 'power2.inOut',
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.feature-list',
            start: 'top 85%',
            once: true,
          }
        });
      }
    });
  });

  document.querySelectorAll('.initiative-card').forEach((card) => {
    const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    card.style.transformPerspective = '800px';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotY(px * 12);
      rotX(-py * 12);
    });
    card.addEventListener('mouseleave', () => {
      rotX(0);
      rotY(0);
    });
  });
}

function initLeadership() {
  const profileCards = document.querySelectorAll('.profile-card');
  if (!profileCards.length) return;

  if (!reduceMotion) {
    gsap.fromTo('.profile-card',
      { y: 60, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.grid-5-col',
          start: 'top 85%',
        },
      }
    );
  } else {
    gsap.set('.profile-card', { opacity: 1, y: 0, scale: 1 });
  }

  const flipBackdrop = document.createElement('div');
  flipBackdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1999;opacity:0;pointer-events:none;backdrop-filter:blur(4px);';
  document.body.appendChild(flipBackdrop);

  let currentExpandedCard = null;
  let lastFocusedTrigger = null;

  function collapseCardA11y() {
    document.removeEventListener('keydown', onExpandedKeydown);
    if (currentExpandedCard) {
      currentExpandedCard.removeAttribute('role');
      currentExpandedCard.removeAttribute('aria-modal');
      currentExpandedCard.removeAttribute('tabindex');
    }
    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
      lastFocusedTrigger = null;
    }
  }

  function onExpandedKeydown(e) {
    if (e.key === 'Escape') collapseCard();
    if (e.key === 'Tab' && currentExpandedCard) {
      const focusables = currentExpandedCard.querySelectorAll('a, button, [tabindex]');
      const list = Array.from(focusables);
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function collapseCard() {
    if (!currentExpandedCard) return;
    const card = currentExpandedCard;
    currentExpandedCard = null;

    collapseCardA11y();

    const doTransition = () => {
      gsap.to(flipBackdrop, { opacity: 0, duration: 0.3, onComplete: () => { flipBackdrop.style.pointerEvents = 'none'; } });
      const state = Flip.getState(card);
      card.classList.remove('is-expanded');
      gsap.set(card, { clearProps: 'top,left' });

      if (card._placeholder) card._placeholder.style.display = 'none';

      Flip.from(state, {
        duration: reduceMotion ? 0 : 0.55,
        ease: 'power3.inOut',
        absolute: true,
        onComplete: () => {
          if (card._placeholder) {
            card._placeholder.remove();
            card._placeholder = null;
          }
        }
      });

      if (card._placeholder) card._placeholder.style.display = 'block';
    };

    if (document.startViewTransition && !reduceMotion) {
      document.startViewTransition(doTransition);
    } else {
      doTransition();
    }
  }

  flipBackdrop.addEventListener('click', collapseCard);

  profileCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (card === currentExpandedCard) {
        e.preventDefault();
        collapseCard();
        return;
      }

      const expanded = document.querySelector('.profile-card.is-expanded');
      if (expanded && expanded !== card) {
        const prevState = Flip.getState(expanded);
        expanded.classList.remove('is-expanded');
        gsap.set(expanded, { clearProps: 'top,left' });

        if (expanded._placeholder) expanded._placeholder.style.display = 'none';

        currentExpandedCard = null;
        Flip.from(prevState, {
          duration: reduceMotion ? 0 : 0.3,
          ease: 'power2.in',
          absolute: true,
          onComplete: () => {
            if (expanded._placeholder) {
              expanded._placeholder.remove();
              expanded._placeholder = null;
            }
          }
        });

        if (expanded._placeholder) expanded._placeholder.style.display = 'block';
      }

      e.preventDefault();

      const doExpand = () => {
        currentExpandedCard = card;
        lastFocusedTrigger = document.activeElement;
        const state = Flip.getState(card);

        if (!card._placeholder) {
          const placeholder = document.createElement('div');
          placeholder.className = 'profile-placeholder';
          const rect = card.getBoundingClientRect();
          placeholder.style.width = rect.width + 'px';
          placeholder.style.height = rect.height + 'px';
          card.parentNode.insertBefore(placeholder, card);
          card._placeholder = placeholder;
        }

        card.classList.add('is-expanded');
        card.setAttribute('role', 'dialog');
        card.setAttribute('aria-modal', 'true');
        card.setAttribute('aria-label', card.querySelector('h4')?.textContent || 'Profile details');
        card.setAttribute('tabindex', '-1');

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cardW = Math.min(400, vw * 0.9);
        gsap.set(card, {
          top: (vh - card.offsetHeight) / 2,
          left: (vw - cardW) / 2,
        });

        Flip.from(state, { duration: reduceMotion ? 0 : 0.65, ease: 'power3.inOut', absolute: true });
        flipBackdrop.style.pointerEvents = 'auto';
        gsap.to(flipBackdrop, { opacity: 1, duration: 0.35 });

        card.focus();
        document.addEventListener('keydown', onExpandedKeydown);
      };

      if (document.startViewTransition && !reduceMotion) {
        document.startViewTransition(doExpand);
      } else {
        doExpand();
      }
    });
  });
}

function initForm() {
  const appForm = document.getElementById('application-form');
  const formSuccess = document.getElementById('form-success');
  if (!appForm || !formSuccess) return;

  document.querySelectorAll('.input-group input, .input-group textarea').forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim() !== '') input.classList.add('has-value');
      else input.classList.remove('has-value');
    });
  });

  const steps = Array.from(document.querySelectorAll('.form-step'));
  let currentStep = 0;

  function goToStep(index) {
    const state = Flip.getState(steps[currentStep]);
    steps[currentStep].style.display = 'none';
    steps[index].style.display = 'block';
    currentStep = index;
    Flip.from(state, { duration: reduceMotion ? 0 : 0.5, ease: 'power2.inOut' });
    gsap.to('.wizard-progress-fill', { scaleX: (index + 1) / steps.length, duration: reduceMotion ? 0 : 0.4, ease: 'power2.out' });
  }

  document.querySelectorAll('.step-next').forEach((btn) => {
    btn.addEventListener('click', () => {
      const currentFields = steps[currentStep].querySelectorAll('[required]');
      const valid = Array.from(currentFields).every(f => f.checkValidity());
      if (valid) goToStep(currentStep + 1);
      else {
        currentFields.forEach(f => {
          if (!f.checkValidity()) {
            const group = f.closest('.input-group');
            if (group) group.classList.add('shake');
            if (!reduceMotion) {
              gsap.to(f, {
                x: [-8, 8, -6, 6, 0],
                duration: 0.4,
                onComplete: () => { if (group) setTimeout(() => group.classList.remove('shake'), 1000); }
              });
            } else {
              if (group) setTimeout(() => group.classList.remove('shake'), 1000);
            }
          }
        });
      }
    });
  });

  document.querySelectorAll('.step-back').forEach(btn => {
    btn.addEventListener('click', () => goToStep(currentStep - 1));
  });

  appForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const requiredFields = appForm.querySelectorAll('[required]');
    let allValid = true;

    requiredFields.forEach(field => {
      const group = field.closest('.input-group');
      if (!field.value || !field.checkValidity()) {
        allValid = false;
        if (group) {
          group.classList.add('shake');
          if (!reduceMotion) {
            gsap.to(field, {
              x: [-8, 8, -6, 6, 0],
              duration: 0.4,
              onComplete: () => { setTimeout(() => group.classList.remove('shake'), 1000); }
            });
          } else {
            setTimeout(() => group.classList.remove('shake'), 1000);
          }
        }
      }
    });

    if (!allValid) return;

    gsap.to(appForm, {
      opacity: 0,
      y: -20,
      duration: reduceMotion ? 0 : 0.5,
      ease: 'power2.in',
      onComplete: () => {
        appForm.style.display = 'none';
        formSuccess.style.display = 'block';

        gsap.fromTo(formSuccess,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: reduceMotion ? 0 : 0.6, ease: 'power3.out' }
        );

        if (!reduceMotion) {
          gsap.to('.success-circle', { attr: { strokeDashoffset: 0 }, duration: 0.8, delay: 0.3, ease: 'power2.inOut' });
          gsap.to('.success-check', { attr: { strokeDashoffset: 0 }, duration: 0.6, ease: 'power2.out', delay: 0.3 });
        } else {
          gsap.set('.success-circle', { attr: { strokeDashoffset: 0 } });
          gsap.set('.success-check', { attr: { strokeDashoffset: 0 } });
        }
        if (sound) sound.success();
      }
    });
  });
}

function initEasterEggsAndSounds() {
  const logoLink = document.getElementById('logo-link');
  if (logoLink) {
    let clickCount = 0;
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      clickCount++;
      if (clickCount >= 5) {
        clickCount = 0;
        if (!reduceMotion) launchConfetti();
      }
    });
  }

  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const next = btn.getAttribute('aria-checked') !== 'true';
      btn.setAttribute('aria-checked', String(next));
      btn.textContent = next ? '\ud83d\udd0a' : '\ud83d\udd07';
      sound.toggle(next);
    });
    document.querySelectorAll('.nav-link, .btn-nav, .btn-primary, .drawer-link').forEach(el => {
      el.addEventListener('mouseenter', () => sound.hover());
    });
  }

  let idleTimer;
  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (reduceMotion) return;
      const cta = document.querySelector('.hero-actions .btn-primary');
      if (cta) gsap.to(cta, { boxShadow: '0 0 30px rgba(210,168,85,0.6)', duration: 1, yoyo: true, repeat: 1, ease: 'sine.inOut' });
    }, 12000);
  }
  ['mousemove', 'scroll', 'keydown', 'touchstart'].forEach(evt => document.addEventListener(evt, resetIdle, { passive: true }));
  resetIdle();
}

function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:100001;pointer-events:none;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const colors = ['#D2A855', '#8E1619', '#e4c480', '#ab1d21', '#ffffff', '#FFD700'];
  const particles = [];
  const particleCount = 120;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20 - 5,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      gravity: 0.3 + Math.random() * 0.2,
      opacity: 1,
    });
  }

  let frame = 0;
  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.008;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });

    if (alive && frame < 200) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();
}

function initScrollReveals() {
  if (reduceMotion) {
    gsap.set('.metric-item, .about-content, .about-visual, .initiative-card, .form-container', { opacity: 1, y: 0 });
    return;
  }
  
  const revealElements = document.querySelectorAll('.metric-item, .about-content, .about-visual, .initiative-card, .form-container');
  revealElements.forEach((el) => {
    gsap.fromTo(el,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
        }
      }
    );
  });

  gsap.to('.scroll-progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3
    }
  });
}

function initVelocityMarquees() {
  const marqueeContent = document.querySelector('.marquee-content');
  const marqueeContent2 = document.querySelector('.marquee-content-2');

  if (marqueeContent) {
    const marqueeTween = gsap.to(marqueeContent, {
      xPercent: -50,
      repeat: -1,
      duration: 15,
      ease: 'linear'
    });

    if (lenis && !reduceMotion) {
      lenis.on('scroll', (e) => {
        const velocity = Math.abs(e.velocity || 0);
        gsap.to(marqueeTween, {
          timeScale: 1 + Math.min(velocity / 15, 6),
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    }
  }

  if (marqueeContent2) {
    gsap.to(marqueeContent2, {
      xPercent: 50,
      repeat: -1,
      duration: 18,
      ease: 'linear'
    });
  }
  
  if (lenis && !reduceMotion) {
    lenis.on('scroll', (e) => {
      const velocity = e.velocity || 0;
      const skewXAmount = Math.min(Math.max(velocity * -0.5, -15), 15);
      gsap.to('.portfolio-item, .profile-card', {
        skewX: skewXAmount,
        overwrite: 'auto',
        duration: 0.4,
        ease: 'power3.out'
      });

      const skewYAmount = Math.min(Math.max(velocity * -0.15, -5), 5);
      gsap.to('.initiative-card, .metric-item', {
        skewY: skewYAmount,
        overwrite: 'auto',
        duration: 0.4,
        ease: 'power3.out'
      });
    });
  }
}

// Debounced resize & image load refresh watchers
function setupRefreshWatchers() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });

  // Watch for image loads to recalculate ScrollTrigger markers/pins
  document.querySelectorAll('img').forEach(img => {
    if (!img.complete) {
      img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    }
  });
}

// =====================================================================
// GLOBAL CLEANUP LIFECYCLE HOOK
// =====================================================================
window.cleanupSIC = function() {
  destroyCursor();
  destroyMetrics();
  destroyPortfolio();
  destroyNavigation();
  
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
  gsap.ticker.remove(updateLenis);
  ScrollTrigger.getAll().forEach(t => t.kill());
};
