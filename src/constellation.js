// constellation.js — lightweight canvas 2D, no WebGL needed
// Gold-on-red color scheme unique to SIC PICT brand
export function initConstellation(canvas, { dotCount = 45, maxDist = 140, color = '210,168,85' } = {}) {
  const ctx = canvas.getContext('2d');
  let w, h, dots;
  let rafId = null;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function makeDots() {
    dots = Array.from({ length: dotCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.5 + 0.5,
    }));
  }

  resize();
  makeDots();

  const resizeObserver = new ResizeObserver(() => { resize(); });
  resizeObserver.observe(canvas);

  function loop() {
    ctx.clearRect(0, 0, w, h);

    dots.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},0.8)`;
      ctx.fill();
    });

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(${color},${0.15 * (1 - dist / maxDist)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  // Use IntersectionObserver to start/stop RAF entirely based on visibility
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!rafId) rafId = requestAnimationFrame(loop);
      } else {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    },
    { threshold: 0 }
  );
  observer.observe(canvas);
}
