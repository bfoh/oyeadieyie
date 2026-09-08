'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PRESS, MEDIA_KIT, byLens } from '@/lib/content';
import { useContactValue } from './ContactContext';
import { useLens } from './LensContext';
import { DownloadSimple, Check } from '@phosphor-icons/react/dist/ssr';
import { Reveal } from './Reveal';

export function Media() {
  const { lens } = useLens();
  const items = byLens(PRESS, lens);
  /* Null until the palace supplies it, so no bracket ever reaches print. */
  const press = useContactValue('press');

  return (
    <section
      id="media"
      data-choreo className="relative border-t border-ebony-line bg-ebony-raised/45 px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <Reveal>
          <div className="flex items-center gap-100">
            <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
            <p data-choreo-label className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Media and press
            </p>
          </div>
          <h2 data-choreo-heading className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl">
            Everything a newsroom needs
          </h2>
        </Reveal>

        <div className="mt-600 grid gap-500 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
          <ul data-reveal-group className="grid gap-300 sm:grid-cols-2">
            {items.map((item, i) => (
              <Reveal as="li" item key={item.id} delay={i * 70}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ebony-line bg-ebony transition-all duration-700 ease-fluid hover:-translate-y-[4px] hover:border-gold-dim hover:shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-ebony-card">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] ease-fluid group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-300">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                      {item.kind}
                    </span>
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
                  <li key={line} className="flex items-start gap-100 text-sm text-ivory/70">
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
                <p className="mt-200 text-xs text-ivory/50">
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
      </div>
    </section>
  );
}
