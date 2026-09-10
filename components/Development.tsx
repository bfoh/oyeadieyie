'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  PROJECT_TAGS,
  IMPACT_SOURCE,
  PROVENANCE_LABEL,
  type ProjectTag,
} from '@/lib/content';
import type { StoredImpact, StoredProject } from '@/lib/store';
import { ProjectProgress } from './ProjectProgress';
import { GLYPHS } from './adinkraGlyphs';
import { Section, SectionHead } from './Section';
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

/**
 * Community development: the record, not the promise.
 *
 * Projects render in stored order, which the office sets at /admin/projects.
 * There is no lens sorting them any more — the order the office chose is the
 * order the town is told about.
 */
export function Development({
  projects,
  impact,
}: {
  projects: StoredProject[];
  impact: StoredImpact[];
}) {
  const [filter, setFilter] = useState<ProjectTag | 'All'>('All');

  const filtered = filter !== 'All';
  const shown = filtered ? projects.filter((p) => p.tag === filter) : projects;

  /* The lead is the first in stored order, and stored order is the office's
     own: it is set with the up and down controls at /admin/projects. Which
     project leads the record is the palace's call, not a rule invented here.

     Only when nothing is filtered — a reader who has chosen Water is scanning
     a subset, and singling out one of four is noise rather than emphasis. */
  const lead = filtered ? null : shown[0];
  const rest = filtered ? shown : shown.slice(1);

  return (
    <Section id="development" ground="raised">
      <SectionHead
        id="development"
        lead="The agenda as the Nkosuo Hene set it out, with what has been delivered, what is in construction and what is still committed — each marked as what it is."
      />

      {/* Impact counter */}
      <Reveal delay={80}>
        <dl className="mt-400 grid grid-cols-2 gap-100 sm:mt-500 sm:gap-200 lg:grid-cols-4">
          {impact.map((stat) => (
            <div
              key={stat.id}
              className="rounded-2xl border border-ebony-line bg-ebony p-200 transition-colors duration-700 ease-fluid hover:border-gold-dim sm:p-300"
            >
              <dd className="font-display text-3xl font-600 leading-none text-ivory sm:text-4xl lg:text-5xl">
                <Counter
                  value={stat.attribution === 'counted' ? projects.length : stat.value}
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
      <ProjectProgress projects={projects} />

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
        /* One list, not two. The record is a single list of projects and the
           lead is the first item in it — pulling it into a list of its own
           would tell a screen reader there are two records here. It spans the
           row instead. */
        <ul
          data-reveal-group
          className={[
            'mt-400 grid gap-300 md:grid-cols-2',
            filtered ? 'lg:grid-cols-3' : 'lg:grid-cols-4',
          ].join(' ')}
        >
          {lead && (
            <Reveal as="li" item key={lead.id} className="md:col-span-2 lg:col-span-4">
              <ProjectCard project={lead} feature />
            </Reveal>
          )}
          {rest.map((project, i) => (
            <Reveal as="li" item key={project.id} delay={(i + 1) * 70}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}

/**
 * One project.
 *
 * `feature` is the same record given the width to be read rather than
 * scanned: the photograph takes the larger share and the body is set at
 * reading size beside it. Everything factual is identical in both, and the
 * provenance badge in particular is drawn the same way at both sizes — a
 * render must not become more convincing by being made bigger.
 */
function ProjectCard({
  project,
  feature = false,
}: {
  project: StoredProject;
  feature?: boolean;
}) {
  const media = project.image ? (
    <div
      className={[
        'relative w-full overflow-hidden bg-ebony-card',
        feature ? 'aspect-[16/10] lg:h-full' : 'aspect-[16/11]',
      ].join(' ')}
    >
      <Image
        src={project.image}
        alt={project.alt ?? project.title}
        fill
        sizes={
          feature
            ? '(max-width: 1024px) 100vw, 58vw'
            : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
        }
        className="object-cover transition-transform duration-[1200ms] ease-fluid group-hover:scale-[1.05]"
      />
      {project.provenance && PROVENANCE_LABEL[project.provenance] && (
        <span className="absolute bottom-100 left-100 rounded-full bg-ebony/85 px-100 py-25 text-xs font-medium text-ivory/80 backdrop-blur-sm">
          {PROVENANCE_LABEL[project.provenance]}
        </span>
      )}
    </div>
  ) : (
    /* No photograph exists for this one yet. An adinkra is honest about
       that; a stock image would not be. */
    <div
      className={[
        'relative flex w-full items-center justify-center overflow-hidden bg-ebony-raised',
        feature ? 'aspect-[16/10] lg:h-full' : 'aspect-[16/11] border-b border-ebony-line',
      ].join(' ')}
    >
      {project.glyph && GLYPHS[project.glyph] && (
        <svg
          viewBox={GLYPHS[project.glyph].viewBox}
          aria-hidden="true"
          className={[
            'text-gold/70 transition-transform duration-[1200ms] ease-fluid group-hover:scale-110',
            feature ? 'h-[96px] w-[96px]' : 'h-[64px] w-[64px]',
          ].join(' ')}
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
  );

  /* The chip row reserves two lines in the compact card.
     At a quarter of the width three chips wrap on some projects and not on
     others, which pushed those titles a line lower than their neighbours in
     the same row. Reserving the second line costs a little space on the cards
     that do not need it and buys an aligned baseline across every row, which
     is the thing a reader actually notices. */
  const chips = (
    <div
      className={[
        'flex flex-wrap gap-75',
        feature ? 'items-center' : 'items-start lg:min-h-[60px] lg:content-start',
      ].join(' ')}
    >
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
            : project.status === 'In construction' || project.status === 'Ongoing'
              ? 'border border-gold text-gold'
              : 'border border-ebony-line text-ivory/50',
        ].join(' ')}
      >
        {project.status}
      </span>
    </div>
  );

  return (
    <article
      className={[
        'group h-full overflow-hidden rounded-2xl border border-ebony-line bg-ebony transition-all duration-700 ease-fluid hover:border-gold-dim hover:shadow-[0_18px_50px_rgba(0,0,0,0.5)]',
        feature
          ? 'grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-stretch'
          : 'flex flex-col hover:-translate-y-[4px]',
      ].join(' ')}
    >
      {media}
      <div
        className={[
          'flex flex-1 flex-col',
          feature ? 'justify-center p-400 sm:p-500' : 'p-300',
        ].join(' ')}
      >
        {chips}
        <h3
          className={[
            'mt-200 font-display font-600 leading-snug text-ivory',
            feature ? 'text-3xl sm:text-4xl' : 'text-xl',
          ].join(' ')}
        >
          {project.title}
        </h3>
        <p
          className={[
            'mt-100 max-w-measure leading-relaxed text-ivory/65',
            feature ? 'text-base sm:text-lg' : 'text-sm',
          ].join(' ')}
        >
          {project.body}
        </p>
      </div>
    </article>
  );
}
