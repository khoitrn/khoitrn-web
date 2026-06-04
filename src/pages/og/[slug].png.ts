import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { client, postsQuery } from '../../lib/sanity';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontData = readFileSync(
  resolve(__dirname, '../../../node_modules/@fontsource-variable/raleway/files/raleway-latin-wght-normal.woff2')
);

function titleFontSize(title: string): number {
  if (title.length < 28) return 72;
  if (title.length < 50) return 60;
  if (title.length < 80) return 48;
  return 40;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await client.fetch(postsQuery);
  return posts.map((post: any) => ({
    params: { slug: post.slug.current },
    props: { title: post.title ?? '', category: post.category ?? '' },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, category } = props as { title: string; category: string };

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#0D0D0A',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 88px',
          fontFamily: '"Raleway"',
        },
        children: [
          // ── top: accent line + category
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '18px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { width: '44px', height: '1px', background: '#B2F200', opacity: 0.7 },
                    children: '',
                  },
                },
                category
                  ? {
                      type: 'p',
                      props: {
                        style: {
                          margin: 0,
                          fontSize: '13px',
                          fontWeight: 300,
                          letterSpacing: '0.26em',
                          textTransform: 'uppercase',
                          color: '#B2F200',
                          opacity: 0.85,
                        },
                        children: category,
                      },
                    }
                  : { type: 'span', props: { style: { display: 'none' }, children: '' } },
              ],
            },
          },

          // ── center: title
          {
            type: 'h1',
            props: {
              style: {
                margin: 0,
                fontSize: `${titleFontSize(title)}px`,
                fontWeight: 300,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: 'rgba(238,238,228,0.93)',
                maxWidth: '980px',
              },
              children: title,
            },
          },

          // ── bottom: site name
          {
            type: 'p',
            props: {
              style: {
                margin: 0,
                fontSize: '13px',
                fontWeight: 300,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(138,137,120,0.75)',
              },
              children: 'khoitrn.com',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Raleway', data: fontData, weight: 300, style: 'normal' }],
    }
  );

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
