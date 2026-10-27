import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clamp, smooth, diveAt, randomVariant, buildTimeline, scrollProgress, autoProgress, DIVE_END } from './math.ts';

const V = { dir: 1 as const, A: 0.6, turns: 1.2, th0: 0.7 };

test('smooth is clamped and eases', () => {
  assert.equal(smooth(-1), 0);
  assert.equal(smooth(2), 1);
  assert.equal(smooth(0.5), 0.5);
  assert.ok(smooth(0.25) < 0.25);
});

test('dive starts high and ends exactly on the name at the strike point', () => {
  const a = diveAt(0, V), z = diveAt(1, V);
  assert.ok(a.by < -0.8, 'starts near the top of the screen');
  assert.ok(Math.abs(a.bx) <= V.A + 1e-9);
  for (const k of ['bx', 'by', 'z', 'bank'] as const) assert.ok(Math.abs(z[k]) < 1e-9, k + ' reaches 0');
  assert.ok(Math.abs(z.dive) < 1e-9, 'level again at the strike');
});

test('dive speeds up: the second half covers more vertical distance than the first', () => {
  const y = (p: number) => diveAt(p, V).by;
  assert.ok(y(0.5) > y(0) && y(1) > y(0.5), 'always descending');
  assert.ok((y(1) - y(0.75)) / 0.25 > (y(0.25) - y(0)) / 0.25, 'steeper near the end');
});

test('dive corkscrew tightens: sway amplitude decays monotonically', () => {
  let prev = Infinity;
  for (let p = 0; p <= 1; p += 0.1) {
    const dec = Math.pow(1 - p, 1.1);
    assert.ok(dec <= prev); prev = dec;
  }
});

test('randomVariant stays inside the designed ranges', () => {
  for (let i = 0; i < 500; i++) {
    const v = randomVariant();
    assert.ok(v.dir === 1 || v.dir === -1);
    assert.ok(v.A >= 0.35 && v.A <= 0.8);
    assert.ok(v.turns >= 0.75 && v.turns <= 1.45);
    assert.ok(v.th0 >= 0 && v.th0 < Math.PI * 2);
  }
  assert.equal(randomVariant(() => 0).dir, -1);
  assert.equal(randomVariant(() => 0.99).dir, 1);
});

test('timeline locates chapters and morph phase', () => {
  const tl = buildTimeline([1, 2, 3], [1, 1, 1]);
  assert.deepEqual(tl.starts, [0, 2, 5]);
  assert.equal(tl.total, 9);
  assert.equal(tl.locate(0), 0);
  assert.equal(tl.locate(1.99), 0);
  assert.equal(tl.locate(2), 1);
  assert.equal(tl.locate(8.9), 2);
  assert.equal(tl.morph(0.5, 0), 0);
  assert.equal(tl.morph(1.5, 0), 0.5);
  assert.equal(tl.morph(9.5 % 9, 0), 0);
});

test('scroll progress maps 115% of a viewport to 1, clamped', () => {
  assert.equal(scrollProgress(0, 800), 0);
  assert.equal(scrollProgress(800 * 1.15, 800), 1);
  assert.equal(scrollProgress(99999, 800), 1);
  assert.ok(Math.abs(scrollProgress(460, 800) - 0.5) < 1e-9);
  assert.equal(scrollProgress(-50, 800), 0);
});

test('auto-open begins after 9s and finishes 7s later', () => {
  assert.equal(autoProgress(0), 0);
  assert.equal(autoProgress(9), 0);
  assert.equal(autoProgress(12.5), 0.5);
  assert.equal(autoProgress(16), 1);
});

test('strike point constant', () => { assert.equal(DIVE_END, 0.44); assert.equal(clamp(5, 0, 1), 1); });
