export const prerender = true;

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { client, postsQuery } from '../lib/sanity';

export async function GET(context: APIContext) {
  const posts = await client.fetch(postsQuery);

  return rss({
    title: 'Khoi Tran',
    description: 'Essays, notes, and thinking by Khoi Tran.',
    site: context.site!,
    items: posts.map((post: any) => ({
      title: post.title,
      pubDate: new Date(post.publishedAt),
      description: post.excerpt ?? '',
      link: `/writing/${post.slug.current}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
