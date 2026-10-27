/* The canvas scene: one cloud of points that forms dust, a paper crane, then a short story of shapes.
   Scroll progress p (0..1) drives the crane's dive and the camera; after the gate it runs on a timer. */
import { clamp, smooth, mixc, rgba, diveAt, randomVariant, buildTimeline, DIVE_END, type RGB, type Variant } from './math.ts';
import * as shapes from './shapes.ts';
import { gate } from './state.ts';

const GOLD: RGB = [200, 148, 60], AMBER: RGB = [228, 174, 86], IVORY: RGB = [220, 212, 190], EMBER: RGB = [204, 108, 60], SAGE: RGB = [150, 176, 108];
/* part palette: 0 ember, 1 gold, 2 amber, 3 ivory, 4 sage */
const PAL: RGB[] = [EMBER, GOLD, AMBER, IVORY, SAGE];
const UI_FONT = '"Be Vietnam Pro", system-ui, "Helvetica Neue", Arial, sans-serif';
const TAU = 6.2832;

/** Chapters, in order. The caption shows while a chapter is current; the first (dust) has none. */
const CHAPTERS: [string, (n: number) => shapes.Shape, string][] = [
  ['Dust', shapes.dustGen, ''],
  ['Hạc', shapes.craneGen, 'Out of dust, a paper crane flies toward you.'],
  ['Cổng', shapes.toriiGen, 'It passes under a gate, the way you pass into a new place.'],
  ['Chùa Cầu', shapes.bridgeGen, 'Past the gate, the covered bridge in Hội An, built by Japanese merchants in the 1590s.'],
  ['Chùa Một Cột', shapes.pagodaGen, 'Then One Pillar Pagoda in Hanoi, standing in a lotus pond.'],
  ['Ensō', shapes.ensoGen, 'Then stillness: one brush stroke, one circle.'],
  ['Đông Sơn', shapes.drumGen, 'Behind the circle, the star on the Đông Sơn drum.'],
  ['Latent', shapes.sphereGen, 'And the star dissolves into a model still learning its shape.'],
];
const HOLDS = [0.4, 1.2, 3.2, 3.6, 3.8, 3.2, 3.2, 3.2];
const MORPHS = [1.8, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2];
const TL = buildTimeline(HOLDS, MORPHS);
const S = CHAPTERS.length;
const YAW = 0.4, YAW_AMP = 0.4;
/* neighbor links: points closer than LIM are joined, at most 4 per point */
const LIM = 1.25, D2 = LIM * LIM, MAX_LINKS = 4;

export type SceneOptions = {
  canvas: HTMLCanvasElement;
  reduce: boolean;
  /** Called when the current chapter changes: caption text and the index of the tick to light (-1 for none). */
  onChapter: (caption: string, tick: number) => void;
};

export class Scene {
  private ctx: CanvasRenderingContext2D;
  private W = 0; private H = 0; private DPR = 1; private FL = 800;
  private OX = 0; private OX0 = 0; private OY = 0;
  private N: number;
  private narrow: boolean;
  private reduce: boolean;
  private onChapter: SceneOptions['onChapter'];

  private shapes: { name: string; story: string; pos: Float32Array; cid: Uint8Array; wing: Float32Array | null; flap: number; tilt: number }[];
  private X: Float32Array; private Y: Float32Array; private Z: Float32Array; private E: Float32Array;
  private cnt: Uint8Array;
  private sx: Float32Array; private sy: Float32Array; private ss: Float32Array; private sd: Float32Array;
  private txt: string[]; private txtT = -9;
  /* link pairs found this frame, with the bucket (distance band x part color) each is drawn in */
  private pa: Int32Array; private pb: Int32Array; private pk: Uint8Array;

  private variant: Variant = randomVariant();
  private t0: number | null = null; private tOpen: number | null = null; private toff = 0;
  private label = '';

  /* pointer: smoothed position drives parallax, `at` shows the x/y/z readout, `tap` jumps to the next morph */
  private ptr = { x: 0, y: 0, nx: 0, ny: 0, sx: 0, sy: 0, t: -99999, tap: false };
  private down: { x: number; y: number; t: number } | null = null;

