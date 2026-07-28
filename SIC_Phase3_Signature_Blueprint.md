# SIC PICT — Phase 3: The Signature Layer
### Round 2 — re-audited against your actual shipped code, plus the next tier of genuinely rare upgrades

**What I did before writing this:** re-read your live `main.js`, `style.css`, `index.html`, and every file in `public/images` fresh, from disk, right now — not from memory of the last file.

---

## 0. Verdict on What You Shipped

I need to say this plainly: you implemented essentially the **entire P0 + P1 + P2 roadmap** from the last file, correctly, in one pass. `SplitText`, `DrawSVGPlugin`, `ScrambleTextPlugin`, `Flip`, and `Observer` are all registered and in active use. The mobile drawer works with a real GSAP hamburger→X, focus-safe Lenis stop/start, and closes on link-click. The count-up metrics, curtain reveal, WebGL grain, hero + portfolio displacement shaders, 3D card tilt, form floating labels + shake-validation + SVG success draw, twin marquee, direction-aware navbar, console easter egg, and confetti are **all live**, all with proper `try/catch` WebGL fallback and `prefers-reduced-motion` gating. `@studio-freight/lenis`, `counter.js`, and the dead `data-aos` attributes are gone. `sharp` got pulled in and used to generate AVIF/WebP variants of your photo assets.

This is no longer "a strong student project." Functionally and technically, this is portfolio-grade agency work. So this file does not repeat what's already excellent — it does three things a first pass can't do until the foundation is solid:

1. Flags the **one real technical debt item left**, which is now the single biggest thing standing between this site and a genuinely fast Lighthouse score — and it's not code, it's an asset.
2. Flags a **new category of gap your own upgrades introduced** — accessibility debt on the interactive surfaces you just built (the Flip modal, the drawer) that didn't exist before because those UI patterns didn't exist before.
3. Proposes the **next tier of ideas** — the kind that move a site from "extremely well executed" to "I haven't seen this exact thing anywhere else," which is what "extraordinary and unique" actually requires at this point.

---

## Table of Contents

