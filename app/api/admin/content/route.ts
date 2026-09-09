import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-guard';
import {
  readContent,
  writeContent,
  storeConfigured,
  newId,
  deleteImageFile,
  type SiteContent,
  type StoredProject,
} from '@/lib/store';

/* Reading is for the admin screens; the public pages read the store directly. */
type Action =
  | { action: 'add-update'; update: { title: string; date: string; body: string; image?: string; alt?: string } }
  | { action: 'set-update'; id: string; update: { title?: string; date?: string; body?: string; image?: string; alt?: string } }
  | { action: 'delete-update'; id: string }
  | { action: 'add-event'; event: { title: string; date: string; time?: string; place?: string; body?: string; imageUrl?: string; imageAlt?: string } }
  | { action: 'set-event'; id: string; event: { title?: string; date?: string; time?: string; place?: string; body?: string; imageUrl?: string; imageAlt?: string } }
  | { action: 'delete-event'; id: string }
  | { action: 'delete-image'; id: string }
  | { action: 'set-enquiry'; id: string; status?: string; note?: string }
  | { action: 'delete-enquiry'; id: string }
  | { action: 'set-contact'; contact: Partial<SiteContent['contact']> }
  | { action: 'add-project'; fields: Record<string, unknown> }
  | { action: 'set-project'; id: string; fields: Record<string, unknown> }
  | { action: 'move-project'; id: string; direction: 'up' | 'down' }
  | { action: 'delete-project'; id: string }
  | { action: 'set-impact'; id: string; value?: number; label?: string; note?: string };

/* The vocabularies the public components switch on. A value outside them
   would render as an unstyled badge or drop out of the tag filter entirely,
   so both write paths check against these rather than trusting the form. */
