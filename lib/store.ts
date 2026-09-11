import { put, list, del, get } from '@vercel/blob';
import {
  UPDATES,
  STATEMENTS,
  GALLERY,
  CONTACT,
  PROJECTS,
  IMPACT,
  type Update,
  type Statement,
} from './content';

/**
 * The editable half of the site.
 *
 * Everything the office can change without a developer lives in one JSON
 * document in Vercel Blob, and the photographs it references live in the same
 * store. Nothing else moved: the projects, the adinkra, the FAQ and the
 * biography stay in `lib/content.ts`, because those are the record rather than
 * the noticeboard, and they should go through review.
 *
 * When the store is not connected the site falls back to the content compiled
 * into the build, so an unconfigured deployment shows the site as published
 * rather than an empty page.
 */

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  /* Blob pathname, needed to delete the file itself. */
  pathname: string;
  addedAt: string;
};

export type SiteEvent = {
  id: string;
  title: string;
  /* ISO date. Events are sorted by it, and past ones fall off the site. */
  date: string;
  time?: string;
  place?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
};

/**
 * Something a member of the public sent to the office.
 *
 * Kept in the store rather than only emailed, because email was the single
 * point of failure: with no Resend key configured the route returned 503 and
 * every appearance request, partnership approach, diaspora offer and press
 * enquiry was simply lost. Storage is the record; email is a notification.
 */
export type EnquiryStatus = 'new' | 'replied' | 'declined' | 'archived';

export type Enquiry = {
  id: string;
  receivedAt: string;
  /* One of the ENGAGE_ROUTES ids. */
  route: string;
  name: string;
  email: string;
  organisation: string;
  detail: string;
  /* The date the sender is asking for, when they gave one. This is what makes
     it checkable against the ceremonial calendar. */
  requestedDate?: string;
  status: EnquiryStatus;
  /* The office's own note, never shown to the sender. */
  note?: string;
};

/**
 * The development record, as the office maintains it.
 *
 * These moved out of lib/content.ts because a project's status is the field
 * that changes most for a *development* chief — Committed, then In
 * construction, then Delivered — and changing it used to need a developer.
 * The compiled values stay as the seed and the fallback, so an unreachable
 * store still renders the site as published.
 */
export type StoredProject = (typeof PROJECTS)[number];
export type StoredImpact = (typeof IMPACT)[number];

export type SiteContent = {
  updates: Update[];
  /* What the chief has said, on the record. Seeded from STATEMENTS so the
     section is never empty on a deployment that has never been edited. */
  statements: Statement[];
  events: SiteEvent[];
  gallery: GalleryImage[];
  enquiries: Enquiry[];
  projects: StoredProject[];
  impact: StoredImpact[];
  contact: {
    email: string;
    phone: string;
    press: string;
    whatsapp: string;
  };
  updatedAt: string;
};

/**
 * The document is written to a NEW path every time, never overwritten.
 *
 * Overwriting one fixed path cannot give correct read-after-write here. The
 * blob is served from a CDN with a thirty day max-age, and a read taken
 * straight after a write returned the PREVIOUS document — verified: the blob's
 * uploadedAt was four minutes newer than the `updatedAt` inside the body it
 * served, with an `age` of 251 seconds. A cache-busting query is ignored, and
 * `cacheControlMaxAge: 0` was not honoured.
 *
 * That is worse than a stale read. Every write is a read-modify-write, so the
 * next write starts from the stale copy and persists it, silently undoing the
 * change just reported as saved. It is almost certainly the real cause of the
 * "delete resurrected the update" bug that was previously blamed on Next's
 * fetch cache alone.
 *
 * Writing a fresh path each time sidesteps the CDN entirely: `list()` is an
 * authenticated API call rather than a cached asset, and the newest URL it
 * returns has never been fetched before, so it cannot be served stale.
 */
const DOC_PREFIX = 'content/site-';
const LEGACY_DOC = 'content/site.json';

/* Old versions are pruned on write; a couple are kept as a cheap safety net. */
const KEEP_VERSIONS = 3;

