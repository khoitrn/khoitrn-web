// Related posts, ranked by how much they actually overlap with the current post.
// A shared tag counts for more than a shared category, and a term that few posts
// carry counts for more than one that nearly all do (so "japan" on a travel post
// says more than "AI" on a site full of AI writing). Recency only breaks ties
// between posts that are already relevant; a post with no overlap is never shown.

export interface RelatableDoc {
  slug: { current: string };
  category?: unknown;
  tags?: unknown;
  publishedAt: string;
}

const TAG_WEIGHT = 3;
const CATEGORY_WEIGHT = 2;
const RECENCY_WEIGHT = 0.5;
const DAY_MS = 86_400_000;

function terms(value: unknown): string[] {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  const cleaned = list
    .filter((v): v is string => typeof v === 'string')
    .map(v => v.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(cleaned)];
}

function idf(total: number, count: number): number {
  return 1 + Math.log(total / Math.max(count, 1));
}

export function rankRelated<T extends RelatableDoc>(current: RelatableDoc, candidates: T[], limit = 3): T[] {
  const everyone = [current, ...candidates];
  const total = everyone.length;

  const tagCount = new Map<string, number>();
  const categoryCount = new Map<string, number>();
  for (const d of everyone) {
    for (const t of terms(d.tags)) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
    for (const c of terms(d.category)) categoryCount.set(c, (categoryCount.get(c) ?? 0) + 1);
  }

  const myTags = new Set(terms(current.tags));
  const myCategories = new Set(terms(current.category));
  const now = Date.now();

  return candidates
    .filter(c => c.slug?.current !== current.slug?.current)
    .map(c => {
      let relevance = 0;
      for (const t of terms(c.tags)) if (myTags.has(t)) relevance += TAG_WEIGHT * idf(total, tagCount.get(t)!);
      for (const k of terms(c.category)) if (myCategories.has(k)) relevance += CATEGORY_WEIGHT * idf(total, categoryCount.get(k)!);
      const ageDays = Math.max(0, (now - new Date(c.publishedAt).getTime()) / DAY_MS);
      const recency = RECENCY_WEIGHT / (1 + ageDays / 365);
      return { doc: c, relevance, score: relevance + recency };
    })
    .filter(x => x.relevance > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.doc);
}
