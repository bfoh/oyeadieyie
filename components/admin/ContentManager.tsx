'use client';

import { useEffect, useState } from 'react';
import type { SiteContent } from '@/lib/store';
import { WritingAssistant } from './WritingAssistant';

/**
 * What the office can change without a developer.
 *
 * Updates and events are added and removed here; photographs are uploaded to
 * the gallery and deleted from it; the contact details fill the blanks the
 * public page currently omits. Everything else — the projects, the adinkra,
 * the biography — stays in the repository, because that is the record rather
 * than the noticeboard and it should go through review.
 */

type Tab = 'updates' | 'events' | 'gallery' | 'contact';

const TABS: { id: Tab; label: string }[] = [
  { id: 'updates', label: 'Updates' },
  { id: 'events', label: 'Events' },
  { id: 'gallery', label: 'Photographs' },
  { id: 'contact', label: 'Contact details' },
];

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

const input =
  'w-full rounded-xl border border-white/10 bg-ebony px-200 py-100 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold focus:outline-none';
const label = 'block text-xs font-semibold uppercase tracking-[0.12em] text-ivory/60';
const primary =
  'rounded-xl bg-gold px-200 py-100 text-sm font-semibold text-ebony transition-all hover:bg-[#e6c34d] disabled:cursor-not-allowed disabled:opacity-50';
const quiet =
  'rounded-lg border border-white/15 px-100 py-50 text-xs font-semibold text-ivory/70 transition-colors hover:border-crimson hover:text-crimson';

