'use client';

import Image from 'next/image';
import { PROFILES, COMPANY } from '@/lib/content';
import { useLens } from './LensContext';
import { Reveal } from './Reveal';

export function DualProfile() {
  const { lens, setLens } = useLens();
  const profile = PROFILES[lens];

  return (
    <section id="ruler" data-choreo className="relative border-t border-ebony-line bg-transparent px-300 py-700 sm:px-500 sm:py-800 lg:px-800">

      <div className="relative mx-auto w-full max-w-[1280px]">
        <Reveal>
          <div className="flex items-center gap-100">
            <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
            <p data-choreo-label className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              The ruler and the leader
            </p>
          </div>
          <h2 data-choreo-heading className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl">
            Two offices, held by one man
          </h2>
          <p data-choreo-lead className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70">
            Most profiles pick a side. This one does not, because the two sides
            pay for each other.
          </p>
        </Reveal>

        {/* Toggle */}
        <Reveal delay={80}>
          <div
            role="tablist"
            aria-label="Profile"
            className="mt-500 inline-flex rounded-2xl border border-ebony-line bg-ebony-raised p-50"
          >
            {(['regal', 'modern'] as const).map((key) => {
              const p = PROFILES[key];
              const selected = lens === key;
              return (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  id={`tab-${key}`}
                  aria-selected={selected}
                  aria-controls={`panel-${key}`}
                  onClick={() => setLens(key)}
                  /* nested radius: outer 16px minus 4px gap = 12px */
                  className={[
                    'rounded-xl px-200 py-100 text-sm font-semibold transition-all duration-700 ease-fluid active:scale-[0.98]',
                    selected
                      ? 'bg-gold text-ebony'
                      : 'text-ivory/60 hover:text-ivory',
                  ].join(' ')}
                >
                  {p.tab}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Panel */}
        <div
          role="tabpanel"
          id={`panel-${profile.key}`}
          aria-labelledby={`tab-${profile.key}`}
          key={profile.key}
          className="mt-400 grid gap-500 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start"
        >
          <Reveal className="relative">
            <div
              data-image-reveal
              className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-ebony-line bg-ebony-card"
            >
              <Image
                src={profile.image}
                alt={profile.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-[1200ms] ease-fluid hover:scale-[1.03]"
                priority={false}
              />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h3 className="font-display text-3xl font-600 text-ivory sm:text-4xl">
              {profile.heading}
            </h3>
            <p className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70">
              {profile.lead}
            </p>

            <dl className="mt-400 grid gap-200 sm:grid-cols-2">
              {profile.facts.map((fact) => (
                /* outer 16px radius, 16px internal padding, so inner shapes stay square */
                <div
                  key={fact.label}
                  className="rounded-2xl border border-ebony-line bg-ebony-raised p-200 transition-colors duration-700 ease-fluid hover:border-gold-dim"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                    {fact.label}
                  </dt>
                  <dd className="mt-75 text-lg font-semibold text-ivory">
                    {fact.value}
                  </dd>
                  <dd className="mt-50 text-sm leading-relaxed text-ivory/55">
                    {fact.note}
                  </dd>
                </div>
              ))}
            </dl>

            {profile.key === 'modern' && (
              <div className="mt-300 rounded-2xl border border-ebony-line bg-ebony-raised p-300">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                  Lines of business
                </p>
                <ul className="mt-200 grid gap-100 sm:grid-cols-2">
                  {COMPANY.services.map((s) => (
                    <li key={s} className="flex items-start gap-75 text-sm text-ivory/70">
                      <span
                        className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-gold"
                        aria-hidden="true"
                      />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