  constructor(o: SceneOptions) {
    this.ctx = o.canvas.getContext('2d')!;
    this.canvas = o.canvas;
    this.reduce = o.reduce;
    this.onChapter = o.onChapter;
    this.narrow = window.innerWidth <= 760;
    this.N = this.narrow ? 320 : this.reduce ? 480 : 700;
    const N = this.N;
    this.shapes = CHAPTERS.map(([name, gen, story]) => { const g = gen(N); return { name, story, pos: g.pos, cid: g.cid, wing: g.wing || null, flap: g.flapScale || 0, tilt: g.tilt || 0 }; });
    this.X = new Float32Array(N); this.Y = new Float32Array(N); this.Z = new Float32Array(N); this.E = new Float32Array(N);
    this.cnt = new Uint8Array(N);
    this.sx = new Float32Array(N); this.sy = new Float32Array(N); this.ss = new Float32Array(N); this.sd = new Float32Array(N);
    this.txt = new Array(N).fill('');
    this.pa = new Int32Array(N * 2); this.pb = new Int32Array(N * 2); this.pk = new Uint8Array(N * 2);
    this.resize();
  }
  private canvas: HTMLCanvasElement;

  /** Size the backing store (device pixel ratio capped at 2). Returns false when nothing changed enough to matter. */
  resize() {
    const W = window.innerWidth, H = window.innerHeight;
    /* mobile URL bars change innerHeight by ~100px while scrolling: keep the layout, don't reallocate the canvas */
    if (this.W && W === this.W && Math.abs(H - this.H) < 150) return;
    this.DPR = Math.min(window.devicePixelRatio || 1, 2);
    this.W = W; this.H = H;
    this.canvas.width = Math.round(W * this.DPR); this.canvas.height = Math.round(H * this.DPR);
    this.FL = Math.min(Math.max(W, H * 1.3) * 0.8, W * 1.7);
    this.OX0 = W > 900 ? W * 0.1 : 0;
    this.OY = -H * 0.05;
  }

