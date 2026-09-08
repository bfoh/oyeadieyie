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
  return NextResponse.json({
    content: await readContent({ fresh: true }),
    configured: storeConfigured(),
  });
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

  /* Fresh, never cached: this is a read-modify-write. */
  /* Fresh, never cached: this is a read-modify-write. */
  const content = await readContent({ fresh: true });

  const clean = (v: unknown, max: number) =>
    typeof v === 'string' ? v.trim().slice(0, max) : '';

  /* A date is the one field that can take the public site down: an unparseable
     string reaches Intl.format in a server component and throws. The date
     input in the admin enforces this shape, but the route must not depend on
     the UI being the thing that called it. */
  const cleanDate = (v: unknown) => {
    const d = clean(v, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`))
      ? d
      : '';
  };

  /**
   * Remove a photograph's file, but only once nothing points at it.
   *
   * An update and an event can be attached to the same picture — the office
   * announces the event, then reports it afterwards using the same frame.
   * Deleting one entry must not pull the picture out from under the other,
   * and leaving the file behind for ever fills the store with orphans. So:
   * count the references that remain, and delete the file only at zero.
   */
  const dropFileIfUnused = async (url?: string) => {
    if (!url) return;
    const stillUsed =
      content.updates.some((u) => u.image === url) ||
      content.events.some((e) => e.imageUrl === url) ||
      content.gallery.some((g) => g.url === url);
    if (!stillUsed) await deleteImageFile(url);
  };

  switch (body.action) {
    case 'add-update': {
      const title = clean(body.update?.title, 120);
      const date = cleanDate(body.update?.date);
      const text = clean(body.update?.body, 2000);
      if (!title || !date) {
        return NextResponse.json({ error: 'title_and_valid_date_required' }, { status: 400 });
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
    case 'delete-update': {
      const going = content.updates.find((u) => u.id === body.id);
      content.updates = content.updates.filter((u) => u.id !== body.id);
      await dropFileIfUnused(going?.image);
      break;
    }

    case 'add-event': {
      const title = clean(body.event?.title, 120);
      const date = cleanDate(body.event?.date);
      if (!title || !date) {
        return NextResponse.json({ error: 'title_and_valid_date_required' }, { status: 400 });
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
    case 'delete-event': {
      const going = content.events.find((e) => e.id === body.id);
      content.events = content.events.filter((e) => e.id !== body.id);
      await dropFileIfUnused(going?.imageUrl);
      break;
    }

    case 'delete-image': {
      const image = content.gallery.find((g) => g.id === body.id);
      /* Built-in frames ship with the site and have no file of their own; the
         admin hides the button, but the route must refuse it too. */
      if (image && !image.pathname) {
        return NextResponse.json({ error: 'built_in_image' }, { status: 400 });
      }
      content.gallery = content.gallery.filter((g) => g.id !== body.id);
      /* Through the reference count, like the other two deletes: an update or
         an event may point at the very same picture. Deleting the file
         unconditionally here was leaving a broken image on the public page —
         the exact failure the helper exists to prevent. */
      await dropFileIfUnused(image?.url);
      break;
    }

    case 'set-contact': {
      /* The only write path that used to spread its input straight into the
         document: no allowlist, no length, no type check. A number stored here
         reaches isSupplied(), which calls .trim() on it, and every page render
         throws. */
      const incoming = (body.contact ?? {}) as Record<string, unknown>;
      const next = { ...content.contact };
      for (const key of ['email', 'phone', 'press', 'whatsapp'] as const) {
        if (!(key in incoming)) continue;
        /* Ignore a value that is not a string rather than clearing the field.
           Coercing it to '' would let a malformed request wipe the office's
           telephone number, which is worse than refusing the change. */
        if (typeof incoming[key] !== 'string') continue;
        next[key] = clean(incoming[key], 120);
      }
      content.contact = next;
      break;
    }

    default:
      return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
  }

  await writeContent(content);
  return NextResponse.json({ ok: true, content });
}
