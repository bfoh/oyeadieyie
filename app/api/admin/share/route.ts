import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isAdmin } from '@/lib/admin-guard';
import { contentToken } from '@/lib/store';
import { storeConfigured } from '@/lib/store';

/**
 * Publish a finished asset to a public URL.
 *
 * Facebook, X, LinkedIn, Telegram and a WhatsApp message all share a LINK;
 * none of them accept an image posted from a web page. So to reach them the
 * artwork has to live somewhere public first, and this is where it goes.
 *
 * Instagram, TikTok and a WhatsApp status accept neither: they only take an
 * upload from the phone itself. Nothing here can change that, and the screen
 * says so rather than pretending otherwise.
 */
const MAX_BYTES = 6 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }
  if (!storeConfigured()) {
    return NextResponse.json({ error: 'store_not_connected' }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get('file');
  const assetId = String(form.get('assetId') ?? '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'no_file' }, { status: 400 });
  }
  if (file.type !== 'image/png') {
    return NextResponse.json({ error: 'unsupported_type' }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }

  /* A fresh name every time. Overwriting one path per asset would be tidier,
     but it would also silently change the picture inside a post the office
     shared last month. */
  const stamp = new Date().toISOString().slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 8);
  const blob = await put(`share/${assetId || 'asset'}-${stamp}-${rand}.png`, file, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'image/png',
  });

  return NextResponse.json({ ok: true, url: blob.url });
}
