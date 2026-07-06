import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Initialize Smooth Scrolling (Lenis)
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync GSAP with Lenis
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

window.onload = () => {
  // Cinematic Preloader Logic
  const preloader = document.getElementById('preloader');
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');
  const loaderContent = document.querySelector('.loader-content');

  if (preloader && progressText && progressBar && loaderContent) {
    let progress = 0;
    const duration = 2500; // 2.5 seconds to reach 100%
    const intervalTime = 30;
    const increment = (100 / (duration / intervalTime));

    const counter = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(counter);
        
        // 1. Fade out loader content but keep background
        gsap.to(loaderContent, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            loaderContent.style.display = 'none';
            
            const introContainer = document.querySelector('.intro-animation-container');
            if (introContainer) {
              introContainer.style.display = 'flex';
              
              // Wrap the text of each line into a moving container
              const lines = document.querySelectorAll('.intro-line');
              lines.forEach(line => {
                const text = line.textContent.trim();
                line.innerHTML = '';
                const span = document.createElement('span');
                span.className = 'intro-text';
                span.textContent = text;
                line.appendChild(span);
              });
              
              // Orchestrate the physics-based animation
              const tl = gsap.timeline({
                onComplete: () => {
                  const heroContainer = document.querySelector('.hero-container');
                  
                  // Coordinate parallax scale-down on Hero with preloader slide away
                  if (heroContainer) {
                    gsap.set(heroContainer, { scale: 1.1 });
                  }
                  
                  gsap.to(preloader, {
                    yPercent: -100,
                    duration: 1.4,
                    ease: 'expo.inOut',
                    onComplete: () => {
                      preloader.style.display = 'none';
                      initAnimations();
                    }
                  });
                  
                  if (heroContainer) {
                    gsap.to(heroContainer, {
                      scale: 1,
                      duration: 1.4,
                      ease: 'expo.inOut'
                    });
                  }
                }
              });
              
              // Intro Tween (bulletproof fromTo)
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
              // Outro Tween
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
              // Fallback if container is missing
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

  function initAnimations() {
    // Initialize AOS after preloader is gone
    if (window.AOS) {
      window.AOS.init({
        once: true,
        offset: 50,
        duration: 800,
        easing: 'ease-out-cubic',
      });
    }

    // Hero Animation
    const heroTl = gsap.timeline();
    heroTl.fromTo('.hero-kicker', 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.hero-title',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo('.hero-subtitle',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
      '-=0.7'
    )
    .fromTo('.hero-actions a',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out' },
      '-=0.5'
    );

    // --- Horizontal Scroll Portfolio ---
    const portfolioSection = document.querySelector('.portfolio-scroll-section');
    const portfolioTrack = document.querySelector('.portfolio-track');
    
    if (portfolioSection && portfolioTrack) {
      function getScrollAmount() {
        let trackWidth = portfolioTrack.scrollWidth;
        return -(trackWidth - window.innerWidth);
      }

      const tween = gsap.to(portfolioTrack, {
        x: getScrollAmount,
        ease: "none"
      });

      ScrollTrigger.create({
        trigger: portfolioSection,
        start: "top top",
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true
      });
    }

    // --- Custom Cursor & Magnetic Elements ---
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

      const magneticElements = document.querySelectorAll('a, button, .profile-card, .portfolio-item');
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

    // --- Scroll Velocity Skew (Lenis Signature) ---
    lenis.on('scroll', (e) => {
      const velocity = e.velocity || 0;
      // Horizontal skew for horizontal cards
      const skewXAmount = Math.min(Math.max(velocity * -0.5, -15), 15);
      gsap.to('.portfolio-item, .profile-card', { 
        skewX: skewXAmount, 
        overwrite: 'auto', 
        duration: 0.4, 
        ease: 'power3.out' 
      });
      
      // Vertical skew for vertical cards
      const skewYAmount = Math.min(Math.max(velocity * -0.15, -5), 5);
      gsap.to('.initiative-card, .metric-item', { 
        skewY: skewYAmount, 
        overwrite: 'auto', 
        duration: 0.4, 
        ease: 'power3.out' 
      });
    });

    // --- Deep Parallax Images ---
    const parallaxElements = document.querySelectorAll('[data-speed]');
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-speed'));
      gsap.fromTo(el, 
        { yPercent: -15 * speed },
        {
          yPercent: 15 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    });

    // --- Cinematic Text Word-by-Word Reveals ---
    const sectionHeadings = document.querySelectorAll('.section-heading');
    sectionHeadings.forEach(heading => {
      // Prevent splitting if it contains complex nested HTML
      if (heading.querySelector('.text-cube-container')) return;
      
      const words = heading.textContent.split(' ');
      heading.innerHTML = '';
      words.forEach(word => {
        if (!word.trim()) return;
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline-block';
        wrapper.style.overflow = 'hidden';
        wrapper.style.verticalAlign = 'top';
        wrapper.style.paddingRight = '0.2em'; // space between words
        
        const inner = document.createElement('span');
        inner.textContent = word;
        inner.style.display = 'inline-block';
        wrapper.appendChild(inner);
        heading.appendChild(wrapper);
        
        gsap.fromTo(inner, 
          { yPercent: 120, rotationZ: 8 },
          { 
            yPercent: 0, 
            rotationZ: 0, 
            duration: 1.4, 
            ease: 'expo.out',
            scrollTrigger: {
              trigger: heading,
              start: "top 90%"
            }
          }
        );
      });
    });

    // --- General Elastic Reveals ---
    const revealElements = document.querySelectorAll('.hero-title, .metric-item, .about-content, .about-visual, .initiative-card, .profile-card, .form-container');
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
            start: "top 90%",
          }
        }
      );
    });

    // --- Phase 2: Global Progress Bar ---
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

    // --- Phase 2: Velocity-Linked Marquee ---
    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContent) {
      const marqueeTween = gsap.to(marqueeContent, {
        xPercent: -50,
        repeat: -1,
        duration: 15,
        ease: 'linear'
      });
      
      lenis.on('scroll', (e) => {
        const velocity = Math.abs(e.velocity || 0);
        gsap.to(marqueeTween, { 
          timeScale: 1 + Math.min(velocity / 15, 6), 
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    }

    // --- Phase 2: Smooth Lenis Anchor Routing ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, {
            offset: -80,
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        }
      });
    });
  }
};
