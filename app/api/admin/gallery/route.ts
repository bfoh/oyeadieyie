import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-guard';
import { readContent, writeContent, saveImage, storeConfigured } from '@/lib/store';

/* Photographs are uploaded straight to the store, then recorded in the
   document. The two steps are separate so a failed write never leaves a
   record pointing at a file that does not exist. */
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }
  if (!storeConfigured()) {
    return NextResponse.json({ error: 'store_not_connected' }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get('file');
  const alt = String(form.get('alt') ?? '').trim().slice(0, 200);
  /* An attachment belongs to its update or event, not to the gallery grid,
     so it is stored but not listed. */
  const attach = String(form.get('mode') ?? '') === 'attachment';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'no_file' }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'unsupported_type' }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }
  if (!alt) {
    /* An image with no description is an image a screen reader cannot use,
       and this site publishes alt text on every photograph. */
    return NextResponse.json({ error: 'alt_required' }, { status: 400 });
  }

  const image = await saveImage(file, alt);

  if (!attach) {
    const content = await readContent();
    content.gallery = [image, ...content.gallery];
    await writeContent(content);
  }

  return NextResponse.json({ ok: true, image });
}
