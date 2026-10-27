/* Point-cloud shapes for the story. Each generator returns N positions plus a part id per point
   (0 ember, 1 gold, 2 amber, 3 ivory, 4 sage), which is what colors it. */
import { clamp, h2 } from './math.ts';

export type Shape = { pos: Float32Array; cid: Uint8Array; wing?: Float32Array; flapScale?: number; tilt?: number };
type V3 = [number, number, number];
type Seg = { a: V3; b: V3; c: number; j: number };

/** Sample points along line segments, in proportion to segment length. */
function fromSegs(N: number, S: Seg[], opts: { oy?: number; sc?: number }): Shape {
  const cum: number[] = []; let tot = 0;
  for (const s of S) { tot += Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2]) + 0.0001; cum.push(tot); }
  const pos = new Float32Array(N * 3), cid = new Uint8Array(N), oy = opts.oy || 0, sc = opts.sc || 1;
  for (let i = 0; i < N; i++) {
    const r = h2(i, 31) * tot; let lo = 0, hi = S.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < r) lo = mid + 1; else hi = mid; }
    const sg = S[lo], u = h2(i, 33), j = sg.j;
    pos[i * 3] = sg.a[0] + (sg.b[0] - sg.a[0]) * u + (h2(i, 34) - 0.5) * j;
    pos[i * 3 + 1] = sg.a[1] + (sg.b[1] - sg.a[1]) * u + (h2(i, 35) - 0.5) * j + oy;
    pos[i * 3 + 2] = sg.a[2] + (sg.b[2] - sg.a[2]) * u + (h2(i, 36) - 0.5) * j;
    cid[i] = sg.c;
  }
  if (sc !== 1) for (let i = 0; i < N * 3; i++) pos[i] *= sc;
  return { pos, cid };
}
const ln = (S: Seg[], a: V3, b: V3, c: number, j: number) => { S.push({ a, b, c, j }); };
function curve(S: Seg[], fn: (t: number) => V3, t0: number, t1: number, n: number, c: number, j: number) {
  let prev = fn(t0);
  for (let q = 1; q <= n; q++) { const cur = fn(t0 + (t1 - t0) * q / n); ln(S, prev, cur, c, j); prev = cur; }
}
const TAU = 6.2832;

export function dustGen(N: number): Shape {
  const pos = new Float32Array(N * 3), cid = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const r = 5.2 * Math.pow(h2(i, 61), 0.5), th = h2(i, 62) * TAU, ph = Math.acos(2 * h2(i, 63) - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th) * 1.3; pos[i * 3 + 1] = r * Math.cos(ph) * 0.8; pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    cid[i] = h2(i, 64) < 0.5 ? 1 : (h2(i, 64) < 0.8 ? 3 : 2);
  }
  return { pos, cid };
}

export function toriiGen(N: number): Shape {
  const S: Seg[] = [];
  function gate(z: number, sc: number) {
    const p = (x: number, y: number, zz?: number): V3 => [x * sc, y * sc, z + (zz || 0) * sc];
    [-1.7, 1.7].forEach((x) => { ln(S, p(x, -2.3, 0), p(x, 1.95, 0), 0, 0.2 * sc); ln(S, p(x * 1.04, -2.3, 0), p(x * 0.97, 1.95, 0), 0, 0.12 * sc); });
    ln(S, p(-2.15, 0.95, 0), p(2.15, 0.95, 0), 2, 0.1 * sc);
    ln(S, p(-2.4, 1.72, 0), p(2.4, 1.72, 0), 2, 0.1 * sc);
    [-0.12, 0.12].forEach((zz) => {
      [0, 0.14].forEach((dy) => {
        curve(S, (x) => p(x, 2.05 + dy + 0.3 * Math.pow(x / 3.1, 2), zz), -3.1, 3.1, 14, 1, 0.05 * sc);
      });
    });
  }
  gate(-2.8, 1); gate(0, 1); gate(2.8, 1);
  const g = fromSegs(N, S, { sc: 0.78 }); g.tilt = -0.1; return g;
}