/**
 * Which token reaches which store.
 *
 * There are two stores now and they are not interchangeable. The PUBLIC one
 * holds the content document and the photographs, which visitors fetch
 * directly. The PRIVATE one holds the enquiries, which nobody may fetch.
 *
 * Vercel names the token of a connected store `BLOB_READ_WRITE_TOKEN`, and a
 * project can only have one variable by that name — which is exactly why the
 * second store could not be connected alongside the first. So the private
 * store takes the default name and the public store gets an explicit one.
 *
 * `contentToken()` falls back to the default deliberately. Before the swap
 * that fallback IS the public store, and after it the explicit variable is
 * set; the code is correct on both sides of the change, so no deploy can land
 * in the window between them and read the wrong store.
 */
export function contentToken(): string | undefined {
  return process.env.CONTENT_BLOB_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
}

export function enquiriesToken(): string | undefined {
  return process.env.ENQUIRIES_BLOB_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
}

export function storeConfigured(): boolean {
  return Boolean(contentToken());
}

/** What the site shows before the office has changed anything. */
export function baseContent(): SiteContent {
  return {
    updates: UPDATES,
    statements: STATEMENTS,
    events: [],
    gallery: GALLERY.map((g, i) => ({
      id: `built-in-${i}`,
      url: g.src,
      alt: g.alt,
      pathname: '',
      addedAt: '',
    })),
    enquiries: [],
    projects: PROJECTS,
    impact: IMPACT,
    contact: {
      email: CONTACT.email,
      phone: CONTACT.phone,
      press: CONTACT.press,
      whatsapp: CONTACT.whatsapp,
    },
    updatedAt: '',
  };
}

/**
 * How many enquiries are kept.
 *
 * The engagement form writes to this document without a session, so the cap is
 * what stops a bot inflating a file that every public page render fetches.
 * Oldest go first, and only ones the office has already dealt with.
 */
export const MAX_ENQUIRIES = 500;

/**
 * Where the enquiries live, and why they do not live with everything else.
 *
 * The content document is written with `access: 'public'`, and it has to be:
 * the gallery photographs beside it are served straight to visitors from blob
 * URLs, so the store's hostname is in the page's own HTML by design.
 *
 * Enquiries were in that same document. That meant the names, email addresses,
 * organisations and messages of members of the public sat in a file any
 * anonymous request could read — verified, not assumed: a plain GET with no
 * token and no cookie returned the whole document, 200, in full. It was
 * unlisted, not protected. Nothing checked anything before serving it.
 *
 * They are now their own blob, written `access: 'private'`, which the token can
 * read and the internet cannot.
 *
 * Two things fall out of the move, both good. The public form no longer
 * read-modify-writes the document that every public page render fetches — it
 * touches only the inbox. And the inbox can sit at ONE fixed path instead of a
 * new versioned path per write, because the CDN staleness that forced the
 * versioning scheme is a property of public blobs; a private read is
 * authenticated and takes `useCache: false`.
 */
const INBOX = 'enquiries/inbox.json';

/** Read the inbox. Never throws: no inbox yet is an empty inbox. */
export async function readEnquiries(): Promise<Enquiry[]> {
  if (!storeConfigured()) return [];
  try {
    const found = await get(INBOX, {
      access: 'private',
      useCache: false,
      token: enquiriesToken(),
    });
    /* `get` resolves to null when the blob does not exist, which is the
       ordinary state before the first enquiry arrives. */
    if (!found) return [];
    const text = await new Response(found.stream as ReadableStream).text();
    const parsed = JSON.parse(text) as { enquiries?: Enquiry[] };
    return parsed.enquiries ?? [];
  } catch {
    /* Not found, unreadable, or malformed. An office with no enquiries and an
       office whose inbox cannot be read look the same from here, and the
       caller's job is the same either way: show nothing rather than fail. */
    return [];
  }
}

/** Replace the inbox. Only ever called from an authenticated route, or from
 *  the engage route, which is the one public write path on this site. */
export async function writeEnquiries(enquiries: Enquiry[]): Promise<void> {
  await put(INBOX, JSON.stringify({ enquiries, updatedAt: new Date().toISOString() }, null, 2), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    token: enquiriesToken(),
  });
}

/**
 * Read the document.
 *
 * Never throws: a site that cannot reach its store should still render from
 * the build rather than fail.
 *
 * `fresh` matters more than it looks. Public pages are happy with a cached
 * copy — that is the whole point of the 30 second window. But every write is
 * a read-modify-write of one document, and reading a cached copy there means
 * editing a stale version and putting it back: deleting two things in a row
 * resurrected the first one, because the second delete started from a copy
 * taken before the first had landed. Writes must always read fresh.
 */
