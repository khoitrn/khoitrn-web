// Abstract cover art for a talk. Four different compositions share one visual language: thin gold
// strokes on the page color, with Japanese and Vietnamese pattern work drawn the way the site draws
// everything else, as points and hairlines. A talk's slug picks the composition and varies it, so
// every talk gets its own picture and a new talk needs no artwork. The grid is 160 by 90.
// Colors come from CSS variables so the art follows the site theme.

export const COVER_KINDS = ['swell', 'ridge', 'drum', 'lattice'] as const;
export type CoverKind = (typeof COVER_KINDS)[number];

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
type Rand = () => number;

const f = (n: number) => n.toFixed(2);
const GOLD = 'var(--color-accent)';
const CANVAS = 'var(--color-canvas)';

// The salt below is chosen so the first three talks land on three different compositions.
export function coverKind(seed: string): CoverKind {
  return COVER_KINDS[Math.floor(rng(`cover-kind-5:${seed}`)() * COVER_KINDS.length)];
}

// A few points in the sky, each joined to its nearest neighbour by a hairline.
function stars(r: Rand, count: number, maxY: number): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < count; i++) pts.push([4 + r() * 152, 4 + r() * Math.max(6, maxY)]);
  let s = '';
  pts.forEach((a, i) => {
    let best: [number, number] | null = null;
    let bd = Infinity;
    pts.forEach((b, j) => {
      if (i === j) return;
      const d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
      if (d < bd) { bd = d; best = b; }
    });
    if (best && bd < 520) s += `<path d="M${f(a[0])} ${f(a[1])} L${f(best[0])} ${f(best[1])}" stroke="${GOLD}" stroke-width=".25" opacity=".35"/>`;
    s += `<circle cx="${f(a[0])}" cy="${f(a[1])}" r="${f(0.45 + r() * 0.6)}" fill="${GOLD}" opacity=".55"/>`;
  });
  return s;
}

// 1. swell: a sun rising behind rows of seigaiha waves.
function swell(r: Rand): string {
  const sr = 9 + r() * 6;
  const sx = sr + 8 + r() * (160 - 2 * sr - 16);
  const sy = sr + 4 + r() * Math.max(2, 40 - sr - 4);
  const look = Math.floor(r() * 3);
  const horizon = 46 + r() * 12;
  const wr = 4.4 + r() * 1.8;
  const dx = wr * 1.55;
  const dy = wr * 0.72;

  let s = `<g data-kind="swell" data-sun="${f(sx)},${f(sy)},${f(sr)}" data-horizon="${f(horizon)}">`;
  s += stars(r, 8 + Math.floor(r() * 12), horizon - 14);
  if (r() > 0.45) s += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr + 5 + r() * 4)}" fill="none" stroke="${GOLD}" stroke-width=".4" stroke-opacity=".45" stroke-dasharray="1 2.2"/>`;
  if (look === 2) {
    s += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr)}" fill="none" stroke="${GOLD}" stroke-width=".9"/><circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr * 0.55)}" fill="none" stroke="${GOLD}" stroke-width=".4" stroke-opacity=".7"/><circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr * 0.2)}" fill="${GOLD}"/>`;
  } else {
    s += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr)}" fill="${GOLD}"/>`;
    if (look === 1) s += `<g fill="none" stroke="${CANVAS}" stroke-width=".5" opacity=".85"><circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr * 0.72)}"/><circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr * 0.45)}"/><circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr * 0.2)}"/></g>`;
  }
  let row = 0;
  for (let y = horizon; y < 100; y += dy, row++) {
    const op = Math.min(0.95, 0.35 + row * 0.06);
    for (let x = -dx + (row % 2 ? dx / 2 : 0); x <= 160 + dx; x += dx) {
      s += `<g fill="${CANVAS}" stroke="${GOLD}" stroke-width=".35" stroke-opacity="${f(op)}"><circle cx="${f(x)}" cy="${f(y)}" r="${f(wr)}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(wr * 0.68)}" fill="none"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(wr * 0.34)}" fill="none"/></g>`;
    }
  }
  return s + '</g>';
}

