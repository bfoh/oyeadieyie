import { NextResponse } from 'next/server';
import { ENGAGE_ROUTES } from '@/lib/content';

/**
 * The engagement inbox.
 *
 * The palace mailbox is configured with two environment variables:
 *
 *   RESEND_API_KEY   an API key from resend.com
 *   ENGAGE_TO        the address that should receive the requests
 *
 * Until both are set this route reports that it cannot deliver, and the form
 * shows the reader the office address instead. It never reports success it
 * cannot back up: an appearance request that silently disappears costs the
 * office an engagement and leaves the sender believing they were ignored.
 */

const ROUTE_IDS = new Set(ENGAGE_ROUTES.map((r) => r.id));

type Payload = {
  name: string;
  email: string;
  organisation: string;
  detail: string;
  route: string;
  /* Honeypot. Real people leave it empty; most bots fill everything. */
  website?: string;
};

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  let body: Partial<Payload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const organisation = clean(body.organisation, 200);
  const detail = clean(body.detail, 4000);
  const route = ROUTE_IDS.has(clean(body.route, 40))
    ? clean(body.route, 40)
    : ENGAGE_ROUTES[0].id;

  if (clean(body.website, 200)) {
    /* Honeypot tripped. Answer as though it worked so the bot stops
       retrying, and send nothing. */
    return NextResponse.json({ ok: true });
  }

  const valid =
    name.length >= 2 &&
    organisation.length >= 2 &&
    detail.length >= 12 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  if (!valid) {
    return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENGAGE_TO;

  if (!apiKey || !to) {
    /* Not a client error: the request was fine, the office inbox is not
       wired up yet. 503 so monitoring can see it and the form can say so. */
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  const routeTitle =
    ENGAGE_ROUTES.find((r) => r.id === route)?.title ?? route;

  const lines = [
    `Route: ${routeTitle}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Organisation: ${organisation}`,
    '',
    detail,
  ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.ENGAGE_FROM ?? 'Adrobaa site <onboarding@resend.dev>',
        to: [to],
        reply_to: email,
        subject: `${routeTitle}: ${organisation}`,
        text: lines,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'send_failed' }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
