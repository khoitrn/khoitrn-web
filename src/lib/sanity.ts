import { createClient } from '@sanity/client';
import { createImageUrlBuilder as imageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { toHTML } from '@portabletext/to-html';

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

export function portableTextToHtml(body: unknown[]): string {
  if (!body) return '';
  return toHTML(body, {
    components: {
      types: {
        image: ({ value }) => {
          const url = urlFor(value).width(1200).auto('format').url();
          return `<img src="${url}" alt="${value.alt ?? ''}" loading="lazy" />`;
        },
      },
    },
  });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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

export const featuredProjectsQuery = `*[_type == "project" && featured == true] | order(year desc)[0...3] {
  _id, title, slug, description, category, year
}`;

export const recentPostsQuery = `*[_type == "post"] | order(publishedAt desc)[0...3] {
  _id, title, slug, excerpt, category, publishedAt
}`;
