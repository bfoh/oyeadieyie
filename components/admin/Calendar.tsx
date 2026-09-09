'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  KIND_LABEL,
  KIND_NOTE,
  WEEKDAYS,
  entriesByDay,
  longDate,
  monthGrid,
  monthLabel,
  todayISO,
  type CalendarEntry,
  type EntryKind,
} from '@/lib/calendar';
import type { SiteContent } from '@/lib/store';

/**
 * The chief's engagements and activities, on one grid.
 *
 * Hovering a day shows what is on it. Hover alone would be no use to half the
 * people who open this — an aide on a phone has no pointer to hover with, and
 * a keyboard user has no way to reach a tooltip that only answers the mouse —
 * so the same card opens on focus and on tap, and Escape closes it. The day
 * under the pointer and the day pinned by a click are tracked separately, so
 * moving the mouse away does not snatch away a card someone deliberately
 * opened.
 *
 * Engagements are also written from here: added on a day, edited in place, and
 * removed behind a confirmation. Everything else on the grid is read-only, and
 * deliberately so — an update is the record of something that already happened
 * and a request belongs to whoever sent it, so both are changed on their own
 * screen rather than from a card that opens on hover.
 *
 * Requests are drawn differently from engagements, and said so in the legend.
 * A date somebody has asked for is not a date the chief has agreed to, and a
 * calendar that blurred the two would produce exactly the double-booking the
 * office is trying to avoid.
 */

const KIND_STYLE: Record<EntryKind, { chip: string; dot: string; card: string }> = {
  event: {
    chip: 'bg-gold/15 text-gold border-gold/40',
    dot: 'bg-gold',
    card: 'border-gold/40',
  },
  update: {
    chip: 'bg-white/5 text-ivory/75 border-white/20',
    dot: 'bg-ivory/60',
    card: 'border-white/20',
  },
  request: {
    /* Dashed, everywhere it appears: nothing here is promised. */
    chip: 'border-dashed bg-transparent text-ivory/60 border-ivory/35',
    dot: 'bg-transparent ring-1 ring-ivory/50',
    card: 'border-dashed border-ivory/35',
  },
};

/**
 * One entry.
 *
 * `compact` is the version that goes inside the hover card, where three
 * entries at full size made a panel tall enough to be flipped above the grid
 * and sit on top of the legend. Smaller here, roomier in the list below.
 */
