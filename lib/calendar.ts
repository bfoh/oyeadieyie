/**
 * The chief's year, gathered into one view.
 *
 * The office already holds three dated records, in three different places and
 * for three different reasons, and nothing ever showed them together:
 *
 *   - **events**    — engagements ahead, published on the public calendar
 *   - **updates**   — the dated record of work that has happened
 *   - **enquiries** — appearances the public has *asked* for, which are not
 *                     commitments and must never be drawn as though they were
 *
 * Seeing them on one grid is what makes the promise the site already prints —
 * that appearances are "confirmed against the traditional calendar" — into
 * something a person can actually check before replying to anyone.
 *
 * Everything here is pure and works in UTC. Dates in the store are bare
 * `YYYY-MM-DD` strings with no timezone, and building the grid in local time
 * shifts every one of them by a day for anyone west of Greenwich — which
 * includes Ghana for half the calculation and every diaspora reader for the
 * rest.
 */
import { parseISODate } from './content';
import type { Statement, Update } from './content';
import type { Enquiry, SiteContent, SiteEvent } from './store';

export type EntryKind = 'event' | 'update' | 'statement' | 'request';

export type CalendarEntry = {
  id: string;
  /* The id of the record itself, without the kind prefix — what a write to
     the store needs, where `id` is only unique across the three kinds. */
  recordId: string;
  kind: EntryKind;
  /* YYYY-MM-DD */
  date: string;
  title: string;
  /* The line under the title in the detail card. */
  detail?: string;
  time?: string;
  place?: string;
  /* Requests only: how the office has dealt with it so far. */
  status?: string;
  /* Where this record is edited. */
  href: string;
};

export const KIND_LABEL: Record<EntryKind, string> = {
  event: 'Engagement',
  update: 'Recorded',
  statement: 'Stated',
  request: 'Requested',
};

/** What each kind means, for the legend. Written for the office, not for me. */
export const KIND_NOTE: Record<EntryKind, string> = {
  event: 'In the calendar and published on the public site.',
  update: 'Work already done and posted as a dated update.',
  statement: 'Something said on the record on this day.',
  request: 'Someone has asked for this date. Nothing is promised.',
};

/* ---------------------------------------------------------------
   Gathering
--------------------------------------------------------------- */

function fromEvent(e: SiteEvent): CalendarEntry {
  return {
    id: `event-${e.id}`,
    recordId: e.id,
    kind: 'event',
    date: e.date,
    title: e.title,
    detail: e.body,
    time: e.time,
    place: e.place,
    href: '/admin/content',
  };
}

function fromUpdate(u: Update): CalendarEntry {
  return {
    id: `update-${u.id}`,
    recordId: u.id,
    kind: 'update',
    date: u.date,
    title: u.title,
    detail: u.body,
    href: '/admin/content',
  };
}

/**
 * A statement, but only a dated one.
 *
 * The office's standing words carry no date on purpose, and an entry with no
 * date is not a calendar entry. `entriesByDay` filters those out before this
 * ever runs, so the assertion below is safe.
 */
function fromStatement(st: Statement): CalendarEntry {
  return {
    id: `statement-${st.id}`,
    recordId: st.id,
    kind: 'statement',
    date: st.date!,
    title: st.title,
    detail: st.pullQuote ?? st.body,
    place: st.occasion,
    href: '/admin/content',
  };
}

function fromEnquiry(e: Enquiry): CalendarEntry {
  return {
    id: `request-${e.id}`,
    recordId: e.id,
    kind: 'request',
    date: e.requestedDate!,
    title: e.name,
    detail: e.detail,
    place: e.organisation,
    status: e.status,
    href: '/admin/enquiries',
  };
}

/**
 * Everything dated, keyed by day.
 *
 * A record whose date will not parse is dropped rather than placed on a day it
 * does not belong to — the same rule the public components follow, for the
 * same reason.
 */
export function entriesByDay(content: SiteContent): Map<string, CalendarEntry[]> {
  const all: CalendarEntry[] = [
    ...content.events.map(fromEvent),
    ...content.updates.map(fromUpdate),
    ...content.statements.filter((st) => st.date).map(fromStatement),
    ...content.enquiries
      /* Declined and archived requests are answered; drawing them on the
         calendar would make a settled date look contested. */
      .filter(
        (e) =>
          e.requestedDate &&
          (e.status === 'new' || e.status === 'replied'),
      )
      .map(fromEnquiry),
  ].filter((e) => parseISODate(e.date) !== null);

  const map = new Map<string, CalendarEntry[]>();
  for (const entry of all) {
    const day = map.get(entry.date);
    if (day) day.push(entry);
    else map.set(entry.date, [entry]);
  }
  /* Engagements first, then the record, then the asks: what is committed
     should read before what is merely wanted. */
  const rank: Record<EntryKind, number> = {
    event: 0,
    update: 1,
    statement: 2,
    request: 3,
  };
  for (const day of map.values()) {
    day.sort((a, b) => rank[a.kind] - rank[b.kind] || a.title.localeCompare(b.title));
  }
  return map;
}

/* ---------------------------------------------------------------
   The grid
--------------------------------------------------------------- */

export type Cell = {
  /* YYYY-MM-DD */
  iso: string;
  day: number;
  /* False for the leading and trailing days borrowed from the months either
     side, which are drawn faintly rather than left blank. */
  inMonth: boolean;
};

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function iso(y: number, m: number, d: number): string {
  return `${String(y).padStart(4, '0')}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/**
 * Six weeks from Sunday, always.
 *
 * A grid whose height changes with the month makes the whole page jump as the
 * office pages through the year, and the day under the pointer moves out from
 * under it. Six rows covers every month in every year.
 */
export function monthGrid(year: number, month: number): Cell[] {
  const first = new Date(Date.UTC(year, month, 1));
  const lead = first.getUTCDay();
  const cells: Cell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(Date.UTC(year, month, 1 - lead + i));
    cells.push({
      iso: iso(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month && d.getUTCFullYear() === year,
    });
  }
  return cells;
}

/** "March 2026" */
export function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month, 1)));
}

/** "Saturday, 14 March 2026" */
export function longDate(isoDate: string): string {
  const d = parseISODate(isoDate);
  if (!d) return isoDate;
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

/** Today as the store writes dates, so it can be compared to them directly. */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
