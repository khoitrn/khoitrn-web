import type { APIRoute } from 'astro';

export const prerender = false;

export const SESSION_COOKIE = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function deriveSessionToken(secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('khoitrn-admin'));
  return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
}

export const POST: APIRoute = async ({ request, locals }) => {
  const { ADMIN_PASSWORD } = locals.runtime.env;

  const data = await request.formData();
  const password = (data.get('password') ?? '').toString();

  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    return new Response(null, {
      status: 303,
      headers: { Location: '/admin/login?error=1' },
    });
  }

  const token = await deriveSessionToken(ADMIN_PASSWORD);

  return new Response(null, {
    status: 303,
    headers: {
      Location: '/admin',
      'Set-Cookie': `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}; Path=/`,
    },
  });
};
