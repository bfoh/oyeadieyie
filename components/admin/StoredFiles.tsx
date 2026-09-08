'use client';

import { useEffect, useState } from 'react';
import { formatBytes } from '@/lib/resizeImage';

type Orphan = {
  pathname: string;
  url: string;
  size: number;
  uploadedAt: string;
  kind: 'share' | 'upload';
};

/**
 * Files nothing points at.
 *
 * These accumulate quietly and are billed: an attachment uploaded and then
 * abandoned, and a fresh PNG for every press of Share. Nothing in the admin
 * could see them, let alone remove them.
 */
export function StoredFiles() {
  const [orphans, setOrphans] = useState<Orphan[] | null>(null);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function load() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch('/api/admin/files');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote(
          data.error === 'store_not_connected'
            ? 'The content store is not connected.'
            : 'Could not read the store.',
        );
        setOrphans([]);
        return;
      }
      setOrphans(data.orphans ?? []);
      setTotal(data.totalBytes ?? 0);
    } catch {
      setNote('Could not reach the server.');
      setOrphans([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function removeAll() {
    if (!orphans?.length) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: orphans.map((o) => o.url) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote('That did not delete.');
        return;
      }
      setNote(
        `Deleted ${data.deleted} file${data.deleted === 1 ? '' : 's'}` +
          (data.skipped ? `, kept ${data.skipped} now in use.` : '.'),
      );
      await load();
    } catch {
      setNote('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-500 rounded-2xl border border-white/10 bg-ebony-raised p-300">
      <div className="flex flex-wrap items-start justify-between gap-200">
        <div>
          <h2 className="font-display text-2xl font-600 text-ivory">Stored files</h2>
          <p className="mt-100 max-w-[62ch] text-sm leading-relaxed text-ivory/60">
            Pictures kept in the store that nothing on the site points at — a
            photograph chosen for an update that was never posted, or a copy
            published each time something was shared. They are safe to remove.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={busy}
          className="rounded-lg border border-white/15 px-200 py-75 text-xs font-semibold text-ivory/70 transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
        >
          {busy ? 'Checking…' : 'Check again'}
        </button>
      </div>

      {note && <p className="mt-200 text-sm text-gold">{note}</p>}

      {orphans === null ? (
        <p className="mt-300 text-sm text-ivory/50">Reading the store…</p>
      ) : orphans.length === 0 ? (
        <p className="mt-300 text-sm text-ivory/60">
          Nothing unused. Every file in the store is on the site.
        </p>
      ) : (
        <>
          <div className="mt-300 flex flex-wrap items-center gap-200">
            <p className="text-sm text-ivory/75">
              {orphans.length} unused {orphans.length === 1 ? 'file' : 'files'},{' '}
              {formatBytes(total)}
            </p>
            <button
              type="button"
              onClick={removeAll}
              disabled={busy}
              className="rounded-lg border border-white/15 px-200 py-75 text-xs font-semibold text-ivory/70 transition-colors hover:border-crimson hover:text-crimson disabled:opacity-50"
            >
              Delete them all
            </button>
          </div>
          <ul className="mt-200 grid gap-75">
            {orphans.slice(0, 40).map((o) => (
              <li
                key={o.url}
                className="flex flex-wrap items-center justify-between gap-100 rounded-lg border border-white/10 bg-ebony px-200 py-100 text-xs"
              >
                <span className="min-w-0 truncate text-ivory/70">{o.pathname}</span>
                <span className="flex shrink-0 items-center gap-200 text-ivory/45">
                  <span>{o.kind === 'share' ? 'shared copy' : 'upload'}</span>
                  <span>{formatBytes(o.size)}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
