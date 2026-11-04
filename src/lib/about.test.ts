import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveAbout, ABOUT_DEFAULTS } from './about.ts';

test('empty or missing document falls back to defaults', () => {
  for (const raw of [null, undefined, {}]) {
    const a = resolveAbout(raw);
    assert.equal(a.name, 'Khoi Tran');
    assert.ok(!('tag' in a));
    assert.deepEqual(a.affiliations, ABOUT_DEFAULTS.affiliations);
    assert.deepEqual(a.expertise, ABOUT_DEFAULTS.expertise);
    assert.deepEqual(a.centersAndPrograms, ABOUT_DEFAULTS.centersAndPrograms);
    assert.equal(a.email, 'khoi@tamu.edu');
    assert.equal(a.body, null);
    assert.equal(a.portrait, null);
  }
});

test('blank strings and empty arrays fall back per field', () => {
  const a = resolveAbout({ name: '   ', expertise: [], affiliations: ['', '  '] });
  assert.equal(a.name, 'Khoi Tran');
  assert.deepEqual(a.expertise, ABOUT_DEFAULTS.expertise);
  assert.deepEqual(a.affiliations, ABOUT_DEFAULTS.affiliations);
});

test('set fields win and list entries are trimmed and filtered', () => {
  const a = resolveAbout({ expertise: [' One ', '', 'Two'], email: 'a@b.co' });
  assert.deepEqual(a.expertise, ['One', 'Two']);
  assert.equal(a.email, 'a@b.co');
});

test('body passes through only when it has blocks', () => {
  const block = { _type: 'block', children: [] };
  assert.deepEqual(resolveAbout({ body: [block] }).body, [block]);
  assert.equal(resolveAbout({ body: [] }).body, null);
});

test('portrait only counts when an asset is set', () => {
  assert.equal(resolveAbout({ portrait: {} }).portrait, null);
  const img = { asset: { _ref: 'image-abc-100x100-jpg' } };
  assert.deepEqual(resolveAbout({ portrait: img }).portrait, img);
});

test('default copy has no em dashes and keeps intended casing', () => {
  const all = JSON.stringify(ABOUT_DEFAULTS);
  assert.ok(!all.includes('—'));
  assert.ok(ABOUT_DEFAULTS.bioFallback[0].startsWith("I'm Khoi Tran"));
  assert.ok(ABOUT_DEFAULTS.bioFallback[0].includes('where i lead'));
  assert.ok(ABOUT_DEFAULTS.bioFallback[1].startsWith("I'm a Terry Scholar"));
});

test('quote falls back to the default and can be overridden', () => {
  const a = resolveAbout({});
  assert.equal(a.quote, 'Know all the theories, master all the techniques, but as you touch a human soul, be just another human soul.');
  assert.equal(a.quoteAttribution, 'attributed to Carl Jung');
  const b = resolveAbout({ quote: 'Custom.', quoteAttribution: 'Someone' });
  assert.equal(b.quote, 'Custom.');
  assert.equal(b.quoteAttribution, 'Someone');
});