async function newestDocument() {
  const { blobs } = await list({ prefix: DOC_PREFIX, token: contentToken() });
  if (blobs.length) {
    /* Paths carry a millisecond stamp, so the highest name is the newest. */
    return [...blobs].sort((a, b) => b.pathname.localeCompare(a.pathname))[0];
  }
  /* Nothing versioned yet: fall back to the single document written before
     this scheme existed, so an existing store keeps its content. */
  const legacy = await list({ prefix: LEGACY_DOC, limit: 1, token: contentToken() });
  return legacy.blobs.find((b) => b.pathname === LEGACY_DOC) ?? null;
}

export async function readContent(
  { fresh = false }: { fresh?: boolean } = {},
): Promise<SiteContent> {
  if (!storeConfigured()) return baseContent();
  try {
    const found = await newestDocument();
    if (!found) return baseContent();
    const res = await fetch(
      found.url,
      fresh ? { cache: 'no-store' } : { next: { revalidate: 30 } },
    );
    if (!res.ok) return baseContent();
    const parsed = (await res.json()) as Partial<SiteContent>;
    const base = baseContent();
    return {
      updates: parsed.updates ?? base.updates,
      /* Null-checked, not length-checked. An empty array is a real answer
         here: it means the office deleted the seeded line on purpose, and
         falling back to the seed would resurrect what it deleted. Only a
         document written before statements existed has no key at all, and
         that one gets the seed. */
      statements: parsed.statements ?? base.statements,
      events: parsed.events ?? base.events,
      gallery: parsed.gallery ?? base.gallery,
      /* Deliberately NOT read from here. Enquiries live in a private blob;
         see the note on INBOX. A caller that needs them asks for them. */
      enquiries: [],
      projects: parsed.projects?.length ? parsed.projects : base.projects,
      impact: parsed.impact?.length ? parsed.impact : base.impact,
      contact: { ...base.contact, ...(parsed.contact ?? {}) },
      updatedAt: parsed.updatedAt ?? '',
    };
  } catch {
    return baseContent();
  }
}

/** Write the document. Only ever called from an authenticated route. */
export async function writeContent(content: SiteContent): Promise<void> {
  /* `enquiries` is stripped on the way out, not merely left unread. A caller
     holding a SiteContent it read earlier could otherwise write personal data
     straight back into the public document and undo the split silently. */
  const { enquiries: _omit, ...publicContent } = content;
  const body = JSON.stringify(
    { ...publicContent, updatedAt: new Date().toISOString() },
    null,
    2,
  );

  /* A new path every time — see the note on DOC_PREFIX. */
  await put(`${DOC_PREFIX}${Date.now()}.json`, body, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    token: contentToken(),
  });

  /* Prune, so the store does not fill with every revision ever made. Failing
     to prune must never fail the write: the content is already saved. */
  try {
    const { blobs } = await list({ prefix: DOC_PREFIX, token: contentToken() });
    const stale = [...blobs]
      .sort((a, b) => b.pathname.localeCompare(a.pathname))
      .slice(KEEP_VERSIONS);
    await Promise.all(stale.map((b) => del(b.url)));
  } catch {
    /* Left for the next write to tidy. */
  }
}

/** Store an uploaded photograph and return the record for the document. */
export async function saveImage(
  file: File,
  alt: string,
): Promise<GalleryImage> {
  const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
  const pathname = `gallery/${Date.now()}-${safe}`;
  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
    token: contentToken(),
  });
  return {
    id: pathname,
    url: blob.url,
    alt,
    pathname,
    addedAt: new Date().toISOString(),
  };
}

/**
 * Remove a photograph's file.
 *
 * Takes either a blob pathname or a full blob URL; the SDK accepts both, and
 * gallery entries record a pathname while attachments record only a URL.
 * Built-in images have neither and are skipped.
 */
export async function deleteImageFile(pathnameOrUrl: string): Promise<void> {
  if (!pathnameOrUrl) return;
  try {
    await del(pathnameOrUrl, { token: contentToken() });
  } catch {
    /* The record is going either way; a missing file is not a failure. */
  }
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
