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

/* How long a session lasts, enforced on the server. The cookie's own maxAge
   is a hint to the browser and nothing more: a copied cookie value can be
   replayed long after the browser would have dropped it. */
export const SESSION_MS = 12 * 60 * 60 * 1000;

/**
 * The value the cookie carries: when it was issued, and an HMAC over that.
 *
 * It used to be an HMAC of a fixed label, which made every session token for a
 * given password identical and valid forever — so a token read once out of a
 * browser stayed good until the password itself changed. Signing the issue
 * time means the server can age a token out, and the signature is what stops
 * the time being edited.
 */
export function sessionToken(now = Date.now()): string | null {
  const pw = secret();
  if (!pw) return null;
  const issued = String(now);
  return `${issued}.${sign(issued, pw)}`;
}

function sign(issued: string, pw: string): string {
  return createHmac('sha256', pw)
    .update(`office-of-the-nkosuo-hene:${issued}`)
    .digest('hex');
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
  const pw = secret();
  if (!pw || !token) return false;

  const dot = token.indexOf('.');
  if (dot < 0) return false;
  const issued = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  /* Check the signature before trusting the timestamp: an unsigned number in
     front of the dot is just something the browser sent us. */
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(issued, pw));
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;

  const at = Number(issued);
  if (!Number.isFinite(at)) return false;
  const age = Date.now() - at;
  /* A token issued in the future is a clock problem or a forgery; either way
     it is not a session this server started. */
  return age >= 0 && age < SESSION_MS;
}
