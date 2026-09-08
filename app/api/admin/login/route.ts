import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  SESSION_MS,
  isConfigured,
  sessionToken,
  verifyPassword,
} from '@/lib/admin-auth';

/**
 * A limit on guessing.
 *
 * Held in memory, so it is per instance and is lost when the instance is
 * recycled — it will not stop a determined distributed attack, and it is not
 * claimed to. What it does stop is the cheap case this route was open to: one
 * client working through a word list against a single office password, which
 * the 600ms pause alone only slowed to a few thousand attempts an hour.
 */
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const ATTEMPT_LIMIT = 10;
const attempts = new Map<string, number[]>();

function tooManyAttempts(who: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(who) ?? []).filter((t) => now - t < ATTEMPT_WINDOW_MS);
  attempts.set(who, recent);
  /* Keep the map from growing without bound on a long-lived instance. */
  if (attempts.size > 500) {
    for (const [k, v] of attempts) {
      if (!v.length) attempts.delete(k);
    }
  }
  return recent.length >= ATTEMPT_LIMIT;
}

function recordFailure(who: string) {
  attempts.set(who, [...(attempts.get(who) ?? []), Date.now()]);
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  const who =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (tooManyAttempts(who)) {
    return NextResponse.json({ error: 'too_many_attempts' }, { status: 429 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  if (!verifyPassword(String(body.password ?? ''))) {
    /* A deliberate pause: a password check that answers instantly is a
       password check that can be run a few thousand times a minute. */
    recordFailure(who);
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: 'wrong_password' }, { status: 401 });
  }

  /* A correct password clears the count, so an aide who mistypes twice and
     then gets it right is not held back on their next visit. */
  attempts.delete(who);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken()!, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MS / 1000,
  });
  return res;
}
