export interface Bookmark {
  url: string;
  slug: string;
}

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BOOKMARK_SLUG = /^mona-[0-9a-zA-Z]+$/;

export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const candidate = trimmed.startsWith('//')
    ? `https:${trimmed}`
    : /^[a-z][a-z\d+.-]*:/i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

export function loadBookmarks(raw: string | null): Bookmark[] {
  if (!raw) return [];

  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];

    return value.flatMap((item): Bookmark[] => {
      if (
        item === null ||
        typeof item !== 'object' ||
        typeof item.url !== 'string' ||
        typeof item.slug !== 'string' ||
        !BOOKMARK_SLUG.test(item.slug)
      ) {
        return [];
      }

      const url = normalizeUrl(item.url);
      return url ? [{ url, slug: item.slug }] : [];
    });
  } catch {
    return [];
  }
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

export function createSlug(bookmarks: Bookmark[], timestamp = Date.now()): string {
  const usedSlugs = new Set(bookmarks.map(({ slug }) => slug));
  let value = Math.max(0, Math.floor(timestamp));
  let slug = `mona-${toBase62(value)}`;

  while (usedSlugs.has(slug)) {
    slug = `mona-${toBase62(++value)}`;
  }
  return slug;
}

function toBase62(value: number): string {
  if (value === 0) return '0';

  let result = '';
  while (value > 0) {
    result = BASE62[value % 62] + result;
    value = Math.floor(value / 62);
  }
  return result;
}
