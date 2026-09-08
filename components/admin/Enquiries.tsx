'use client';

import { useMemo, useState } from 'react';
import { ENGAGE_ROUTES, parseISODate } from '@/lib/content';
import type { Enquiry, EnquiryStatus, SiteEvent } from '@/lib/store';

/**
 * Everything the public has sent to the office.
 *
 * The site tells readers twice that appearances are "confirmed against the
 * traditional calendar, which takes precedence over all other commitments".
 * Until now nothing implemented that: the date lived inside a prose field
 * where nothing could check it. An enquiry that names a date is now compared
 * against the events the office already keeps, and a clash is shown here
 * before anyone replies.
 */

const STATUSES: { id: EnquiryStatus; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'replied', label: 'Replied' },
  { id: 'declined', label: 'Declined' },
  { id: 'archived', label: 'Archived' },
];

/* A durbar does not only occupy its own day: chiefs travel, and the days
   either side are spoken for too. */
const CLASH_DAYS = 2;

function formatDate(iso?: string) {
  const d = parseISODate(iso);
  if (!d) return iso ?? '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function daysBetween(a: Date, b: Date) {
  return Math.round(Math.abs(a.getTime() - b.getTime()) / 86_400_000);
}

export function Enquiries({
  initial,
  events,
}: {
  initial: Enquiry[];
  events: SiteEvent[];
}) {
  const [enquiries, setEnquiries] = useState(initial);
  const [filter, setFilter] = useState<EnquiryStatus | 'all'>('new');
  const [route, setRoute] = useState<string>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const shown = useMemo(
    () =>
      enquiries
        .filter((e) => (filter === 'all' ? true : e.status === filter))
        .filter((e) => (route === 'all' ? true : e.route === route))
        .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)),
    [enquiries, filter, route],
  );

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: enquiries.length };
    STATUSES.forEach((s) => {
      out[s.id] = enquiries.filter((e) => e.status === s.id).length;
    });
    return out;
  }, [enquiries]);

  /** Events sitting on or near the date an enquiry is asking for. */
  function clashes(enquiry: Enquiry) {
    const wanted = parseISODate(enquiry.requestedDate);
    if (!wanted) return [];
    return events
      .map((ev) => ({ ev, on: parseISODate(ev.date) }))
      .filter(
        (x): x is { ev: SiteEvent; on: Date } =>
          x.on !== null && daysBetween(x.on, wanted) <= CLASH_DAYS,
      )
      .map(({ ev, on }) => ({ ev, days: daysBetween(on, wanted) }));
  }

  async function send(body: unknown, apply: (list: Enquiry[]) => Enquiry[], message: string) {
    setBusy(JSON.stringify(body));
    setNote(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setNote('That did not save. Try again.');
        return;
      }
      setEnquiries(apply);
      setNote(message);
    } catch {
      setNote('Could not reach the server.');
    } finally {
      setBusy(null);
    }
  }

  const setStatus = (e: Enquiry, status: EnquiryStatus) =>
    send(
      { action: 'set-enquiry', id: e.id, status },
      (list) => list.map((x) => (x.id === e.id ? { ...x, status } : x)),
      `Marked ${status}.`,
    );

  const saveNote = (e: Enquiry) => {
    const value = draft[e.id] ?? '';
    return send(
      { action: 'set-enquiry', id: e.id, note: value },
      (list) => list.map((x) => (x.id === e.id ? { ...x, note: value || undefined } : x)),
      'Note saved.',
    );
  };

  const remove = (e: Enquiry) =>
    send(
      { action: 'delete-enquiry', id: e.id },
      (list) => list.filter((x) => x.id !== e.id),
      'Enquiry deleted.',
    );

  function replyHref(e: Enquiry) {
    const title = ENGAGE_ROUTES.find((r) => r.id === e.route)?.title ?? 'your enquiry';
    const subject = `Re: ${title}`;
    const body = [
      `Dear ${e.name},`,
      '',
      'Thank you for writing to the office of the Nkosuo Hene of Adrobaa.',
      '',
      '',
      'Office of the Nkosuo Hene of Adrobaa',
    ].join('\n');
    return `mailto:${e.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const chip = 'rounded-full px-100 py-25 text-xs font-semibold';

  return (
    <>
      <div className="flex flex-wrap gap-200">
        <div role="group" aria-label="Status" className="flex flex-wrap gap-75 rounded-2xl border border-white/10 bg-ebony-raised p-75">
          {[{ id: 'all' as const, label: 'All' }, ...STATUSES].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setFilter(s.id as EnquiryStatus | 'all')}
              aria-pressed={filter === s.id}
              className={[
                'flex items-center gap-75 rounded-xl px-200 py-75 text-sm font-semibold transition-all',
                filter === s.id ? 'bg-gold text-ebony' : 'text-ivory/60 hover:text-ivory',
              ].join(' ')}
            >
              {s.label}
              <span className={filter === s.id ? 'text-ebony/70' : 'text-ivory/40'}>
                {counts[s.id] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <select
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          aria-label="Filter by route"
          className="rounded-xl border border-white/10 bg-ebony px-200 py-100 text-sm text-ivory focus:border-gold focus:outline-none"
        >
          <option value="all">Every route</option>
          {ENGAGE_ROUTES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </div>

      {note && (
        <p role="status" className="mt-200 text-sm text-gold">
          {note}
        </p>
      )}

      {shown.length === 0 ? (
        <p className="mt-400 text-base text-ivory/55">
          {enquiries.length === 0
            ? 'Nothing yet. Everything sent through the form on the home page arrives here.'
            : 'Nothing under this heading.'}
        </p>
      ) : (
        <ul className="mt-400 grid gap-300">
          {shown.map((e) => {
            const conflict = clashes(e);
            const routeTitle = ENGAGE_ROUTES.find((r) => r.id === e.route)?.title ?? e.route;
            return (
              <li key={e.id} className="rounded-2xl border border-white/10 bg-ebony-raised p-300">
                <div className="flex flex-wrap items-start justify-between gap-200">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-100">
                      <span className={`${chip} border border-gold/40 text-gold`}>{routeTitle}</span>
                      <span
                        className={[
                          chip,
                          e.status === 'new'
                            ? 'bg-gold text-ebony'
                            : 'border border-white/20 text-ivory/55',
                        ].join(' ')}
                      >
                        {e.status}
                      </span>
                      <span className="text-xs text-ivory/40">{formatWhen(e.receivedAt)}</span>
                    </div>
                    <h2 className="mt-200 font-display text-2xl font-600 text-ivory">{e.name}</h2>
                    <p className="mt-25 text-sm text-ivory/65">
                      {e.organisation} · {e.email}
                    </p>
                  </div>

                  <a
                    href={replyHref(e)}
                    className="rounded-xl bg-gold px-200 py-100 text-sm font-semibold text-ebony transition-all hover:bg-[#e6c34d]"
                  >
                    Reply
                  </a>
                </div>

                {e.requestedDate && (
                  <div
                    className={[
                      'mt-300 rounded-xl border p-200',
                      conflict.length
                        ? 'border-crimson/50 bg-crimson/5'
                        : 'border-white/10 bg-ebony',
                    ].join(' ')}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                      Date requested
                    </p>
                    <p className="mt-50 text-base text-ivory">{formatDate(e.requestedDate)}</p>
                    {conflict.length > 0 ? (
                      <ul className="mt-100 grid gap-25">
                        {conflict.map(({ ev, days }) => (
                          <li key={ev.id} className="text-sm text-crimson">
                            Clashes with {ev.title} —{' '}
                            {days === 0 ? 'the same day' : `${days} day${days > 1 ? 's' : ''} away`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-100 text-sm text-ivory/55">
                        Nothing in the calendar within {CLASH_DAYS} days.
                      </p>
                    )}
                  </div>
                )}

                <p className="mt-300 whitespace-pre-wrap text-base leading-relaxed text-ivory/75">
                  {e.detail}
                </p>

                <div className="mt-300 grid gap-100">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-ivory/50" htmlFor={`note-${e.id}`}>
                    Office note, never shown to the sender
                  </label>
                  <textarea
                    id={`note-${e.id}`}
                    rows={2}
                    maxLength={600}
                    defaultValue={e.note ?? ''}
                    onChange={(ev) => setDraft((d) => ({ ...d, [e.id]: ev.target.value }))}
                    className="w-full resize-y rounded-xl border border-white/10 bg-ebony px-200 py-100 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold focus:outline-none"
                    placeholder="Spoke to them on the 3rd; awaiting the council."
                  />
                </div>

                <div className="mt-200 flex flex-wrap items-center gap-75">
                  {STATUSES.filter((s) => s.id !== e.status).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={busy !== null}
                      onClick={() => setStatus(e, s.id)}
                      className="rounded-lg border border-white/15 px-200 py-50 text-xs font-semibold text-ivory/70 transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
                    >
                      Mark {s.label.toLowerCase()}
                    </button>
                  ))}
                  {draft[e.id] !== undefined && (
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => saveNote(e)}
                      className="rounded-lg border border-gold px-200 py-50 text-xs font-semibold text-gold transition-colors hover:bg-gold/10 disabled:opacity-50"
                    >
                      Save note
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => remove(e)}
                    className="ml-auto rounded-lg border border-white/15 px-200 py-50 text-xs font-semibold text-ivory/50 transition-colors hover:border-crimson hover:text-crimson disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
