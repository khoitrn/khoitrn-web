import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const { DB } = locals.runtime.env;
  const token = url.searchParams.get('token') ?? '';

  if (!token) {
    return new Response('Invalid unsubscribe link.', { status: 400 });
  }

  await DB.prepare(
    `UPDATE subscribers SET status = 'unsubscribed' WHERE unsubscribe_token = ?`
  ).bind(token).run();

  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Unsubscribed — Khoi Tran</title>
        <style>
          body { font-family: Georgia, serif; max-width: 420px; margin: 8rem auto; padding: 0 1.5rem; color: #1a1a1a; text-align: center; }
          p { font-size: 1rem; line-height: 1.75; color: #555; }
          a { color: #1a1a1a; }
        </style>
      </head>
      <body>
        <p>You've been unsubscribed. No hard feelings.</p>
        <p><a href="https://khoitrn.com">← Back to site</a></p>
      </body>
    </html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
};
