'use client';

import {
  UsersThree,
  BookOpenText,
  Plant,
  Buildings,
} from '@phosphor-icons/react/dist/ssr';
import { PILLARS, byLens } from '@/lib/content';
import { useLens } from './LensContext';
import { Reveal } from './Reveal';

const ICONS = {
  users: UsersThree,
  book: BookOpenText,
  plant: Plant,
  buildings: Buildings,
} as const;

export function Vision() {
  const { lens } = useLens();
  const pillars = byLens(PILLARS, lens);

  return (
    <section
      id="vision"
      data-choreo className="relative border-t border-ebony-line bg-transparent px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
    >

      <div className="relative mx-auto w-full max-w-[1280px]">
        <Reveal>
          <div className="flex items-center gap-100">
            <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
            <p data-choreo-label className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Vision and mission
            </p>
          </div>
          <h2 data-choreo-heading className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl">
            What the stool is for
          </h2>
          <p data-choreo-lead className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70">
            His agenda for Adrobaa and the wider Ahafo Region, in his own terms, so
            the town can hold him to it.
          </p>
        </Reveal>

        <ul data-reveal-group className="mt-600 grid gap-200 md:grid-cols-2">
          {pillars.map((pillar, i) => {
            const Icon = ICONS[pillar.icon as keyof typeof ICONS];
            return (
              <Reveal as="li" item key={pillar.id} delay={i * 80}>
                <article className="h-full rounded-2xl border border-ebony-line bg-ebony-raised/80 p-300 backdrop-blur-sm transition-all duration-700 ease-fluid hover:-translate-y-[3px] hover:border-gold-dim hover:bg-ebony-card">
                  {/* nested radius: outer 16, gap 24 so no formula applies, kept at 12 */}
                  <span className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-ebony-line bg-ebony text-gold">
                    <Icon size={22} weight="light" aria-hidden="true" />
                  </span>
                  <h3 className="mt-200 font-display text-2xl font-600 leading-snug text-ivory">
                    {pillar.title}
                  </h3>
                  <p className="mt-100 text-base leading-relaxed text-ivory/65">
                    {pillar.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
