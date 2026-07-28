import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let triggers = [];

export function initMetrics(reduceMotion = false) {
  const metricElements = document.querySelectorAll('.metric-number');
  if (!metricElements.length) return;

  metricElements.forEach((el) => {
    if (el.dataset.animated === 'true') return;

    const raw = el.textContent.trim();
    // Parse number ignoring commas (e.g. 1,200.50 -> 1200.50)
    const match = raw.match(/([\D]*)([\d,]+(?:\.\d+)?)([\D]*)/);
    if (!match) return;

    const prefix = match[1] || '';
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3] || '';
    const target = parseFloat(numStr);
    const hasCommas = match[2].includes(',');
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;

    if (reduceMotion) {
      el.textContent = raw;
      el.dataset.animated = 'true';
      return;
    }

    el.textContent = `${prefix}0${suffix}`;
    const obj = { val: 0 };

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        el.dataset.animated = 'true';
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            let formatted = decimals > 0 ? obj.val.toFixed(decimals) : Math.floor(obj.val).toString();
            if (hasCommas) {
              const parts = formatted.split('.');
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              formatted = parts.join('.');
            }
            el.textContent = `${prefix}${formatted}${suffix}`;
          },
          onComplete: () => {
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

    triggers.push(trigger);
  });
}

export function destroyMetrics() {
  triggers.forEach(t => t.kill());
  triggers = [];
}
