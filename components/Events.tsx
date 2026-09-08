import Image from 'next/image';
import type { SiteEvent } from '@/lib/store';
import { parseISODate } from '@/lib/content';
import { Reveal } from './Reveal';
import { HOME_LIMITS } from '@/lib/limits';

/**
 * The calendar.
 *
 * Only events still to come are shown: a site advertising last month's durbar
 * reads as abandoned. Renders nothing at all when there is nothing coming,
 * rather than an empty heading.
 */
function formatDate(iso: string) {
  const d = parseISODate(iso);
  if (!d) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

export function Events({ events }: { events: SiteEvent[] }) {
  const today = new Date().toISOString().slice(0, 10);
  /* A garbage date string sorts above a real one, so it would survive this
     filter and then be parsed unguarded below. Drop anything unparseable. */
  const upcoming = events
    .filter((e) => parseISODate(e.date) !== null && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, HOME_LIMITS.events);

  if (!upcoming.length) return null;

  return (
    <section
      id="events"
      data-choreo
      className="relative border-t border-ebony-line bg-ebony-raised/45 px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <Reveal>
          <div className="flex items-center gap-100">
            <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
            <p data-choreo-label className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              The calendar
            </p>
          </div>
          <h2 data-choreo-heading className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl">
            Coming at Adrobaa
          </h2>
          <p data-choreo-lead className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70">
            Durbars, festivals and commissionings. The ceremonial calendar
            governs the stool&apos;s year, and everything else is arranged around it.
          </p>
        </Reveal>

        <ul data-reveal-group className="mt-600 grid gap-300 md:grid-cols-2">
          {upcoming.map((ev, i) => {
            const day = parseISODate(ev.date)!;
            return (
            <Reveal as="li" item key={ev.id} delay={i * 70}>
              <article className="flex h-full gap-300 rounded-2xl border border-ebony-line bg-ebony p-300 transition-all duration-700 ease-fluid hover:border-gold-dim">
                <div className="shrink-0 text-center">
                  <div className="rounded-xl border border-gold/40 px-200 py-100">
                    <div className="font-display text-3xl font-600 leading-none text-gold">
                      {day.getUTCDate()}
                    </div>
                    <div className="mt-50 text-xs uppercase tracking-[0.14em] text-ivory/60">
                      {new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' }).format(day)}
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-2xl font-600 leading-snug text-ivory">{ev.title}</h3>
                  <time dateTime={ev.date} className="mt-75 block text-sm text-gold">
                    {formatDate(ev.date)}
                    {ev.time ? ` · ${ev.time}` : ''}
                  </time>
                  {ev.place && <p className="mt-50 text-sm text-ivory/60">{ev.place}</p>}
                  {ev.body && <p className="mt-100 text-base leading-relaxed text-ivory/65">{ev.body}</p>}
                  {ev.imageUrl && (
                    <div className="relative mt-200 aspect-[16/9] overflow-hidden rounded-xl">
                      <Image
                        src={ev.imageUrl}
                        alt={ev.imageAlt ?? ev.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 45vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
