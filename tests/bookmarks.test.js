import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSlug,
  formatBookmark,
  loadBookmarks,
  normalizeUrl,
} from '../src/lib/bookmarks.ts';

test('normalizes URLs with and without https to the same value', () => {
  assert.equal(normalizeUrl('example.com/path'), 'https://example.com/path');
  assert.equal(normalizeUrl('https://example.com/path'), 'https://example.com/path');
});

test('recovers from empty, corrupt, legacy, and non-array storage values', () => {
  for (const raw of [null, '', '{broken', '"legacy value"', '{"url":"https://example.com"}']) {
    assert.deepEqual(loadBookmarks(raw), []);
  }

  assert.deepEqual(
    loadBookmarks(
      '[{"url":"https://example.com/","slug":"mona-abc"},{"url":4,"slug":"bad"},{"url":"javascript:alert(1)","slug":"mona-xyz"}]',
    ),
    [{ url: 'https://example.com/', slug: 'mona-abc' }],
  );
});

test('formats a bookmark with the exact URL and slug separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://example.com/', slug: 'mona-7fk2' }),
    'https://example.com/ :: mona-7fk2',
  );
});

test('creates unique base62 slugs with the mona prefix', () => {
  const first = createSlug([], 3844);
  assert.match(first, /^mona-[0-9a-zA-Z]+$/);
  assert.notEqual(createSlug([{ url: '', slug: first }], 3844), first);
});