export function ContentManager({ initial, configured }: { initial: SiteContent; configured: boolean }) {
  const [tab, setTab] = useState<Tab>('updates');
  const [content, setContent] = useState<SiteContent>(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* Forms */
  const [update, setUpdate] = useState({ title: '', date: '', body: '' });
  const [event, setEvent] = useState({ title: '', date: '', time: '', place: '', body: '' });
  const [alt, setAlt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [contact, setContact] = useState(initial.contact);

  useEffect(() => setContact(initial.contact), [initial.contact]);

  async function send(body: unknown, success: string) {
    setBusy(true);
    setNote(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.error === 'store_not_connected'
            ? 'The content store is not connected to this deployment yet.'
            : data.error === 'title_and_date_required'
              ? 'A title and a date are both needed.'
              : 'That did not save. Try again.',
        );
        return false;
      }
      if (data.content) setContent(data.content);
      setNote(success);
      return true;
    } catch {
      setError('Could not reach the server.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    setNote(null);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('alt', alt);
      const res = await fetch('/api/admin/gallery', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          {
            alt_required: 'Describe the photograph first. Every image on this site carries a description.',
            too_large: 'That file is over 8 MB. Resize it and try again.',
            unsupported_type: 'Use a JPEG, PNG, WebP or AVIF.',
            store_not_connected: 'The content store is not connected to this deployment yet.',
          }[data.error as string] ?? 'That upload did not go through.',
        );
        return;
      }
      setContent((c) => ({ ...c, gallery: [data.image, ...c.gallery] }));
      setFile(null);
      setAlt('');
      setNote('Photograph added.');
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!configured && (
        <div className="mb-400 rounded-2xl border border-crimson/40 bg-crimson/5 p-300">
          <p className="text-sm font-semibold text-ivory">The content store is not connected</p>
          <p className="mt-100 text-sm leading-relaxed text-ivory/70">
            A Vercel Blob store named <strong>adrobaa-content</strong> has been
            created for this project but not yet connected to it. Open the
            project on Vercel, go to Storage, and connect it. Everything below
            starts working the moment it is, and until then the site shows what
            was published in the last build.
          </p>
        </div>
      )}

      <div role="group" aria-label="Sections" className="flex flex-wrap gap-100 rounded-2xl border border-white/10 bg-ebony-raised p-75">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); setNote(null); setError(null); }}
            aria-pressed={tab === t.id}
            className={[
              'rounded-xl px-300 py-100 text-sm font-semibold transition-all',
              tab === t.id ? 'bg-gold text-ebony' : 'text-ivory/60 hover:text-ivory',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(note || error) && (
        <p
          role={error ? 'alert' : 'status'}
          className={['mt-300 text-sm', error ? 'text-crimson' : 'text-gold'].join(' ')}
        >
          {error ?? note}
        </p>
      )}

      {/* ---------------- updates ---------------- */}
      {tab === 'updates' && (
        <div className="mt-400 grid gap-400 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
          <section className="rounded-2xl border border-white/10 bg-ebony-raised p-300">
            <h2 className="font-display text-2xl font-600 text-ivory">Post an update</h2>
            <p className="mt-100 text-sm leading-relaxed text-ivory/60">
              Dated entries appear on the home page, newest first. This is what
              turns the site into a record that accumulates.
            </p>
            <div className="mt-300 grid gap-200">
              <div>
                <label className={label} htmlFor="u-title">Title</label>
                <input id="u-title" className={`${input} mt-75`} value={update.title} maxLength={120}
                  onChange={(e) => setUpdate({ ...update, title: e.target.value })}
                  placeholder="Borehole commissioned at Adrobaa" />
              </div>
              <div>
                <label className={label} htmlFor="u-date">Date</label>
                <input id="u-date" type="date" className={`${input} mt-75`} value={update.date}
                  onChange={(e) => setUpdate({ ...update, date: e.target.value })} />
              </div>
              <div>
                <label className={label} htmlFor="u-body">What happened</label>
                <textarea id="u-body" rows={5} className={`${input} mt-75 resize-y`} value={update.body} maxLength={2000}
                  onChange={(e) => setUpdate({ ...update, body: e.target.value })}
                  placeholder="A paragraph the town and the press can quote." />
                <WritingAssistant
                  kind="update"
                  context={[update.title && `Title: ${update.title}`, update.date && `Date: ${update.date}`]
                    .filter(Boolean)
                    .join('\n')}
                  placeholder="The borehole at the school was commissioned; the town now draws clean water"
                  onDraft={(text) => setUpdate((u) => ({ ...u, body: text }))}
                />
              </div>
              <button
                type="button"
                className={primary}
                disabled={busy || !update.title || !update.date}
                onClick={async () => {
                  if (await send({ action: 'add-update', update }, 'Update posted.')) {
                    setUpdate({ title: '', date: '', body: '' });
                  }
                }}
              >
                {busy ? 'Saving…' : 'Post the update'}
              </button>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-600 text-ivory">
              Published <span className="text-ivory/40">({content.updates.length})</span>
            </h2>
            {content.updates.length === 0 ? (
              <p className="mt-200 text-sm text-ivory/55">
                Nothing posted yet, so the updates section does not appear on the site at all.
              </p>
            ) : (
              <ul className="mt-200 grid gap-200">
                {content.updates.map((u) => (
                  <li key={u.id} className="rounded-2xl border border-white/10 bg-ebony-raised p-300">
                    <div className="flex items-start justify-between gap-200">
                      <div>
                        <time dateTime={u.date} className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                          {formatDate(u.date)}
                        </time>
                        <h3 className="mt-75 font-display text-xl font-600 text-ivory">{u.title}</h3>
                        {u.body && <p className="mt-100 text-sm leading-relaxed text-ivory/65">{u.body}</p>}
                      </div>
                      <button
                        type="button"
                        className={quiet}
                        disabled={busy}
                        onClick={() => send({ action: 'delete-update', id: u.id }, 'Update removed.')}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* ---------------- events ---------------- */}
      {tab === 'events' && (
        <div className="mt-400 grid gap-400 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
          <section className="rounded-2xl border border-white/10 bg-ebony-raised p-300">
            <h2 className="font-display text-2xl font-600 text-ivory">Add an event</h2>
            <p className="mt-100 text-sm leading-relaxed text-ivory/60">
              Durbars, festivals, commissionings and appearances. They appear on
              the site in date order and drop off once the day has passed.
            </p>
            <div className="mt-300 grid gap-200">
              <div>
                <label className={label} htmlFor="e-title">Event</label>
                <input id="e-title" className={`${input} mt-75`} value={event.title} maxLength={120}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                  placeholder="Durbar of Chiefs" />
              </div>
              <div className="grid gap-200 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="e-date">Date</label>
                  <input id="e-date" type="date" className={`${input} mt-75`} value={event.date}
                    onChange={(e) => setEvent({ ...event, date: e.target.value })} />
                </div>
                <div>
                  <label className={label} htmlFor="e-time">Time</label>
                  <input id="e-time" className={`${input} mt-75`} value={event.time} maxLength={40}
                    onChange={(e) => setEvent({ ...event, time: e.target.value })} placeholder="10:00 prompt" />
                </div>
              </div>
              <div>
                <label className={label} htmlFor="e-place">Place</label>
                <input id="e-place" className={`${input} mt-75`} value={event.place} maxLength={120}
                  onChange={(e) => setEvent({ ...event, place: e.target.value })}
                  placeholder="The durbar ground, Adrobaa" />
              </div>
              <div>
                <label className={label} htmlFor="e-body">Detail</label>
                <textarea id="e-body" rows={4} className={`${input} mt-75 resize-y`} value={event.body} maxLength={1200}
                  onChange={(e) => setEvent({ ...event, body: e.target.value })} />
                <WritingAssistant
                  kind="event"
                  context={[event.title && `Event: ${event.title}`, event.date && `Date: ${event.date}`, event.place && `Place: ${event.place}`]
                    .filter(Boolean)
                    .join('\n')}
                  placeholder="Chiefs and queen mothers gather; the sanitation block will be handed to the town"
                  onDraft={(text) => setEvent((ev) => ({ ...ev, body: text }))}
                />
              </div>
              <button
                type="button"
                className={primary}
                disabled={busy || !event.title || !event.date}
                onClick={async () => {
                  if (await send({ action: 'add-event', event }, 'Event added.')) {
                    setEvent({ title: '', date: '', time: '', place: '', body: '' });
                  }
                }}
              >
                {busy ? 'Saving…' : 'Add the event'}
              </button>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-600 text-ivory">
              In the calendar <span className="text-ivory/40">({content.events.length})</span>
            </h2>
            {content.events.length === 0 ? (
              <p className="mt-200 text-sm text-ivory/55">
                No events yet, so the calendar section does not appear on the site.
              </p>
            ) : (
              <ul className="mt-200 grid gap-200">
                {content.events.map((ev) => {
                  const past = ev.date < new Date().toISOString().slice(0, 10);
                  return (
                    <li key={ev.id} className="rounded-2xl border border-white/10 bg-ebony-raised p-300">
                      <div className="flex items-start justify-between gap-200">
                        <div>
                          <div className="flex flex-wrap items-center gap-100">
                            <time dateTime={ev.date} className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                              {formatDate(ev.date)}
                            </time>
                            {past && (
                              <span className="rounded-full border border-white/20 px-100 py-25 text-xs text-ivory/50">
                                Past
                              </span>
                            )}
                          </div>
                          <h3 className="mt-75 font-display text-xl font-600 text-ivory">{ev.title}</h3>
                          <p className="mt-50 text-sm text-ivory/60">
                            {[ev.time, ev.place].filter(Boolean).join(' · ')}
                          </p>
                          {ev.body && <p className="mt-100 text-sm leading-relaxed text-ivory/65">{ev.body}</p>}
                        </div>
                        <button
                          type="button"
                          className={quiet}
                          disabled={busy}
                          onClick={() => send({ action: 'delete-event', id: ev.id }, 'Event removed.')}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* ---------------- gallery ---------------- */}
      {tab === 'gallery' && (
        <div className="mt-400">
          <section className="rounded-2xl border border-white/10 bg-ebony-raised p-300">
            <h2 className="font-display text-2xl font-600 text-ivory">Add a photograph</h2>
            <p className="mt-100 max-w-measure text-sm leading-relaxed text-ivory/60">
              Goes into the gallery on the home page. JPEG, PNG, WebP or AVIF, up
              to 8 MB. A description is required: every photograph on this site
              carries one, so the page works for a reader who cannot see it.
            </p>
            <div className="mt-300 grid gap-200 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] lg:items-end">
              <div>
                <label className={label} htmlFor="g-file">Photograph</label>
                <input
                  id="g-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className={`${input} mt-75 file:mr-200 file:rounded-lg file:border-0 file:bg-gold file:px-200 file:py-50 file:text-xs file:font-semibold file:text-ebony`}
                />
              </div>
              <div>
                <label className={label} htmlFor="g-alt">Description</label>
                <input id="g-alt" className={`${input} mt-75`} value={alt} maxLength={200}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Queen mothers of Adrobaa in red and black cloth at a durbar" />
              </div>
              <button type="button" className={primary} disabled={busy || !file || !alt} onClick={upload}>
                {busy ? 'Uploading…' : 'Add'}
              </button>
            </div>
          </section>

          <h2 className="mt-500 font-display text-2xl font-600 text-ivory">
            In the gallery <span className="text-ivory/40">({content.gallery.length})</span>
          </h2>
          <ul className="mt-200 grid grid-cols-2 gap-200 md:grid-cols-3 xl:grid-cols-4">
            {content.gallery.map((g) => (
              <li key={g.id} className="overflow-hidden rounded-2xl border border-white/10 bg-ebony-raised">
                <div className="relative aspect-[3/4] w-full bg-black/40">
                  {/* A plain img: these are arbitrary blob URLs, and the
                      optimiser would need every host allow-listed. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt={g.alt} className="h-full w-full object-cover" />
                </div>
                <div className="p-200">
                  <p className="text-xs leading-relaxed text-ivory/60">{g.alt}</p>
                  {g.pathname ? (
                    <button
                      type="button"
                      className={`${quiet} mt-200`}
                      disabled={busy}
                      onClick={() => send({ action: 'delete-image', id: g.id }, 'Photograph removed.')}
                    >
                      Delete
                    </button>
                  ) : (
                    <p className="mt-200 text-xs text-ivory/35">Shipped with the site</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------------- contact ---------------- */}
      {tab === 'contact' && (
        <div className="mt-400 max-w-[620px]">
          <section className="rounded-2xl border border-white/10 bg-ebony-raised p-300">
            <h2 className="font-display text-2xl font-600 text-ivory">Contact details</h2>
            <p className="mt-100 text-sm leading-relaxed text-ivory/60">
              These fill the blanks the public page currently leaves out. A value
              in brackets counts as unset, and its line stays hidden rather than
              printing a placeholder.
            </p>
            <div className="mt-300 grid gap-200">
              {([
                ['email', 'Office email', 'office@example.com'],
                ['phone', 'Office telephone', '+233 XX XXX XXXX'],
                ['press', 'Press desk', 'press@example.com'],
                ['whatsapp', 'WhatsApp number', '233XXXXXXXXX'],
              ] as const).map(([key, text, placeholder]) => (
                <div key={key}>
                  <label className={label} htmlFor={`c-${key}`}>{text}</label>
                  <input
                    id={`c-${key}`}
                    className={`${input} mt-75`}
                    value={contact[key] ?? ''}
                    placeholder={placeholder}
                    onChange={(e) => setContact({ ...contact, [key]: e.target.value })}
                  />
                </div>
              ))}
              <button
                type="button"
                className={primary}
                disabled={busy}
                onClick={() => send({ action: 'set-contact', contact }, 'Contact details saved.')}
              >
                {busy ? 'Saving…' : 'Save contact details'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
