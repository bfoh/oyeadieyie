'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DownloadSimple, Check } from '@phosphor-icons/react/dist/ssr';
import {
  PRESS,
  MEDIA_KIT,
  UPDATES_INTRO,
  formatUpdateDate,
  type Update,
} from '@/lib/content';
import { HOME_LIMITS } from '@/lib/limits';
import { useContactValue } from './ContactContext';
import { Section, SectionHead } from './Section';
import { Reveal } from './Reveal';

/**
 * News and media.
 *
 * Two things a newsroom wants and one thing a returning reader wants, in one
 * chapter: what has happened lately, the cleared photography, and the press
 * pack.
 *
 * The dated entries are the only place on this site where the record
 * accumulates. Nothing else here carries a date, so without them a second
 * visit looks identical to the first and regional press has nothing to cite.
 * When there are none the updates half renders nothing — an empty "latest"
 * heading says the office has stopped, rather than that it has not started —
 * and the press half carries the chapter on its own.
 */
export function News({ updates }: { updates: Update[] }) {
  /* Null until the palace supplies it, so no bracket ever reaches print. */
  const press = useContactValue('press');

  const shown = [...updates]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, HOME_LIMITS.updates);

  return (
    <Section id="news">
      <SectionHead
        id="news"
        lead={UPDATES_INTRO}
      />

      {shown.length > 0 && (
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
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] ease-fluid group-hover:scale-[1.05]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-300">
                  {/* A machine readable date beside the printed one, so the
                      entry can be cited and syndicated correctly. */}
                  <time dateTime={item.date} className="text-sm text-gold">
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
      )}

      <div className="mt-800 grid gap-500 border-t border-ebony-line pt-600 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
        <ul data-reveal-group className="grid gap-300 sm:grid-cols-2">
          {PRESS.map((item, i) => (
            <Reveal as="li" item key={item.id} delay={i * 70}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ebony-line bg-ebony transition-all duration-700 ease-fluid hover:-translate-y-[4px] hover:border-gold-dim hover:shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-ebony-card">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1200ms] ease-fluid group-hover:scale-[1.05]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-300">
                  <span className="text-sm text-gold">{item.kind}</span>
                  <h3 className="mt-100 font-display text-xl font-600 leading-snug text-ivory">
                    {item.title}
                  </h3>
                  <p className="mt-100 text-sm leading-relaxed text-ivory/60">
                    {item.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={140}>
          <div className="rounded-2xl border border-ebony-line bg-ebony p-400">
            <h3 className="font-display text-2xl font-600 text-ivory">
              Press kit
            </h3>
            <p className="mt-100 text-base leading-relaxed text-ivory/65">
              Approved biographies, cleared photography and the correct forms of
              address, ready to download.
            </p>
            <ul className="mt-300 grid gap-100">
              {MEDIA_KIT.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-100 text-sm text-ivory/70"
                >
                  <Check
                    size={16}
                    weight="bold"
                    className="mt-[3px] shrink-0 text-gold"
                    aria-hidden="true"
                  />
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href="/media-kit"
              className="group mt-400 inline-flex min-h-[44px] items-center gap-75 rounded-xl bg-gold px-200 py-100 text-base font-semibold text-ebony transition-all duration-700 ease-fluid hover:bg-[#e6c34d] active:scale-[0.98]"
            >
              Open the press kit
              <DownloadSimple
                size={16}
                weight="bold"
                className="transition-transform duration-700 ease-fluid group-hover:translate-y-[2px]"
                aria-hidden="true"
              />
            </Link>
            {press && (
              <p className="mt-200 text-sm text-ivory/50">
                Press desk:{' '}
                <a
                  href={`mailto:${press}`}
                  className="transition-colors duration-700 ease-fluid hover:text-gold"
                >
                  {press}
                </a>
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
