/**
 * Admin access.
 *
 * One office, one password, held in an environment variable and never in the
 * repository. The cookie carries a signed value rather than the password
 * itself, so the secret is not sitting in the browser waiting to be read.
 *
 * Set ADMIN_PASSWORD in Vercel. Until it is set, the admin refuses every
 * attempt rather than falling back to a default, because a default password
 * on a public URL is the same as no password at all.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export { ADMIN_COOKIE } from './admin-cookie';

function secret(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  return pw && pw.length >= 8 ? pw : null;
}

export function isConfigured(): boolean {
  return secret() !== null;
}

/** The value the cookie carries: an HMAC of a fixed label under the password. */
export function sessionToken(): string | null {
  const pw = secret();
  if (!pw) return null;
  return createHmac('sha256', pw).update('office-of-the-nkosuo-hene').digest('hex');
}

export function verifyPassword(candidate: string): boolean {
  const pw = secret();
  if (!pw) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(pw);
  /* Compare in constant time, and only when the lengths already match, since
     timingSafeEqual throws on a length mismatch. */
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyToken(token: string | undefined): boolean {
  const expected = sessionToken();
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
