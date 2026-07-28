// =====================================================================
// SIC PICT — Main Animation & Interaction Controller
// Implements the full Animation & Effects Blueprint (P0 + P1 + P2)
// =====================================================================

import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
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

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin, Flip, Observer);

// =====================================================================
// GLOBAL: Reduced Motion Detection
// =====================================================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// =====================================================================
// GLOBAL: WebGL Support Detection
// =====================================================================
function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

// =====================================================================
// GLOBAL: Initialize Lucide Icons (tree-shaken, no CDN)
// =====================================================================
createIcons({ icons: { ArrowRight, Rocket, Lightbulb, Users, CheckCircle } });

// =====================================================================
// CONSOLE EASTER EGG (§6)
// =====================================================================
console.log('%c SIC PICT ', 'background:#8E1619;color:#D2A855;font-size:20px;font-weight:bold;padding:8px 16px;border-radius:4px;');
console.log('%cLike reading code? So do we. Join the tech team → mailto:sic@pict.edu', 'color:#D2A855;font-size:13px;');

// =====================================================================
// SMOOTH SCROLLING (Lenis) — correctly synced to GSAP ticker
// =====================================================================
let lenis;

if (!reduceMotion) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
} else {
  // Reduced motion: skip Lenis entirely, use native scroll
  gsap.globalTimeline.timeScale(100);
}

