// hero-distortion.js — OGL WebGL displacement shader, mouse-reactive
// §5.4 Upgrade 3 — Subtle liquid ripple on the hero background image
// Uses a fullscreen Triangle pass (same as grain.js) for correct viewport fill
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';

const vertex = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform vec2 uMouse;
  uniform float uStrength;
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Aspect-correct mouse distance
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    float dist = distance(uv * aspect, uMouse * aspect);
    float falloff = smoothstep(0.35, 0.0, dist);
    vec2 dir = normalize(uv - uMouse + 0.0001);

    // Subtle idle wave when mouse isn't interacting
    float idleWave = sin(uv.x * 6.0 + uTime * 0.8) * sin(uv.y * 4.0 + uTime * 0.6) * 0.002;
    
    uv += dir * falloff * uStrength * 0.06;
    uv.x += idleWave;
    uv.y += idleWave * 0.5;

    // Keep UVs in valid range
    uv = clamp(uv, 0.0, 1.0);

    gl_FragColor = texture2D(tMap, uv);
  }
`;

/**
 * Initialize hero image distortion effect.
 * Creates a WebGL canvas over the hero section with a mouse-reactive ripple.
 * Uses a fullscreen Triangle geometry (same pattern as grain.js) — no camera needed.
 * Falls back gracefully — the CSS background-image remains visible underneath.
 * 
 * @param {HTMLElement} heroEl - The .hero element
 */
export function initHeroDistortion(heroEl) {
  try {
    const { width, height } = heroEl.getBoundingClientRect();
    if (!width || !height) return; // hero not visible yet

    const renderer = new Renderer({
      alpha: true,
      dpr: Math.min(window.devicePixelRatio, 1.5), // cap for performance
    });
    const gl = renderer.gl;
    
    // Position canvas absolutely within the hero, behind content but above the base bg
    gl.canvas.style.cssText = [
      'position: absolute',
      'inset: 0',
      'width: 100%',
      'height: 100%',
      'z-index: 1',          // above bg (z-index 0) but below overlay (z-index 2)
      'pointer-events: none',
    ].join(';');
    
    // Insert canvas before the overlay so the gradient still works on top
    const overlay = heroEl.querySelector('.hero-overlay');
    if (overlay) {
      heroEl.insertBefore(gl.canvas, overlay);
    } else {
      heroEl.prepend(gl.canvas);
    }

    // Load the hero background image as a texture via computed style
    const heroStyle = getComputedStyle(heroEl);
    const bgImage = heroStyle.backgroundImage;
    // Match first url() — handles 'url("/images/about_image.png")' format
    const bgMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (!bgMatch) {
      // No background image found — remove canvas gracefully
      gl.canvas.remove();
      return;
    }
    
    const imgSrc = bgMatch[1];
    const texture = new Texture(gl, { generateMipmaps: false });
    const img = new Image();
    img.onload = () => {
      texture.image = img;
    };
    img.src = imgSrc;

    // Fullscreen triangle — same approach as grain.js (no camera, no projection)
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        tMap: { value: texture },
        uMouse: { value: [0.5, 0.5] },
        uStrength: { value: 0.2 },
        uTime: { value: 0 },
        uResolution: { value: [width, height] },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    // Current and target mouse for lerping
    const targetMouse = { x: 0.5, y: 0.5 };
    const currentMouse = { x: 0.5, y: 0.5 };

    heroEl.addEventListener('mousemove', (e) => {
      const rect = heroEl.getBoundingClientRect();
      targetMouse.x = (e.clientX - rect.left) / rect.width;
      targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height; // flip Y for GL coords
    });

    heroEl.addEventListener('mouseleave', () => {
      targetMouse.x = 0.5;
      targetMouse.y = 0.5;
    });

    function resize() {
      const rect = heroEl.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      program.uniforms.uResolution.value = [rect.width, rect.height];
    }
    window.addEventListener('resize', resize);
    resize();

    let rafId;
    function loop(t) {
      // Smooth lerp toward target
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;
      
      program.uniforms.uMouse.value = [currentMouse.x, currentMouse.y];
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    // Pause when hero leaves viewport for performance
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!rafId) rafId = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    });
    observer.observe(heroEl);

  } catch (e) {
    console.warn('Hero distortion shader failed to initialize, CSS background stays.', e);
    // Fallback: the CSS background-image remains exactly as-is — zero layout breakage.
  }
}
