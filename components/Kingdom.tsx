'use client';

import Image from 'next/image';
import { useState } from 'react';
import { TIMELINE, CHIEF } from '@/lib/content';
import { Reveal } from './Reveal';

export function Kingdom({ gallery }: { gallery: { id: string; url: string; alt: string }[] }) {
  const [activeId, setActiveId] = useState(TIMELINE[0].id);
  const active = TIMELINE.find((t) => t.id === activeId) ?? TIMELINE[0];

  return (
    <section
      id="kingdom"
      data-choreo className="relative border-t border-ebony-line bg-ebony-raised/45 px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <Reveal>
          <div className="flex items-center gap-100">
            <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
            <p data-choreo-label className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              {CHIEF.place} · {CHIEF.region}
            </p>
          </div>
          <h2 data-choreo-heading className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl">
            The kingdom of Adrobaa
          </h2>
          <p data-choreo-lead className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70">
            A town in Tano North, a stool with a working brief, and a court that
            still decides how things are done.
          </p>
        </Reveal>

        {/* Timeline */}
        <div className="mt-600 grid gap-500 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:items-start">
          <Reveal>
            <ol className="relative border-l border-ebony-line pl-300">
              {TIMELINE.map((item) => {
                const selected = item.id === activeId;
                return (
                  <li key={item.id} className="relative pb-200 last:pb-0">
                    <span
                      aria-hidden="true"
                      className={[
                        'absolute -left-[calc(24px+4px)] top-[18px] h-[7px] w-[7px] rounded-full transition-all duration-700 ease-fluid',
                        selected ? 'bg-gold' : 'bg-ebony-line',
                      ].join(' ')}
                    />
                    <button
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      aria-pressed={selected}
                      className={[
                        'w-full rounded-2xl border p-200 text-left transition-all duration-700 ease-fluid active:scale-[0.99]',
                        selected
                          ? 'border-gold-dim bg-ebony-card'
                          : 'border-transparent hover:border-ebony-line hover:bg-ebony-card/60',
                      ].join(' ')}
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                        {item.marker}
                      </span>
                      <span className="mt-50 block font-display text-xl font-600 text-ivory">
                        {item.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </Reveal>

          <Reveal delay={120} key={active.id}>
            <figure>
              <div
                data-image-reveal
                className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-ebony-line bg-ebony-card"
              >
                <Image
                  src={active.image}
                  alt={active.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70">
                {active.body}
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {/* Gallery */}
        <Reveal delay={80}>
          <h3 className="mt-800 font-display text-2xl font-600 text-ivory">
            The court in session
          </h3>
        </Reveal>
        <ul data-reveal-group className="mt-300 grid grid-cols-2 gap-200 md:grid-cols-3">
          {gallery.slice(0, 9).map((shot, i) => (
            <Reveal as="li" item key={shot.id} delay={i * 60}>
              <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-ebony-line bg-ebony-card">
                <Image
                  src={shot.url}
                  alt={shot.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 30vw"
                  className="object-cover transition-transform duration-[1200ms] ease-fluid group-hover:scale-[1.05]"
                />
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