  pointer(e: PointerEvent) {
    const p = this.ptr;
    p.x = e.clientX; p.y = e.clientY; p.nx = e.clientX / this.W * 2 - 1; p.ny = e.clientY / this.H * 2 - 1; p.t = performance.now();
    if (e.type === 'pointerdown') this.down = { x: e.clientX, y: e.clientY, t: p.t };
    /* a tap is a short press that did not move: a scroll drag on a phone must not skip a chapter */
    else if (e.type === 'pointerup' && this.down) {
      if (Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y) < 10 && p.t - this.down.t < 500) p.tap = true;
      this.down = null;
    } else if (e.type === 'pointercancel') this.down = null;
  }

  /** Draw one frame. T: animation seconds. p: eased gate progress. alpha: fade-in of the whole canvas. raw: real dt for pointer easing. */
  frame(T: number, p: number, alpha: number, raw: number) {
    const { ctx, N, X, Y, Z, E, cnt, sx, sy, ss, sd, ptr } = this;
    const W = this.W, H = this.H, DPR = this.DPR, FL = this.FL, reduce = this.reduce;
    let i: number, j: number;

    const k = Math.min(1, raw * 2.5); ptr.sx += (ptr.nx - ptr.sx) * k; ptr.sy += (ptr.ny - ptr.sy) * k;
    this.OX = this.OX0 * smooth((p - 0.5) / 0.4); /* centered behind the title, then drifts right to make room for the page */
    const OX = this.OX, OY = this.OY;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = smooth(alpha);

    if (this.t0 === null) this.t0 = T;
    const t = T - this.t0;
    const ie = reduce ? 0 : 1 - smooth(clamp(p / 0.6, 0, 1)); /* 1 = far away and head-on, 0 = arrived */
    if (p > 0.97 && this.tOpen === null) this.tOpen = t;
    const gs = TL.starts[1];
    const base = this.tOpen === null ? Math.min(t, gs) : gs + (t - this.tOpen);
    let lm = Math.max(0, base + this.toff) % TL.total, kk = TL.locate(lm);
    if (ptr.tap) {
      ptr.tap = false;
      if (this.tOpen !== null) {
        const ph = lm - TL.starts[kk];
        if (ph < HOLDS[kk]) { this.toff += HOLDS[kk] - ph; lm = Math.max(0, base + this.toff) % TL.total; kk = TL.locate(lm); }
      }
    }

    /* the dive: high above the name, drops with increasing speed, corkscrews tighter, straightens at the strike */
    const dcam = 12 + 30 * ie, pu = reduce ? 1 : clamp(p / DIVE_END, 0, 1);
    const D = diveAt(pu, this.variant);
    const ofx = D.bx * (W / 2) * dcam / FL, ofy = -D.by * (H / 2) * dcam / FL, ofz = D.z;
    gate.crane.x = W / 2 + OX + D.bx * W / 2; gate.crane.y = H / 2 + OY + D.by * H / 2;

    const A = this.shapes[kk], B = this.shapes[(kk + 1) % S];
    const mt = TL.morph(lm, kk), sm = mt * mt * (3 - 2 * mt);
    const ci = (mt > 0.5 ? kk + 1 : kk) % S, cs = this.shapes[ci];
    if (cs.name !== this.label) { this.label = cs.name; this.onChapter(cs.story, ci >= 1 && ci <= 7 ? ci - 1 : -1); }

    let ay = YAW + YAW_AMP * Math.sin(t * 0.18) + ptr.sx * 0.5;
    ay += (1.3 - ay) * ie; /* head-on at first, then it banks into profile */
    ay += 0.5 * D.bank; /* leans into each turn of the spiral */
    const ax = 0.35 + (A.tilt + (B.tilt - A.tilt) * sm) + ptr.sy * 0.3 - 0.7 * D.dive; /* nose down during the dive */
    const cb = Math.cos(ay), sb = Math.sin(ay), ca = Math.cos(ax), sa = Math.sin(ax);
    const ap = A.pos, bp = B.pos, cA = A.cid, cB = B.cid;
    const flapNow = Math.sin(t * (2.2 + 1.6 * ie)) * 0.5;
    for (i = 0; i < N; i++) {
      let e = clamp((mt - (i % 9) / 9 * 0.45) / 0.55, 0, 1); e = e * e * (3 - 2 * e); E[i] = e;
      let yA = ap[i * 3 + 1], yB = bp[i * 3 + 1];
      if (A.wing) yA += flapNow * A.flap * A.wing[i];
      if (B.wing) yB += flapNow * B.flap * B.wing[i];
      X[i] = ap[i * 3] + (bp[i * 3] - ap[i * 3]) * e + Math.sin(t * 0.5 + i) * 0.07;
      Y[i] = yA + (yB - yA) * e + Math.sin(t * 0.43 + i * 1.3) * 0.07;
      Z[i] = ap[i * 3 + 2] + (bp[i * 3 + 2] - ap[i * 3 + 2]) * e + Math.sin(t * 0.37 + i * 0.7) * 0.07;
      cnt[i] = 0;
    }

    /* neighbor links (O(N^2) with early-outs; see the perf note in the PR). Links fade mid-morph so each shape stands out. */
    const linkK = 1 - 0.75 * Math.sin(Math.PI * mt);
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    let pn = 0;
    const pa = this.pa, pb = this.pb, pk = this.pk;
    for (i = 0; i < N; i++) {
      const xi = X[i], yi = Y[i], zi = Z[i];
      for (j = i + 1; j < N; j++) {
        const dx = xi - X[j]; if (dx > LIM || dx < -LIM) continue;
        const dy = yi - Y[j]; if (dy > LIM || dy < -LIM) continue;
        const dz = zi - Z[j], d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < D2 && cnt[i] < MAX_LINKS && cnt[j] < MAX_LINKS) {
          cnt[i]++; cnt[j]++;
          pa[pn] = i; pb[pn] = j; pk[pn] = (d2 < 0.35 ? 0 : (d2 < 0.8 ? 1 : 2)) * 5 + (E[i] < 0.5 ? cA[i] : cB[i]); pn++;
        }
      }
    }

    /* project */
    for (i = 0; i < N; i++) {
      const x1 = X[i] * cb + Z[i] * sb, z1 = -X[i] * sb + Z[i] * cb, y1 = Y[i] * ca - z1 * sa, z2 = Y[i] * sa + z1 * ca;
      const d = z2 + ofz + dcam; /* camera sits dcam in front of the origin, looking straight at it */
      if (d < 0.1) { sd[i] = -1; continue; }
      const s = FL / d;
      sx[i] = W / 2 + OX + (x1 + ofx) * s; sy[i] = H / 2 + OY - (y1 + ofy) * s; ss[i] = s; sd[i] = d;
    }

    const alphas = [0.36, 0.22, 0.11];
    ctx.lineWidth = 1;
    for (let bk = 0; bk < 15; bk++) {
      let open = false;
      for (let q = 0; q < pn; q++) {
        if (pk[q] !== bk) continue;
        const a = pa[q], b = pb[q];
        if (sd[a] < 0 || sd[b] < 0) continue;
        if (!open) { ctx.beginPath(); open = true; }
        ctx.moveTo(sx[a], sy[a]); ctx.lineTo(sx[b], sy[b]);
      }
      if (open) { ctx.strokeStyle = rgba(PAL[bk % 5], alphas[(bk / 5) | 0] * linkK); ctx.stroke(); }
    }

    /* a few readable numbers beside points, refreshed a few times a second (off on phones) */
    const numbers = W > 760;
    if (t - this.txtT > 0.35) { this.txtT = t; if (numbers) for (i = 3; i < N; i += 23) this.txt[i] = (X[i] / 3.5).toFixed(2); }
    const on = performance.now() - ptr.t < 4500;
    let best = -1, bestD = 110, curSz = 0;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (i = 0; i < N; i++) {
      if (sd[i] < 0) continue;
      let nearV = 0;
      if (on) { const dd = Math.hypot(sx[i] - ptr.x, sy[i] - ptr.y); nearV = clamp(1.3 - dd / 200, 0, 1); if (dd < bestD) { bestD = dd; best = i; } }
      const fog = clamp(1.3 - (sd[i] - 9) / 8, 0.45, 1), sz = clamp(ss[i] * 0.016, 1, 3.2) * (1 + nearV * 0.8);
      const col = mixc(PAL[cA[i]], PAL[cB[i]], E[i]);
      ctx.fillStyle = rgba(mixc(col, IVORY, nearV), (0.55 + 0.4 * nearV) * fog);
      ctx.fillRect(sx[i] - sz / 2, sy[i] - sz / 2, sz, sz);
      if (nearV > 0.5) { ctx.fillStyle = rgba(col, 0.12 * nearV); ctx.beginPath(); ctx.arc(sx[i], sy[i], sz * 4, 0, TAU); ctx.fill(); }
      if (numbers && i % 23 === 3 && sd[i] < 15 && mt < 0.05) {
        const fs = clamp(Math.round(ss[i] * 0.012), 9, 12);
        if (fs !== curSz) { curSz = fs; ctx.font = '400 ' + fs + 'px ' + UI_FONT; }
        ctx.fillStyle = rgba(mixc(col, IVORY, 0.3), (0.45 + 0.4 * nearV) * fog);
        ctx.fillText(this.txt[i], sx[i] + 7, sy[i] - 5);
      }
    }
    /* cursor readout for the nearest point */
    if (best >= 0) {
      const bx = sx[best], by = sy[best];
      ctx.lineWidth = 1; ctx.strokeStyle = rgba(IVORY, 0.8);
      ctx.beginPath(); ctx.arc(bx, by, 8, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + 6, by - 6); ctx.lineTo(bx + 28, by - 28); ctx.lineTo(bx + 44, by - 28); ctx.stroke();
      ctx.font = '400 12px ' + UI_FONT; ctx.fillStyle = rgba(IVORY, 0.95);
      ctx.fillText('x ' + X[best].toFixed(2) + '   y ' + Y[best].toFixed(2) + '   z ' + Z[best].toFixed(2), bx + 48, by - 28);
      ctx.fillStyle = rgba(AMBER, 0.85);
      ctx.fillText('point ' + best + ', ' + cnt[best] + ' links', bx + 48, by - 12);
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
}
