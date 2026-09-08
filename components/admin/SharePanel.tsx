'use client';

import { useState } from 'react';

/**
 * Where a finished asset can actually go.
 *
 * Two different mechanisms, because the platforms are two different kinds:
 *
 * Facebook, WhatsApp as a message, X, LinkedIn and Telegram all take a LINK.
 * None of them will accept an image posted from a web page, so the artwork is
 * published to a public URL first and that URL is what gets shared.
 *
 * Instagram, TikTok and a WhatsApp status take neither a link nor a web post.
 * They only accept an upload made from the phone itself. The honest answer is
 * to put the file on the device — the phone's own share sheet, or a download —
 * and post it from the app. This panel says that plainly rather than offering
 * a button that would not work.
 */

type Props = {
  url: string;
  text: string;
  filename: string;
  blob: Blob;
  onClose: () => void;
};

const LINK_TARGETS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    href: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(`${t}\n${u}`)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    id: 'x',
    label: 'X',
    href: (u: string, t: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    href: (u: string, t: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
];

export function SharePanel({ url, text, filename, blob, onClose }: Props) {
  const [note, setNote] = useState<string | null>(null);
  const canDeviceShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [new File([blob], filename, { type: 'image/png' })] });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setNote('Link copied.');
    } catch {
      setNote('Could not copy. Select the link and copy it by hand.');
    }
  }

  async function copyImage() {
    try {
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
      setNote('Picture copied. Paste it into WhatsApp Web or a message.');
    } catch {
      setNote('This browser will not copy a picture. Save it instead.');
    }
  }

  function save() {
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
    setNote('Saved. Post it from the app on your phone.');
  }

  async function deviceShare() {
    try {
      await navigator.share({
        files: [new File([blob], filename, { type: 'image/png' })],
        text,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setNote('The device would not open its share sheet.');
    }
  }

  return (
    <div className="border-t border-white/10 bg-ebony p-300">
      <div className="flex items-start justify-between gap-200">
        <div>
          <h3 className="font-display text-xl font-600 text-ivory">Share this</h3>
          <p className="mt-50 text-xs leading-relaxed text-ivory/55">
            Published to a link the office can post anywhere.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/15 px-100 py-50 text-xs font-semibold text-ivory/70 transition-colors hover:border-gold hover:text-gold"
        >
          Done
        </button>
      </div>

      <p className="mt-300 text-xs font-semibold uppercase tracking-[0.14em] text-gold">
        Post the link
      </p>
      <div className="mt-100 flex flex-wrap gap-75">
        {LINK_TARGETS.map((t) => (
          <a
            key={t.id}
            href={t.href(url, text)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/15 px-200 py-75 text-sm font-semibold text-ivory transition-colors hover:border-gold hover:text-gold"
          >
            {t.label}
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          className="rounded-lg border border-white/15 px-200 py-75 text-sm font-semibold text-ivory/70 transition-colors hover:border-gold hover:text-gold"
        >
          Copy link
        </button>
      </div>

      <p className="mt-300 text-xs font-semibold uppercase tracking-[0.14em] text-gold">
        Instagram, TikTok, WhatsApp status
      </p>
      <p className="mt-75 max-w-[60ch] text-xs leading-relaxed text-ivory/55">
        These three take an upload from the phone and nothing else — there is no
        way for a web page to post to them. Put the picture on the device, then
        post it from the app.
      </p>
      <div className="mt-100 flex flex-wrap gap-75">
        {canDeviceShare && (
          <button
            type="button"
            onClick={deviceShare}
            className="rounded-lg bg-gold px-200 py-75 text-sm font-semibold text-ebony transition-all hover:bg-[#e6c34d]"
          >
            Send to a phone app
          </button>
        )}
        <button
          type="button"
          onClick={save}
          className="rounded-lg border border-white/15 px-200 py-75 text-sm font-semibold text-ivory transition-colors hover:border-gold hover:text-gold"
        >
          Save the picture
        </button>
        <button
          type="button"
          onClick={copyImage}
          className="rounded-lg border border-white/15 px-200 py-75 text-sm font-semibold text-ivory/70 transition-colors hover:border-gold hover:text-gold"
        >
          Copy the picture
        </button>
      </div>

      <p className="mt-300 break-all rounded-lg border border-white/10 bg-ebony-raised p-100 text-xs text-ivory/45">
        {url}
      </p>
      {note && <p className="mt-100 text-xs text-gold">{note}</p>}
    </div>
  );
}
