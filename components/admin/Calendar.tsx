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

export function Calendar({ content }: { content: SiteContent }) {
  const today = todayISO();
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

  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const open = pinned ?? hovered;

  /* A new day means a new measurement. */
  useLayoutEffect(() => {
    setFlip('auto');
    setMaxH(null);
    setOffsetX(0);
  }, [open]);

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
  }, [open, flip]);

  /* Escape closes a pinned card wherever the focus happens to be. */
  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPinned(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinned]);

  function step(by: number) {
    setCursor((c) => {
      const d = new Date(Date.UTC(c.year, c.month + by, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
    setPinned(null);
    setHovered(null);
  }

  function goToday() {
    setCursor({
      year: Number(today.slice(0, 4)),
      month: Number(today.slice(5, 7)) - 1,
    });
    setPinned(today);
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

  const openEntries = open ? (byDay.get(open) ?? []) : [];

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
                {entries.length > 0 ? (
                  <button
                    type="button"
                    onMouseEnter={() => setHovered(cell.iso)}
                    onFocus={() => setHovered(cell.iso)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setPinned((p) => (p === cell.iso ? null : cell.iso))}
                    aria-expanded={isOpen}
                    aria-label={`${longDate(cell.iso)}, ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
                    className={[
                      'flex h-full w-full flex-col items-start gap-50 rounded-lg text-left transition-colors',
                      isOpen ? 'bg-white/10' : 'hover:bg-white/5',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                        isToday ? 'bg-gold text-ebony' : 'text-ivory/80',
                      ].join(' ')}
                    >
                      {cell.day}
                    </span>
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
                  </button>
                ) : (
                  <span
                    className={[
                      'flex h-[22px] w-[22px] items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                      isToday ? 'bg-gold text-ebony' : 'text-ivory/35',
                    ].join(' ')}
                  >
                    {cell.day}
                  </span>
                )}

                {isOpen && entries.length > 0 && (
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
                    <div className="mt-100 grid gap-75">
                      {entries.map((e) => (
                        <EntryCard key={e.id} entry={e} compact />
                      ))}
                    </div>
                    {pinned === cell.iso && (
                      <div className="mt-100 flex items-center justify-between gap-100">
                        <Link
                          href={entries[0].href}
                          className="text-[11px] font-semibold text-gold underline underline-offset-2"
                        >
                          Open the record
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPinned(null)}
                          className="text-[11px] font-semibold text-ivory/50 hover:text-ivory"
                        >
                          Close
                        </button>
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
        Hover a day to see what is on it, or tap it to keep the card open.
        Everything here is added on{' '}
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