1. [The One Remaining Technical Debt — Asset Weight](#1-asset-weight)
2. [Accessibility Debt on Your Own New UI](#2-a11y-debt)
3. [The Signature Concept — The Ecosystem Constellation](#3-constellation)
4. [Sound Design — Synthesized, Zero-Asset, Opt-In](#4-sound-design)
5. [The Multi-Step Application Wizard (You Already Have the Plugin)](#5-form-wizard)
6. [View Transitions API — In-Page Polish + Future-Proofing](#6-view-transitions)
7. [The Idle-State Nudge](#7-idle-nudge)
8. [Share-Ready Metadata](#8-metadata)
9. [Content Debt — Still Open](#9-content-debt)
10. [Phase 3 Roadmap](#10-roadmap)

---

<a name="1-asset-weight"></a>
## 1. The One Remaining Technical Debt — Asset Weight

Your `sharp`-powered AVIF/WebP pipeline is genuinely well done — `about_image.png` (823 KB) → `about_image.avif` (129 KB) is an ~84% reduction, and the same treatment on `startup_image` and `team_image` is correct and effective. But two assets that are used **far more pervasively** than any single photo never got the same treatment, and they now represent the large majority of your total page weight:

| File | Size | Where it's used |
|---|---|---|
| `public/images/red-texture.jpg` | **4.16 MB** | `background-image` on `.bg-red-textured` (navbar, hero, impact-metrics, initiatives, every dark portfolio item, leadership, footer), `#preloader`, `.mobile-drawer`, `.btn-primary` — this is your single most-referenced asset on the entire page. |
| `public/images/logo.png` | **1.16 MB** | Displayed at 55×55px in the navbar, 60×60px in the footer, 140×140px in the preloader. You are shipping over a megabyte to paint a circle smaller than a thumbnail, three separate times. |
| `public/images/red-curtain.png` | 785 KB | Now actively used by the curtain-reveal panels you built — still worth compressing since it's part of the critical first-paint path. |

The browser only downloads `red-texture.jpg` once and caches it, so it isn't multiplied by every usage — but that one download is still sitting directly in your **critical rendering path**: it's the background of both the preloader (the very first thing painted) and the hero (the first section after). A 4+ MB image blocking your Largest Contentful Paint is the kind of thing that will show up immediately in Lighthouse/PageSpeed and in real mobile-data conditions on campus wifi, and it's the highest-leverage fix remaining on this entire project — higher leverage than any animation on this list, because it affects every single visitor before any animation even runs.

You already have `sharp` installed. Extend the same conversion script you (presumably) used for the photo assets to cover these two:

```js
// scripts/optimize-images.js — run once, add to package.json as "optimize": "node scripts/optimize-images.js"
import sharp from 'sharp';

const targets = [
  { in: 'public/images/red-texture.jpg', out: 'public/images/red-texture', maxWidth: 1600 },
  { in: 'public/images/logo.png',        out: 'public/images/logo',        maxWidth: 300  },
  { in: 'public/images/red-curtain.png', out: 'public/images/red-curtain', maxWidth: 1600 },
];

for (const t of targets) {
  await sharp(t.in).resize({ width: t.maxWidth }).avif({ quality: 60 }).toFile(`${t.out}.avif`);
  await sharp(t.in).resize({ width: t.maxWidth }).webp({ quality: 75 }).toFile(`${t.out}.webp`);
  // logo also needs a small PNG fallback for older Safari / SVG isn't an option here without a redesign
  if (t.in.endsWith('.png')) {
    await sharp(t.in).resize({ width: t.maxWidth }).png({ quality: 80, compressionLevel: 9 }).toFile(`${t.out}-optimized.png`);
  }
}
```

For `red-texture.jpg` specifically — it's a repeating/cover background texture, so it doesn't need to stay at whatever resolution it currently is. A texture tile only needs to be as large as the biggest area it'll cover at `background-size: cover`, and even then a 1600px-wide version compressed at quality 60 will be visually indistinguishable as a subtle textured backdrop while landing well under 200 KB instead of 4.16 MB. Swap every `url('/images/red-texture.jpg')` in `style.css` for a CSS `image-set()` so the browser picks the lightest format it supports, with the original as fallback:

```css
.bg-red-textured {
  background-color: #3d070a;
  background-image: image-set(
    url('/images/red-texture.avif') type('image/avif'),
    url('/images/red-texture.webp') type('image/webp'),
    url('/images/red-texture.jpg') type('image/jpeg')
  );
  background-size: cover;
  background-position: center;
  color: #ffffff;
}
```
Do the same for `#preloader`, `.mobile-drawer`, `.btn-primary`, and `.curtain-panel` (using the curtain-specific compressed versions). For `logo.png`, just point `<img src>` at the new `logo-optimized.png` (or `.webp`) — at display sizes this small, even 60–80 KB is generous headroom.

**One more idea specifically for the logo, since you have `sharp` in your toolchain already:** `sharp` can't vectorize a raster PNG into an SVG on its own, but if you (or anyone on the design side) has the original vector/Illustrator/Figma source of the crest, exporting that directly as SVG would let you finally build the self-drawing `DrawSVGPlugin` preloader crest from the first blueprint — that upgrade is still open specifically because it needs a vector source file, not more code.

---

<a name="2-a11y-debt"></a>
## 2. Accessibility Debt on Your Own New UI

This is a normal and honestly good sign — it means you built real interactive surfaces that didn't exist before, and those surfaces need the accessibility work that any new interactive UI needs. Two specific gaps, both fixable with plumbing you already have in place:

### 2.1 The Flip-expanded profile card has no keyboard or screen-reader story

Right now, `card.addEventListener('click', ...)` expands a `.profile-card` into `.profile-card.is-expanded` — a fixed-position panel with a `flipBackdrop` behind it. This is functionally a modal dialog, but it has none of a modal's required semantics:

- No `Escape`-to-close.
- No focus trap — a keyboard user tabbing through the page will tab straight through the (visually hidden-behind-backdrop) rest of the page while the "modal" is open.
- No focus is moved *into* the expanded card on open, or *back to the triggering card* on close — a screen reader user gets no signal anything happened.
- No `role="dialog"` / `aria-modal="true"` / accessible name on the expanded state.
- Since `.profile-card` is an `<a>` tag pointing to LinkedIn, `e.preventDefault()` on every click means **keyboard-only visitors who can't hover to discover the click-to-expand behavior will never reach the actual LinkedIn link** — clicking (via Enter key) always expands, never navigates. You need a distinct, accessible way to actually reach the link.

```js
// Extend your existing expand handler in main.js
function expandCard(card) {
  const state = Flip.getState(card);
  card.classList.add('is-expanded');
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  card.setAttribute('aria-label', card.querySelector('h4')?.textContent || 'Profile details');

  Flip.from(state, { duration: 0.65, ease: 'power3.inOut', absolute: true });

  flipBackdrop.style.pointerEvents = 'auto';
  gsap.to(flipBackdrop, { opacity: 1, duration: 0.35 });

  // Move focus into the card, remember what to return focus to
  lastFocusedTrigger = document.activeElement;
  card.setAttribute('tabindex', '-1');
  card.focus();

  document.addEventListener('keydown', onExpandedKeydown);
}

function onExpandedKeydown(e) {
  if (e.key === 'Escape') collapseCard();
  // basic focus trap: keep Tab cycling within the card + its visible LinkedIn link
  if (e.key === 'Tab') {
    const focusables = currentExpandedCard.querySelectorAll('a, button, [tabindex]');
    const list = Array.from(focusables);
    if (!list.length) return;
    const first = list[0], last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

// On collapse: remove ARIA attrs, remove the keydown listener, restore focus
function collapseCardA11y() {
  document.removeEventListener('keydown', onExpandedKeydown);
  currentExpandedCard?.removeAttribute('role');
  currentExpandedCard?.removeAttribute('aria-modal');
  lastFocusedTrigger?.focus();
}
```
And for the "how do keyboard users still reach LinkedIn" problem — add a visible "View LinkedIn →" link *inside* the expanded state that's a real, un-intercepted `<a>`, separate from the card's own click-to-expand behavior:
```html
<a href="[real linkedin url]" target="_blank" class="expanded-linkedin-link" onclick="event.stopPropagation()">View LinkedIn →</a>
```

### 2.2 The mobile drawer needs the same treatment (smaller lift, same pattern)

You already correctly `lenis.stop()` and lock body scroll on open — good instincts. Add: `Escape` to close, focus moves to the first `.drawer-link` on open, and focus returns to `#hamburger` on close. Same `onKeydown` pattern as above, much shorter since the drawer is simpler than the Flip card.

### 2.3 Branded focus-visible states

You never set `outline: none` anywhere, which is good — the browser default focus ring still works. But on your near-black `.bg-red-textured` backgrounds, the default blue/black outline is low-contrast and off-brand. A two-line addition makes keyboard navigation actually match the polish of the mouse experience:
```css
a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 3px;
}
```

### 2.4 Floating labels + `placeholder=" "`

Your CSS `:not(:placeholder-shown)` trick for floating labels relies on `placeholder=" "` (a single space) on every input. This works visually but screen readers on some browser/AT combinations announce that whitespace placeholder as part of the field description alongside the real `<label>`, which is redundant noise. Since the `<label>` is already correctly associated via `for=`, you can safely add `aria-hidden="true"` is *not* the fix (that would hide the whole placeholder attribute, which isn't how ARIA works) — the actual fix is simpler: this is a known, accepted trade-off of the CSS-only floating label pattern, and it's minor enough not to block shipping, but if you want it fully clean, the robust version uses a `<textarea>`/`<input>` with a non-empty, meaningful `placeholder` *and* drives the float state via a small JS `input` event listener toggling a `.has-value` class instead of relying on `:placeholder-shown` — worth doing only if an accessibility audit specifically flags it.

---

<a name="3-constellation"></a>
## 3. The Signature Concept — The Ecosystem Constellation

Everything you've built so far (grain, distortion, tilt, count-up, curtain) is **craft applied to an existing template structure** — genuinely excellent craft, but the sections themselves (hero, metrics, cards, portfolio strip, team grid) are the same sections any incubator site would have. If the goal is "something very extraordinary, very unique" — not just "extremely well-polished" — the highest-ceiling move left is a piece of **visual IP that's actually yours**, not a technique borrowed from a Codrops tutorial.

Given your brand is explicitly about an *ecosystem* (mentors → founders → startups → funding, the exact language already in your copy: "fostering an ecosystem of excellence"), the natural visual metaphor is a **constellation / network graph** — nodes and connecting lines, gently alive. This can exist at two levels of commitment:

### 3.1 Ambient version (cheap — ties into what you already have)

A sparse field of small gold dots behind the hero content (in front of your existing WebGL distortion layer, or blended into it), that drift slowly and draw a thin connecting line between any two dots that come within a threshold distance of each other — classic "particle constellation" background, but rendered in your exact gold (`#D2A855`) on the deep red (`#3d070a`), which is a combination almost nobody else's constellation-background demo uses (they're all blue-on-black). That color choice alone makes it read as bespoke rather than a copy-pasted CodePen effect.

```js
// constellation.js — lightweight canvas 2D, no WebGL needed for this version
export function initConstellation(canvas, { dotCount = 45, maxDist = 140, color = '210,168,85' } = {}) {
  const ctx = canvas.getContext('2d');
  let w, h, dots;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  function makeDots() {
    dots = Array.from({ length: dotCount }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.5 + 0.5,
    }));
  }
  resize(); makeDots();
  window.addEventListener('resize', () => { resize(); });

  function loop() {
    ctx.clearRect(0, 0, w, h);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},0.8)`;
      ctx.fill();
    });
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
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
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
```
Pure Canvas 2D, no shader knowledge required, trivially light (sub-1KB of logic), and it directly reinforces "ecosystem" as a felt visual truth rather than just a word in your subheading — this is the kind of detail that makes a jury/judge/investor specifically remember your site by name.

### 3.2 Full version — an actual interactive "Ecosystem" section

If you want to go further: promote this from ambient background to a **real section between Initiatives and Portfolio**, where the nodes are labeled and meaningful — "SIC" at the center, connected to node clusters for "Mentors," "Funding Partners," "Incubated Startups," "Alumni Network" — each node slightly larger/brighter based on some weighting (e.g., number of startups per category), and **hoverable**: hovering a node highlights its direct connections and shows a small info card (reusing the same card-reveal pattern you already built for Leadership). This turns an abstract metaphor into an actual, explorable representation of what SIC *is* — mentors, money, startups, and people, all visibly connected — which is a genuinely rare thing for a college club site to have and immediately signals technical seriousness to any visiting investor or mentor.

This is a bigger build (a proper data structure of nodes/edges + force-directed or manually-positioned layout + GSAP-driven line-draw-in on scroll via `DrawSVGPlugin`, which you already have registered), so treat it as a stretch goal, but it's the single idea on this entire document with the highest "nobody else has this" ceiling.

---

<a name="4-sound-design"></a>
## 4. Sound Design — Synthesized, Zero-Asset, Opt-In

You don't need to source or license any sound files — the Web Audio API can *synthesize* short, clean UI tones from oscillators + a gain envelope, which keeps this at effectively zero KB added to your bundle and zero licensing risk. Given your ScrambleText nav-hover and magnetic-cursor system already exist, a barely-there audio layer (a soft tick on nav hover, a slightly warmer tone on form success) is a small addition that a lot of visitors will register subconsciously as "this feels expensive" without consciously noticing why.

**Non-negotiables, per current Web Audio best practice:** default to muted/off, require an explicit user gesture to start the `AudioContext` (browsers block autoplay regardless), and give a visible, labeled mute toggle using `role="switch"` so assistive tech announces its state correctly.

```js
// sound.js — zero external assets, pure oscillator synthesis
let ctx = null;
let enabled = false;

function ensureContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
}

function tone({ freq = 440, duration = 0.08, type = 'sine', gain = 0.05 }) {
  if (!enabled || !ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export const sound = {
  hover: () => tone({ freq: 880, duration: 0.05, gain: 0.03 }),
  success: () => { tone({ freq: 523.25, duration: 0.12, gain: 0.05 }); setTimeout(() => tone({ freq: 783.99, duration: 0.18, gain: 0.05 }), 90); },
  toggle: (on) => {
    enabled = on;
    if (on) ensureContext();
  },
};
```
```html
<button id="sound-toggle" class="sound-toggle" role="switch" aria-checked="false" aria-label="Toggle interface sound">🔇</button>
```
```js
document.getElementById('sound-toggle').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  const next = btn.getAttribute('aria-checked') !== 'true';
  btn.setAttribute('aria-checked', String(next));
  btn.textContent = next ? '🔊' : '🔇';
  sound.toggle(next);
});
document.querySelectorAll('.nav-link, .btn-nav, .btn-primary').forEach(el => {
  el.addEventListener('mouseenter', () => sound.hover());
});
// in your form success onComplete:
sound.success();
```
Keep the palette to 2–3 tones maximum (hover, success, maybe one for the confetti easter egg) — more than that starts to feel like a game UI rather than an institutional site, which works against the brand tone established in §3 of the first blueprint.

---

<a name="5-form-wizard"></a>
## 5. The Multi-Step Application Wizard (You Already Have the Plugin)

Your application form is currently one long single-screen form — five fields plus a submit. Because `Flip` is already imported and registered in your project, converting this into a **3-step wizard** (Step 1: Founder + Email → Step 2: Startup Name + Stage → Step 3: Executive Summary) is now a small addition, not a new dependency, and it directly improves your actual conversion funnel — long single-screen forms reliably have lower completion rates than short paced steps, independent of any visual polish.

```js
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

document.querySelectorAll('.step-next').forEach((btn, i) => {
  btn.addEventListener('click', () => {
    const currentFields = steps[currentStep].querySelectorAll('[required]');
    const valid = Array.from(currentFields).every(f => f.checkValidity());
    if (valid) goToStep(currentStep + 1);
    else currentFields.forEach(f => { if (!f.checkValidity()) gsap.to(f, { x: [-8,8,-6,6,0], duration: 0.4 }); });
  });
});
document.querySelectorAll('.step-back').forEach(btn => {
  btn.addEventListener('click', () => goToStep(currentStep - 1));
});
```
Add a thin gold progress bar (`.wizard-progress-fill`, same `scaleX` pattern you're already using on `.scroll-progress`) above the form so users always see exactly how much is left — consistent visual language with the rest of the page, not a new pattern.

---

<a name="6-view-transitions"></a>
## 6. View Transitions API — In-Page Polish + Future-Proofing

Worth knowing precisely where this stands in mid-2026, since claims about it online are inconsistent: **same-document View Transitions are Baseline-available** (Chrome/Edge 111+, Safari 18+, Firefox 144+ as of late 2025) — meaning you can safely use `document.startViewTransition()` today with a feature-detect fallback, no polyfill needed. **Cross-document** transitions (true multi-page navigations) are solid in Chrome/Edge 126+ and Safari 18.2+, but Firefox hasn't shipped it yet — treat it strictly as progressive enhancement there.

Two applications for your actual site:

**Now — smoothing the Flip card expand/collapse and step-wizard transitions**, as a lighter-weight companion to GSAP Flip for the *simplest* cross-fades, freeing GSAP for the choreographed stuff it's actually good at:
```js
function collapseCard() {
  if (!currentExpandedCard) return;
  const doTransition = () => { /* existing Flip collapse logic */ };
  if (document.startViewTransition) {
    document.startViewTransition(doTransition);
  } else {
    doTransition();
  }
}
```

**Later — if you ever split individual portfolio companies or team bios into their own pages** (a natural next step once you have real content for each), cross-document View Transitions let a startup's card image morph directly into that page's hero image with a one-line `view-transition-name` pairing and zero extra JavaScript or router library — genuinely the highest-leverage web platform feature available for exactly that "list → detail" navigation pattern, and it's native, so it adds no bundle weight at all.

---

<a name="7-idle-nudge"></a>
## 7. The Idle-State Nudge

A small, high-ROI conversion detail: if a visitor sits on the hero for ~12 seconds without scrolling or moving the mouse, give the primary CTA (`.btn-primary` inside `.hero-actions`) a single, gentle breathing-glow pulse — not a loop, one pulse, so it reads as a nudge rather than a distraction:

```js
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
```

---

<a name="8-metadata"></a>
## 8. Share-Ready Metadata

You already added a `<meta name="description">` — good instinct, and it's exactly the right move. It's currently missing the Open Graph / Twitter Card tags that control how the link looks when it's pasted into WhatsApp, LinkedIn, or Slack — which, realistically, is how most of your actual audience (fellow students, mentors, other clubs) will first encounter this link, not by typing a URL directly.

```html
<meta property="og:title" content="Startup and Innovation Cell | PICT" />
<meta property="og:description" content="PICT's premier incubation center — transforming student ideas into scalable enterprises." />
<meta property="og:image" content="https://[your-domain]/images/og-cover.jpg" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```
The `og:image` needs to be a purpose-made 1200×630px graphic (not a resized logo) — worth designing once, since it's the single image every future share of this link will display. Given the brand system already established (Playfair Display headline, gold-on-red, the crest), this is a quick design task, not an engineering one.

Also add `apple-touch-icon` and a `manifest.json` with your gold/red theme color (`theme_color: "#8E1619"`) — small, cheap, and it means the site looks intentional rather than default if anyone adds it to their home screen on mobile.

---

<a name="9-content-debt"></a>
## 9. Content Debt — Still Open

Flagging once more, briefly, because it's still true and still the fastest way to undercut everything above: all 10 Leadership cards still link to the same LinkedIn URL, all 4 Portfolio cards still show the same image, and 4 team members still show "XYZ role." None of this is an engineering task — it's asset/content collection — but it's worth prioritizing before a public launch, because a visitor who notices identical cards will discount the polish everywhere else as "template," even though it demonstrably isn't.

---

<a name="10-roadmap"></a>
## 10. Phase 3 Roadmap

**P0 — highest leverage, do first:**
- [ ] Compress `red-texture.jpg` (4.16MB→target <200KB) and `logo.png` (1.16MB→target <80KB) via `sharp`, swap to `image-set()` in CSS ([§1](#1-asset-weight)) — bigger performance win than everything else in this document combined
- [ ] Add `Escape` + focus trap + `role="dialog"` to the Flip-expanded profile card, and a real, reachable LinkedIn link inside it ([§2.1](#2-a11y-debt))
- [ ] Branded `:focus-visible` styles ([§2.3](#2-a11y-debt))
- [ ] OG/Twitter share metadata + custom `og:image` ([§8](#8-metadata))

**P1 — next tier of craft:**
- [ ] Ambient constellation canvas behind the hero ([§3.1](#3-constellation))
- [ ] Multi-step application wizard using your existing `Flip` import ([§5](#5-form-wizard))
- [ ] Idle-state CTA nudge ([§7](#7-idle-nudge))
- [ ] Escape-to-close + focus management on the mobile drawer ([§2.2](#2-a11y-debt))

**P2 — the signature swing:**
- [ ] Full interactive "Ecosystem" node-graph section ([§3.2](#3-constellation))
- [ ] Synthesized sound design layer with opt-in toggle ([§4](#4-sound-design))
- [ ] View Transitions for Flip-card collapse as a lighter companion to GSAP ([§6](#6-view-transitions))
- [ ] Self-drawing SVG crest — blocked only on getting a vector source of the logo ([§1](#1-asset-weight))

---

*Re-audited from your live `main.js`, `style.css`, `index.html`, and `public/images` directory. Every gap identified here is something your own last round of work newly exposed or newly enabled — this is what "the next 10%" actually looks like once the foundational 90% is this solid.*
