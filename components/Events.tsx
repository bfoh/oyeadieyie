import Image from 'next/image';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import type { SiteEvent } from '@/lib/store';
import { parseISODate, ENGAGE_ROUTES } from '@/lib/content';
import { HOME_LIMITS } from '@/lib/limits';
import { Section, SectionHead } from './Section';
import { Reveal } from './Reveal';

/**
 * Events and engagements.
 *
 * Only events still to come are shown: a site advertising last month's durbar
 * reads as abandoned.
 *
 * This used to render nothing at all when the calendar was empty, which was
 * right when it was one section among thirteen and wrong now that it is a
 * named chapter with a link in the nav pointing at it. A nav item that
 * scrolls to nowhere is broken in a way an empty calendar is not. So when
 * there is nothing coming, the section says what the office accepts instead,
 * which is the thing a reader arriving at "Events & Engagements" wanted to
 * know anyway.
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

  return (
    <Section id="events" ground="raised">
      <SectionHead
        id="events"
        variant="split"
        lead="Durbars, festivals and commissionings. The ceremonial calendar governs the stool's year, and every other commitment is arranged around it."
      />

      {upcoming.length > 0 ? (
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
                        {new Intl.DateTimeFormat('en-GB', {
                          month: 'short',
                          timeZone: 'UTC',
                        }).format(day)}
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-2xl font-600 leading-snug text-ivory">
                      {ev.title}
                    </h3>
                    <time dateTime={ev.date} className="mt-75 block text-sm text-gold">
                      {formatDate(ev.date)}
                      {ev.time ? ` · ${ev.time}` : ''}
                    </time>
                    {ev.place && (
                      <p className="mt-50 text-sm text-ivory/60">{ev.place}</p>
                    )}
                    {ev.body && (
                      <p className="mt-100 text-base leading-relaxed text-ivory/65">
                        {ev.body}
                      </p>
                    )}
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
      ) : (
        <Reveal className="mt-600">
          <p className="max-w-measure text-base leading-relaxed text-ivory/65">
            Nothing is published for the coming weeks. Dates are posted here
            once the traditional council has confirmed them against the
            ceremonial calendar. These are the engagements the office accepts:
          </p>
        </Reveal>
      )}

      {/* The routes stand under the calendar whether or not it has anything
          in it: a reader who arrives here wants to know what can be asked
          for, and that is true on a quiet month as much as a busy one. */}
      <ul
        data-reveal-group
        className="mt-600 grid gap-200 border-t border-ebony-line pt-600 sm:grid-cols-2 lg:grid-cols-4"
      >
        {ENGAGE_ROUTES.map((route, i) => (
          <Reveal as="li" item key={route.id} delay={i * 70}>
            <article className="h-full rounded-2xl border border-ebony-line bg-ebony-raised/80 p-300 backdrop-blur-sm">
              <h3 className="font-display text-xl font-600 leading-snug text-ivory">
                {route.title}
              </h3>
              <p className="mt-100 text-sm leading-relaxed text-ivory/60">
                {route.body}
              </p>
            </article>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={100}>
        <a
          href="/#contact"
          className="group mt-400 inline-flex min-h-[52px] items-center gap-75 rounded-xl bg-gold px-300 py-100 text-base font-semibold text-ebony transition-all duration-700 ease-fluid hover:bg-[#e6c34d] active:scale-[0.98]"
        >
          Request an appearance
          <ArrowRight
            weight="bold"
            className="h-[16px] w-[16px] transition-transform duration-700 ease-fluid group-hover:translate-x-[3px]"
            aria-hidden="true"
          />
        </a>
      </Reveal>
    </Section>
  );
}
