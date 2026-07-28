// portfolio-distortion.js — OGL WebGL displacement shader, mouse-reactive
// §5.8 Upgrade 1 — Liquid ripple on portfolio images
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
  uniform vec2 uImageResolution;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Object-fit: cover mapping
    vec2 s = uResolution;
    vec2 i = uImageResolution;
    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 newSize = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
    vec2 offset = (rs < ri ? vec2((newSize.x - s.x) / 2.0, 0.0) : vec2(0.0, (newSize.y - s.y) / 2.0)) / newSize;
    uv = uv * s / newSize + offset;

    
    // Aspect-correct mouse distance
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    float dist = distance(uv * aspect, uMouse * aspect);
    float falloff = smoothstep(0.4, 0.0, dist);
    vec2 dir = normalize(uv - uMouse + 0.0001);

    // subtle idle wave
    float idleWave = sin(uv.x * 4.0 + uTime * 0.5) * sin(uv.y * 3.0 + uTime * 0.4) * 0.003;
    
    uv += dir * falloff * uStrength * 0.08;
    uv.y += idleWave;

    uv = clamp(uv, 0.0, 1.0);
    gl_FragColor = texture2D(tMap, uv);
  }
`;

export function initPortfolioDistortion(containerEl) {
  try {
    const imgEl = containerEl.querySelector('img');
    if (!imgEl) return;

    const renderer = new Renderer({
      alpha: true,
      dpr: Math.min(window.devicePixelRatio, 1.5),
    });
    const gl = renderer.gl;
    
    gl.canvas.style.cssText = [
      'position: absolute',
      'inset: 0',
      'width: 100%',
      'height: 100%',
      'z-index: 2',
      'pointer-events: none',
      'opacity: 0', // Fade in when loaded
      'transition: opacity 0.4s ease'
    ].join(';');
    
    // We keep the original image as fallback, but hide it once canvas is ready
    // Actually, setting the img to opacity 0 lets the canvas show through perfectly
    imgEl.style.transition = 'opacity 0.4s ease';

    containerEl.style.position = 'relative';
    containerEl.style.overflow = 'hidden'; // Ensure canvas doesn't bleed out
    containerEl.appendChild(gl.canvas);

    const texture = new Texture(gl, { generateMipmaps: false });
    
    // Handle image load
    const onLoad = () => {
      texture.image = imgEl;
      program.uniforms.uImageResolution.value = [imgEl.naturalWidth, imgEl.naturalHeight];
      gl.canvas.style.opacity = '1';
      imgEl.style.opacity = '0'; // Hide underlying image gracefully
    };
    
    if (imgEl.complete && imgEl.naturalWidth !== 0) {
      onLoad();
    } else {
      imgEl.addEventListener('load', onLoad);
    }

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        tMap: { value: texture },
        uMouse: { value: [0.5, 0.5] },
        uStrength: { value: 0 },
        uTime: { value: 0 },
        uResolution: { value: [containerEl.clientWidth, containerEl.clientHeight] },
        uImageResolution: { value: [1, 1] }
      },
    });
    
    const mesh = new Mesh(gl, { geometry, program });

    // Interaction state
    let targetMouse = { x: 0.5, y: 0.5 };
    let currentMouse = { x: 0.5, y: 0.5 };
    let targetStrength = 0;
    let currentStrength = 0;
    let isHovering = false;
    let isVisible = false;

    // Use IntersectionObserver to pause rendering when offscreen
    const io = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    io.observe(containerEl);

    containerEl.addEventListener('mouseenter', () => {
      isHovering = true;
      targetStrength = 1.0;
    });

    containerEl.addEventListener('mouseleave', () => {
      isHovering = false;
      targetStrength = 0;
      // Reset mouse to center smoothly
      targetMouse.x = 0.5;
      targetMouse.y = 0.5;
    });

    containerEl.addEventListener('mousemove', (e) => {
      const rect = containerEl.getBoundingClientRect();
      targetMouse.x = (e.clientX - rect.left) / rect.width;
      targetMouse.y = 1.0 - ((e.clientY - rect.top) / rect.height); // WebGL Y is inverted
    });

    const resize = () => {
      const w = containerEl.clientWidth;
      const h = containerEl.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [w, h];
    };
    
    window.addEventListener('resize', resize);
    // Initial size check
    setTimeout(resize, 100);

    const loop = (t) => {
      requestAnimationFrame(loop);
      if (!isVisible) return;

      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.1;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.1;
      currentStrength += (targetStrength - currentStrength) * 0.08;

      program.uniforms.uMouse.value = [currentMouse.x, currentMouse.y];
      program.uniforms.uStrength.value = currentStrength;
      program.uniforms.uTime.value = t * 0.001;

      renderer.render({ scene: mesh });
    };
    
    requestAnimationFrame(loop);
    
  } catch (err) {
    console.warn('Portfolio WebGL init failed, falling back to CSS:', err);
  }
}
