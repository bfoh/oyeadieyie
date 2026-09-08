import { put, list, del } from '@vercel/blob';
import { UPDATES, GALLERY, CONTACT, type Update } from './content';

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

export type SiteContent = {
  updates: Update[];
  events: SiteEvent[];
  gallery: GalleryImage[];
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

export function storeConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** What the site shows before the office has changed anything. */
export function baseContent(): SiteContent {
  return {
    updates: UPDATES,
    events: [],
    gallery: GALLERY.map((g, i) => ({
      id: `built-in-${i}`,
      url: g.src,
      alt: g.alt,
      pathname: '',
      addedAt: '',
    })),
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
  const { blobs } = await list({ prefix: DOC_PREFIX });
  if (blobs.length) {
    /* Paths carry a millisecond stamp, so the highest name is the newest. */
    return [...blobs].sort((a, b) => b.pathname.localeCompare(a.pathname))[0];
  }
  /* Nothing versioned yet: fall back to the single document written before
     this scheme existed, so an existing store keeps its content. */
  const legacy = await list({ prefix: LEGACY_DOC, limit: 1 });
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
      events: parsed.events ?? base.events,
      gallery: parsed.gallery ?? base.gallery,
      contact: { ...base.contact, ...(parsed.contact ?? {}) },
      updatedAt: parsed.updatedAt ?? '',
    };
  } catch {
    return baseContent();
  }
}

/** Write the document. Only ever called from an authenticated route. */
export async function writeContent(content: SiteContent): Promise<void> {
  const body = JSON.stringify(
    { ...content, updatedAt: new Date().toISOString() },
    null,
    2,
  );

  /* A new path every time — see the note on DOC_PREFIX. */
  await put(`${DOC_PREFIX}${Date.now()}.json`, body, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });

  /* Prune, so the store does not fill with every revision ever made. Failing
     to prune must never fail the write: the content is already saved. */
  try {
    const { blobs } = await list({ prefix: DOC_PREFIX });
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
  const blob = await put(pathname, file, { access: 'public', addRandomSuffix: false });
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
    await del(pathnameOrUrl);
  } catch {
    /* The record is going either way; a missing file is not a failure. */
  }
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
