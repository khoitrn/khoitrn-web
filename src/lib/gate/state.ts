/* State shared by the canvas, the gate and the page chrome. The canvas loop owns it and calls the listeners every frame. */

const SEEN_KEY = 'khoi-gate-seen';

export const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True once the gate has been played or skipped in this browser session. */
export function gateSeen(): boolean {
  try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
}
export function markGateSeen() {
  try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* storage blocked: the gate just plays again next visit */ }
}

export const gate = {
  /** Latched target progress (only ever goes up) and the eased value everything is drawn from. */
  target: 0,
  p: 0,
  /** Screen position of the crane, so the title letters can react to it. */
  crane: { x: 0, y: 0 },
  /** Seconds of animation time since the gate started (pauses while the tab is hidden). */
  idle: 0,
};

type Listener = (p: number, dt: number) => void;
const listeners: Listener[] = [];
export const onFrame = (fn: Listener) => { listeners.push(fn); };
export const emitFrame = (dt: number) => { for (const fn of listeners) fn(gate.p, dt); };

/** Jump straight to the opened page (skip control, reduced motion, repeat visit). */
export const openGate = () => { gate.target = 1; };
