import { test } from 'node:test';
import assert from 'node:assert/strict';
import { talkCoverSvg, coverKind, COVER_KINDS } from './talkCover.ts';

const CURRENT = ['it-only-takes-one-person', 'abs-talk', 'foundation'];

test('same seed gives the same cover', () => {
  assert.equal(talkCoverSvg('abs-talk'), talkCoverSvg('abs-talk'));
});

test('the current talks each get a different composition, not a shifted copy', () => {
  const kinds = CURRENT.map(coverKind);
  assert.equal(new Set(kinds).size, CURRENT.length, `kinds: ${kinds.join(', ')}`);
  CURRENT.forEach((s, i) => assert.ok(talkCoverSvg(s).includes(`data-kind="${kinds[i]}"`)));
});

test('the four compositions really are different drawings', () => {
  const art = COVER_KINDS.map((k) => talkCoverSvg('same-seed', k));
  assert.equal(new Set(art).size, COVER_KINDS.length);
  // each has its own signature element
  assert.ok(art[COVER_KINDS.indexOf('swell')].includes('stroke-opacity'));
  assert.ok(art[COVER_KINDS.indexOf('ridge')].includes('data-ridges'));
  assert.ok(art[COVER_KINDS.indexOf('drum')].includes('data-teeth'));
  assert.ok(art[COVER_KINDS.indexOf('lattice')].includes('data-lattice'));
});

test('different seeds of one kind still differ', () => {
  for (const k of COVER_KINDS) assert.notEqual(talkCoverSvg('one', k), talkCoverSvg('two', k));
});

test('every composition is a valid drawing in the site palette', () => {
  for (const k of COVER_KINDS) {
    for (const seed of ['abs-talk', 'foundation', 'it-only-takes-one-person', '', 'x'.repeat(200), 'a', 'b', 'c']) {
      const svg = talkCoverSvg(seed, k);
      assert.ok(svg.length > 500, `${k} not empty`);
      assert.ok(!svg.includes('NaN') && !svg.includes('undefined') && !svg.includes('Infinity'), `${k} has bad numbers`);
      assert.ok(!svg.includes('—'), 'no em dashes');
      assert.ok(!/#[0-9a-f]{3,6}/i.test(svg), 'colors must come from CSS variables');
    }
  }
});

test('the swell sun stays inside the sky', () => {
  for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
    const m = talkCoverSvg(seed, 'swell').match(/data-sun="([\d.]+),([\d.]+),([\d.]+)"/);
    assert.ok(m, 'sun metadata present');
    const [x, y, r] = [Number(m![1]), Number(m![2]), Number(m![3])];
    assert.ok(x - r >= 0 && x + r <= 160 && y - r >= 0, `sun in bounds for ${seed}`);
  }
});
