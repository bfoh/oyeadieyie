'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Play } from '@phosphor-icons/react/dist/ssr';
import { ADINKRA, FILM, TIMELINE, GALLERY } from '@/lib/content';
import { GLYPHS } from './adinkraGlyphs';
import { Section, SectionHead } from './Section';
import { Reveal } from './Reveal';

/**
 * Traditional culture.
 *
 * The adinkra and the ceremony they are worn at, in one chapter, because they
 * are one subject: the cloth is a sentence and the durbar is where it is
 * spoken.
 *
 * The glosses open on CLICK, with `aria-expanded`. They were once revealed by
 * `group-hover` and `group-focus-visible` alone, and on a phone — which is
 * most of this site's traffic — a tap sets `:focus` but not `:focus-visible`,
 * so ten Akan proverbs, the most culturally substantial content here, were
 * unreachable. Do not "simplify" this back to hover.
 */

/**
 * The ceremonial band.
 *
 * Photography already in public/img, and its description is LOOKED UP rather
 * than written here. Every one of these files is already described somewhere
 * in lib/content.ts, and a second description written from the filename would
 * be a guess about a photograph — the one thing this site does not do. Resolve
 * from the existing entries, and drop anything that has no description on
 * record rather than inventing one.
 */
const DESCRIBED: Record<string, string> = Object.fromEntries([
  ...TIMELINE.map((t) => [t.image, t.alt] as const),
  ...GALLERY.map((g) => [g.src, g.alt] as const),
]);

const CEREMONY = [
  '/img/kingdom-festival.jpg',
  '/img/kingdom-queenmothers.jpg',
  '/img/procession-kente.jpg',
  '/img/kingdom-durbar.jpg',
]
  .filter((src) => DESCRIBED[src])
  .map((src) => ({ src, alt: DESCRIBED[src] }));

export function Culture() {
  const [open, setOpen] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function start() {
    setStarted(true);
    /* Wait for the source to mount before asking the element to play */
    requestAnimationFrame(() => {
      const v = videoRef.current;
      if (!v) return;
      v.load();
      void v.play().catch(() => {
        /* Autoplay refused: the native controls are already visible */
      });
    });
  }

  return (
    <Section id="culture">
      <SectionHead
        id="culture"
        lead="Akan adinkra carry proverbs. The regalia worn at a durbar is not decoration, it is a sentence. Choose a symbol to read it."
      />

      <ul
        data-reveal-group
        className="mt-600 grid grid-cols-2 gap-200 sm:grid-cols-3 lg:grid-cols-5"
      >
        {ADINKRA.map((sym, i) => {
          const g = GLYPHS[sym.id];
          const isOpen = open === sym.id;
          return (
            <Reveal as="li" item key={sym.id} delay={i * 50}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : sym.id)}
                aria-expanded={isOpen}
                aria-controls={`gloss-${sym.id}`}
                className={[
                  'group flex h-full w-full flex-col rounded-2xl border bg-ebony-raised/80 p-200 text-left backdrop-blur-sm transition-all duration-700 ease-fluid hover:-translate-y-[3px] hover:border-gold hover:bg-ebony-card active:scale-[0.98]',
                  isOpen ? 'border-gold bg-ebony-card' : 'border-ebony-line',
                ].join(' ')}
              >
                <span className="flex h-[64px] items-center">
                  {g && (
                    <svg
                      viewBox={g.viewBox}
                      aria-hidden="true"
                      className={[
                        'h-[56px] w-[56px] text-gold transition-transform duration-[900ms] ease-fluid group-hover:scale-110',
                        isOpen ? 'scale-110' : '',
                      ].join(' ')}
                    >
                      {g.el}
                    </svg>
                  )}
                </span>
                <p className="mt-200 font-display text-lg font-600 leading-snug text-ivory">
                  {sym.name}
                </p>
                <p className="mt-25 text-sm leading-snug text-gold/80">
                  {sym.meaning}
                </p>
                {/* Grid rows animate a height the content decides, so the
                    gloss is never clipped whatever its length. */}
                <span
                  id={`gloss-${sym.id}`}
                  className={[
                    'grid overflow-hidden transition-all duration-[900ms] ease-fluid',
                    isOpen
                      ? 'mt-100 grid-rows-[1fr] opacity-100'
                      : 'mt-0 grid-rows-[0fr] opacity-0',
                  ].join(' ')}
                >
                  <span className="min-h-0">
                    <span className="block text-sm leading-relaxed text-ivory/60">
                      {sym.gloss}
                    </span>
                  </span>
                </span>
              </button>
            </Reveal>
          );
        })}
      </ul>

      {/* The ceremony itself. Click to play: the file is never fetched until
          the viewer asks for it, so a 21 MB record of the enstoolment costs
          nothing on load. */}
      <Reveal className="mt-800">
        <h3 className="max-w-measure font-display text-3xl font-600 leading-tight text-ivory">
          {FILM.title}
        </h3>
        <p className="mt-200 max-w-measure text-base leading-relaxed text-ivory/65">
          {FILM.body}
        </p>
      </Reveal>

      <Reveal delay={100}>
        <div
          data-image-reveal
          className="relative mt-400 aspect-video w-full overflow-hidden rounded-2xl border border-ebony-line bg-ebony-card"
        >
          {started ? (
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              preload="auto"
              poster={FILM.poster}
              className="h-full w-full bg-black object-contain"
            >
              <source src={FILM.src} type="video/mp4" />
            </video>
          ) : (
            <button
              type="button"
              onClick={start}
              className="group absolute inset-0 h-full w-full"
              aria-label={`Play the film, ${FILM.title}`}
            >
              <Image
                src={FILM.poster}
                alt={FILM.alt}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover transition-transform duration-[1400ms] ease-fluid group-hover:scale-[1.03]"
              />
              <span
                className="absolute inset-0 bg-black/35 transition-colors duration-700 ease-fluid group-hover:bg-black/25"
                aria-hidden="true"
              />
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ebony/70 backdrop-blur-sm transition-all duration-700 ease-fluid group-hover:scale-110 group-hover:border-gold group-hover:bg-gold"
              >
                <Play
                  size={26}
                  weight="fill"
                  className="ml-[3px] text-gold transition-colors duration-700 ease-fluid group-hover:text-ebony"
                />
              </span>
            </button>
          )}
        </div>
      </Reveal>

      <Reveal delay={160}>
        <ul className="mt-300 flex flex-wrap items-center gap-x-300 gap-y-100">
          {FILM.meta.map((m) => (
            <li key={m} className="flex items-center gap-75 text-xs text-ivory/50">
              <span
                className="h-[3px] w-[3px] rounded-full bg-gold"
                aria-hidden="true"
              />
              {m}
            </li>
          ))}
        </ul>
      </Reveal>

      {/* A quiet band of the ceremony as it is actually kept: no captions,
          because these are not claims, they are the room. */}
      <ul
        data-reveal-group
        className="mt-800 grid grid-cols-2 gap-200 lg:grid-cols-4"
      >
        {CEREMONY.map((shot, i) => (
          <Reveal as="li" item key={shot.src} delay={i * 60}>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-ebony-line bg-ebony-card">
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 50vw, 24vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
