import { NextResponse } from 'next/server';
import { list, del } from '@vercel/blob';
import { isAdmin } from '@/lib/admin-guard';
import { readContent, storeConfigured } from '@/lib/store';

/**
 * Files in the store that nothing points at.
 *
 * Two ways they accumulate, both invisible until now. A photograph attached to
 * an update or an event is uploaded the moment it is chosen — if the office
 * then abandons the form, the file is stored, publicly readable and referenced
 * by nothing. And every press of Share publishes a fresh PNG under a new name,
 * for ever, with no listing and no way to remove it.
 *
 * The content document itself is excluded: it is the thing that does the
 * referencing, and its own old revisions are pruned on write.
 */
/* EVERY record that can hold a photograph must be listed here. A record this
   function does not know about has its picture reported as an orphan and
   offered for deletion, which puts a broken image on the public page — the
   exact failure the sweeper exists to prevent. Add to this when you add a
   record type that carries an image. */
function referencedUrls(content: Awaited<ReturnType<typeof readContent>>) {
  const urls = new Set<string>();
  content.gallery.forEach((g) => g.url && urls.add(g.url));
  content.updates.forEach((u) => u.image && urls.add(u.image));
  content.events.forEach((e) => e.imageUrl && urls.add(e.imageUrl));
  content.statements.forEach((st) => st.imageUrl && urls.add(st.imageUrl));
  return urls;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }
  if (!storeConfigured()) {
    return NextResponse.json({ error: 'store_not_connected' }, { status: 503 });
  }

  const content = await readContent({ fresh: true });
  const used = referencedUrls(content);
  const { blobs } = await list();

  const orphans = blobs
    .filter((b) => !b.pathname.startsWith('content/'))
    .filter((b) => !used.has(b.url))
    .map((b) => ({
      pathname: b.pathname,
      url: b.url,
      size: b.size,
      uploadedAt: b.uploadedAt,
      kind: b.pathname.startsWith('share/') ? 'share' : 'upload',
    }))
    .sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)));

  return NextResponse.json({
    orphans,
    totalBytes: orphans.reduce((n, o) => n + (o.size ?? 0), 0),
    inUse: used.size,
  });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  let body: { urls?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const urls = Array.isArray(body.urls) ? body.urls.slice(0, 100) : [];
  if (!urls.length) {
    return NextResponse.json({ error: 'nothing_to_delete' }, { status: 400 });
  }

  /* Re-check against the document rather than trusting the caller: the list
     that produced these was taken at some earlier moment, and a photograph
     may have been attached to something since. */
  const content = await readContent({ fresh: true });
  const used = referencedUrls(content);
  const safe = urls.filter(
    (u) => typeof u === 'string' && !used.has(u) && !u.includes('/content/'),
  );

  await Promise.all(safe.map((u) => del(u).catch(() => {})));

  return NextResponse.json({ ok: true, deleted: safe.length, skipped: urls.length - safe.length });
}
