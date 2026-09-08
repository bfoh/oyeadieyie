import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, isConfigured, sessionToken, verifyPassword } from '@/lib/admin-auth';

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
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
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: 'wrong_password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken()!, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return res;
}
