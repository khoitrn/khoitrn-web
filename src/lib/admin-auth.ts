import { SESSION_COOKIE, deriveSessionToken } from '../pages/api/admin/login';

export async function isAuthenticated(request: Request, adminPassword: string): Promise<boolean> {
  if (!adminPassword) return false;
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
  const sessionToken = cookies[SESSION_COOKIE];
  if (!sessionToken) return false;
  const expected = await deriveSessionToken(adminPassword);
  return sessionToken === expected;
}
