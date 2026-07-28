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
  success: () => { 
    tone({ freq: 523.25, duration: 0.12, gain: 0.05 }); 
    setTimeout(() => tone({ freq: 783.99, duration: 0.18, gain: 0.05 }), 90); 
  },
  toggle: (on) => {
    enabled = on;
    if (on) ensureContext();
  },
};
