import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const client = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET ?? 'production',
  apiVersion: '2025-04-01',
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Queries
export const postsQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id, title, slug, excerpt, category, publishedAt,
  "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
}`;

export const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id, title, slug, excerpt, category, publishedAt, body,
  "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
}`;

export const projectsQuery = `*[_type == "project"] | order(year desc) {
  _id, title, slug, description, category, year, featured,
  coverImage, url, technologies
}`;

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0] {
  _id, title, slug, description, category, year,
  coverImage, url, technologies, body
}`;

export const nowQuery = `*[_type == "now"][0] { body, updatedAt }`;
