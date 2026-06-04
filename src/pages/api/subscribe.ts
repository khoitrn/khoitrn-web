import type { APIRoute } from 'astro';

export const prerender = false;

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export const POST: APIRoute = async ({ request, locals }) => {
  const { DB, RESEND_API_KEY } = locals.runtime.env;

  let email: string;
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = await request.json();
    email = (body.email ?? '').toString().toLowerCase().trim();
  } else {
    const data = await request.formData();
    email = (data.get('email') ?? '').toString().toLowerCase().trim();
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = generateToken();

  try {
    await DB.prepare(
      `INSERT INTO subscribers (email, unsubscribe_token)
       VALUES (?, ?)
       ON CONFLICT(email) DO UPDATE
         SET status = 'active', unsubscribe_token = excluded.unsubscribe_token`
    ).bind(email, token).run();
  } catch {
    return new Response(JSON.stringify({ error: 'Something went wrong. Try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Khoi Tran <hello@khoitrn.com>',
        to: email,
        subject: "You're in.",
        html: `
          <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#1a1a1a">
            <p style="font-size:1rem;line-height:1.75">Thanks for subscribing. I'll reach out when there's something worth reading.</p>
            <p style="font-size:0.85rem;color:#888;margin-top:3rem">
              <a href="https://khoitrn.com/api/unsubscribe?token=${token}" style="color:#888">Unsubscribe</a>
            </p>
          </div>
        `,
      }),
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
