'use client';

import { useEffect, useRef, useState } from 'react';
import type { SiteContent } from '@/lib/store';
import { WritingAssistant } from './WritingAssistant';
import { AttachPhoto } from './AttachPhoto';
import { formatBytes, resizeImage } from '@/lib/resizeImage';
import { HOME_LIMITS } from '@/lib/limits';

/**
 * What the office can change without a developer.
 *
 * Updates and events are posted, corrected and removed here; photographs are
 * uploaded to the gallery and deleted from it; the contact details fill the
 * blanks the public page currently omits. Everything else — the projects, the
 * adinkra, the biography — stays in the repository, because that is the record
 * rather than the noticeboard and it should go through review.
 *
 * Correcting is done in the same panel that posts, loaded with what is already
 * there. Two forms would be two places to add a field to and one place to
 * forget, and the office would lose the photograph picker and the writing
 * assistant on whichever copy was written second.
 */

type Tab = 'updates' | 'statements' | 'events' | 'gallery' | 'contact';

const TABS: { id: Tab; label: string }[] = [
  { id: 'updates', label: 'Updates' },
  { id: 'statements', label: 'Statements' },
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
/* Correcting is the ordinary act and removing is the grave one, so Edit reads
   as the calmer of the two and only Delete turns red under the pointer. */
const subtle =
  'rounded-lg border border-white/15 px-100 py-50 text-xs font-semibold text-ivory/70 transition-colors hover:border-gold hover:text-gold';

/**
 * What the home page will not have room for.
 *
 * Nothing is deleted when a list outgrows its section — the entries stay here
 * and stay in the store — but there is no archive page for them to fall back
 * to, so they simply stop being public. Saying which ones, by name, is the
 * least the admin owes the person who posted them.
 */
function Overflow({ shown, total, what }: { shown: number; total: number; what: string }) {
  if (total <= shown) return null;
  return (
    <p className="mt-200 rounded-xl border border-gold/30 bg-gold/5 p-200 text-sm leading-relaxed text-gold">
      The home page has room for {shown} {what}. The {total - shown} marked
      below are kept here but are not on the public site. Delete one of the {shown}
      {' '}above them to bring another through.
    </p>
  );
}

export function ContentManager({ initial, configured }: { initial: SiteContent; configured: boolean }) {
  const [tab, setTab] = useState<Tab>('updates');
  const [content, setContent] = useState<SiteContent>(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* Forms */
  const [update, setUpdate] = useState<{ title: string; date: string; body: string; image?: string; alt?: string }>(
    { title: '', date: '', body: '' },
  );
  const [event, setEvent] = useState<{ title: string; date: string; time: string; place: string; body: string; imageUrl?: string; imageAlt?: string }>(
    { title: '', date: '', time: '', place: '', body: '' },
  );
  /* A statement's date is optional here as it is everywhere else: his
     standing words were not said on a day anyone recorded. */
  const [statement, setStatement] = useState<{
    title: string;
    date: string;
    occasion: string;
    body: string;
    pullQuote: string;
    imageUrl?: string;
    imageAlt?: string;
  }>({ title: '', date: '', occasion: '', body: '', pullQuote: '' });
  const [alt, setAlt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [contact, setContact] = useState(initial.contact);

  /* Which record the panel above is currently correcting, if any. */
  const [editingUpdate, setEditingUpdate] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [editingStatement, setEditingStatement] = useState<string | null>(null);
  const updateForm = useRef<HTMLElement>(null);
  const eventForm = useRef<HTMLElement>(null);
  const statementForm = useRef<HTMLElement>(null);

  useEffect(() => setContact(initial.contact), [initial.contact]);

  /* The public calendar shows only what is still ahead, soonest first, so a
     past event is not competing for one of the four places. */
  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = [...content.events]
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

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
            : /* The route says `title_and_valid_date_required`; this read
                 `title_and_date_required` and so showed the generic line for
                 the one failure the office can actually put right. */
              data.error === 'title_and_valid_date_required'
              ? 'A title and a valid date are both needed.'
              : data.error === 'not_found'
                ? 'That entry is no longer here. Someone may have removed it.'
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

  /* The blank each form goes back to, whether a save finished or the office
     changed its mind. */
  const BLANK_UPDATE = { title: '', date: '', body: '' };
  const BLANK_EVENT = { title: '', date: '', time: '', place: '', body: '' };
  const BLANK_STATEMENT = {
    title: '',
    date: '',
    occasion: '',
    body: '',
    pullQuote: '',
  };

  function resetForms() {
    setEditingUpdate(null);
    setEditingEvent(null);
    setEditingStatement(null);
    setUpdate(BLANK_UPDATE);
    setEvent(BLANK_EVENT);
    setStatement(BLANK_STATEMENT);
  }

  /**
   * Bring a record up into the panel that posts.
   *
   * The panel is above the list on a narrow screen and beside it on a wide
   * one, so an Edit pressed halfway down a long list can load a form nobody
   * can see. Scrolling to it is what makes the button mean something on a
   * phone; the focus is what makes it mean something to a keyboard.
   */
  function scrollToForm(ref: React.RefObject<HTMLElement | null>) {
    const el = ref.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.querySelector('input')?.focus({ preventScroll: true });
  }

  /* A photograph taken off leaves the field undefined, and an undefined field
     does not survive JSON.stringify — the key simply vanishes, and the route,
     which patches only what it is sent, would keep the old picture. Empty
     strings are what say "cleared" on the way out. */
  async function saveUpdate() {
    const ok = editingUpdate
      ? await send(
          {
            action: 'set-update',
            id: editingUpdate,
            update: { ...update, image: update.image ?? '', alt: update.alt ?? '' },
          },
          'Update corrected.',
        )
      : await send({ action: 'add-update', update }, 'Update posted.');
    if (ok) resetForms();
  }

  async function saveEvent() {
    const ok = editingEvent
      ? await send(
          {
            action: 'set-event',
            id: editingEvent,
            event: { ...event, imageUrl: event.imageUrl ?? '', imageAlt: event.imageAlt ?? '' },
          },
          'Event corrected.',
        )
      : await send({ action: 'add-event', event }, 'Event added.');
    if (ok) resetForms();
  }

  async function saveStatement() {
    const ok = editingStatement
      ? await send(
          {
            action: 'set-statement',
            id: editingStatement,
            statement: {
              ...statement,
              imageUrl: statement.imageUrl ?? '',
              imageAlt: statement.imageAlt ?? '',
            },
          },
          'Statement corrected.',
        )
      : await send({ action: 'add-statement', statement }, 'Statement posted.');
    if (ok) resetForms();
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    setNote(null);
    setError(null);
    try {
      const { file: toSend, before, after, resized } = await resizeImage(file);
      const form = new FormData();
      form.append('file', toSend);
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
      setNote(
        resized
          ? `Photograph added, resized from ${formatBytes(before)} to ${formatBytes(after)}.`
          : 'Photograph added.',
      );
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
            /* A correction left half-typed on a tab nobody is looking at is a
               correction the office thinks it made. */
            onClick={() => { setTab(t.id); setNote(null); setError(null); resetForms(); }}
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
          <section
            ref={updateForm}
            className={[
              'rounded-2xl border bg-ebony-raised p-300 scroll-mt-300',
              editingUpdate ? 'border-gold/40' : 'border-white/10',
            ].join(' ')}
          >
            <h2 className="text-2xl font-700 tracking-tight text-ivory">
              {editingUpdate ? 'Correct the update' : 'Post an update'}
            </h2>
            <p className="mt-100 text-sm leading-relaxed text-ivory/60">
              {editingUpdate
                ? 'The entry keeps its place in the record; only what you change here changes on the site.'
                : 'Dated entries appear on the home page, newest first. This is what turns the site into a record that accumulates.'}
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
              <div>
                <label className={label}>Photograph</label>
                <AttachPhoto
                  value={update.image}
                  alt={update.alt}
                  onChange={(image, alt) => setUpdate((u) => ({ ...u, image, alt }))}
                />
              </div>
              <div className="flex flex-wrap items-center gap-200">
                <button
                  type="button"
                  className={primary}
                  disabled={busy || !update.title || !update.date}
                  onClick={saveUpdate}
                >
                  {busy ? 'Saving…' : editingUpdate ? 'Save the correction' : 'Post the update'}
                </button>
                {editingUpdate && (
                  <button
                    type="button"
                    className="text-sm font-semibold text-ivory/55 transition-colors hover:text-ivory"
                    onClick={resetForms}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-700 tracking-tight text-ivory">
              Published <span className="text-ivory/40">({content.updates.length})</span>
            </h2>
            <Overflow shown={HOME_LIMITS.updates} total={content.updates.length} what="updates" />
            {content.updates.length === 0 ? (
              <p className="mt-200 text-sm text-ivory/55">
                Nothing posted yet, so the updates section does not appear on the site at all.
              </p>
            ) : (
              <ul className="mt-200 grid gap-200">
                {[...content.updates]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((u, i) => (
                  <li
                    key={u.id}
                    className={[
                      'rounded-2xl border bg-ebony-raised p-300',
                      editingUpdate === u.id
                        ? 'border-gold/60'
                        : i < HOME_LIMITS.updates
                          ? 'border-white/10'
                          : 'border-dashed border-gold/30 opacity-70',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-200">
                      <div className="flex gap-200">
                        {u.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.image} alt={u.alt ?? ''} className="h-[70px] w-[70px] shrink-0 rounded-lg object-cover" />
                        )}
                      <div>
                        <time dateTime={u.date} className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                          {formatDate(u.date)}
                        </time>
                        <h3 className="mt-75 text-xl font-600 tracking-tight text-ivory">{u.title}</h3>
                        {u.body && <p className="mt-100 text-sm leading-relaxed text-ivory/65">{u.body}</p>}
                      </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-75">
                        {editingUpdate === u.id ? (
                          <span className="rounded-lg border border-gold/40 px-100 py-50 text-xs font-semibold text-gold">
                            Being corrected
                          </span>
                        ) : (
                          <button
                            type="button"
                            className={subtle}
                            disabled={busy}
                            onClick={() => {
                              setEditingEvent(null);
                              setEditingUpdate(u.id);
                              setUpdate({
                                title: u.title,
                                date: u.date,
                                body: u.body ?? '',
                                image: u.image,
                                alt: u.alt,
                              });
                              setNote(null);
                              setError(null);
                              scrollToForm(updateForm);
                            }}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          className={quiet}
                          disabled={busy}
                          onClick={async () => {
                            /* Removing the entry loaded into the panel above
                               would leave it correcting a record that is no
                               longer there, and the save would come back "no
                               longer here" with the text still in it. */
                            if (editingUpdate === u.id) resetForms();
                            await send({ action: 'delete-update', id: u.id }, 'Update removed.');
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}


      {/* ---------------- statements ---------------- */}
      {tab === 'statements' && (
        <div className="mt-400 grid gap-400 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
          <section
            ref={statementForm}
            className={[
              'rounded-2xl border bg-ebony-raised p-300 scroll-mt-300',
              editingStatement ? 'border-gold/40' : 'border-white/10',
            ].join(' ')}
          >
            <h2 className="text-2xl font-700 tracking-tight text-ivory">
              {editingStatement ? 'Correct the statement' : 'Post a statement'}
            </h2>
            <p className="mt-100 text-sm leading-relaxed text-ivory/60">
              {editingStatement
                ? 'The entry keeps its place in the record; only what you change here changes on the site.'
                : 'What the chief has said, on the record. Post his words, not a summary of them.'}
            </p>
            <div className="mt-300 grid gap-200">
              <div>
                <label className={label} htmlFor="s-title">Title</label>
                <input id="s-title" className={`${input} mt-75`} value={statement.title} maxLength={160}
                  onChange={(e) => setStatement({ ...statement, title: e.target.value })}
                  placeholder="Address to the traditional council" />
              </div>
              <div>
                <label className={label} htmlFor="s-occasion">Occasion</label>
                <input id="s-occasion" className={`${input} mt-75`} value={statement.occasion} maxLength={160}
                  onChange={(e) => setStatement({ ...statement, occasion: e.target.value })}
                  placeholder="Enstoolment durbar, Adrobaa" />
              </div>
              <div>
                <label className={label} htmlFor="s-date">Date</label>
                <input id="s-date" type="date" className={`${input} mt-75`} value={statement.date}
                  onChange={(e) => setStatement({ ...statement, date: e.target.value })} />
                {/* The one dated record on this site that may be left blank,
                    and the reason is worth keeping: a standing line of his was
                    not said on a day anybody wrote down, and putting a date on
                    it would be inventing one. */}
                <p className="mt-75 text-xs leading-relaxed text-ivory/50">
                  Leave this empty for standing words rather than a speech given
                  on a day. Undated statements print last and stay off the
                  calendar.
                </p>
              </div>
              <div>
                <label className={label} htmlFor="s-quote">The line to set large</label>
                <input id="s-quote" className={`${input} mt-75`} value={statement.pullQuote} maxLength={300}
                  onChange={(e) => setStatement({ ...statement, pullQuote: e.target.value })}
                  placeholder="Development for the People, By the People." />
              </div>
              <div>
                <label className={label} htmlFor="s-body">What was said</label>
                <textarea id="s-body" rows={6} className={`${input} mt-75 resize-y`} value={statement.body} maxLength={4000}
                  onChange={(e) => setStatement({ ...statement, body: e.target.value })}
                  placeholder="The passage, or the whole of it." />
                <WritingAssistant
                  kind="update"
                  context={[
                    statement.title && `Title: ${statement.title}`,
                    statement.occasion && `Occasion: ${statement.occasion}`,
                    statement.date && `Date: ${statement.date}`,
                  ]
                    .filter(Boolean)
                    .join('\n')}
                  placeholder="what he said at the durbar about youth training and the boreholes"
                  onDraft={(text) => setStatement((st) => ({ ...st, body: text }))}
                />
              </div>
              <div>
                <label className={label}>Photograph</label>
                <AttachPhoto
                  value={statement.imageUrl}
                  alt={statement.imageAlt}
                  onChange={(imageUrl, imageAlt) =>
                    setStatement((st) => ({ ...st, imageUrl, imageAlt }))
                  }
                />
              </div>
              <div className="flex flex-wrap items-center gap-200">
                <button
                  type="button"
                  className={primary}
                  disabled={busy || !statement.title || !statement.body}
                  onClick={saveStatement}
                >
                  {busy ? 'Saving…' : editingStatement ? 'Save the correction' : 'Post the statement'}
                </button>
                {editingStatement && (
                  <button
                    type="button"
                    className="text-sm font-semibold text-ivory/55 transition-colors hover:text-ivory"
                    onClick={resetForms}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-700 tracking-tight text-ivory">
              Published <span className="text-ivory/40">({content.statements.length})</span>
            </h2>
            <Overflow shown={HOME_LIMITS.statements} total={content.statements.length} what="statements" />
            {content.statements.length === 0 ? (
              <p className="mt-200 text-sm text-ivory/55">
                Nothing posted. The section still carries his vision statement,
                which is compiled into the site rather than stored here.
              </p>
            ) : (
              <ul className="mt-200 grid gap-200">
                {[...content.statements]
                  .sort((a, b) => {
                    if (!a.date && !b.date) return 0;
                    if (!a.date) return 1;
                    if (!b.date) return -1;
                    return b.date.localeCompare(a.date);
                  })
                  .map((st, i) => (
                    <li
                      key={st.id}
                      className={[
                        'rounded-2xl border bg-ebony-raised p-300',
                        editingStatement === st.id
                          ? 'border-gold/60'
                          : i < HOME_LIMITS.statements
                            ? 'border-white/10'
                            : 'border-dashed border-gold/30 opacity-70',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-200">
                        <div className="flex gap-200">
                          {st.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={st.imageUrl} alt={st.imageAlt ?? ''} className="h-[70px] w-[70px] shrink-0 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                              {st.occasion}
                              {st.occasion && st.date ? ' · ' : ''}
                              {st.date ? formatDate(st.date) : ''}
                            </p>
                            <h3 className="mt-75 text-xl font-600 tracking-tight text-ivory">{st.title}</h3>
                            {st.pullQuote && (
                              <p className="mt-100 text-lg font-600 text-ivory/80">{st.pullQuote}</p>
                            )}
                            <p className="mt-100 text-sm leading-relaxed text-ivory/65">{st.body}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-75">
                          {editingStatement === st.id ? (
                            <span className="rounded-lg border border-gold/40 px-100 py-50 text-xs font-semibold text-gold">
                              Being corrected
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={subtle}
                              disabled={busy}
                              onClick={() => {
                                setEditingUpdate(null);
                                setEditingEvent(null);
                                setEditingStatement(st.id);
                                setStatement({
                                  title: st.title,
                                  date: st.date ?? '',
                                  occasion: st.occasion ?? '',
                                  body: st.body,
                                  pullQuote: st.pullQuote ?? '',
                                  imageUrl: st.imageUrl,
                                  imageAlt: st.imageAlt,
                                });
                                setNote(null);
                                setError(null);
                                scrollToForm(statementForm);
                              }}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            type="button"
                            className={quiet}
                            disabled={busy}
                            onClick={() => {
                              if (!confirm(`Delete "${st.title}"? This cannot be undone.`)) return;
                              void send({ action: 'delete-statement', id: st.id }, 'Statement deleted.');
                              if (editingStatement === st.id) resetForms();
                            }}
                          >
                            Delete
                          </button>
                        </div>
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
          <section
            ref={eventForm}
            className={[
              'rounded-2xl border bg-ebony-raised p-300 scroll-mt-300',
              editingEvent ? 'border-gold/40' : 'border-white/10',
            ].join(' ')}
          >
            <h2 className="text-2xl font-700 tracking-tight text-ivory">
              {editingEvent ? 'Change the event' : 'Add an event'}
            </h2>
            <p className="mt-100 text-sm leading-relaxed text-ivory/60">
              {editingEvent
                ? 'A date moved here moves the record itself, so anything answered with this event still points at it.'
                : 'Durbars, festivals, commissionings and appearances. They appear on the site in date order and drop off once the day has passed.'}
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
              <div>
                <label className={label}>Photograph</label>
                <AttachPhoto
                  value={event.imageUrl}
                  alt={event.imageAlt}
                  onChange={(imageUrl, imageAlt) => setEvent((ev) => ({ ...ev, imageUrl, imageAlt }))}
                />
              </div>
              <div className="flex flex-wrap items-center gap-200">
                <button
                  type="button"
                  className={primary}
                  disabled={busy || !event.title || !event.date}
                  onClick={saveEvent}
                >
                  {busy ? 'Saving…' : editingEvent ? 'Save the change' : 'Add the event'}
                </button>
                {editingEvent && (
                  <button
                    type="button"
                    className="text-sm font-semibold text-ivory/55 transition-colors hover:text-ivory"
                    onClick={resetForms}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-700 tracking-tight text-ivory">
              In the calendar <span className="text-ivory/40">({content.events.length})</span>
            </h2>
            <Overflow shown={HOME_LIMITS.events} total={upcomingEvents.length} what="events ahead" />
            {content.events.length === 0 ? (
              <p className="mt-200 text-sm text-ivory/55">
                No events yet, so the calendar section does not appear on the site.
              </p>
            ) : (
              <ul className="mt-200 grid gap-200">
                {content.events.map((ev) => {
                  const past = ev.date < today;
                  /* Beyond the fourth event still ahead: kept, but off the
                     public calendar until one before it passes or is removed. */
                  const beyond =
                    !past &&
                    upcomingEvents.findIndex((e) => e.id === ev.id) >= HOME_LIMITS.events;
                  return (
                    <li
                      key={ev.id}
                      className={[
                        'rounded-2xl border bg-ebony-raised p-300',
                        editingEvent === ev.id
                          ? 'border-gold/60'
                          : beyond
                            ? 'border-dashed border-gold/30 opacity-70'
                            : 'border-white/10',
                      ].join(' ')}
                    >
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
                          <h3 className="mt-75 text-xl font-600 tracking-tight text-ivory">{ev.title}</h3>
                          <p className="mt-50 text-sm text-ivory/60">
                            {[ev.time, ev.place].filter(Boolean).join(' · ')}
                          </p>
                          {ev.body && <p className="mt-100 text-sm leading-relaxed text-ivory/65">{ev.body}</p>}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-75">
                          {editingEvent === ev.id ? (
                            <span className="rounded-lg border border-gold/40 px-100 py-50 text-xs font-semibold text-gold">
                              Being changed
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={subtle}
                              disabled={busy}
                              onClick={() => {
                                setEditingUpdate(null);
                                setEditingEvent(ev.id);
                                setEvent({
                                  title: ev.title,
                                  date: ev.date,
                                  time: ev.time ?? '',
                                  place: ev.place ?? '',
                                  body: ev.body ?? '',
                                  imageUrl: ev.imageUrl,
                                  imageAlt: ev.imageAlt,
                                });
                                setNote(null);
                                setError(null);
                                scrollToForm(eventForm);
                              }}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            type="button"
                            className={quiet}
                            disabled={busy}
                            onClick={async () => {
                              if (editingEvent === ev.id) resetForms();
                              await send({ action: 'delete-event', id: ev.id }, 'Event removed.');
                            }}
                          >
                            Delete
                          </button>
                        </div>
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
            <h2 className="text-2xl font-700 tracking-tight text-ivory">Add a photograph</h2>
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

          <h2 className="mt-500 text-2xl font-700 tracking-tight text-ivory">
            In the gallery <span className="text-ivory/40">({content.gallery.length})</span>
          </h2>
          <Overflow shown={HOME_LIMITS.gallery} total={content.gallery.length} what="photographs" />
          <ul className="mt-200 grid grid-cols-2 gap-200 md:grid-cols-3 xl:grid-cols-4">
            {content.gallery.map((g, i) => (
              <li
                key={g.id}
                className={[
                  'overflow-hidden rounded-2xl border bg-ebony-raised',
                  i < HOME_LIMITS.gallery ? 'border-white/10' : 'border-dashed border-gold/30 opacity-70',
                ].join(' ')}
              >
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
            <h2 className="text-2xl font-700 tracking-tight text-ivory">Contact details</h2>
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
