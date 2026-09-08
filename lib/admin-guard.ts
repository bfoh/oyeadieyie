import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyToken } from './admin-auth';

/**
 * Every writing route calls this first.
 *
 * The middleware guards pages, not API routes, so without this an unsigned
 * POST could edit the site. Returns true only for a cookie whose signature
 * verifies under the current password.
 */
export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifyToken(token);
}