// 2. ridge: five layered mountain ridgelines under a low sun, the highest peaks joined as a constellation.
function ridge(r: Rand): string {
  const sr = 9 + r() * 5;
  const sx = 28 + r() * 104;
  const sy = 24 + r() * 12;
  let s = `<g data-kind="ridge" data-ridges="5">`;
  s += stars(r, 6 + Math.floor(r() * 6), 22);
  s += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr)}" fill="${GOLD}"/>`;
  s += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr + 5)}" fill="none" stroke="${GOLD}" stroke-width=".4" stroke-opacity=".4" stroke-dasharray="1 2.2"/>`;

  const peak = (t: number) => 1 - Math.abs(Math.sin(t));
  for (let i = 0; i < 5; i++) {
    const base = 40 + i * 11;
    const amp = 12 + i * 2.5;
    const f1 = 0.035 + r() * 0.04 + i * 0.008;
    const f2 = 0.1 + r() * 0.08;
    const p1 = r() * 6.28;
    const p2 = r() * 6.28;
    const pts: [number, number][] = [];
    for (let x = -2; x <= 162; x += 3) pts.push([x, base - amp * (0.6 * peak(x * f1 + p1) + 0.4 * peak(x * f2 + p2))]);
    // mist between the layers
    s += `<path d="M0 ${f(base - 3)} H160" stroke="${GOLD}" stroke-width=".3" stroke-opacity=".28" stroke-dasharray="7 4"/>`;
    s += `<path d="M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')} L162 100 L-2 100 Z" fill="${CANVAS}" stroke="${GOLD}" stroke-width="${f(0.4 + i * 0.1)}" stroke-opacity="${f(0.3 + i * 0.15)}" stroke-linejoin="round"/>`;
    if (i === 1) {
      const tops = pts.filter((p, k) => k > 0 && k < pts.length - 1 && p[1] < pts[k - 1][1] && p[1] <= pts[k + 1][1] && p[0] > 4 && p[0] < 156);
      if (tops.length > 1) s += `<path d="M${tops.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')}" fill="none" stroke="${GOLD}" stroke-width=".3" stroke-opacity=".6"/>`;
      tops.forEach(([x, y]) => { s += `<circle cx="${f(x)}" cy="${f(y)}" r="1" fill="${GOLD}"/>`; });
    }
  }
  return s + '</g>';
}

