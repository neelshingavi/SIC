# SIC PICT — Animation & Effects Blueprint
### A deep technical audit + Awwwards-tier upgrade path for the Startup and Innovation Cell website

**Stack detected:** Vite 8, vanilla JS (ES modules), GSAP 3.15 + ScrollTrigger, Lenis (smooth scroll), Lucide icons.
**Audit method:** Full read of `index.html`, `src/main.js`, `src/style.css`, `src/counter.js`, `package.json`, and the `public/images` / `src/assets` asset trees.

---

## Table of Contents

- [SIC PICT — Animation \& Effects Blueprint](#sic-pict--animation--effects-blueprint)
    - [A deep technical audit + Awwwards-tier upgrade path for the Startup and Innovation Cell website](#a-deep-technical-audit--awwwards-tier-upgrade-path-for-the-startup-and-innovation-cell-website)
  - [Table of Contents](#table-of-contents)
  - [1. Executive Verdict](#1-executive-verdict)
  - [2. Deep Audit — What's Already There (and What's Broken)](#2-deep-audit--whats-already-there-and-whats-broken)
    - [🔴 P0 — Critical / Functional Bugs](#-p0--critical--functional-bugs)
    - [🟡 P1 — Dead Code / Redundancy (cheap wins, do these first)](#-p1--dead-code--redundancy-cheap-wins-do-these-first)
    - [🟢 Things that are already correct and you should *not* touch](#-things-that-are-already-correct-and-you-should-not-touch)
  - [3. The Reference Tier — What "Best" Actually Looks Like Right Now](#3-the-reference-tier--what-best-actually-looks-like-right-now)
  - [4. The Unlocked Toolkit — GSAP Went 100% Free in 2025](#4-the-unlocked-toolkit--gsap-went-100-free-in-2025)
  - [5. Section-by-Section Blueprint](#5-section-by-section-blueprint)
    - [5.1 Global Layer (Cursor, Grain, Progress, Scroll)](#51-global-layer-cursor-grain-progress-scroll)
    - [5.2 Preloader](#52-preloader)
    - [5.3 Navbar](#53-navbar)
    - [5.4 Hero](#54-hero)
    - [5.5 Impact Metrics](#55-impact-metrics)
    - [5.6 About](#56-about)
    - [5.7 Initiatives](#57-initiatives)
    - [5.8 Portfolio (Horizontal Scroll)](#58-portfolio-horizontal-scroll)
    - [5.9 Leadership](#59-leadership)
    - [5.10 Application Form](#510-application-form)
    - [5.11 Marquee](#511-marquee)
    - [5.12 Footer](#512-footer)
  - [6. Signature Moves — What Would Make This Genuinely Unique](#6-signature-moves--what-would-make-this-genuinely-unique)
  - [7. Performance, Accessibility \& Engineering Hygiene](#7-performance-accessibility--engineering-hygiene)
  - [8. Prioritized Roadmap](#8-prioritized-roadmap)
  - [9. Reference Library](#9-reference-library)

---

<a name="1-executive-verdict"></a>
## 1. Executive Verdict

Most "make my site more impressive" audits start from a template. Yours doesn't need that conversation — you've already built roughly 60% of what a paid creative agency would ship for a client like this:

- Lenis smooth scroll synced correctly to GSAP's ticker (not the common broken half-integration)
- A pinned horizontal-scroll portfolio track with a dynamically computed scroll distance
- A custom dot+outline cursor with **context-aware modes** (`.hovered`, `.view-mode`, `.profile-mode`) — most student sites don't even attempt this
- Velocity-driven skew on scroll (the "Lenis signature move") on two independent element groups
- A hand-rolled word-by-word text-reveal splitter with per-word masking
- A cinematic preloader with a counted progress bar → intro typography sequence → hero handoff
- A velocity-linked infinite marquee

This is not a "add some fade-ins" job. This is a "you're 60% of the way to an Awwwards submission, let's close the gap with precision" job. The gap has three parts:

1. **Dead weight and silent bugs** you should fix before adding anything new (Section 2) — including one that actually breaks mobile navigation entirely.
2. **A toolkit unlock you're not using yet.** GSAP's paid Club GreenSock plugins (`SplitText`, `DrawSVG`, `MorphSVG`, `Physics2D`, `ScrambleText`, `Flip`, `Inertia`) became **100% free for commercial use in April 2025** after Webflow's acquisition of GreenSock. You already have `gsap@^3.15.0` installed — you have full legal access to all of it right now, no new install needed beyond importing the plugin files.
3. **Signature moments that don't exist yet** — a WebGL grain layer, image distortion on hover, a self-drawing SVG crest, animated counters on your metrics (currently static!), and a couple of "wow, did you build this yourselves?" touches that cost little but read as expensive.

---

<a name="2-deep-audit"></a>
## 2. Deep Audit — What's Already There (and What's Broken)

Fix these **before** layering new effects on top — several of them will visually conflict with or silently cancel out anything new you add.

### 🔴 P0 — Critical / Functional Bugs

| # | Issue | Evidence | Fix |
|---|-------|----------|-----|
| 1 | **Mobile nav is completely non-functional.** `.hamburger` exists in the DOM and is `display`-shown under `@media (max-width: 992px)` (which hides `.nav-links-center`), but there is **zero JavaScript** wiring a click handler to it anywhere in `main.js`. On any phone or tablet, a visitor cannot navigate to About / Initiatives / Portfolio / Leadership at all. | Grep confirms no `querySelector('.hamburger')` anywhere in `main.js`. | Build a slide-in mobile drawer (code in [§5.3](#53-navbar)). This is more important than any animation on this list — it's a broken product, not a missing polish item. |
| 2 | **AOS is referenced but never loaded.** `data-aos="fade-up"` etc. appear on `.hero-content`, `.metric-item`, `.about-content`, `.about-visual`, `.initiative-card`, `.profile-card`, `.form-container`, and `initAnimations()` calls `window.AOS.init(...)`. There is no `<script>` tag loading AOS and it isn't in `package.json`. `window.AOS` is `undefined`, so that `if (window.AOS)` block silently no-ops. | `index.html` head has an empty `<!-- AOS Animations -->` comment with no script tag. | Delete every `data-aos*` attribute. Your GSAP `revealElements` ScrollTrigger loop already animates most of these same elements — the AOS attributes are inert corpses, not a fallback. |
| 3 | **All 10 leadership profile cards link to the same LinkedIn URL** (`neel-shingavi`) regardless of whose card it is. | Every `<a class="profile-card">` in the Leadership section. | Content bug, not animation, but it's the first thing a visiting recruiter/investor will click and notice. Fix before shipping any of the animation work below — a broken link undercuts the "extraordinary" the whole page is going for. |
| 4 | **All 4 portfolio items render the identical image** (`startup_image.png`). | Portfolio section markup. | Same category as #3 — cosmetic trust issue, fix in parallel. |

### 🟡 P1 — Dead Code / Redundancy (cheap wins, do these first)

| # | Issue | Why it matters |
|---|-------|-----------------|
| 5 | **Two Lenis packages installed** — `@studio-freight/lenis` *and* `lenis` in `package.json`. `main.js` only imports from `'lenis'` (the current, maintained package — `@studio-freight/lenis` was renamed and is now a deprecated alias). | Dead dependency bloating `node_modules` and lockfile. Run `npm uninstall @studio-freight/lenis`. |
| 6 | **Lucide is loaded twice, in two different ways.** `index.html` pulls the *entire* icon set from `https://unpkg.com/lucide@latest` (a runtime CDN fetch of every icon that exists, only ~5 are used: `arrow-right`, `rocket`, `lightbulb`, `users`, `check-circle`), **and** `lucide` is separately installed via npm but never imported in `main.js`. | This is a real, measurable performance cost — you're shipping hundreds of unused icon defs over the network on every load, plus a render-blocking third-party script tag, when a 2 KB tree-shaken import would do. Fix in [§7](#7-performance-a11y). |
| 7 | `src/counter.js` is Vite's default scaffold boilerplate (`setupCounter`) and is **never imported anywhere**. Dead file. | Delete it. |
| 8 | `index.html` favicon points to `/vite.svg` (the default Vite logo) instead of your own `public/favicon.svg`, which exists and is unused. | One-line fix: `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`. |
| 9 | `src/assets/hero.png`, `src/assets/javascript.svg`, `src/assets/vite.svg` are leftover Vite scaffold assets, never referenced in your markup (your real images all live in `public/images/`). | Delete `src/assets/` entirely, or repurpose it. |
| 10 | `public/images/red-curtain.png` exists but is **never referenced** anywhere in `index.html` or `style.css`. | Either this was meant for a curtain-reveal preloader transition (very on-brand — see [§6](#6-signature-moves) for exactly that idea) or it's dead weight. Given the filename and the red/gold heraldic theme, I'd bet it was planned for a "curtain pulls back" reveal — worth building that, it's a great concept for this brand. |

### 🟢 Things that are already correct and you should *not* touch

- The `@media (hover: none) and (pointer: coarse)` guard that disables the custom cursor on touch devices — correct, and a lot of sites forget this.
- Syncing Lenis's `raf` into `gsap.ticker` and calling `gsap.ticker.lagSmoothing(0)` — this is the textbook-correct integration; most tutorials get this wrong.
- `invalidateOnRefresh: true` on the horizontal portfolio ScrollTrigger — correct, prevents desync on resize.

---

<a name="3-reference-tier"></a>
## 3. The Reference Tier — What "Best" Actually Looks Like Right Now

You asked me to go through top-level websites. Rather than name-drop generically, here's what's actually defining the ceiling on the Awwwards/FWA circuit right now, and — more usefully — *which specific technique from each* is realistic to bring into a vanilla-JS/GSAP institutional site like yours (you don't need to become a WebGL agency to borrow the right three ideas):

- **Active Theory** — large-scale real-time WebGL, but the transferable lesson is their **mobile-first performance discipline**: they explicitly ship reduced particle counts / simplified scenes on lower-end devices via device detection rather than degrading gracefully after the fact. Borrow this principle for your pinned horizontal scroll (see [§5.8](#58-portfolio)).
- **Lusion** — the reference point for shader/material work; the transferable idea for you is a subtle **animated grain/noise shader** as an atmosphere layer, not a literal 3D scene (see [§6](#6-signature-moves)).
- **Obys Agency** — the benchmark for **editorial typographic motion** — their static frames already read as posters. Your `Playfair Display` serif + word-mask reveal is already reaching for this; `SplitText` (see [§4](#4-unlocked-toolkit)) will get you the rest of the way with proper character-level control.
- **Resn** — playful, character-driven micro-interactions with real craft. The transferable idea is **restraint plus one unexpected delight** (their sites aren't animated everywhere — they pick 2-3 moments and go all-in). This should inform your prioritization: don't animate all 12 sections equally hard, pick your hero + portfolio + metrics as the "all-in" moments and let the rest be clean and fast.
- **Stripe / Linear / Vercel** (not agency showcases, but the products every judge and recruiter has actually used) — the transferable lesson is **subtlety with performance**: scroll-linked gradient meshes, tilt-on-hover cards, count-up numbers, all running at 60fps with zero jank, none of it gratuitous. This is the closer analogue for an *institutional* site than a full agency showcase — SIC needs to look premium and trustworthy to investors/mentors, not experimental.

**Bottom line for your specific brief:** your target aesthetic is closer to "Stripe/Linear-grade restraint" wearing "Obys-grade typography" with **one** Lusion-grade atmospheric touch (grain shader) and **one** Resn-grade delight (an easter egg). Full agency-scale WebGL scenes (Bruno Simon's drivable 3D portfolio, Active Theory's campaign work) would actually work *against* an institutional incubator brand — that level of experimentalism reads as "agency flexing," not "trustworthy incubator." Calibrate ambition accordingly; the sections below do.

---

<a name="4-unlocked-toolkit"></a>
## 4. The Unlocked Toolkit — GSAP Went 100% Free in 2025

This is the single highest-leverage fact for this project. As of **April 2025**, following Webflow's acquisition of GreenSock (Oct 2024), **every previously-paid "Club GreenSock" plugin is now free for commercial use**, no license required. You're already on `gsap@^3.15.0`. Nothing below needs a new subscription — just importing the plugin module.

| Plugin | What it unlocks for you specifically |
|---|---|
| **SplitText** | Replaces your hand-rolled `heading.textContent.split(' ')` word-splitter in `main.js`. Real character/word/line splitting, automatic re-split on resize/font-load (yours will silently misalign if a user resizes mid-session or a font swaps), and a built-in `mask` option for the exact overflow-hidden reveal you're already faking manually. Also has a real accessibility mode (`accessible: true`) that keeps the un-split text available to screen readers — your current implementation destroys the semantic text node, which is a real a11y regression you likely didn't intend. |
| **DrawSVG** | Animates `stroke-dashoffset` to "draw" an SVG path live. Perfect for a self-drawing crest/emblem in the preloader — see [§5.2](#52-preloader). |
| **MorphSVG** | Smoothly morphs one SVG path into another. Ideal for a hamburger→X icon morph (you need this menu built anyway per bug #1) and a play/pause-style toggle anywhere you need one. |
| **Physics2D** | Real physics-driven motion (gravity, velocity, bounce). Good for an easter-egg "shatter" effect — *not* for primary content, per the restraint principle in §3. |
| **ScrambleText** | Matrix-style character-scramble-then-settle text effect. Great as a nav-link/button hover micro-interaction for a *tech-forward* institutional brand like an innovation cell — subtle, cheap, on-brand. |
| **Flip** | Animates an element smoothly between two DOM states/positions (e.g., a card expanding into a full-screen bio modal). Ideal for turning your placeholder "XYZ role" team cards into real bios later. |
| **Inertia** | Physically-accurate momentum/drag. Could give your custom cursor a touch of weighted lag, or power an interactive dot-grid background. |
| **ScrollSmoother** / **Observer** | GreenSock's own smooth-scroll + direction-aware scroll listener. You don't need to replace Lenis (it's working correctly), but `Observer` is worth adding standalone for a direction-aware navbar hide/show (see [§5.3](#53-navbar)) — much less code than hand-rolling scroll-delta tracking. |

Install once, register what you use:

```bash
# no new package needed — gsap already includes all plugins in the same install
```

```js
// main.js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, ScrambleTextPlugin, Observer);
```

---

<a name="5-section-by-section"></a>
## 5. Section-by-Section Blueprint

<a name="51-global-layer"></a>
### 5.1 Global Layer (Cursor, Grain, Progress, Scroll)

**Current state:** dot+outline cursor with mode classes, CSS-SVG-turbulence noise overlay, scaleX scroll-progress bar. All solid.

**Upgrade 1 — Replace the CSS noise overlay with a real WebGL grain shader.**
Your current `.noise-overlay` is a static base64 SVG `feTurbulence` filter re-triggered via a 4-step CSS `steps()` keyframe — cheap, but visibly "stepped" and flat (no depth, no reaction to anything). A single-pass GLSL film-grain shader over a full-viewport canvas is barely heavier (one draw call, ~15 lines of GLSL) and gives you *continuous*, animated, slightly-depth-varying grain — the exact texture behind the "Lusion look" referenced in §3.

```glsl
// grain.frag — minimal animated film grain, runs as a single fullscreen triangle
precision mediump float;
uniform float uTime;
uniform vec2 uResolution;
uniform float uOpacity; // tie to a CSS var or GSAP tween for reduced-motion fallback

float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float grain = random(uv * uResolution.xy + uTime * 60.0);
  gl_FragColor = vec4(vec3(grain), grain * uOpacity);
}
```

Wire it up with **OGL** (~6 KB gzipped — dramatically lighter than Three.js, which you don't need for a single fullscreen pass):

```bash
npm install ogl
```

```js
// grain.js
import { Renderer, Program, Mesh, Triangle } from 'ogl';

export function initGrain(opacity = 0.045) {
  const renderer = new Renderer({ alpha: true });
  const gl = renderer.gl;
  gl.canvas.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:none;mix-blend-mode:overlay;';
  document.body.appendChild(gl.canvas);

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: `attribute vec2 uv; attribute vec2 position; varying vec2 vUv;
      void main(){ vUv=uv; gl_Position=vec4(position,0,1); }`,
    fragment: /* paste grain.frag body here */ ``,
    uniforms: { uTime: { value: 0 }, uResolution: { value: [innerWidth, innerHeight] }, uOpacity: { value: opacity } },
  });
  const mesh = new Mesh(gl, { geometry, program });

  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    program.uniforms.uResolution.value = [innerWidth, innerHeight];
  }
  window.addEventListener('resize', resize);
  resize();

  function loop(t) {
    program.uniforms.uTime.value = t * 0.001;
    renderer.render({ scene: mesh });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
```

Replace `.noise-overlay` div + its keyframes with `initGrain()` called once in `main.js`. Respect `prefers-reduced-motion` by freezing `uTime` updates (see [§7](#7-performance-a11y)).

**Upgrade 2 — Direction-aware navbar via GSAP `Observer`.** Currently your `.navbar` is `position: sticky` and always visible, eating viewport on scroll. The Stripe/Linear pattern: hide on scroll-down, reveal instantly on scroll-up.

```js
Observer.create({
  target: window,
  type: 'wheel,touch,scroll',
  onUp: () => gsap.to('.navbar', { yPercent: 0, duration: 0.4, ease: 'power2.out' }),
  onDown: (self) => {
    if (self.scrollY() > 120) gsap.to('.navbar', { yPercent: -100, duration: 0.4, ease: 'power2.in' });
  },
});
```
(Requires `.navbar { transition: none; will-change: transform; }` and the Observer plugin registered.)

---

<a name="52-preloader"></a>
### 5.2 Preloader

**Current state:** counted progress bar → fade out → line-by-line intro text → `expo.inOut` slide-away, coordinated with a hero scale-down. This is already a genuinely cinematic sequence — better than most agency demo sites. Two upgrades, not a rebuild:

**Upgrade 1 — Self-drawing SVG crest instead of a pulsing raster PNG.**
Your `loader-logo` is currently `logo.png` with a CSS `pulse-glow` keyframe. Re-export your logo as an SVG (even a simplified line-art version of the crest) and animate it with `DrawSVGPlugin` — a stroke that inks itself in is a much more premium, heraldic motif than a pulsing raster image, and it directly matches your red/gold institutional-seal branding language.

```js
gsap.set('.loader-crest path', { drawSVG: '0%' });
gsap.to('.loader-crest path', {
  drawSVG: '100%',
  duration: 1.8,
  ease: 'power2.inOut',
  stagger: 0.08,
});
```

**Upgrade 2 — Use that unused `red-curtain.png`.** Given the filename and your red/gold heraldic branding, this asset was very likely intended for a literal **curtain-pull reveal**: two curtain-texture panels slide apart (like a theater curtain / ribbon-cutting — thematically perfect for an "incubation" and "founders" narrative) to reveal the hero underneath, instead of (or layered with) the current vertical `yPercent: -100` slide-away.

```css
.curtain-panel { position: fixed; top: 0; width: 50%; height: 100%; background: url('/images/red-curtain.png') center/cover; z-index: 9999; }
.curtain-left { left: 0; }
.curtain-right { right: 0; }
```

```js
tl.to('.curtain-left', { xPercent: -100, duration: 1.2, ease: 'expo.inOut' }, 'reveal')
  .to('.curtain-right', { xPercent: 100, duration: 1.2, ease: 'expo.inOut' }, 'reveal');
```

**Upgrade 3 — Session-aware skip.** A 2.5s+ un-skippable intro on *every* page load (including someone hitting back/forward, or a recruiter re-opening the tab) is exactly what costs Awwwards submissions points, and it costs you real bounce risk. Store a session flag and shorten/skip on repeat visits within the same tab session, and always offer a visible skip control:

```js
const seenIntro = sessionStorage.getItem('sic_intro_seen');
const introDuration = seenIntro ? 400 : 2500; // fast-path repeat visits
sessionStorage.setItem('sic_intro_seen', '1');
```
Add a small "Skip →" text button, `opacity: 0` fading in after ~800ms, that jumps straight to `initAnimations()`.

---

<a name="53-navbar"></a>
### 5.3 Navbar

**Fix the P0 bug first** — a real mobile drawer:

```html
<div class="mobile-drawer">
  <a href="#about" class="nav-link">About</a>
  <a href="#initiatives" class="nav-link">Initiatives</a>
  <a href="#portfolio" class="nav-link">Portfolio</a>
  <a href="#leadership" class="nav-link">Leadership</a>
  <a href="#apply" class="btn-primary">Apply Now</a>
</div>
```

```js
const hamburger = document.querySelector('.hamburger');
const drawer = document.querySelector('.mobile-drawer');
let drawerOpen = false;

hamburger.addEventListener('click', () => {
  drawerOpen = !drawerOpen;
  hamburger.classList.toggle('active', drawerOpen);
  gsap.to(drawer, {
    xPercent: drawerOpen ? 0 : 100,
    duration: 0.6,
    ease: 'power4.inOut',
  });
  document.body.style.overflow = drawerOpen ? 'hidden' : '';
  drawerOpen ? lenis.stop() : lenis.start(); // freeze smooth-scroll under the drawer
});
```

**Hamburger → X morph with MorphSVG** (or pure CSS rotate — MorphSVG is the more "expensive-looking" option since it's a true path morph, not a rotate/translate fake):
```js
gsap.to('.hamburger span:nth-child(1)', { rotation: 45, y: 7, duration: 0.3 });
gsap.to('.hamburger span:nth-child(2)', { opacity: 0, duration: 0.2 });
gsap.to('.hamburger span:nth-child(3)', { rotation: -45, y: -7, duration: 0.3 });
```

**Nav link ScrambleText on hover** (ties into the "tech innovation cell" brand identity — subtle, not gimmicky at this scale):
```js
document.querySelectorAll('.nav-link').forEach((link) => {
  const original = link.textContent;
  link.addEventListener('mouseenter', () => {
    gsap.to(link, { duration: 0.6, scrambleText: { text: original, chars: 'upperCase', speed: 0.4 } });
  });
});
```

---

<a name="54-hero"></a>
### 5.4 Hero

**Current state:** staggered kicker/title/subtitle/actions reveal + a CSS `rotateX` 3D text cube for "Leaders./Founders./Startups./Visionaries." — genuinely a nice touch already.

**Upgrade 1 — SplitText for the title instead of the manual word-splitter.** Your current word-by-word split (`sectionHeadings.forEach` in `main.js`) explicitly *skips* any heading containing `.text-cube-container` to avoid breaking the cube markup — meaning your hero title (the single most important headline on the page) currently gets **none** of your custom reveal animation, only the blunt `heroTl.fromTo('.hero-title', {y:30,opacity:0}, ...)`. `SplitText` handles nested markup correctly (it can split around the cube span without destroying it), so you can finally give the hero title the same per-word cinematic reveal as every other heading:

```js
const heroSplit = new SplitText('.hero-title', { type: 'words', mask: 'words' });
gsap.from(heroSplit.words, {
  yPercent: 120,
  rotationZ: 6,
  opacity: 0,
  duration: 1.4,
  ease: 'expo.out',
  stagger: 0.08,
});
```

**Upgrade 2 — Tie the 3D cube's rotation to hover/idle state, not just a fixed 10s CSS loop.** Right now it auto-rotates regardless of user attention. Pausing on hover (a one-line CSS `animation-play-state: paused` on `:hover`) lets a visitor actually read "Founders." before it flips away — small but real usability win for a piece of copy you clearly worked hard on.
```css
.text-cube-container:hover .text-cube { animation-play-state: paused; }
```

**Upgrade 3 — WebGL displacement on the hero background image** (this is the single highest-impact visual upgrade available to you, and it's the technique that most directly channels the Lusion/Codrops "liquid distortion hover" reference in §3). Your hero currently uses a flat `background: url(...) center/cover` with a linear-gradient overlay. Swapping the background `<img>` for a canvas running a lightweight displacement shader (mouse-reactive ripple, using **OGL**, same library as the grain layer) turns a static photo into something that visibly *reacts* to the cursor — this single effect is disproportionately responsible for the "how did they build this" reaction on portfolio-grade sites.

```js
// hero-distortion.js — OGL displacement, mouse-reactive
import { Renderer, Camera, Transform, Plane, Program, Texture } from 'ogl';

const fragment = `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uMouse;
uniform float uStrength;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  float dist = distance(uv, uMouse);
  float falloff = smoothstep(0.35, 0.0, dist);
  vec2 dir = normalize(uv - uMouse + 0.0001);
  uv += dir * falloff * uStrength * 0.06;
  gl_FragColor = texture2D(tMap, uv);
}`;
// ... standard OGL boilerplate: renderer -> camera -> plane -> texture from hero image
// on mousemove within .hero, lerp uMouse toward normalized cursor position each frame
```
Keep `uStrength` low (0.15–0.3 range) — you want a *subtle* liquid ripple that reads as "premium glass," not a funhouse mirror. Always pair with a static `<img>` fallback for browsers/devices where WebGL init fails (see [§7](#7-performance-a11y) — graceful degradation).

---

<a name="55-impact-metrics"></a>
### 5.5 Impact Metrics

**This is the biggest missing "wow" on the entire page, and it's the cheapest to add.** `₹15M+`, `40+`, `120+`, `15+` are currently **static text** — no count-up animation at all, despite every surrounding element on the page being scroll-triggered. An animated odometer count-up on scroll-into-view is one of the most reliably effective "this feels expensive" moves in web design, and yours is the only major numeric showcase on the page not doing it.

```js
document.querySelectorAll('.metric-number').forEach((el) => {
  const raw = el.textContent.trim();              // "₹15M+", "40+", "120+", "15+"
  const numMatch = raw.match(/[\d.]+/)[0];
  const prefix = raw.split(numMatch)[0];           // "₹" or ""
  const suffix = raw.split(numMatch)[1];           // "M+" or "+"
  const target = parseFloat(numMatch);
  const obj = { val: 0 };

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
      });
    },
  });
});
```

Pair it with a subtle **glow-pulse on completion** (`gsap.to(el, {textShadow: '0 0 20px rgba(210,168,85,0.8)', yoyo:true, repeat:1, duration:0.4})`) so the moment the count "lands" has a tiny punctuation mark — this is exactly the kind of micro-detail Resn-tier studios obsess over.

---

<a name="56-about"></a>
### 5.6 About

**Current state:** `data-speed="0.8"` parallax on the image + a solid-color `.img-backdrop` offset behind it. Clean, already good.

**Upgrade — turn the static backdrop into a second, independently-parallaxing layer** for actual depth instead of a flat offset rectangle:
```js
gsap.to('.img-backdrop', {
  yPercent: -20,
  ease: 'none',
  scrollTrigger: { trigger: '.about-visual', start: 'top bottom', end: 'bottom top', scrub: true },
});
```
Since `.img-front` already parallaxes via your existing `[data-speed]` loop, this gives you two planes moving at different rates — genuine multi-plane depth rather than a static drop-shadow-style offset.

**Upgrade — animate the `check-circle` feature-list icons with a staggered draw-in** using `DrawSVGPlugin` on the Lucide SVG paths once rendered, triggered on scroll — reinforces "we build things properly" at the icon level, not just the layout level.

---

<a name="57-initiatives"></a>
### 5.7 Initiatives

**Current state:** hover = `translateY(-10px) scale(1.02)` + shadow. Functional, a little flat next to everything else on the page.

**Upgrade — 3D cursor-tilt (the Vercel/Linear card pattern referenced in §3).** Card rotates toward the cursor on mousemove within its bounds, using `gsap.quickTo` for performance (avoids creating a new tween object on every mousemove event):

```js
document.querySelectorAll('.initiative-card').forEach((card) => {
  const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
  const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });

  card.style.transformPerspective = '800px';

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotY(px * 12);   // max ~12deg tilt — stays premium, not gimmicky
    rotX(-py * 12);
  });
  card.addEventListener('mouseleave', () => { rotX(0); rotY(0); });
});
```

**Upgrade — icon micro-animation on hover.** Currently `.card-icon` (rocket / lightbulb / users) is static. A tiny elastic pop or icon-specific motion (rocket nudges up-right, lightbulb flickers brightness) on card hover reinforces the tilt with a second layer of feedback:
```js
card.addEventListener('mouseenter', () => gsap.to(card.querySelector('.card-icon'), { scale: 1.15, rotate: -8, duration: 0.4, ease: 'back.out(2)' }));
```

---

<a name="58-portfolio"></a>
### 5.8 Portfolio (Horizontal Scroll)

**Current state:** this is your most technically ambitious section already — pinned section, GSAP-driven `x` tween matched to track width, velocity-based skew. Genuinely well-built.

**Upgrade 1 — WebGL image displacement on hover** (same OGL technique as [§5.4](#54-hero), applied per-card): a liquid ripple that reacts as the cursor moves across each portfolio image is *the* signature Codrops/Awwwards "showcase card" pattern, and your cards are literally showcasing startups — thematically it doubles as "look how far these ideas came."

**Upgrade 2 — `gsap.matchMedia()` to disable the pin on mobile.** Pinned horizontal scroll-jacking is one of the most common sources of janky, disorienting mobile experiences on award-style sites, and directly contradicts the "mobile-first, not retrofitted" principle from the Active Theory reference in §3. Below a breakpoint, swap to a native swipeable track:

```js
let mm = gsap.matchMedia();

mm.add('(min-width: 769px)', () => {
  // existing pinned horizontal-scroll GSAP code lives here, unchanged
});

mm.add('(max-width: 768px)', () => {
  // native, performant, no scroll-jacking on touch
  portfolioTrack.style.overflowX = 'auto';
  portfolioTrack.style.scrollSnapType = 'x mandatory';
  portfolioTrack.querySelectorAll('.portfolio-item').forEach(el => el.style.scrollSnapAlign = 'center');
});
```

**Upgrade 3 — cursor "drag hint" affordance.** Since this is scroll-jacked (not obviously draggable), first-time visitors sometimes don't realize they can keep scrolling through it. A brief, one-time `cursor-outline` label change to "SCROLL" the first time the section pins (already have the plumbing for cursor mode-swapping — just add a `.scroll-hint` mode triggered once via `ScrollTrigger.create({ once: true, ... })`) removes any ambiguity.

---

<a name="59-leadership"></a>
### 5.9 Leadership

**Current state:** magnetic hover, image scale + border-color shift, `zoom-in` reveal (dead — see AOS bug). Solid bones, needs the reveal replaced and one signature upgrade.

**Upgrade — Flip-powered bio expansion.** Right now clicking a profile card just navigates to LinkedIn. A richer, more "we built an actual product" pattern: clicking expands the card in-place into a full bio panel (photo, name, role, a short quote/blurb, *then* the LinkedIn link) using `Flip` to animate the exact card element from its grid position to a centered modal-like state — no jarring modal-fade, the card *becomes* the modal:

```js
card.addEventListener('click', (e) => {
  e.preventDefault();
  const state = Flip.getState(card);
  card.classList.add('is-expanded');
  Flip.from(state, { duration: 0.6, ease: 'power3.inOut', absolute: true });
});
```
This also solves your "XYZ role" placeholder problem constructively — it gives you a real content surface (a bio panel) worth filling in, rather than just a name + one-line title.

**Upgrade — stagger reveal replacing the dead AOS zoom-in**, matching the pattern already used elsewhere on the page:
```js
gsap.from('.profile-card', {
  y: 60, opacity: 0, scale: 0.9, duration: 1, ease: 'expo.out', stagger: 0.08,
  scrollTrigger: { trigger: '.grid-5-col', start: 'top 85%' },
});
```

---

<a name="510-application-form"></a>
### 5.10 Application Form

**Current state:** plain `box-shadow`, no interaction beyond browser-default focus states, no submit animation (`alert()` on submit).

This is genuinely the most under-designed section relative to everything around it — worth deliberate attention since it's the conversion point of the entire site.

**Upgrade 1 — animated floating labels + focus-line draw**, replacing static `<label>`s:
```css
.input-group { position: relative; }
.input-group input, .input-group textarea { border: none; border-bottom: 1.5px solid #ccc; }
.input-group label {
  position: absolute; left: 0; top: 0.8rem; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); pointer-events: none;
}
.input-group input:focus ~ label, .input-group input:not(:placeholder-shown) ~ label {
  top: -1.1rem; font-size: 0.75rem; color: var(--color-red);
}
```

**Upgrade 2 — replace `alert('Application Received.')` with a real success sequence.** A JS `alert()` on a page this polished is a jarring downgrade in perceived quality. Swap for a GSAP-driven success state that morphs the form container itself (Flip again, or a simple crossfade) into a confirmation message with the gold checkmark motif already used in your About section icons — visual continuity across the page, not a browser-native popup.

**Upgrade 3 — per-field validation micro-shake.** On invalid submit, a quick `gsap.to(field, {x: [-8,8,-6,6,0], duration:0.4})` horizontal shake on the offending field reads as considerably more crafted than the default red browser outline.

---

<a name="511-marquee"></a>
### 5.11 Marquee

**Current state:** already excellent — velocity-linked speed via Lenis scroll events is a genuinely advanced touch most sites skip.

**Upgrade — stack a second marquee row moving the opposite direction**, offset slightly in opacity/scale, directly above or below. This "counter-scrolling twin marquee" is a common Awwwards pattern for adding depth to what's otherwise a flat text band, and it's a ~10-line addition given the plumbing you already have:
```js
gsap.to('.marquee-content-2', { xPercent: 50, repeat: -1, duration: 18, ease: 'linear' });
```
```css
.marquee-content-2 { opacity: 0.15; }
```

---

<a name="512-footer"></a>
### 5.12 Footer

**Current state:** static, no motion at all — reasonable, footers usually shouldn't compete for attention. One tasteful addition:

**Upgrade — magnetic footer-link hover consistent with your nav/button pattern** (you already have a `.magnetic` class and mousemove listener wired to `a, button, .profile-card, .portfolio-item` — simply extend the selector to include `.footer-links a` for consistency; costs nothing, unifies the interaction language across the whole page). Currently footer links are excluded from your magnetic system, which makes the footer feel like a different, older site was pasted underneath a newer one.

---

<a name="6-signature-moves"></a>
## 6. Signature Moves — What Would Make This Genuinely Unique

These aren't section-specific — they're the kind of small, cheap, high-memorability touches that make technical visitors (investors, mentor networks, other dev teams) specifically remark on the site, which is exactly the audience an "Innovation Cell" site should be optimizing to impress:

1. **Console easter egg.** A styled `console.log` ASCII crest + recruiting message the moment DevTools opens — genuinely used by Stripe, GitHub, and Figma, and perfectly on-brand for a *technical innovation cell* actively trying to recruit builders:
   ```js
   console.log('%c SIC PICT ', 'background:#8E1619;color:#D2A855;font-size:20px;font-weight:bold;padding:8px 16px;border-radius:4px;');
   console.log('%cLike reading code? So do we. Join the tech team → mailto:sic@pict.edu', 'color:#D2A855;font-size:13px;');
   ```
2. **Logo-click easter egg.** Clicking the crest logo 5 times triggers a brief gold-and-red confetti burst (`canvas-confetti`, ~3 KB) — cheap, memorable, zero risk to the institutional tone since it's opt-in/hidden.
3. **The curtain-reveal preloader** using your currently-unused `red-curtain.png` (full detail in [§5.2](#52-preloader)) — this is the single most "did they actually design this or just template it" tell available to you, and the asset is already sitting in your repo unused.
4. **A single, well-chosen WebGL moment** (hero + portfolio image displacement, [§5.4](#54-hero)/[§5.8](#58-portfolio)) rather than WebGL everywhere — per the Resn "restraint + one delight" principle from §3, this reads as more confident than a site trying to WebGL every element.

---

<a name="7-performance-a11y"></a>
## 7. Performance, Accessibility & Engineering Hygiene

**`prefers-reduced-motion` — currently handled nowhere in this codebase**, despite the site being unusually animation-dense (custom cursor, velocity skew, parallax, scroll-jacked pinning). For vestibular-sensitive visitors this isn't optional polish, it's an accessibility requirement. Gate the heavy motion globally:

```js
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
  gsap.globalTimeline.timeScale(100); // effectively skip animation-timed sequences
  lenis.destroy();                     // fall back to native scroll
  // skip WebGL grain / distortion init entirely
  // set count-up numbers directly to final value, no tween
}
```

**Icon loading — fix the double-Lucide issue from bug #6.** Replace the CDN `<script>` + `lucide.createIcons()` global pattern with tree-shaken imports of only the icons you actually use:
```js
import { createIcons, ArrowRight, Rocket, Lightbulb, Users, CheckCircle } from 'lucide';
createIcons({ icons: { ArrowRight, Rocket, Lightbulb, Users, CheckCircle } });
```
Remove the `<script src="https://unpkg.com/lucide@latest">` tag from `index.html` entirely. This alone likely cuts a meaningful chunk of your total JS payload, since the CDN "latest" bundle ships every icon in the library.

**Images — no `loading="lazy"`, no explicit `width`/`height`, PNG-only.** Every `<img>` on the page is missing dimension attributes, which is a direct Cumulative Layout Shift (CLS) hit on Core Web Vitals — a real ranking and UX factor, not just a nitpick. Also convert your photo assets (`about_image.png`, `startup_image.png`, `team_image.png`) to compressed WebP/AVIF with a PNG `<picture>` fallback:
```html
<picture>
  <source srcset="/images/about_image.avif" type="image/avif">
  <source srcset="/images/about_image.webp" type="image/webp">
  <img src="/images/about_image.png" width="800" height="600" loading="lazy" alt="Students in Lab">
</picture>
```
(Hero and above-the-fold images should stay `loading="eager"` — only lazy-load what's below the fold, e.g. About/Portfolio/Leadership imagery.)

**WebGL graceful degradation.** Any canvas-based effect (grain shader, hero/portfolio distortion) needs a real fallback path, not just a silent failure — per the "Poor graceful degradation" warning that's a known, common failure mode for exactly this kind of Curtains.js/OGL displacement effect. Always feature-detect and keep the underlying `<img>` visible until WebGL confirms it initialized:
```js
function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}
if (supportsWebGL() && !reduceMotion) initGrain();
// otherwise the static image / CSS overlay stays exactly as-is — no blank space, ever
```

**CSS scroll-driven animations (`animation-timeline`) — worth knowing about, not worth adopting wholesale yet.** As of mid-2026 this is natively supported in Chrome/Edge/Opera/Safari with ~84% global coverage, and Firefox has it behind a flag — meaning it's close to production-ready as a *zero-JS* alternative for simple scroll-fade effects, running entirely on the compositor thread (no main-thread jank even under heavy JS load). It's not a fit for anything you're pinning or scrubbing with velocity data (your GSAP+Lenis+ScrollTrigger combo is doing real work CSS alone can't replicate — non-linear timelines, pin-spacing, velocity skew), but for isolated below-the-fold "just fade up when visible" elements where you don't need JS logic anyway, it's a genuinely lighter-weight option worth prototyping once Firefox ships it unflagged.

---

<a name="8-roadmap"></a>
## 8. Prioritized Roadmap

**P0 — Ship this week, before anything else:**
- [ ] Build the mobile hamburger drawer (site is currently unusable on phones — bug #1)
- [ ] Fix the 10 identical LinkedIn links (bug #3)
- [ ] Vary/replace the 4 identical portfolio images (bug #4)
- [ ] Remove dead AOS attributes + `@studio-freight/lenis` + `counter.js` + unused `src/assets/*` (bugs #2, #5, #7, #9)
- [ ] Fix favicon reference (bug #8)
- [ ] Add animated count-up to Impact Metrics ([§5.5](#55-impact-metrics)) — highest visual return for lowest effort on this entire list
- [ ] Add `prefers-reduced-motion` global gate ([§7](#7-performance-a11y))

**P1 — Next pass, real craft upgrades:**
- [ ] Swap manual word-split for `SplitText` on hero + headings ([§5.1](#51-global-layer), [§5.4](#54-hero))
- [ ] Fix double-Lucide loading, add `loading="lazy"` + explicit image dimensions ([§7](#7-performance-a11y))
- [ ] 3D tilt on `.initiative-card` ([§5.7](#57-initiatives))
- [ ] Direction-aware navbar via `Observer` ([§5.1](#51-global-layer))
- [ ] Replace form `alert()` with a real success-state animation ([§5.10](#510-application-form))
- [ ] `gsap.matchMedia()` to disable pinned horizontal scroll on mobile ([§5.8](#58-portfolio))

**P2 — Signature/stretch, do these once P0+P1 are solid:**
- [ ] WebGL grain shader layer (OGL) replacing the CSS noise overlay ([§5.1](#51-global-layer))
- [ ] WebGL displacement on hero + portfolio images ([§5.4](#54-hero), [§5.8](#58-portfolio))
- [ ] Curtain-reveal preloader using `red-curtain.png` ([§5.2](#52-preloader))
- [ ] Self-drawing SVG crest in preloader via `DrawSVGPlugin` ([§5.2](#52-preloader))
- [ ] Flip-powered leadership bio expansion ([§5.9](#59-leadership))
- [ ] Console easter egg + logo-click confetti ([§6](#6-signature-moves))

---

<a name="9-reference-library"></a>
## 9. Reference Library

**Study these for technique, not for wholesale copying — pick the one idea, not the whole aesthetic:**
- **Codrops (tympanus.net/codrops)** — the single best source for exact, working code behind almost every effect in this document (WebGL distortion hover, grain shaders, SplitText demos).
- **Awwwards WebGL / Grainy Shader collections** — curated, current examples of the grain and distortion techniques referenced in §5.1/§5.4/§5.8.
- **GSAP's own Codrops collaboration demos** (SplitText, DrawSVG, MorphSVG, Physics2D) — official, current, and built by the plugin authors themselves.
- **OGL GitHub repo + examples** — the lightweight WebGL library recommended throughout this document.

**Official docs to bookmark for implementation:**
- GSAP: `gsap.com/docs` (SplitText, DrawSVG, ScrollTrigger, Observer, Flip, matchMedia)
- Lenis: current GitHub repo under the `darkroomengineering/lenis` org (the package you're already using)
- MDN: CSS scroll-driven animations (`animation-timeline`) for the future-facing note in §7

---

*Built from a full read of your actual `index.html`, `main.js`, `style.css`, and asset tree — every code snippet above uses your real class names and structure and should drop in with minimal adaptation. Start with P0.*