function EntryCard({ entry, compact }: { entry: CalendarEntry; compact?: boolean }) {
  const s = KIND_STYLE[entry.kind];
  return (
    <div className={`rounded-xl border bg-ebony ${compact ? 'p-100' : 'p-200'} ${s.card}`}>
      <div className="flex flex-wrap items-center gap-100">
        <span className={`rounded-full border px-100 py-25 text-[11px] font-semibold ${s.chip}`}>
          {KIND_LABEL[entry.kind]}
        </span>
        {entry.time && <span className="text-[11px] text-ivory/50">{entry.time}</span>}
        {entry.status && (
          <span className="text-[11px] text-ivory/40">{entry.status}</span>
        )}
      </div>
      <p
        className={[
          'mt-75 font-display font-600 leading-snug text-ivory',
          compact ? 'text-base' : 'text-lg',
        ].join(' ')}
      >
        {entry.title}
      </p>
      {entry.place && <p className="mt-25 text-xs text-gold/80">{entry.place}</p>}
      {entry.detail && (
        <p
          className={[
            'mt-75 text-xs leading-relaxed text-ivory/60',
            compact ? 'line-clamp-2' : 'line-clamp-4',
          ].join(' ')}
        >
          {entry.detail}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   The engagement form
--------------------------------------------------------------- */

export type Draft = {
  title: string;
  /* YYYY-MM-DD. Carried in the draft rather than taken from the day, so an
     engagement that moves can be moved by editing it instead of being deleted
     and typed in again. */
  date: string;
  time: string;
  place: string;
  body: string;
};

export const BLANK_DRAFT: Draft = { title: '', date: '', time: '', place: '', body: '' };

/* py-100 rather than py-75: at the smaller padding these were 34px tall,
   and Cancel was 17px — fine with a mouse, not with a thumb. */
const FORM_INPUT =
  'w-full rounded-lg border border-white/10 bg-ebony px-100 py-100 text-xs text-ivory placeholder:text-ivory/25 focus:border-gold focus:outline-none';

/**
 * One form for both jobs.
 *
 * Adding and editing an engagement are the same five fields, and keeping two
 * copies of them is how the two drift apart — a field added to one and not the
 * other, a limit raised in one place. The only difference is the date: when
 * adding, the day is the cell that was clicked, so the field would be asking a
 * question already answered; when editing, it is the field most likely to be
 * the reason the form was opened at all.
 */
function EngagementForm({
  idPrefix,
  mode,
  draft,
  onChange,
  onSubmit,
  onCancel,
  saving,
  error,
  titleRef,
  className,
}: {
  idPrefix: string;
  mode: 'add' | 'edit';
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
  titleRef: React.RefObject<HTMLInputElement | null>;
  className?: string;
}) {
  const editing = mode === 'edit';
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={className}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory/50">
        {editing ? 'Edit engagement' : 'New engagement'}
      </p>

      <label className="sr-only" htmlFor={`t-${idPrefix}`}>
        What it is
      </label>
      <input
        id={`t-${idPrefix}`}
        ref={titleRef}
        autoFocus
        value={draft.title}
        maxLength={120}
        placeholder="Durbar of Chiefs"
        onChange={(e) => onChange({ title: e.target.value })}
        className={FORM_INPUT + ' mt-75'}
      />

      <div className="mt-75 grid grid-cols-2 gap-75">
        {editing && (
          <div>
            <label className="sr-only" htmlFor={`dt-${idPrefix}`}>Date</label>
            <input
              id={`dt-${idPrefix}`}
              type="date"
              value={draft.date}
              onChange={(e) => onChange({ date: e.target.value })}
              className={FORM_INPUT}
            />
          </div>
        )}
        <div>
          <label className="sr-only" htmlFor={`tm-${idPrefix}`}>Time</label>
          <input
            id={`tm-${idPrefix}`}
            value={draft.time}
            maxLength={40}
            placeholder="10:00"
            onChange={(e) => onChange({ time: e.target.value })}
            className={FORM_INPUT}
          />
        </div>
        <div className={editing ? 'col-span-2' : ''}>
          <label className="sr-only" htmlFor={`pl-${idPrefix}`}>Place</label>
          <input
            id={`pl-${idPrefix}`}
            value={draft.place}
            maxLength={120}
            placeholder="Palace grounds"
            onChange={(e) => onChange({ place: e.target.value })}
            className={FORM_INPUT}
          />
        </div>
      </div>

      <label className="sr-only" htmlFor={`bd-${idPrefix}`}>Detail</label>
      <textarea
        id={`bd-${idPrefix}`}
        rows={2}
        value={draft.body}
        maxLength={1200}
        placeholder="A sentence for the public calendar."
        onChange={(e) => onChange({ body: e.target.value })}
        className={FORM_INPUT + ' mt-75 resize-y'}
      />

      {error && (
        <p role="alert" className="mt-75 text-[11px] text-crimson">
          {error}
        </p>
      )}

      {/* Said plainly, because it is: this is the same list the public
          calendar prints. */}
      <p className="mt-75 text-[10px] leading-relaxed text-ivory/40">
        {editing
          ? 'The change reaches the public calendar within about half a minute.'
          : 'Goes on the public calendar within about half a minute.'}
      </p>

      <div className="mt-100 flex items-center gap-75">
        <button
          type="submit"
          disabled={saving || !draft.title.trim()}
          className="rounded-lg bg-gold px-200 py-100 text-[11px] font-semibold text-ebony transition-all hover:bg-[#e6c34d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : editing ? 'Save it' : 'Add it'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-100 py-100 text-[11px] font-semibold text-ivory/50 hover:text-ivory"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function Calendar({
  initial,
  configured,
}: {
  initial: SiteContent;
  configured: boolean;
}) {
  const today = todayISO();
  /* The calendar writes now, so it holds the document rather than reading a
     snapshot: adding an engagement has to put it on the grid at once, without
     a reload the office would not know to do. */
  const [content, setContent] = useState(initial);
  const byDay = useMemo(() => entriesByDay(content), [content]);

  /* One piece of state, not two. Held together because the month arrows move
     both — with separate states, each click read the year and month captured
     in its own closure, so two clicks in the same tick both computed from the
     same starting month and the calendar moved one month instead of two. */
  const [cursor, setCursor] = useState(() => ({
    year: Number(today.slice(0, 4)),
    month: Number(today.slice(5, 7)) - 1,
  }));
  const { year, month } = cursor;
  /* Two separate states on purpose — see the note above the component. */
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  /* Which way the detail card opens. The row it sits in is a good first
     guess, but a day carrying several entries makes a tall card, and a guess
     that is wrong leaves half of it off the screen — so the card is measured
     once it is up and flipped if it does not fit. */
  const [flip, setFlip] = useState<'auto' | 'up' | 'down'>('auto');
  /* How tall the card may be in the direction it ended up opening, and how
     far it must slide sideways to stay on the screen. */
  const [maxH, setMaxH] = useState<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);

  /* The day whose "add an engagement" form is open, the engagement being
     edited, the one waiting on a confirmed delete, and what is in the form. */
  const [adding, setAdding] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK_DRAFT);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const open = pinned ?? hovered;

  /* A new day, or the form opening, means a new measurement: the card is a
     different height either way, and a placement worked out for the old one
     leaves the new one hanging off the screen. */
  /* Editing and the delete confirmation change the card's height as surely as
     the add form does, so all three are measured again. */
  const shape = `${adding}|${editing}|${confirming}`;
  useLayoutEffect(() => {
    setFlip('auto');
    setMaxH(null);
    setOffsetX(0);
  }, [open, shape]);

  /**
   * Place the card against the day it belongs to, measured rather than
   * guessed.
   *
   * Guessing from the row worked on a desktop and put the card 79px above the
   * top of the screen on a phone, where a 460px card has room in neither
   * direction. So both positions are computed from the cell's own rectangle,
   * the one that fits wins, and if neither fits the card takes the larger side
   * and is capped to the room actually there — a card that scrolls is a
   * nuisance, a card that is half off the screen is unusable.
   *
   * Sideways is the same story: a 268px card hanging off a 54px cell in the
   * middle of a phone screen ran 100px past the right edge, so it is slid back
   * by however much it overhangs.
   */
  useLayoutEffect(() => {
    if (!open || flip !== 'auto') return;
    const el = cardRef.current;
    const cell = el?.offsetParent as HTMLElement | null;
    if (!el || !cell) return;

    const c = cell.getBoundingClientRect();
    const h = el.offsetHeight;
    const w = el.offsetWidth;
    const gap = 4;
    const margin = 12;

    const below = window.innerHeight - margin - (c.bottom + gap);
    const above = c.top - gap - margin;

    if (h <= below) setFlip('down');
    else if (h <= above) setFlip('up');
    else {
      const up = above > below;
      setFlip(up ? 'up' : 'down');
      setMaxH(Math.max(180, Math.floor(up ? above : below)));
    }

    /* The card is laid out from the cell's left edge; work out how far it has
       to move to sit inside the page. */
    const viewport = document.documentElement.clientWidth;
    let dx = 0;
    if (c.left + w > viewport - margin) dx = viewport - margin - w - c.left;
    if (c.left + dx < margin) dx = margin - c.left;
    setOffsetX(Math.round(dx));
  }, [open, flip, shape]);

  /* Escape closes a pinned card wherever the focus happens to be — the form
     first, so a half-typed engagement is not thrown away by the same key that
     dismisses the card. */
  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      /* Back out one step at a time. The key that dismisses the card must not
         also throw away a half-typed engagement, or answer a delete nobody
         has confirmed. */
      if (adding || editing) closeForm();
      else if (confirming) setConfirming(null);
      else setPinned(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinned, adding, editing, confirming]);

  /* Everything the card can have half-open: the form, the edit, and an
     unanswered delete. Called wherever the card closes or moves to another
     day, so nothing is left waiting on a day nobody is looking at. */
  function closeForm() {
    setAdding(null);
    setEditing(null);
    setConfirming(null);
    setDraft(BLANK_DRAFT);
    setFormError(null);
  }

  function openForm(iso: string) {
    setPinned(iso);
    setAdding(iso);
    setEditing(null);
    setConfirming(null);
    setDraft({ ...BLANK_DRAFT, date: iso });
    setFormError(null);
  }

  function openEdit(entry: CalendarEntry) {
    setPinned(entry.date);
    setAdding(null);
    setEditing(entry.recordId);
    setConfirming(null);
    setDraft({
      title: entry.title,
      date: entry.date,
      time: entry.time ?? '',
      place: entry.place ?? '',
      body: entry.detail ?? '',
    });
    setFormError(null);
  }

  /**
   * The one place this screen writes.
   *
   * Returns the document the route wrote, so a caller can follow the record
   * it just changed; null means nothing was written and the message is
   * already on the form.
   */
  async function send(payload: Record<string, unknown>): Promise<SiteContent | null> {
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(
          data.error === 'store_not_connected'
            ? 'The content store is not connected to this deployment.'
            : data.error === 'title_and_valid_date_required'
              ? 'A title and a valid date are both needed.'
              : data.error === 'not_found'
                ? 'That engagement is no longer in the calendar.'
                : 'That did not save. Try again.',
        );
        return null;
      }
      if (data.content) setContent(data.content);
      return (data.content as SiteContent) ?? null;
    } catch {
      setFormError('Could not reach the server.');
      return null;
    } finally {
      setSaving(false);
    }
  }

  /** Add or edit, depending on which the form was opened for. */
  async function saveEngagement(iso: string) {
    const title = draft.title.trim();
    if (!title) {
      setFormError('An engagement needs a title.');
      titleRef.current?.focus();
      return;
    }
    const date = editing ? draft.date : iso;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFormError('That date will not do. Use the date field.');
      return;
    }
    const event = { title, date, time: draft.time, place: draft.place, body: draft.body };
    const written = await send(
      editing
        ? { action: 'set-event', id: editing, event }
        : { action: 'add-event', event },
    );
    if (!written) return;
    closeForm();
    /* Follow the record. An engagement moved to another day would otherwise
       vanish from the card the office is looking at, which reads as a delete. */
    setPinned(date);
    setCursor((c) => {
      const y = Number(date.slice(0, 4));
      const m = Number(date.slice(5, 7)) - 1;
      return c.year === y && c.month === m ? c : { year: y, month: m };
    });
  }

  async function removeEngagement(entry: CalendarEntry) {
    const written = await send({ action: 'delete-event', id: entry.recordId });
    if (!written) return;
    setConfirming(null);
    /* A day emptied by the delete has no card left to draw, and leaving it
       pinned would cost the office a click it cannot see the reason for:
       the next press on that cell would only be undoing a selection nothing
       on screen shows. */
    const left = entriesByDay(written).get(entry.date)?.length ?? 0;
    if (left === 0) setPinned(null);
  }

  function step(by: number) {
    setCursor((c) => {
      const d = new Date(Date.UTC(c.year, c.month + by, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
    setPinned(null);
    setHovered(null);
    closeForm();
  }

  function goToday() {
    setCursor({
      year: Number(today.slice(0, 4)),
      month: Number(today.slice(5, 7)) - 1,
    });
    setPinned(today);
    closeForm();
  }

  /* Counted over the month on screen, not over the whole store, so the figure
     answers the question the person is actually looking at. */
  const monthCounts = useMemo(() => {
    const out: Record<EntryKind, number> = { event: 0, update: 0, request: 0 };
    for (const cell of cells) {
      if (!cell.inMonth) continue;
      for (const e of byDay.get(cell.iso) ?? []) out[e.kind] += 1;
    }
    return out;
  }, [cells, byDay]);

  /* Everything still ahead, so the office has a list as well as a grid — a
     grid answers "what is on the 14th", a list answers "what is next". */
  /* Grouped by day, not one heading per entry: four engagements on the same
     Saturday printed that Saturday's date four times. */
  const ahead = useMemo(() => {
    const days: { date: string; entries: CalendarEntry[] }[] = [];
    for (const [day, list] of byDay) {
      if (day < today) continue;
      const entries = list.filter((e) => e.kind !== 'update');
      if (entries.length) days.push({ date: day, entries });
    }
    days.sort((a, b) => a.date.localeCompare(b.date));
    /* A handful of days, so the list stays a glance rather than a second
       calendar. */
    return days.slice(0, 5);
  }, [byDay, today]);

  const navBtn =
    'rounded-lg border border-white/15 px-200 py-75 text-sm font-semibold text-ivory/75 transition-colors hover:border-gold hover:text-gold';

  return (
    <>
      {/* ---- Month header ------------------------------------------ */}
      {/* One row at every width. At 390 the month label at its desktop size
          pushed "Today" onto a line of its own, where it read as something
          left behind rather than a control. */}
      <div className="flex items-center justify-between gap-100">
        <div className="flex min-w-0 items-center gap-75 sm:gap-100">
          <button type="button" onClick={() => step(-1)} className={navBtn} aria-label="Previous month">
            ←
          </button>
          <h2 className="min-w-[7.5rem] whitespace-nowrap text-center font-display text-xl font-600 text-ivory sm:min-w-[9.5rem] sm:text-3xl">
            {monthLabel(year, month)}
          </h2>
          <button type="button" onClick={() => step(1)} className={navBtn} aria-label="Next month">
            →
          </button>
        </div>
        <button
          type="button"
          onClick={goToday}
          className="shrink-0 rounded-lg border border-white/15 px-100 py-75 text-xs font-semibold text-ivory/75 transition-colors hover:border-gold hover:text-gold sm:px-200 sm:text-sm"
        >
          Today
        </button>
      </div>

      {/* ---- Legend ------------------------------------------------- */}
      <ul className="mt-300 grid gap-100 sm:grid-cols-3">
        {(['event', 'update', 'request'] as EntryKind[]).map((kind) => (
          <li
            key={kind}
            className="flex items-start gap-100 rounded-xl border border-white/10 bg-ebony-raised p-200"
          >
            <span className={`mt-50 h-[10px] w-[10px] shrink-0 rounded-full ${KIND_STYLE[kind].dot}`} />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ivory">
                {KIND_LABEL[kind]}
                <span className="ml-75 font-normal text-ivory/40">
                  {monthCounts[kind]} this month
                </span>
              </span>
              <span className="mt-25 block text-xs leading-relaxed text-ivory/50">
                {KIND_NOTE[kind]}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* ---- The grid ----------------------------------------------- */}
      <div
        ref={gridRef}
        /* No overflow-hidden here, however much the rounded corners want it:
           the detail card is absolutely positioned inside a cell and is meant
           to extend past the grid. Clipping the container clips the card. */
        className="mt-300 rounded-2xl border border-white/10 bg-ebony-raised"
        onMouseLeave={() => setHovered(null)}
      >
        <div className="grid grid-cols-7 border-b border-white/10">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="px-100 py-100 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-ivory/40 sm:text-xs"
            >
              {/* One letter is enough on a phone; the full name has nowhere
                  to go in a seventh of 350px. */}
              <span className="sm:hidden">{w[0]}</span>
              <span className="hidden sm:inline">{w}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const entries = byDay.get(cell.iso) ?? [];
            const isToday = cell.iso === today;
            const isOpen = open === cell.iso;
            /* A first guess at which way the card opens; the effect above
               corrects it against the real measurements once it is on screen. */
            const row = Math.floor(i / 7);
            const col = i % 7;
            const up = flip === 'auto' ? row >= 3 : flip === 'up';

            return (
              <div
                key={cell.iso}
                onMouseEnter={() => setHovered(entries.length ? cell.iso : null)}
                className={[
                  'relative min-h-[76px] border-b border-r border-white/5 p-75 sm:min-h-[104px] sm:p-100',
                  col === 6 ? 'border-r-0' : '',
                  row === 5 ? 'border-b-0' : '',
                  cell.inMonth ? '' : 'opacity-35',
                ].join(' ')}
              >
                {/* Every day is a control, not only the ones with something
                    on them: an empty day is where an engagement most often
                    needs to go, and it used to be the one thing on this page
                    that could not be clicked. */}
                <button
                  type="button"
                  onMouseEnter={() => entries.length && setHovered(cell.iso)}
                  onFocus={() => entries.length && setHovered(cell.iso)}
                  onBlur={() => setHovered(null)}
                  onClick={() => {
                    if (pinned === cell.iso) {
                      setPinned(null);
                      closeForm();
                    } else if (entries.length) {
                      setPinned(cell.iso);
                      closeForm();
                    } else {
                      /* Nothing to read on an empty day, so go straight to
                         the thing the click was for. */
                      openForm(cell.iso);
                    }
                  }}
                  aria-expanded={isOpen}
                  aria-label={
                    entries.length
                      ? `${longDate(cell.iso)}, ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`
                      : `${longDate(cell.iso)}, nothing in the calendar. Add an engagement`
                  }
                  className={[
                    'group flex h-full w-full flex-col items-start gap-50 rounded-lg text-left transition-colors',
                    isOpen ? 'bg-white/10' : 'hover:bg-white/5',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                      isToday
                        ? 'bg-gold text-ebony'
                        : entries.length
                          ? 'text-ivory/80'
                          : 'text-ivory/35',
                    ].join(' ')}
                  >
                    {cell.day}
                  </span>

                  {entries.length > 0 ? (
                    <>
                    {/* Titles where there is room, dots where there is not. */}
                    <span className="hidden w-full min-w-0 flex-col gap-25 sm:flex">
                      {entries.slice(0, 2).map((e) => (
                        <span
                          key={e.id}
                          className={`truncate rounded border px-50 py-25 text-[10px] font-medium ${KIND_STYLE[e.kind].chip}`}
                        >
                          {e.title}
                        </span>
                      ))}
                      {entries.length > 2 && (
                        <span className="text-[10px] text-ivory/40">
                          +{entries.length - 2} more
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-25 sm:hidden">
                      {entries.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={`h-[6px] w-[6px] rounded-full ${KIND_STYLE[e.kind].dot}`}
                        />
                      ))}
                      {entries.length > 3 && (
                        <span className="text-[9px] font-semibold leading-none text-ivory/45">
                          +{entries.length - 3}
                        </span>
                      )}
                    </span>
                    </>
                  ) : (
                    /* A quiet plus, shown on hover and whenever the day is
                       open, so the grid does not become a field of buttons
                       shouting to be pressed. */
                    <span
                      aria-hidden="true"
                      className={[
                        'mt-auto hidden text-lg leading-none text-ivory/30 transition-opacity sm:block',
                        isOpen ? 'opacity-100 text-gold' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                      ].join(' ')}
                    >
                      +
                    </span>
                  )}
                </button>

                {isOpen && (entries.length > 0 || adding === cell.iso) && (
                  <div
                    ref={cardRef}
                    style={{
                      left: offsetX,
                      ...(maxH ? { maxHeight: maxH } : null),
                    }}
                    role="dialog"
                    aria-label={longDate(cell.iso)}
                    /* The card belongs to the day, so keep it open while the
                       pointer is on the card itself. */
                    onMouseEnter={() => setHovered(cell.iso)}
                    className={[
                      /* A day can carry several entries; cap the card and let
                         it scroll rather than run off the bottom of the
                         screen where the rest cannot be read at all. */
                      'absolute z-20 max-h-[min(70vh,460px)] w-[268px] overflow-y-auto rounded-2xl border border-white/15 bg-ebony-raised p-200 shadow-[0_24px_60px_rgba(0,0,0,0.65)]',
                      up ? 'bottom-full mb-50' : 'top-full mt-50',
                    ].join(' ')}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                      {longDate(cell.iso)}
                    </p>
                    {entries.length > 0 && (
                      <div className="mt-100 grid gap-75">
                        {entries.map((e) =>
                          editing === e.recordId ? (
                            /* The engagement is replaced by its own fields,
                               in place, so it is plain which of several is
                               being changed. */
                            <EngagementForm
                              key={e.id}
                              idPrefix={`edit-${e.recordId}`}
                              mode="edit"
                              draft={draft}
                              onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
                              onSubmit={() => void saveEngagement(cell.iso)}
                              onCancel={closeForm}
                              saving={saving}
                              error={formError}
                              titleRef={titleRef}
                              className="rounded-xl border border-gold/40 bg-ebony p-100"
                            />
                          ) : (
                            <div key={e.id}>
                              <EntryCard entry={e} compact />
                              {/* Only engagements are edited here. An update
                                  is the record of something that happened and
                                  a request belongs to the person who sent it;
                                  both have their own screen, and both would
                                  be the wrong thing to change from a calendar
                                  card by mistake. */}
                              {e.kind === 'event' && configured && (
                                confirming === e.recordId ? (
                                  <div className="mt-50 rounded-lg border border-crimson/40 bg-crimson/5 p-100">
                                    <p className="text-[11px] leading-relaxed text-ivory/70">
                                      Remove this engagement? It goes from the
                                      public calendar too.
                                    </p>
                                    <div className="mt-75 flex items-center gap-75">
                                      <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => void removeEngagement(e)}
                                        className="rounded-lg border border-crimson/60 px-100 py-75 text-[11px] font-semibold text-crimson transition-colors hover:bg-crimson/10 disabled:opacity-50"
                                      >
                                        {saving ? 'Removing…' : 'Remove it'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirming(null)}
                                        className="rounded-lg px-100 py-75 text-[11px] font-semibold text-ivory/50 hover:text-ivory"
                                      >
                                        Keep it
                                      </button>
                                    </div>
                                    {formError && (
                                      <p role="alert" className="mt-75 text-[11px] text-crimson">
                                        {formError}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="mt-50 flex items-center gap-100 px-50">
                                    <button
                                      type="button"
                                      onClick={() => openEdit(e)}
                                      className="text-[11px] font-semibold text-gold underline underline-offset-2 hover:text-[#e6c34d]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        closeForm();
                                        setConfirming(e.recordId);
                                      }}
                                      className="text-[11px] font-semibold text-ivory/45 underline underline-offset-2 hover:text-crimson"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {pinned === cell.iso && adding === cell.iso && (
                      <EngagementForm
                        idPrefix={`add-${cell.iso}`}
                        mode="add"
                        draft={draft}
                        onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
                        onSubmit={() => void saveEngagement(cell.iso)}
                        onCancel={closeForm}
                        saving={saving}
                        error={formError}
                        titleRef={titleRef}
                        className={entries.length ? 'mt-200 border-t border-white/10 pt-200' : 'mt-100'}
                      />
                    )}

                    {pinned === cell.iso && adding !== cell.iso && !editing && (
                      <div className="mt-100 flex flex-wrap items-center justify-between gap-100">
                        {configured ? (
                          <button
                            type="button"
                            onClick={() => openForm(cell.iso)}
                            className="rounded-lg border border-gold/40 px-100 py-75 text-[11px] font-semibold text-gold transition-colors hover:bg-gold/10"
                          >
                            + Engagement
                          </button>
                        ) : (
                          <span className="text-[11px] text-ivory/40">
                            Store not connected
                          </span>
                        )}
                        <div className="flex items-center gap-100">
                          {entries.length > 0 && (
                            <Link
                              href={entries[0].href}
                              className="text-[11px] font-semibold text-gold underline underline-offset-2"
                            >
                              Open the record
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setPinned(null);
                              closeForm();
                            }}
                            className="rounded-lg px-100 py-75 text-[11px] font-semibold text-ivory/50 hover:text-ivory"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-200 text-xs leading-relaxed text-ivory/45">
        Hover a day to see what is on it, or tap it to keep the card open. Tap
        an empty day to put an engagement on it, and use Edit or Delete on an
        engagement to change or remove it — including moving it to another
        day. Updates and requests are kept on{' '}
        <Link href="/admin/content" className="text-gold underline underline-offset-2">
          Manage the site
        </Link>{' '}
        and{' '}
        <Link href="/admin/enquiries" className="text-gold underline underline-offset-2">
          Enquiries
        </Link>
        .
      </p>

      {/* ---- What is next ------------------------------------------- */}
      <section className="mt-600">
        <h2 className="font-display text-2xl font-600 text-ivory">Still ahead</h2>
        {ahead.length === 0 ? (
          <p className="mt-200 text-sm text-ivory/55">
            Nothing in the calendar from today onwards. Add an event on Manage
            the site and it appears here and on the public page.
          </p>
        ) : (
          <ul className="mt-200 grid gap-300 sm:grid-cols-2">
            {ahead.map((day) => (
              <li key={day.date} className="grid gap-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                  {longDate(day.date)}
                </p>
                {day.entries.map((e) => (
                  <EntryCard key={e.id} entry={e} />
                ))}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