// 3. drum: Dong Son bronze-drum rings with a zigzag band and a ray crown, off centre.
function drum(r: Rand): string {
  const cx = 70 + r() * 60;
  const cy = 30 + r() * 30;
  let s = `<g data-kind="drum" data-teeth="56">`;
  for (let i = 1; i <= 11; i++) {
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(i * 7.5)}" fill="none" stroke="${GOLD}" stroke-width="${i % 3 ? 0.35 : 0.8}" stroke-opacity="${f(Math.max(0.14, 0.85 - i * 0.07))}"/>`;
  }
  const p = (a: number, rr: number) => `${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`;
  const band = (inner: number, outer: number, n: number, op: number) => {
    let d = '';
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * Math.PI * 2;
      const a1 = ((k + 0.5) / n) * Math.PI * 2;
      const a2 = ((k + 1) / n) * Math.PI * 2;
      d += `M${p(a0, inner)} L${p(a1, outer)} L${p(a2, inner)}`;
    }
    return `<path d="${d}" fill="none" stroke="${GOLD}" stroke-width=".45" stroke-opacity="${op}"/>`;
  };
  s += band(37.5, 44, 56, 0.9) + band(60, 66, 80, 0.5);
  s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="4.6" fill="${GOLD}"/>`;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    s += `<path d="M${p(a, 6.5)} L${p(a, 11)}" stroke="${GOLD}" stroke-width=".6" stroke-linecap="round"/>`;
  }
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2;
    const [x, y] = [cx + Math.cos(a) * 44, cy + Math.sin(a) * 44];
    s += `<rect x="${f(x - 1.3)}" y="${f(y - 1.3)}" width="2.6" height="2.6" fill="${CANVAS}" stroke="${GOLD}" stroke-width=".6"/>`;
  }
  s += `<path d="M8 84 H152" stroke="${GOLD}" stroke-width="2.4" stroke-opacity=".5" stroke-dasharray=".35 3.65"/>`;
  return s + '</g>';
}

// 4. lattice: an asanoha-style triangular lattice fading from its centre, with a circuit trace walking its edges.
function lattice(r: Rand): string {
  const a = 9;
  const h = a * 0.866;
  const [ox, oy] = [2, 3];
  const cx = 34 + r() * 92;
  const cy = 30 + r() * 28;
  const R = 46 + r() * 12;
  let s = `<g data-kind="lattice" data-lattice="${a}">`;
  const inside = (x: number, y: number) => Math.hypot(x - cx, y - cy) <= R;
  const pos = (i: number, j: number): [number, number] => [ox + i * a + (j % 2) * (a / 2), oy + j * h];
  const edge = (x1: number, y1: number, x2: number, y2: number) => {
    if (!inside(x1, y1) || !inside(x2, y2)) return '';
    const d = Math.hypot((x1 + x2) / 2 - cx, (y1 + y2) / 2 - cy);
    return `<path d="M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}" stroke="${GOLD}" stroke-width=".3" stroke-opacity="${f(0.1 + 0.4 * (1 - d / R))}"/>`;
  };
  for (let j = 0; j <= 12; j++) {
    for (let i = -1; i <= 19; i++) {
      const [x, y] = pos(i, j);
      s += edge(x, y, x + a, y) + edge(x, y, x + a / 2, y + h) + edge(x, y, x - a / 2, y + h);
      if (inside(x, y) && Math.hypot(x - cx, y - cy) < R * 0.55) s += `<circle cx="${f(x)}" cy="${f(y)}" r=".55" fill="${GOLD}" opacity=".5"/>`;
    }
  }
  s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R + 4)}" fill="none" stroke="${GOLD}" stroke-width=".4" stroke-opacity=".35" stroke-dasharray="1 2.4"/>`;

  // circuit trace along lattice edges: right, up-right or down-right moves only
  const j0 = Math.max(1, Math.min(9, Math.round((cy - oy) / h)));
  let [x, y] = pos(Math.max(0, Math.round((cx - R * 0.9 - ox) / a)), j0);
  const path: [number, number][] = [[x, y]];
  for (let n = 0; n < 11 && x < 150; n++) {
    const moves: [number, number][] = [[a, 0], [a / 2, -h], [a / 2, h], [a, 0]];
    const [mx, my] = moves[Math.floor(r() * moves.length)];
    if (y + my < 8 || y + my > 82) continue;
    x += mx;
    y += my;
    path.push([x, y]);
  }
  s += `<path d="M${path.map(([px, py]) => `${f(px)} ${f(py)}`).join(' L')}" fill="none" stroke="${GOLD}" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/>`;
  path.forEach(([px, py], k) => {
    s += k === path.length - 1
      ? `<circle cx="${f(px)}" cy="${f(py)}" r="3.4" fill="${CANVAS}" stroke="${GOLD}" stroke-width=".8"/><circle cx="${f(px)}" cy="${f(py)}" r="1.2" fill="${GOLD}"/>`
      : `<rect x="${f(px - 1.2)}" y="${f(py - 1.2)}" width="2.4" height="2.4" fill="${CANVAS}" stroke="${GOLD}" stroke-width=".6"/>`;
  });
  return s + '</g>';
}

const MAKERS: Record<CoverKind, (r: Rand) => string> = { swell, ridge, drum, lattice };

export function talkCoverSvg(seed: string, kind: CoverKind = coverKind(seed)): string {
  return MAKERS[kind](rng(`${kind}:${seed}`));
}
