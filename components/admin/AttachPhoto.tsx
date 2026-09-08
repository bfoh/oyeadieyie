'use client';

import { useState } from 'react';

/**
 * A photograph attached to one update or event.
 *
 * Stored in the same place as the gallery but deliberately not listed in it:
 * a picture that belongs to a particular announcement should not also turn up
 * in the gallery grid on the home page.
 *
 * A description is required for the same reason it is everywhere else on this
 * site — the page has to work for a reader who cannot see the picture.
 */
export function AttachPhoto({
  value,
  alt,
  onChange,
}: {
  value?: string;
  alt?: string;
  onChange: (url: string | undefined, alt: string | undefined) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState(alt ?? '');

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('alt', caption);
      form.append('mode', 'attachment');
      const res = await fetch('/api/admin/gallery', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          {
            alt_required: 'Describe the photograph first.',
            too_large: 'That file is over 8 MB. Resize it and try again.',
            unsupported_type: 'Use a JPEG, PNG, WebP or AVIF.',
            store_not_connected: 'The content store is not connected yet.',
          }[data.error as string] ?? 'That upload did not go through.',
        );
        return;
      }
      onChange(data.image.url, caption);
      setFile(null);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  if (value) {
    return (
      <div className="mt-75 flex items-start gap-200 rounded-xl border border-white/10 bg-ebony p-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt={alt ?? ''} className="h-[64px] w-[64px] shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-relaxed text-ivory/60">{alt}</p>
          <button
            type="button"
            onClick={() => { onChange(undefined, undefined); setCaption(''); }}
            className="mt-75 rounded-lg border border-white/15 px-100 py-50 text-xs font-semibold text-ivory/70 transition-colors hover:border-crimson hover:text-crimson"
          >
            Remove photograph
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-75 grid gap-100">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full rounded-xl border border-white/10 bg-ebony px-200 py-100 text-sm text-ivory file:mr-200 file:rounded-lg file:border-0 file:bg-gold file:px-200 file:py-50 file:text-xs file:font-semibold file:text-ebony"
      />
      {file && (
        <>
          <input
            value={caption}
            maxLength={200}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Describe the photograph"
            className="w-full rounded-xl border border-white/10 bg-ebony px-200 py-100 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold focus:outline-none"
          />
          <button
            type="button"
            onClick={upload}
            disabled={busy || !caption.trim()}
            className="justify-self-start rounded-lg bg-gold px-200 py-50 text-xs font-bold uppercase tracking-[0.08em] text-ebony transition-all hover:bg-[#e6c34d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Uploading…' : 'Attach'}
          </button>
        </>
      )}
      {error && <p role="alert" className="text-xs text-crimson">{error}</p>}
    </div>
  );
}
