/* Pure helpers for the gate and the story. No DOM, so they run under node --test. */

export type RGB = [number, number, number];
export type Variant = { dir: 1 | -1; A: number; turns: number; th0: number };

/** Scroll progress p at which the crane strikes the name. */
export const DIVE_END = 0.44;
/** Seconds of no scrolling before the gate opens by itself, and how long the opening takes. */
export const AUTO_DELAY = 9;
export const AUTO_RAMP = 7;
/** Scroll runway, as a fraction of the viewport height, that maps to p = 0..1. */
export const RUNWAY = 1.15;

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const smooth = (v: number) => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
export const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const rgba = (c: RGB, a: number) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${(a < 0 ? 0 : a).toFixed(3)})`;
/** Deterministic hash in [0, 1). */
export const h2 = (a: number, b: number) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

export const scrollProgress = (scrollY: number, viewportH: number) => clamp(scrollY / (RUNWAY * viewportH), 0, 1);
export const autoProgress = (idleSeconds: number) => clamp((idleSeconds - AUTO_DELAY) / AUTO_RAMP, 0, 1);

/** Each load rolls a new falcon-style path: direction, sway width, number of turns, starting phase. */
export function randomVariant(rand: () => number = Math.random): Variant {
  return { dir: rand() < 0.5 ? -1 : 1, A: 0.35 + rand() * 0.45, turns: 0.75 + rand() * 0.7, th0: rand() * Math.PI * 2 };
}

/**
 * The stoop. pu runs 0..1 from the top of the dive to the strike.
 * bx, by: screen offset as a fraction of half the viewport (by = -0.82 is high above the name, 0 is on it).
 * z: depth wobble. dive: 0 level, 1 steepest (drives the nose tilt). bank: lean into the current turn.
 * The sway decays as (1-pu)^1.1 so the corkscrew tightens, and by eases as pu^1.7 so it speeds up.
 */
export function diveAt(pu: number, V: Variant) {
  const dec = Math.pow(1 - pu, 1.1), th = V.th0 + V.dir * V.turns * Math.PI * 2 * pu;
  return {
    bx: V.A * dec * Math.sin(th),
    by: -0.82 * (1 - Math.pow(pu, 1.7)),
    z: 3.5 * dec * Math.cos(th),
    dive: Math.sin(Math.PI * pu),
    bank: V.dir * dec * Math.cos(th),
  };
}

/** holds[k]: seconds shape k stays formed. morphs[k]: seconds it takes to become shape k+1. */
export function buildTimeline(holds: number[], morphs: number[]) {
  const starts: number[] = []; let total = 0;
  for (let k = 0; k < holds.length; k++) { starts.push(total); total += holds[k] + morphs[k]; }
  return {
    starts, total,
    locate(lm: number) { let q = 0; while (q < holds.length - 1 && starts[q + 1] <= lm) q++; return q; },
    /** 0 while holding, then 0..1 across the morph. */
    morph(lm: number, k: number) { return clamp((lm - starts[k] - holds[k]) / morphs[k], 0, 1); },
  };
}
