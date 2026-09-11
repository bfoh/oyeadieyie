import { NextResponse } from 'next/server';
import { ENGAGE_ROUTES } from '@/lib/content';
import {
  MAX_ENQUIRIES,
  newId,
  readEnquiries,
  storeConfigured,
  writeEnquiries,
  type Enquiry,
} from '@/lib/store';

/**
 * The engagement inbox.
 *
 * Capture first, notify second.
 *
 * The enquiry is written to the store before any email is attempted, so
 * storage is the record and email only a convenience. This route used to do
 * the opposite: with no Resend key configured it returned 503 and the enquiry
 * was gone — every appearance request, partnership approach, diaspora offer
 * and press enquiry lost, on a site whose entire purpose is to attract them.
 *
 * The office reads them at /admin/enquiries. Email, when these are set, is an
 * extra:
 *
 *   RESEND_API_KEY   an API key from resend.com
 *   ENGAGE_TO        the address that should receive the requests
 */

const ROUTE_IDS = new Set(ENGAGE_ROUTES.map((r) => r.id));

type Payload = {
  name: string;
  email: string;
  organisation: string;
  detail: string;
  route: string;
  /* The date being asked for, when the sender gives one. */
  requestedDate?: string;
  /* Honeypot. Real people leave it empty; most bots fill everything. */
  website?: string;
};

/* This route writes to the shared document without a session, so it is the one
   place a stranger can grow the file that every public page render fetches.
   No more than this many may arrive in the window. */
const FLOOD_WINDOW_MS = 10 * 60 * 1000;
const FLOOD_LIMIT = 8;

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

  const requestedDate = (() => {
    const d = clean(body.requestedDate, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`))
      ? d
      : undefined;
  })();

  const routeTitle =
    ENGAGE_ROUTES.find((r) => r.id === route)?.title ?? route;

  /* ---- capture ---- */
  let stored = false;
  if (storeConfigured()) {
    try {
      /* The inbox only. This route used to read-modify-write the whole content
         document — the same document every public page render fetches — which
         meant the one place a stranger can write was also the place the site
         reads from. It now touches nothing but the enquiries. */
      const existing = await readEnquiries();

      const since = Date.now() - FLOOD_WINDOW_MS;
      const recent = existing.filter(
        (e) => Date.parse(e.receivedAt) > since,
      ).length;
      if (recent >= FLOOD_LIMIT) {
        /* Answer as though it worked, so a bot learns nothing, and write
           nothing. A genuine sender in this window is vanishingly unlikely
           and can still reach the office by phone or WhatsApp. */
        return NextResponse.json({ ok: true });
      }

      const enquiry: Enquiry = {
        id: newId(),
        receivedAt: new Date().toISOString(),
        route,
        name,
        email,
        organisation,
        detail,
        requestedDate,
        status: 'new',
      };

      /* Trim only what the office has already dealt with, oldest first, so a
         flood can never push an unanswered enquiry out of the record. */
      let enquiries = [enquiry, ...existing];
      if (enquiries.length > MAX_ENQUIRIES) {
        const keep = enquiries.filter((e) => e.status === 'new');
        const rest = enquiries
          .filter((e) => e.status !== 'new')
          .slice(0, Math.max(0, MAX_ENQUIRIES - keep.length));
        enquiries = [...keep, ...rest].sort((a, b) =>
          b.receivedAt.localeCompare(a.receivedAt),
        );
      }

      await writeEnquiries(enquiries);
      stored = true;
    } catch {
      /* Fall through to email; the sender is told the truth either way. */
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENGAGE_TO;

  /* ---- notify ---- */
  if (!apiKey || !to) {
    /* No mailbox wired up. If the enquiry is in the store the office will
       still see it, so this is a success; only report failure when nothing
       anywhere has a copy. */
    return stored
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  const lines = [
    `Route: ${routeTitle}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Organisation: ${organisation}`,
    requestedDate ? `Date requested: ${requestedDate}` : '',
    '',
    detail,
  ]
    .filter((l) => l !== '')
    .join('\n');

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

    if (!res.ok && !stored) {
      return NextResponse.json({ error: 'send_failed' }, { status: 502 });
    }
  } catch {
    /* The email failed. If it is in the store the office still has it. */
    if (!stored) {
      return NextResponse.json({ error: 'send_failed' }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
