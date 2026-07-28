// grain.js — WebGL animated film grain overlay using OGL
// Replaces the CSS feTurbulence noise overlay with a continuous, smooth grain shader
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const vertexShader = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uOpacity;

  float random(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float grain = random(uv * uResolution.xy + uTime * 60.0);
    gl_FragColor = vec4(vec3(grain), grain * uOpacity);
  }
`;

let animating = true;

export function initGrain(opacity = 0.045) {
  try {
    const renderer = new Renderer({ alpha: true, dpr: 1 });
    const gl = renderer.gl;
    gl.canvas.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:none;mix-blend-mode:overlay;';
    document.body.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [innerWidth, innerHeight] },
        uOpacity: { value: opacity },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      renderer.setSize(innerWidth, innerHeight);
      program.uniforms.uResolution.value = [innerWidth, innerHeight];
    }
    window.addEventListener('resize', resize);
    resize();

    function loop(t) {
      if (animating) {
        program.uniforms.uTime.value = t * 0.001;
      }
      renderer.render({ scene: mesh });
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    return {
      pause: () => { animating = false; },
      resume: () => { animating = true; },
    };
  } catch (e) {
    console.warn('WebGL grain shader failed to initialize, falling back to no grain overlay.', e);
    return null;
  }
}
