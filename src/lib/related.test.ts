import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankRelated } from './related.ts';

const doc = (slug: string, category: string[], tags: string[] | null, publishedAt: string) => ({
  slug: { current: slug }, category, tags, publishedAt,
});

const current = doc('current', ['AI'], ['ai', 'ai safety'], '2026-11-21T00:00:00Z');

test('posts with no shared tag or category are never returned', () => {
  const out = rankRelated(current, [
    doc('japan', ['Travel'], ['japan'], '2026-06-01T00:00:00Z'),
    doc('essay', ['Essay'], null, '2026-05-01T00:00:00Z'),
  ]);
  assert.deepEqual(out, []);
});

test('a shared tag outranks a newer post that only shares a category', () => {
  const tagMatch = doc('tag-match', ['Career'], ['ai safety'], '2026-01-01T00:00:00Z');
  const catOnly = doc('cat-only', ['AI'], ['unrelated'], '2026-11-01T00:00:00Z');
  const out = rankRelated(current, [catOnly, tagMatch]);
  assert.deepEqual(out.map(p => p.slug.current), ['tag-match', 'cat-only']);
});

test('more overlap wins over recency', () => {
  const both = doc('both', ['AI'], ['ai', 'ai safety'], '2026-01-01T00:00:00Z');
  const one = doc('one', ['Career'], ['ai'], '2026-11-01T00:00:00Z');
  const out = rankRelated(current, [one, both]);
  assert.equal(out[0].slug.current, 'both');
});

test('a rare shared tag counts for more than a common one', () => {
  const crowd = ['a', 'b', 'c', 'd'].map(s => doc(s, ['Travel'], ['common'], '2026-02-01T00:00:00Z'));
  const cur = doc('cur', ['Essay'], ['common', 'rare'], '2026-11-21T00:00:00Z');
  const rare = doc('rare-one', ['Travel'], ['rare'], '2026-02-01T00:00:00Z');
  const out = rankRelated(cur, [...crowd, rare], 1);
  assert.equal(out[0].slug.current, 'rare-one');
});

test('recency breaks ties between equally relevant posts', () => {
  const older = doc('older', ['Career'], ['ai'], '2026-01-01T00:00:00Z');
  const newer = doc('newer', ['Career'], ['ai'], '2026-10-01T00:00:00Z');
  const out = rankRelated(current, [older, newer]);
  assert.deepEqual(out.map(p => p.slug.current), ['newer', 'older']);
});

test('tags match regardless of case or stray whitespace, and never the post itself', () => {
  const messy = doc('messy', ['Career'], [' AI '], '2026-03-01T00:00:00Z');
  const self = doc('current', ['AI'], ['ai'], '2026-11-21T00:00:00Z');
  const out = rankRelated(current, [self, messy]);
  assert.deepEqual(out.map(p => p.slug.current), ['messy']);
});

test('respects the limit and tolerates a bare-string category and null tags', () => {
  const many = Array.from({ length: 6 }, (_, i) => doc(`p${i}`, ['AI'], ['ai'], `2026-0${i + 1}-01T00:00:00Z`));
  assert.equal(rankRelated(current, many, 3).length, 3);
  const legacy = { slug: { current: 'old' }, category: 'AI', tags: null, publishedAt: '2026-01-01T00:00:00Z' };
  assert.deepEqual(rankRelated(current, [legacy]).map(p => p.slug.current), ['old']);
});
