'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  UsersThree,
  BookOpenText,
  Plant,
  Buildings,
} from '@phosphor-icons/react/dist/ssr';
import { TIMELINE, PILLARS, CHIEF } from '@/lib/content';
import { Section, SectionHead } from './Section';
import { Reveal } from './Reveal';

const ICONS = {
  users: UsersThree,
  book: BookOpenText,
  plant: Plant,
  buildings: Buildings,
} as const;

/**
 * Chieftaincy and leadership.
 *
 * The stool and what it is for, in one chapter: the timeline of the seat
 * itself, then the four things he says the seat is meant to deliver. These
 * were two sections and read as two answers to one question.
 *
 * The gallery that used to hang off the bottom of this section is now its own
 * chapter. A grid of durbar photography under a timeline was a second subject
 * arriving without being announced.
 */
export function Chieftaincy() {
  const [activeId, setActiveId] = useState(TIMELINE[0].id);
  const active = TIMELINE.find((t) => t.id === activeId) ?? TIMELINE[0];

  return (
    <Section id="chieftaincy" ground="raised">
      <SectionHead
        id="chieftaincy"
        variant="split"
        lead="Where many traditional seats are ceremonial, the Nkosuo stool carries an explicit brief: attract development to the town, deliver it, and account for it to the traditional council."
        note={`${CHIEF.place} · ${CHIEF.region}`}
      />

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
                    <span className="text-sm text-gold">{item.marker}</span>
                    <span className="mt-50 block font-display text-xl font-600 text-ivory">
                      {item.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Reveal>

        {/* Keyed on the active entry so the figure re-mounts and the caption
            cannot be left describing the previous photograph. */}
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
            <figcaption
              aria-live="polite"
              className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70"
            >
              {active.body}
            </figcaption>
          </figure>
        </Reveal>
      </div>

      <Reveal className="mt-800">
        <h3 className="max-w-measure font-display text-3xl font-600 leading-tight text-ivory">
          What the stool is for
        </h3>
        <p className="mt-200 max-w-measure text-base leading-relaxed text-ivory/65">
          His agenda for Adrobaa and the wider Ahafo Region, in his own terms,
          so the town can hold him to it.
        </p>
      </Reveal>

      <ul data-reveal-group className="mt-400 grid gap-200 md:grid-cols-2">
        {PILLARS.map((pillar, i) => {
          const Icon = ICONS[pillar.icon as keyof typeof ICONS];
          return (
            <Reveal as="li" item key={pillar.id} delay={i * 80}>
              <article className="h-full rounded-2xl border border-ebony-line bg-ebony-raised/80 p-300 backdrop-blur-sm transition-all duration-700 ease-fluid hover:-translate-y-[3px] hover:border-gold-dim hover:bg-ebony-card">
                <span className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-ebony-line bg-ebony text-gold">
                  <Icon size={22} weight="light" aria-hidden="true" />
                </span>
                <h4 className="mt-200 font-display text-2xl font-600 leading-snug text-ivory">
                  {pillar.title}
                </h4>
                <p className="mt-100 text-base leading-relaxed text-ivory/65">
                  {pillar.body}
                </p>
              </article>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