export function bridgeGen(N: number): Shape {
  const S: Seg[] = [], X = 3.8, deck = (x: number) => -0.55 + 0.35 * (1 - (x / X) * (x / X));
  [-0.9, 0.9].forEach((z) => {
    curve(S, (t) => [t, deck(t), z], -X, X, 24, 3, 0.05);
    curve(S, (a) => [1.7 * Math.cos(a), -1.75 + 1.25 * Math.sin(a), z], 0, Math.PI, 20, 1, 0.05);
    [-X, -1.7, 1.7, X].forEach((x) => { ln(S, [x, -2.05, z], [x, deck(x), z], 3, 0.1); });
  });
  [-1.8, 1.8, -2.7, 2.7].forEach((z) => { curve(S, (t) => [t, -2.05 + 0.05 * Math.sin(t * 3 + z), z], -X - 0.6, X + 0.6, 20, 4, 0.04); });
  [-1, 1].forEach((s) => {
    curve(S, (t) => [t, 0.3 + 0.2 * Math.pow(Math.abs(t) / X, 3), s * 1.45], -X - 0.1, X + 0.1, 24, 2, 0.05);
    [1, 2, 3].forEach((k) => {
      const f = k / 4;
      curve(S, (t) => [t, 0.3 + 0.8 * Math.pow(f, 1.5) + 0.2 * Math.pow(Math.abs(t) / X, 3), s * 1.45 * (1 - f)], -X - 0.1, X + 0.1, 20, 2, 0.05);
    });
    [-3.4, -2.2, -1.2, 1.2, 2.2, 3.4].forEach((x) => { ln(S, [x, deck(x), s * 1.2], [x, 0.3, s * 1.2], 0, 0.08); });
  });
  curve(S, (t) => [t, 1.15 + 0.2 * Math.pow(Math.abs(t) / X, 3), 0], -X - 0.1, X + 0.1, 24, 1, 0.06);
  /* central shrine roof */
  [-1, 1].forEach((sx) => { [-1, 1].forEach((sz) => { ln(S, [sx * 1.15, 1.05, sz * 1.45], [sx * 0.3, 2.0, 0], 1, 0.06); }); });
  curve(S, (t) => [t, 1.05, 1.45], -1.15, 1.15, 4, 1, 0.05);
  curve(S, (t) => [t, 1.05, -1.45], -1.15, 1.15, 4, 1, 0.05);
  ln(S, [-0.3, 2.0, 0], [0.3, 2.0, 0], 1, 0.06);
  ln(S, [0, 2.0, 0], [0, 2.5, 0], 1, 0.05);
  const g = fromSegs(N, S, { oy: -0.1, sc: 0.8 }); g.tilt = 0.05; return g;
}

export function pagodaGen(N: number): Shape {
  const S: Seg[] = [];
  /* the single pillar */
  [-1, 1].forEach((a) => { [-1, 1].forEach((b) => { ln(S, [a * 0.2, -2.05, b * 0.2], [a * 0.2, -0.45, b * 0.2], 3, 0.05); }); });
  [-1.7, -1.1, -0.6].forEach((y) => { curve(S, (a) => [0.28 * Math.cos(a), y, 0.28 * Math.sin(a)], 0, TAU, 12, 3, 0.04); });
  /* platform */
  const sq = (h: number, y: number, c: number) => { ln(S, [-h, y, -h], [h, y, -h], c, 0.05); ln(S, [h, y, -h], [h, y, h], c, 0.05); ln(S, [h, y, h], [-h, y, h], c, 0.05); ln(S, [-h, y, h], [-h, y, -h], c, 0.05); };
  sq(1.45, -0.3, 2); sq(1.25, -0.5, 2);
  /* posts */
  [-1, 1].forEach((a) => { [-1, 1].forEach((b) => { ln(S, [a * 1.05, -0.3, b * 1.05], [a * 1.05, 0.7, b * 1.05], 0, 0.07); }); });
  /* two-tier hip roof with raised corners */
  function roof(h: number, yEave: number, yApex: number, up: number, c1: number, c2: number) {
    const edge = (fn: (u: number) => V3) => curve(S, fn, -1, 1, 12, c1, 0.05);
    edge((u) => [h * u, yEave + up * u * u, h]);
    edge((u) => [h * u, yEave + up * u * u, -h]);
    edge((u) => [h, yEave + up * u * u, h * u]);
    edge((u) => [-h, yEave + up * u * u, h * u]);
    [-1, 1].forEach((a) => { [-1, 1].forEach((b) => { ln(S, [a * h, yEave + up, b * h], [0, yApex, 0], c2, 0.06); ln(S, [a * h * 0.5, yEave + up * 0.35 + (yApex - yEave) * 0.45, b * h * 0.5], [0, yApex, 0], c2, 0.04); }); });
  }
  roof(1.75, 0.7, 2.1, 0.3, 2, 1);
  roof(0.85, 1.75, 2.55, 0.18, 2, 1);
  ln(S, [0, 2.55, 0], [0, 3.1, 0], 1, 0.05);
  /* pond ripples */
  [1.2, 2.0, 2.8, 3.6, 4.4].forEach((r, k) => { curve(S, (a) => [r * Math.cos(a), -2.05 + 0.06 * Math.sin(a * 3 + k), r * Math.sin(a)], 0, TAU, 40, k % 2 ? 3 : 4, 0.03); });
  const g = fromSegs(N, S, { oy: -0.5, sc: 0.9 }); g.tilt = 0.12; return g;
}

