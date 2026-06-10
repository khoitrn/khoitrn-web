import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.runtime?.env) return new Response(null, { status: 204 });
  const { DB } = locals.runtime.env;

  let path: string, referrer: string | null;
  try {
    const body = await request.json();
    path = (body.path ?? '').toString().slice(0, 255);
    referrer = body.referrer ? body.referrer.toString().slice(0, 255) : null;
  } catch {
    return new Response(null, { status: 204 });
  }

  if (!path) return new Response(null, { status: 204 });

  const country = request.headers.get('cf-ipcountry') ?? null;

  await DB.prepare(
    `INSERT INTO page_views (path, referrer, country) VALUES (?, ?, ?)`
  ).bind(path, referrer, country).run().catch(() => {});

  return new Response(null, { status: 204 });
};
