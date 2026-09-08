'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  PROJECTS,
  PROJECT_TAGS,
  IMPACT,
  IMPACT_SOURCE,
  PROVENANCE_LABEL,
  byLens,
  type ProjectTag,
} from '@/lib/content';
import { ProjectProgress } from './ProjectProgress';
import { useLens } from './LensContext';
import { GLYPHS } from './adinkraGlyphs';
import { Reveal } from './Reveal';

/**
 * Count up driven by IntersectionObserver and requestAnimationFrame.
 * Respects reduced motion by jumping straight to the final value.
 */
function Counter({
  value,
  prefix = '',
  suffix = '',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(value);
      return;
    }

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          const start = performance.now();
          const dur = 1600;
          const tick = (now: number) => {
            const t = Math.min((now - start) / dur, 1);
            /* Cubic ease out, so it settles rather than stopping dead */
            setN(value * (1 - Math.pow(1 - t, 3)));
            if (t < 1) raf = requestAnimationFrame(tick);
            else setN(value);
          };
          raf = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  /* Fractional targets keep one decimal while counting, whole ones never do */
  const shown = Number.isInteger(value)
    ? Math.round(n).toLocaleString('en-GB')
    : n.toFixed(1);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

export function Projects() {
  const [filter, setFilter] = useState<ProjectTag | 'All'>('All');
  const { lens } = useLens();

  /* The lens reorders the record, it never filters it. Everything stays
     reachable however the viewer is reading the page. */
  const ordered = byLens(PROJECTS, lens);
  const shown =
    filter === 'All' ? ordered : ordered.filter((p) => p.tag === filter);

  return (
    <section
      id="projects"
      data-choreo className="relative border-t border-ebony-line bg-ebony-raised/45 px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <Reveal>
          <div className="flex items-center gap-100">
            <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
            <p data-choreo-label className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Development record
            </p>
          </div>
          <h2 data-choreo-heading className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl">
            Renders become buildings
          </h2>
          <p data-choreo-lead className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70">
            {lens === 'regal'
              ? 'The development agenda as set out by the Nkosuo Hene, led by the work the town feels first: sanitation, cleanliness, schooling and land.'
              : 'The development agenda as set out by the Nkosuo Hene, led by the built and engineered work: water, roads, lighting and trades.'}
          </p>
        </Reveal>

        {/* Impact counter */}
        <Reveal delay={80}>
          <dl className="mt-400 grid grid-cols-2 gap-100 sm:mt-500 sm:gap-200 lg:grid-cols-4">
            {IMPACT.map((stat) => (
              <div
                key={stat.id}
                className="rounded-2xl border border-ebony-line bg-ebony p-200 transition-colors duration-700 ease-fluid hover:border-gold-dim sm:p-300"
              >
                <dd className="font-display text-3xl font-600 leading-none text-ivory sm:text-4xl lg:text-5xl">
                  <Counter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </dd>
                <dt className="mt-75 text-sm font-semibold leading-snug text-ivory/80">
                  {stat.label}
                </dt>
                <dd className="mt-50 hidden text-xs text-ivory/50 sm:block">{stat.note}</dd>
              </div>
            ))}
          </dl>
          {/* Which numbers the page can prove, and which the office has
              stated. A counter with no provenance is a claim, not a record. */}
          <p className="mt-200 max-w-[68ch] text-xs leading-relaxed text-ivory/50">
            {IMPACT_SOURCE}
          </p>
        </Reveal>

        {/* Renders become buildings: the sequence, from the photography that
            already existed. */}
        <ProjectProgress />

        {/* Filters */}
        <Reveal delay={120}>
          <div
            role="group"
            aria-label="Filter projects by category"
            className="-mx-300 mt-500 flex snap-x snap-mandatory gap-75 overflow-x-auto px-300 pb-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-600 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
          >
            {(['All', ...PROJECT_TAGS] as const).map((tag) => {
              const selected = filter === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setFilter(tag)}
                  aria-pressed={selected}
                  className={[
                    'min-h-[44px] shrink-0 snap-start whitespace-nowrap rounded-full border px-200 py-100 text-sm font-semibold transition-all duration-700 ease-fluid active:scale-[0.98]',
                    selected
                      ? 'border-gold bg-gold text-ebony'
                      : 'border-ebony-line text-ivory/65 hover:border-gold-dim hover:text-ivory',
                  ].join(' ')}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Cards, or the empty state */}
        {shown.length === 0 ? (
          <div className="mt-400 rounded-2xl border border-ebony-line bg-ebony p-500 text-center">
            <p className="font-display text-2xl text-ivory">
              Nothing published under this heading yet
            </p>
            <p className="mx-auto mt-100 max-w-measure text-base text-ivory/60">
              Projects appear here once the traditional council has approved the
              scope. Choose another category, or ask the office what is coming.
            </p>
            <button
              type="button"
              onClick={() => setFilter('All')}
              className="mt-300 rounded-xl border border-white/20 px-200 py-100 text-base font-semibold text-ivory transition-all duration-700 ease-fluid hover:border-gold hover:text-gold active:scale-[0.98]"
            >
              Show every project
            </button>
          </div>
        ) : (
          <ul data-reveal-group className="mt-400 grid gap-300 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((project, i) => (
              <Reveal as="li" item key={project.id} delay={i * 70}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ebony-line bg-ebony transition-all duration-700 ease-fluid hover:-translate-y-[4px] hover:border-gold-dim hover:shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
                  {project.image ? (
                    <div className="relative aspect-[16/11] w-full overflow-hidden bg-ebony-card">
                      <Image
                        src={project.image}
                        alt={project.alt ?? project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-[1200ms] ease-fluid group-hover:scale-[1.05]"
                      />
                      {project.provenance &&
                        PROVENANCE_LABEL[project.provenance] && (
                          <span className="absolute bottom-100 left-100 rounded-full bg-ebony/85 px-100 py-25 text-xs font-medium text-ivory/80 backdrop-blur-sm">
                            {PROVENANCE_LABEL[project.provenance]}
                          </span>
                        )}
                    </div>
                  ) : (
                    /* No photograph exists for this one yet. An adinkra is
                       honest about that; a stock image would not be. */
                    <div className="relative flex aspect-[16/11] w-full items-center justify-center overflow-hidden border-b border-ebony-line bg-ebony-raised">
                      {project.glyph && GLYPHS[project.glyph] && (
                        <svg
                          viewBox={GLYPHS[project.glyph].viewBox}
                          aria-hidden="true"
                          className="h-[64px] w-[64px] text-gold/70 transition-transform duration-[1200ms] ease-fluid group-hover:scale-110"
                        >
                          {GLYPHS[project.glyph].el}
                        </svg>
                      )}
                      {project.figure && (
                        <span className="absolute bottom-200 right-200 font-display text-2xl text-ivory/25">
                          {project.figure}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-300">
                    <div className="flex flex-wrap items-center gap-75">
                      <span className="rounded-full border border-ebony-line px-100 py-25 text-xs font-semibold text-ivory/60">
                        {project.tag}
                      </span>
                      {project.figure && project.image && (
                        <span className="rounded-full border border-gold/40 px-100 py-25 text-xs font-semibold text-gold">
                          {project.figure}
                        </span>
                      )}
                      <span
                        className={[
                          'rounded-full px-100 py-25 text-xs font-semibold',
                          project.status === 'Delivered'
                            ? 'bg-gold text-ebony'
                            : project.status === 'In construction' ||
                                project.status === 'Ongoing'
                              ? 'border border-gold text-gold'
                              : 'border border-ebony-line text-ivory/50',
                        ].join(' ')}
                      >
                        {project.status}
                      </span>
                    </div>
                    <h3 className="mt-200 font-display text-2xl font-600 leading-snug text-ivory">
                      {project.title}
                    </h3>
                    <p className="mt-100 text-base leading-relaxed text-ivory/65">
                      {project.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
