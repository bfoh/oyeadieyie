import Image from 'next/image';
import { UPDATES_INTRO, formatUpdateDate, type Update } from '@/lib/content';
import { Reveal } from './Reveal';

/**
 * Dated entries from the office.
 *
 * Nothing else on this site carries a date, so a second visit looks identical
 * to the first and regional press has nothing to cite. This is where the
 * record accumulates: the borehole that came in, the durbar that happened,
 * the students placed this year.
 *
 * While UPDATES is empty the section renders nothing at all. An empty
 * "Latest news" heading is worse than no heading, because it says the office
 * has stopped rather than that it has not started.
 */
export function Updates({ updates }: { updates: Update[] }) {
  if (!updates.length) return null;

  const shown = [...updates]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <section
      id="updates"
      data-choreo
      className="relative border-t border-ebony-line bg-transparent px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <Reveal>
          <div className="flex items-center gap-100">
            <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
            <p
              data-choreo-label
              className="text-xs font-semibold uppercase tracking-[0.18em] text-gold"
            >
              From the office
            </p>
          </div>
          <h2
            data-choreo-heading
            className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl"
          >
            Latest from Adrobaa
          </h2>
          <p
            data-choreo-lead
            className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70"
          >
            {UPDATES_INTRO}
          </p>
        </Reveal>

        <ul
          data-reveal-group
          className="mt-600 grid gap-300 md:grid-cols-2 lg:grid-cols-3"
        >
          {shown.map((item, i) => (
            <Reveal as="li" item key={item.id} delay={i * 70}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ebony-line bg-ebony transition-all duration-700 ease-fluid hover:-translate-y-[4px] hover:border-gold-dim hover:shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
                {item.image && (
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-ebony-card">
                    <Image
                      src={item.image}
                      alt={item.alt ?? item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] ease-fluid group-hover:scale-[1.05]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-300">
                  {/* A machine readable date beside the printed one, so the
                      entry can be cited and syndicated correctly. */}
                  <time
                    dateTime={item.date}
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-gold"
                  >
                    {formatUpdateDate(item.date)}
                  </time>
                  <h3 className="mt-100 font-display text-2xl font-600 leading-snug text-ivory">
                    {item.title}
                  </h3>
                  <p className="mt-100 text-base leading-relaxed text-ivory/65">
                    {item.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
