import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-guard';
import {
  readContent,
  writeContent,
  storeConfigured,
  newId,
  deleteImageFile,
  type SiteContent,
} from '@/lib/store';

/* Reading is for the admin screens; the public pages read the store directly. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }
  return NextResponse.json({ content: await readContent(), configured: storeConfigured() });
}

type Action =
  | { action: 'add-update'; update: { title: string; date: string; body: string; image?: string; alt?: string } }
  | { action: 'delete-update'; id: string }
  | { action: 'add-event'; event: { title: string; date: string; time?: string; place?: string; body?: string; imageUrl?: string; imageAlt?: string } }
  | { action: 'delete-event'; id: string }
  | { action: 'delete-image'; id: string }
  | { action: 'set-contact'; contact: Partial<SiteContent['contact']> };

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }
  if (!storeConfigured()) {
    return NextResponse.json({ error: 'store_not_connected' }, { status: 503 });
  }

  let body: Action;
  try {
    body = (await request.json()) as Action;
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const content = await readContent();
  const clean = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

  switch (body.action) {
    case 'add-update': {
      const title = clean(body.update?.title, 120);
      const date = clean(body.update?.date, 10);
      const text = clean(body.update?.body, 2000);
      if (!title || !date) {
        return NextResponse.json({ error: 'title_and_date_required' }, { status: 400 });
      }
      content.updates = [
        {
          id: newId(),
          date,
          title,
          body: text,
          image: clean(body.update?.image, 400) || undefined,
          alt: clean(body.update?.alt, 200) || undefined,
        },
        ...content.updates,
      ];
      break;
    }
    case 'delete-update':
      content.updates = content.updates.filter((u) => u.id !== body.id);
      break;

    case 'add-event': {
      const title = clean(body.event?.title, 120);
      const date = clean(body.event?.date, 10);
      if (!title || !date) {
        return NextResponse.json({ error: 'title_and_date_required' }, { status: 400 });
      }
      content.events = [
        ...content.events,
        {
          id: newId(),
          title,
          date,
          time: clean(body.event?.time, 40) || undefined,
          place: clean(body.event?.place, 120) || undefined,
          body: clean(body.event?.body, 1200) || undefined,
          imageUrl: clean(body.event?.imageUrl, 400) || undefined,
          imageAlt: clean(body.event?.imageAlt, 200) || undefined,
        },
      ].sort((a, b) => a.date.localeCompare(b.date));
      break;
    }
    case 'delete-event':
      content.events = content.events.filter((e) => e.id !== body.id);
      break;

    case 'delete-image': {
      const image = content.gallery.find((g) => g.id === body.id);
      if (image) await deleteImageFile(image.pathname);
      content.gallery = content.gallery.filter((g) => g.id !== body.id);
      break;
    }

    case 'set-contact':
      content.contact = { ...content.contact, ...body.contact };
      break;

    default:
      return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
  }

  await writeContent(content);
  return NextResponse.json({ ok: true, content });
}