export function sphereGen(N: number): Shape {
  const pos = new Float32Array(N * 3), cid = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const y = 1 - (i + 0.5) / N * 2, rr = Math.sqrt(1 - y * y), th = i * 2.39996;
    pos[i * 3] = Math.cos(th) * rr * 2.7; pos[i * 3 + 1] = y * 2.7; pos[i * 3 + 2] = Math.sin(th) * rr * 2.7;
    cid[i] = clamp(Math.floor((1 - y) / 2 * 4), 0, 3);
  }
  return { pos, cid };
}

function starPerimeter(rOut: number, rIn: number, zj: number, off: number) {
  const V: [number, number][] = [], cum = [0]; let total = 0;
  for (let k = 0; k < 28; k++) { const an = k / 28 * TAU; V.push([(k % 2 ? rIn : rOut) * Math.cos(an), (k % 2 ? rIn : rOut) * Math.sin(an)]); }
  for (let k = 0; k < 28; k++) { const a0 = V[k], b0 = V[(k + 1) % 28]; total += Math.hypot(b0[0] - a0[0], b0[1] - a0[1]); cum.push(total); }
  return (i: number, n: number): V3 => {
    const s = (i + 0.5) / n * total; let seg = 0;
    while (seg < 27 && cum[seg + 1] < s) seg++;
    const fr = (s - cum[seg]) / (cum[seg + 1] - cum[seg] || 1), p0 = V[seg], p1 = V[(seg + 1) % 28];
    return [p0[0] + (p1[0] - p0[0]) * fr, p0[1] + (p1[1] - p0[1]) * fr, (h2(i + off, 4) - 0.5) * zj];
  };
}

export function drumGen(N: number): Shape {
  const pos = new Float32Array(N * 3), cid = new Uint8Array(N), nStar = Math.round(N * 0.4), f = starPerimeter(2.5, 0.85, 0.3, 11);
  for (let i = 0; i < N; i++) {
    let x: number, y: number, z = (h2(i, 8) - 0.5) * 0.25, cd: number;
    if (i < nStar) { const p = f(i, nStar); x = p[0]; y = p[1]; z = p[2]; cd = 2; }
    else {
      const q = i - nStar, m = N - nStar, grp = q % 3, k = Math.floor(q / 3), cnt = Math.ceil(m / 3), an = k / cnt * TAU;
      if (grp === 0) { x = 3.1 * Math.cos(an); y = 3.1 * Math.sin(an); cd = 1; }
      else if (grp === 1) { const a2 = Math.round(k / cnt * 48) / 48 * TAU; x = 3.75 * Math.cos(a2); y = 3.75 * Math.sin(a2); cd = 3; }
      else { const rz = Math.round(k / cnt * 72) % 2 ? 4.5 : 4.15; x = rz * Math.cos(an); y = rz * Math.sin(an); cd = 0; }
    }
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; cid[i] = cd;
  }
  return { pos, cid };
}