const STATUSES = ['Delivered', 'Ongoing', 'In construction', 'Committed'];
const TAGS = ['Sanitation', 'Water', 'Infrastructure', 'Education', 'Environment'];

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
    /* Editing a posted update, so a wrong date or a misspelt name is a
       correction rather than a delete and a re-post. The two are not the same
       thing: a re-post mints a new id, and anything that has cited the entry
       — a share card, a link the press was given — is pointing at a record
       that no longer exists. */
    case 'set-update': {
      const update = content.updates.find((u) => u.id === body.id);
      if (!update) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
      }
      const f = body.update ?? {};
      if (typeof f.title === 'string') {
        const title = clean(f.title, 120);
        if (!title) {
          return NextResponse.json({ error: 'title_and_valid_date_required' }, { status: 400 });
        }
        update.title = title;
      }
      if (typeof f.date === 'string') {
        const date = cleanDate(f.date);
        if (!date) {
          return NextResponse.json({ error: 'title_and_valid_date_required' }, { status: 400 });
        }
        update.date = date;
      }
      if (typeof f.body === 'string') update.body = clean(f.body, 2000);
      /* A photograph swapped out, or taken off entirely, leaves the old file
         behind. Reclaim it the same way a delete does — through the reference
         count, since an event may be using the very same frame. */
      if (typeof f.image === 'string') {
        const was = update.image;
        update.image = clean(f.image, 400) || undefined;
        if (was && was !== update.image) await dropFileIfUnused(was);
      }
      if (typeof f.alt === 'string') update.alt = clean(f.alt, 200) || undefined;
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
    /* Editing an engagement in place, so a date that moves keeps its record
       rather than becoming a delete and a re-entry — the enquiry that was
       answered with it still points at this id. */
    case 'set-event': {
      const event = content.events.find((e) => e.id === body.id);
      if (!event) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
      }
      const f = body.event ?? {};
      if (typeof f.title === 'string') {
        const title = clean(f.title, 120);
        if (!title) {
          return NextResponse.json({ error: 'title_and_valid_date_required' }, { status: 400 });
        }
        event.title = title;
      }
      if (typeof f.date === 'string') {
        const date = cleanDate(f.date);
        if (!date) {
          return NextResponse.json({ error: 'title_and_valid_date_required' }, { status: 400 });
        }
        event.date = date;
      }
      /* The optional three clear when they arrive empty: an engagement that
         has lost its venue must be able to say so. */
      if (typeof f.time === 'string') event.time = clean(f.time, 40) || undefined;
      if (typeof f.place === 'string') event.place = clean(f.place, 120) || undefined;
      if (typeof f.body === 'string') event.body = clean(f.body, 1200) || undefined;
      /* As with an update: the file the engagement is letting go of is
         reclaimed only once nothing else points at it. */
      if (typeof f.imageUrl === 'string') {
        const was = event.imageUrl;
        event.imageUrl = clean(f.imageUrl, 400) || undefined;
        if (was && was !== event.imageUrl) await dropFileIfUnused(was);
      }
      if (typeof f.imageAlt === 'string') event.imageAlt = clean(f.imageAlt, 200) || undefined;
      /* A moved date changes the order the public page prints. */
      content.events = [...content.events].sort((a, b) => a.date.localeCompare(b.date));
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

    case 'set-enquiry': {
      const found = content.enquiries.find((e) => e.id === body.id);
      if (!found) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
      }
      const allowed = ['new', 'replied', 'declined', 'archived'] as const;
      const status = clean(body.status, 20);
      if (status && (allowed as readonly string[]).includes(status)) {
        found.status = status as (typeof allowed)[number];
      }
      if ('note' in body) found.note = clean(body.note, 600) || undefined;
      break;
    }

    case 'delete-enquiry':
      content.enquiries = content.enquiries.filter((e) => e.id !== body.id);
      break;

    case 'add-project': {
      const f = body.fields ?? {};
      const title = clean(f.title, 90);
      if (!title) {
        return NextResponse.json({ error: 'title_required' }, { status: 400 });
      }
      /* No image and no provenance: a project entered here has no photograph
         yet, and Projects.tsx already draws an adinkra in that case. Giving it
         a stock picture would be the dishonest option, and claiming a
         provenance it does not have would be worse. */
      content.projects = [
        ...content.projects,
        {
          id: newId(),
          title,
          tag: (typeof f.tag === 'string' && TAGS.includes(f.tag) ? f.tag : 'Infrastructure') as StoredProject['tag'],
          status: (typeof f.status === 'string' && STATUSES.includes(f.status)
            ? f.status
            : 'Committed') as StoredProject['status'],
          body: clean(f.body, 600),
          figure: clean(f.figure, 24) || undefined,
          glyph: 'nkyinkyim',
        },
      ];
      break;
    }

    case 'set-project': {
      const project = content.projects.find((p) => p.id === body.id);
      if (!project) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
      }
      const f = body.fields ?? {};

      if (typeof f.title === 'string') project.title = clean(f.title, 90);
      if (typeof f.body === 'string') project.body = clean(f.body, 600);
      if (typeof f.figure === 'string') {
        const fig = clean(f.figure, 24);
        project.figure = fig || undefined;
      }
      if (typeof f.status === 'string' && STATUSES.includes(f.status)) {
        project.status = f.status as typeof project.status;
      }
      if (typeof f.tag === 'string' && TAGS.includes(f.tag)) {
        project.tag = f.tag as typeof project.tag;
      }
      if (f.lens === 'regal' || f.lens === 'modern') project.lens = f.lens;
      break;
    }

    case 'move-project': {
      const i = content.projects.findIndex((p) => p.id === body.id);
      if (i < 0) return NextResponse.json({ error: 'not_found' }, { status: 404 });
      const j = body.direction === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= content.projects.length) break;
      const next = [...content.projects];
      [next[i], next[j]] = [next[j], next[i]];
      content.projects = next;
      break;
    }

    case 'delete-project': {
      const going = content.projects.find((p) => p.id === body.id);
      content.projects = content.projects.filter((p) => p.id !== body.id);
      /* A project's photographs live in public/, not the blob store, so there
         is no file to reclaim — only the record goes. */
      void going;
      break;
    }

    case 'set-impact': {
      const stat = content.impact.find((i) => i.id === body.id);
      if (!stat) return NextResponse.json({ error: 'not_found' }, { status: 404 });
      /* The projects tile is derived from the list on every render, so it is
         not editable here: that is what stops it contradicting the record
         printed beneath it, as it once did. */
      if (stat.attribution === 'counted') {
        return NextResponse.json({ error: 'derived_figure' }, { status: 400 });
      }
      if (typeof body.value === 'number' && Number.isFinite(body.value) && body.value >= 0) {
        stat.value = Math.round(body.value * 10) / 10;
      }
      if (typeof body.label === 'string') stat.label = clean(body.label, 40);
      if (typeof body.note === 'string') stat.note = clean(body.note, 80);
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
