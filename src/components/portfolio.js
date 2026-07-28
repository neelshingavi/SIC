import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let mm = null;

export function initPortfolio(reduceMotion = false) {
  const portfolioSection = document.querySelector('.portfolio-scroll-section');
  const portfolioTrack = document.querySelector('.portfolio-track');

  if (!portfolioSection || !portfolioTrack) return;

  mm = gsap.matchMedia();

  mm.add('(min-width: 769px)', () => {
    if (reduceMotion) {
      portfolioTrack.style.overflowX = 'auto';
      portfolioTrack.style.scrollSnapType = 'x mandatory';
      portfolioTrack.querySelectorAll('.portfolio-item').forEach(el => {
        el.style.scrollSnapAlign = 'center';
      });
      return;
    }
    
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

    const cursorOutline = document.querySelector('.cursor-outline');
    if (cursorOutline) {
      ScrollTrigger.create({
        trigger: portfolioSection,
        start: 'top center',
        once: true,
        onEnter: () => {
          cursorOutline.classList.add('scroll-hint');
          gsap.delayedCall(2, () => cursorOutline.classList.remove('scroll-hint'));
        },
      });
    }
  });

  mm.add('(max-width: 768px)', () => {
    portfolioTrack.style.overflowX = 'auto';
    portfolioTrack.style.scrollSnapType = 'x mandatory';
    portfolioTrack.querySelectorAll('.portfolio-item').forEach(el => {
      el.style.scrollSnapAlign = 'center';
    });
  });
}

export function destroyPortfolio() {
  if (mm) {
    mm.revert();
    mm = null;
  }
}
