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

const DOC = 'content/site.json';

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
 * the build rather than fail. `revalidate` keeps the public pages fresh
 * without making every visit wait on a fetch.
 */
export async function readContent(): Promise<SiteContent> {
  if (!storeConfigured()) return baseContent();
  try {
    const { blobs } = await list({ prefix: DOC, limit: 1 });
    const found = blobs.find((b) => b.pathname === DOC);
    if (!found) return baseContent();
    const res = await fetch(found.url, { next: { revalidate: 30 } });
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

/** Write the document back. Only ever called from an authenticated route. */
export async function writeContent(content: SiteContent): Promise<void> {
  await put(DOC, JSON.stringify({ ...content, updatedAt: new Date().toISOString() }, null, 2), {
    access: 'public',
    contentType: 'application/json',
    /* One document, overwritten in place, so its URL stays stable and the
       store never fills with orphaned copies. */
    addRandomSuffix: false,
    allowOverwrite: true,
  });
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

/** Remove a photograph's file. Built-in images have no file to remove. */
export async function deleteImageFile(pathname: string): Promise<void> {
  if (!pathname) return;
  try {
    await del(pathname);
  } catch {
    /* The record is going either way; a missing file is not a failure. */
  }
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
