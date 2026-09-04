'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Play } from '@phosphor-icons/react/dist/ssr';
import { FILM } from '@/lib/content';
import { Reveal } from './Reveal';

/**
 * The enstoolment film. Click to play: the file is never fetched until the
 * viewer asks for it, so a 1080p ceremony record costs nothing on load.
 */
export function FilmFeature() {
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
    <section
      aria-labelledby="film-heading"
      data-choreo className="relative border-t border-ebony-line bg-transparent px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <Reveal>
          <div className="flex items-center gap-100">
            <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
            <p data-choreo-label className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              {FILM.kicker}
            </p>
          </div>
          <h2
            id="film-heading"
            data-choreo-heading className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl"
          >
            {FILM.title}
          </h2>
          <p data-choreo-lead className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70">
            {FILM.body}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div
            data-image-reveal
            className="relative mt-500 aspect-video w-full overflow-hidden rounded-2xl border border-ebony-line bg-ebony-card"
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
                <span className="h-[3px] w-[3px] rounded-full bg-gold" aria-hidden="true" />
                {m}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