// =====================================================================
// PRELOADER — Session-aware, skip-capable, curtain reveal (§5.2)
// =====================================================================
window.onload = () => {
  const preloader = document.getElementById('preloader');
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');
  const loaderContent = document.querySelector('.loader-content');
  const skipBtn = document.getElementById('skip-intro');
  const seenIntro = sessionStorage.getItem('sic_intro_seen');

  let introSkipped = false;

  function skipToMain() {
    if (introSkipped) return;
    introSkipped = true;
    gsap.killTweensOf('*');
    
    // Curtain reveal
    const curtainTl = gsap.timeline({
      onComplete: () => {
        preloader.style.display = 'none';
        gsap.set('.curtain-left', { xPercent: -101 });
        gsap.set('.curtain-right', { xPercent: 101 });
        initAnimations();
      }
    });

    // Bring curtains in, then sweep them away
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

  // Wire skip button
  if (skipBtn) {
    skipBtn.addEventListener('click', skipToMain);
    // Fade in skip button after 800ms
    gsap.to(skipBtn, { opacity: 1, delay: 0.8, duration: 0.4 });
  }

  // Session-aware: fast-path for repeat visitors
  if (seenIntro || reduceMotion) {
    if (preloader) preloader.style.display = 'none';
    initAnimations();
    return;
  }

  if (preloader && progressText && progressBar && loaderContent) {
    let progress = 0;
    const duration = 2500;
    const intervalTime = 30;
    const increment = (100 / (duration / intervalTime));

    const counter = setInterval(() => {
      if (introSkipped) { clearInterval(counter); return; }
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(counter);
        
        // Fade out loader content
        gsap.to(loaderContent, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            if (introSkipped) return;
            loaderContent.style.display = 'none';
            
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

                  // Curtain reveal transition
                  const revealTl = gsap.timeline({
                    onComplete: () => {
                      preloader.style.display = 'none';
                      gsap.set('.curtain-left', { xPercent: -101 });
                      gsap.set('.curtain-right', { xPercent: 101 });
                      sessionStorage.setItem('sic_intro_seen', '1');
                      initAnimations();
                    }
                  });

                  revealTl
                    .set('.curtain-left', { xPercent: -101 })
                    .set('.curtain-right', { xPercent: 101 })
                    .to('.curtain-left', { xPercent: 0, duration: 0.5, ease: 'power3.inOut' }, 0)
                    .to('.curtain-right', { xPercent: 0, duration: 0.5, ease: 'power3.inOut' }, 0)
                    .set(preloader, { display: 'none' })
                    .to('.curtain-left', { xPercent: -101, duration: 1.2, ease: 'expo.inOut' }, '+=0.05')
                    .to('.curtain-right', { xPercent: 101, duration: 1.2, ease: 'expo.inOut' }, '<');

                  if (heroContainer) {
                    revealTl.to(heroContainer, {
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
              preloader.style.opacity = '0';
              setTimeout(() => {
                preloader.style.display = 'none';
                initAnimations();
              }, 600);
            }
          }
        });
      }
      
      progressText.innerText = Math.floor(progress) + '%';
      progressBar.style.width = progress + '%';
    }, intervalTime);
  } else {
    initAnimations();
  }

  // ===================================================================
  // MAIN ANIMATION INIT — everything fires after preloader is done
  // ===================================================================
  function initAnimations() {
    // ---------------------------------------------------------------
    // WebGL Grain Overlay (§5.1 — replaces CSS noise overlay)
    // ---------------------------------------------------------------
    // WebGL Canvas Effects (Global & Hero & Portfolio)
    // ---------------------------------------------------------------
    if (!reduceMotion && supportsWebGL()) {
      initGrain(0.045);
      
      const heroEl = document.querySelector('.hero');
      if (heroEl) initHeroDistortion(heroEl);

      const constellationCanvas = document.getElementById('constellation-canvas');
      if (constellationCanvas) {
        initConstellation(constellationCanvas);
      }
      // Portfolio image distortion on hover (§5.8)
      document.querySelectorAll('.portfolio-img').forEach(el => {
        initPortfolioDistortion(el);
      });
    }

    // Initialize Interactive Ecosystem Node-Graph
    initEcosystem();

    // ---------------------------------------------------------------
    // Hero Animation with SplitText (§5.4)
    // ---------------------------------------------------------------
    const heroTl = gsap.timeline();
    heroTl.fromTo('.hero-kicker', 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    // SplitText for hero title — handles nested .text-cube-container correctly
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      // Omit `mask: 'words'` here! The mask's overflow:hidden breaks the 3D cube's preserve-3d context.
      const heroSplit = new SplitText(heroTitle, { type: 'words' });
      heroTl.from(heroSplit.words, {
        y: 60, // use absolute y instead of yPercent since we aren't masking
        rotationZ: 6,
        opacity: 0,
        duration: 1.4,
        ease: 'expo.out',
        stagger: 0.08,
      }, '-=0.5');
    }

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

    // ---------------------------------------------------------------
    // SplitText for all section headings (§5.4 — replacing manual word-split)
    // ---------------------------------------------------------------
    const sectionHeadings = document.querySelectorAll('.section-heading');
    sectionHeadings.forEach(heading => {
      if (heading.closest('.hero')) return; // hero already handled above
      
      const split = new SplitText(heading, { type: 'words', mask: 'words' });
      gsap.from(split.words, {
        yPercent: 120,
        rotationZ: 8,
        duration: 1.4,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: {
          trigger: heading,
          start: 'top 90%',
        }
      });
    });

    // ---------------------------------------------------------------
    // Impact Metrics Count-Up Animation (§5.5 — THE biggest missing wow)
    // ---------------------------------------------------------------
    document.querySelectorAll('.metric-number').forEach((el) => {
      const raw = el.textContent.trim();
      const numMatch = raw.match(/[\d.]+/);
      if (!numMatch) return;
      const num = numMatch[0];
      const prefix = raw.split(num)[0];
      const suffix = raw.split(num)[1];
      const target = parseFloat(num);
      const obj = { val: 0 };

      if (reduceMotion) {
        // Set final value directly
        return;
      }

      // Set to 0 initially
      el.textContent = `${prefix}0${suffix}`;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              const display = Number.isInteger(target) ? Math.floor(obj.val) : obj.val.toFixed(1);
              el.textContent = `${prefix}${display}${suffix}`;
            },
            onComplete: () => {
              // Glow pulse on completion
              gsap.to(el, {
                textShadow: '0 0 20px rgba(210,168,85,0.8)',
                yoyo: true,
                repeat: 1,
                duration: 0.4,
                ease: 'power2.inOut',
                clearProps: 'textShadow',
              });
            }
          });
        },
      });
    });

    // ---------------------------------------------------------------
    // Horizontal Scroll Portfolio (§5.8)
    // ---------------------------------------------------------------
    const portfolioSection = document.querySelector('.portfolio-scroll-section');
    const portfolioTrack = document.querySelector('.portfolio-track');
    
    if (portfolioSection && portfolioTrack) {
      let mm = gsap.matchMedia();

      mm.add('(min-width: 769px)', () => {
        function getScrollAmount() {
          let trackWidth = portfolioTrack.scrollWidth;
          return -(trackWidth - window.innerWidth);
        }

        const tween = gsap.to(portfolioTrack, {
          x: getScrollAmount,
          ease: 'none'
        });

        ScrollTrigger.create({
          trigger: portfolioSection,
          start: 'top top',
          end: () => `+=${getScrollAmount() * -1}`,
          pin: true,
          animation: tween,
          scrub: 1,
          invalidateOnRefresh: true,
        });

        // Cursor "drag hint" affordance — show SCROLL once (§5.8)
        const cursorOutline = document.querySelector('.cursor-outline');
        if (cursorOutline) {
          ScrollTrigger.create({
            trigger: portfolioSection,
            start: 'top center',
            once: true,
            onEnter: () => {
              cursorOutline.classList.add('scroll-hint');
              gsap.delayedCall(2, () => {
                cursorOutline.classList.remove('scroll-hint');
              });
            },
          });
        }
      });

      mm.add('(max-width: 768px)', () => {
        // Native swipeable on mobile — no scroll-jacking
        portfolioTrack.style.overflowX = 'auto';
        portfolioTrack.style.scrollSnapType = 'x mandatory';
        portfolioTrack.querySelectorAll('.portfolio-item').forEach(el => {
          el.style.scrollSnapAlign = 'center';
        });
      });
    }

    // ---------------------------------------------------------------
    // Custom Cursor & Magnetic Elements (enhanced with footer links §5.12)
    // ---------------------------------------------------------------
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline) {
      document.addEventListener('mousemove', (e) => {
        gsap.set(cursorDot, {
          x: e.clientX,
          y: e.clientY
        });
        gsap.to(cursorOutline, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: 'power2.out'
        });
      });

      document.addEventListener('mousedown', () => {
        cursorOutline.classList.add('clicking');
      });
      document.addEventListener('mouseup', () => {
        cursorOutline.classList.remove('clicking');
      });

      // Extended selector: now includes footer links (§5.12)
      // We explicitly list the interactive elements instead of a global 'a' to prevent inline links from becoming magnetic.
      const magneticElements = document.querySelectorAll('.nav-link, .btn-nav, .logo, .link-arrow, .btn-primary, .profile-card, .portfolio-item, .footer-links a');
      magneticElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursorDot.classList.add('hidden');
          if (el.classList.contains('portfolio-item')) {
            cursorOutline.classList.add('view-mode');
          } else if (el.classList.contains('profile-card')) {
            cursorOutline.classList.add('profile-mode');
          } else {
            cursorOutline.classList.add('hovered');
          }
        });
        el.addEventListener('mouseleave', () => {
          cursorDot.classList.remove('hidden');
          cursorOutline.classList.remove('hovered');
          cursorOutline.classList.remove('view-mode');
          cursorOutline.classList.remove('profile-mode');
          if (!el.classList.contains('profile-card') && !el.classList.contains('portfolio-item')) {
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
          }
        });
        el.addEventListener('mousemove', (e) => {
          if (el.classList.contains('portfolio-item') || el.classList.contains('profile-card')) return;
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.5, ease: 'power2.out' });
        });
      });
    }

    // ---------------------------------------------------------------
    // Scroll Velocity Skew (Lenis Signature — preserved from original)
    // ---------------------------------------------------------------
    if (lenis) {
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

    // ---------------------------------------------------------------
    // Deep Parallax Images (preserved)
    // ---------------------------------------------------------------
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

    // ---------------------------------------------------------------
    // About Section — Independent parallax on backdrop (§5.6)
    // ---------------------------------------------------------------
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

    // ---------------------------------------------------------------
    // About Section — DrawSVG on check-circle icons (§5.6)
    // ---------------------------------------------------------------
    // Wait a tick for Lucide to render SVGs, then animate paths
    requestAnimationFrame(() => {
      const checkIcons = document.querySelectorAll('.feature-list .icon-gold svg');
      checkIcons.forEach(svg => {
        const paths = svg.querySelectorAll('path, circle, polyline');
        if (paths.length > 0) {
          gsap.set(paths, { drawSVG: '0%' });
          gsap.to(paths, {
            drawSVG: '100%',
            duration: 1.2,
            ease: 'power2.inOut',
            stagger: 0.15,
            scrollTrigger: {
              trigger: '.feature-list',
              start: 'top 85%',
              once: true,
            },
          });
        }
      });
    });

    // ---------------------------------------------------------------
    // Initiative Cards — 3D Cursor Tilt (§5.7)
    // ---------------------------------------------------------------
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

      // Icon micro-animation on hover (§5.7)
      const icon = card.querySelector('.card-icon');
      if (icon) {
        card.addEventListener('mouseenter', () => {
          gsap.to(icon, { scale: 1.15, rotate: -8, duration: 0.4, ease: 'back.out(2)' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(icon, { scale: 1, rotate: 0, duration: 0.4, ease: 'power2.out' });
        });
      }
    });

    // ---------------------------------------------------------------
    // Leadership — Stagger reveal replacing dead AOS (§5.9)
    // ---------------------------------------------------------------
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

    // ---------------------------------------------------------------
    // Leadership — Flip-powered bio expansion (§5.9 / Phase 3 A11y)
    // ---------------------------------------------------------------
    // Create a backdrop overlay for dismissal
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
      // basic focus trap
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
        // Fade out backdrop
        gsap.to(flipBackdrop, { opacity: 0, duration: 0.3, onComplete: () => { flipBackdrop.style.pointerEvents = 'none'; } });

        const state = Flip.getState(card);
        card.classList.remove('is-expanded');
        // Return card to its original position in grid
        Flip.from(state, {
          duration: 0.55,
          ease: 'power3.inOut',
          absolute: true,
        });
      };

      if (document.startViewTransition) {
        document.startViewTransition(doTransition);
      } else {
        doTransition();
      }
    }

    flipBackdrop.addEventListener('click', collapseCard);

    document.querySelectorAll('.profile-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // If this card is already expanded, collapse it
        if (card === currentExpandedCard) {
          e.preventDefault();
          collapseCard();
          return;
        }

        const expanded = document.querySelector('.profile-card.is-expanded');
        if (expanded && expanded !== card) {
          const prevState = Flip.getState(expanded);
          currentExpandedCard = null;
          expanded.classList.remove('is-expanded');
          Flip.from(prevState, { duration: 0.3, ease: 'power2.in', absolute: true });
        }

        e.preventDefault();
        
        const doExpand = () => {
          currentExpandedCard = card;
          lastFocusedTrigger = document.activeElement;

          const state = Flip.getState(card);
          card.classList.add('is-expanded');
          card.setAttribute('role', 'dialog');
          card.setAttribute('aria-modal', 'true');
          card.setAttribute('aria-label', card.querySelector('h4')?.textContent || 'Profile details');
          card.setAttribute('tabindex', '-1');

          // Center the card in viewport
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const cardW = Math.min(400, vw * 0.9);
          gsap.set(card, {
            top: (vh - card.offsetHeight) / 2,
            left: (vw - cardW) / 2,
          });

          Flip.from(state, { duration: 0.65, ease: 'power3.inOut', absolute: true });

          // Show backdrop
          flipBackdrop.style.pointerEvents = 'auto';
          gsap.to(flipBackdrop, { opacity: 1, duration: 0.35 });

          card.focus();
          document.addEventListener('keydown', onExpandedKeydown);
        };

        if (document.startViewTransition) {
          document.startViewTransition(doExpand);
        } else {
          doExpand();
        }
      });
    });

    // ---------------------------------------------------------------
    // General Elastic Reveals (preserved, minus AOS-dependent elements)
    // ---------------------------------------------------------------
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

    // ---------------------------------------------------------------
    // Global Progress Bar (preserved)
    // ---------------------------------------------------------------
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

    // ---------------------------------------------------------------
    // Velocity-Linked Marquee + Counter-scrolling second row (§5.11)
    // ---------------------------------------------------------------
    const marqueeContent = document.querySelector('.marquee-content');
    const marqueeContent2 = document.querySelector('.marquee-content-2');
    
    if (marqueeContent) {
      const marqueeTween = gsap.to(marqueeContent, {
        xPercent: -50,
        repeat: -1,
        duration: 15,
        ease: 'linear'
      });
      
      if (lenis) {
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

    // Counter-scrolling twin marquee (§5.11)
    if (marqueeContent2) {
      gsap.to(marqueeContent2, {
        xPercent: 50,
        repeat: -1,
        duration: 18,
        ease: 'linear'
      });
    }

    // ---------------------------------------------------------------
    // Direction-Aware Navbar Hide/Show via Observer (§5.1)
    // ---------------------------------------------------------------
    Observer.create({
      target: window,
      type: 'wheel,touch,scroll',
      onUp: () => gsap.to('.navbar', { yPercent: 0, duration: 0.4, ease: 'power2.out' }),
      onDown: (self) => {
        if (self.scrollY() > 120) {
          gsap.to('.navbar', { yPercent: -100, duration: 0.4, ease: 'power2.in' });
        }
      },
    });

    // ---------------------------------------------------------------
    // Nav Link ScrambleText on Hover (§5.3)
    // ---------------------------------------------------------------
    document.querySelectorAll('.nav-link').forEach((link) => {
      const original = link.textContent;
      link.addEventListener('mouseenter', () => {
        gsap.to(link, { duration: 0.6, scrambleText: { text: original, chars: 'upperCase', speed: 0.4 } });
      });
    });

    // ---------------------------------------------------------------
    // Mobile Drawer (§5.3 / Phase 3 A11y)
    // ---------------------------------------------------------------
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

      hamburger.addEventListener('click', () => {
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
      });

      // Close drawer on link click
      drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          closeDrawerA11y();
        });
      });
    }

    // ---------------------------------------------------------------
    // Application Form — Real Success State + Validation (§5.10)
    // ---------------------------------------------------------------
    const appForm = document.getElementById('application-form');
    const formSuccess = document.getElementById('form-success');
    
    // Add floating label has-value toggling
    document.querySelectorAll('.input-group input, .input-group textarea').forEach(input => {
      input.addEventListener('input', () => {
        if (input.value.trim() !== '') {
          input.classList.add('has-value');
        } else {
          input.classList.remove('has-value');
        }
      });
    });

    if (appForm && formSuccess) {
      const steps = Array.from(document.querySelectorAll('.form-step'));
      let currentStep = 0;

      function goToStep(index) {
        const state = Flip.getState(steps[currentStep]);
        steps[currentStep].style.display = 'none';
        steps[index].style.display = 'block';
        currentStep = index;
        Flip.from(state, { duration: 0.5, ease: 'power2.inOut' });
        gsap.to('.wizard-progress-fill', { scaleX: (index + 1) / steps.length, duration: 0.4, ease: 'power2.out' });
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
                gsap.to(f, { 
                  x: [-8,8,-6,6,0], 
                  duration: 0.4,
                  onComplete: () => { if (group) setTimeout(() => group.classList.remove('shake'), 1000); }
                });
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

        // Per-field validation with shake
        const requiredFields = appForm.querySelectorAll('[required]');
        let allValid = true;

        requiredFields.forEach(field => {
          const group = field.closest('.input-group');
          if (!field.value || !field.checkValidity()) {
            allValid = false;
            if (group) {
              group.classList.add('shake');
              gsap.to(field, {
                x: [-8, 8, -6, 6, 0],
                duration: 0.4,
                onComplete: () => {
                  setTimeout(() => group.classList.remove('shake'), 1000);
                }
              });
            }
          }
        });

        if (!allValid) return;

        // Success animation — morph form into success state
        gsap.to(appForm, {
          opacity: 0,
          y: -20,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            appForm.style.display = 'none';
            formSuccess.style.display = 'block';
            
            // Animate success elements
            gsap.fromTo(formSuccess, 
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
            );

            // Draw the success circle
            gsap.to('.success-circle', {
              attr: { strokeDashoffset: 0 },
              duration: 0.8,
              delay: 0.3,
              ease: 'power2.inOut',
            });

            // Draw the success checkmark
            gsap.to('.success-check', {
              attr: { strokeDashoffset: 0 },
              duration: 0.6,
              ease: 'power2.out',
              delay: 0.3
            });
            
            if (sound) sound.success();
          }
        });
      });
    }

    // ---------------------------------------------------------------
    // Smooth Lenis Anchor Routing (preserved, now also closes drawer)
    // ---------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
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
      });
    });

    // ---------------------------------------------------------------
    // Logo Click Easter Egg — Gold & Red Confetti (§6)
    // ---------------------------------------------------------------
    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
      let clickCount = 0;
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        clickCount++;
        if (clickCount >= 5) {
          clickCount = 0;
          // Simple canvas confetti burst
          launchConfetti();
        }
      });
    }

    // ---------------------------------------------------------------
    // Sound Design Opt-in (§4) — must be inside window.onload so DOM exists
    // ---------------------------------------------------------------
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const next = btn.getAttribute('aria-checked') !== 'true';
        btn.setAttribute('aria-checked', String(next));
        btn.textContent = next ? '\ud83d\udd0a' : '\ud83d\udd07';
        sound.toggle(next);
      });
      // Wire hover sounds to interactive elements after DOM is fully ready
      document.querySelectorAll('.nav-link, .btn-nav, .btn-primary, .drawer-link').forEach(el => {
        el.addEventListener('mouseenter', () => sound.hover());
      });
    }

  } // end initAnimations

}; // end window.onload

// =====================================================================
// CONFETTI EASTER EGG (§6 — lightweight, no external dependency)
// =====================================================================
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

// ---------------------------------------------------------------
// The Idle-State Nudge (§7)
// ---------------------------------------------------------------
let idleTimer;
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cta = document.querySelector('.hero-actions .btn-primary');
    if (cta) gsap.to(cta, { boxShadow: '0 0 30px rgba(210,168,85,0.6)', duration: 1, yoyo: true, repeat: 1, ease: 'sine.inOut' });
  }, 12000);
}
['mousemove', 'scroll', 'keydown', 'touchstart'].forEach(evt => document.addEventListener(evt, resetIdle, { passive: true }));
resetIdle();