export function ensoGen(N: number): Shape {
  const pos = new Float32Array(N * 3), cid = new Uint8Array(N), start = -2.3;
  for (let i = 0; i < N; i++) {
    const s = Math.pow(h2(i, 5), 0.9), th = start + 5.5 * s, taper = 1 - 0.6 * s;
    let r = 3.3 + (h2(i, 6) - 0.5) * 0.75 * taper * (0.6 + 0.8 * s);
    if (s > 0.8 && h2(i, 12) < 0.4) r += (h2(i, 13) > 0.5 ? 1 : -1) * 0.5 * (s - 0.7);
    pos[i * 3] = r * Math.cos(th); pos[i * 3 + 1] = r * Math.sin(th); pos[i * 3 + 2] = (h2(i, 7) - 0.5) * 0.3;
    cid[i] = s < 0.3 ? 3 : (s < 0.7 ? 2 : 0);
  }
  return { pos, cid };
}

export function craneGen(N: number): Shape {
  const T = 1.15, tip = 0.1 + 0.4 * 0.55, tq = 0.1 + 0.4 * 0.28, SC = 2.4;
  const F: V3[][] = [
    [[0, 0.18, 0], [0, 0, -0.14], [-0.35, 0, 0]], [[0, 0.18, 0], [0.35, 0, 0], [0, 0, -0.14]], [[0, 0.18, 0], [0, 0, 0.14], [0.35, 0, 0]], [[0, 0.18, 0], [-0.35, 0, 0], [0, 0, 0.14]],
    [[0, -0.12, 0], [-0.35, 0, 0], [0, 0, -0.14]], [[0, -0.12, 0], [0, 0, -0.14], [0.35, 0, 0]], [[0, -0.12, 0], [0.35, 0, 0], [0, 0, 0.14]], [[0, -0.12, 0], [0, 0, 0.14], [-0.35, 0, 0]],
    [[0.3, 0.03, 0.05], [0.3, 0.03, -0.05], [0.6, 0.3, 0]], [[0.58, 0.3, 0.025], [0.58, 0.3, -0.025], [0.84, 0.2, 0]], [[-0.3, 0.02, 0.05], [-0.3, 0.02, -0.05], [-0.7, 0.24, 0]],
    [[-0.22, 0.1, 0], [0.26, 0.1, 0], [0.05, tip, -T]], [[-0.22, 0.1, 0], [0.05, tip, -T], [-0.3, tq, -0.7]],
    [[-0.22, 0.1, 0], [0.05, tip, T], [0.26, 0.1, 0]], [[-0.22, 0.1, 0], [-0.3, tq, 0.7], [0.05, tip, T]],
  ];
  const cum: number[] = []; let tot = 0;
  for (const [a0, b0, c0] of F) {
    const ux = b0[0] - a0[0], uy = b0[1] - a0[1], uz = b0[2] - a0[2], wx = c0[0] - a0[0], wy = c0[1] - a0[1], wz = c0[2] - a0[2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    tot += 0.5 * Math.sqrt(nx * nx + ny * ny + nz * nz) + 0.004; cum.push(tot);
  }
  const pos = new Float32Array(N * 3), wing = new Float32Array(N), cid = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const r = h2(i, 1) * tot; let f = 0; while (f < F.length - 1 && cum[f] < r) f++;
    const v0 = F[f][0], v1 = F[f][1], v2 = F[f][2]; let px: number, py: number, pz: number;
    if (h2(i, 4) < 0.3) {
      const e = Math.floor(h2(i, 5) * 3), s = h2(i, 6), q0 = F[f][e], q1 = F[f][(e + 1) % 3];
      px = q0[0] + (q1[0] - q0[0]) * s; py = q0[1] + (q1[1] - q0[1]) * s; pz = q0[2] + (q1[2] - q0[2]) * s;
    } else {
      let u = h2(i, 2), v = h2(i, 3); if (u + v > 1) { u = 1 - u; v = 1 - v; }
      px = v0[0] + u * (v1[0] - v0[0]) + v * (v2[0] - v0[0]); py = v0[1] + u * (v1[1] - v0[1]) + v * (v2[1] - v0[1]); pz = v0[2] + u * (v1[2] - v0[2]) + v * (v2[2] - v0[2]);
    }
    pos[i * 3] = (px - 0.07) * SC; pos[i * 3 + 1] = (py - 0.12) * SC; pos[i * 3 + 2] = pz * SC;
    wing[i] = f >= 11 ? Math.min(1, Math.abs(pz) / T) : 0;
    cid[i] = f < 8 ? 3 : (f < 10 ? 0 : (f === 10 ? 1 : (wing[i] > 0.72 ? 0 : 2)));
  }
  return { pos, wing, cid, flapScale: 0.55 * SC };
}
