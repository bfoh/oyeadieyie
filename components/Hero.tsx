'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { HERO, CHIEF } from '@/lib/content';
import { useLens } from './LensContext';

export function Hero() {
  const { lens } = useLens();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [portrait, setPortrait] = useState(false);

  /* Pick the orientation that actually fits the viewport and only then fetch
     it, so a phone never downloads the landscape master. The poster carries
     the frame until the file is ready. */
  useEffect(() => {
    const isPortrait = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
    setPortrait(isPortrait);
    setSrc(isPortrait ? '/video/hero-mobile-v2.mp4' : '/video/hero-v2.mp4');
  }, []);

  /**
   * Load the chosen cut and ask it to play.
   *
   * The source is assigned to the element here rather than rendered as a
   * <source> child. A media element runs its resource selection algorithm
   * when it is inserted; a <source> appended afterwards only starts a load if
   * the browser re-runs that algorithm, which Chrome does and Safari does
   * not. Because orientation is unknown until this effect runs, the server
   * rendered a <video> with no source at all, so on an iPhone the element
   * sat empty and the hero never moved. Setting `src` invokes resource
   * selection on every browser, exactly once, so this is both the fix and
   * still a single download.
   *
   * Autoplay is a request, not a guarantee. iOS grants it only for muted,
   * inline, silent video, and refuses outright in Low Power Mode whatever
   * the markup says. So: set the conditions as properties, not just
   * attributes, retry as data arrives, and fall back to the reader's first
   * touch anywhere on the page.
   */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;

    /* iOS checks the properties, and React sets `muted` as a property rather
       than a parsed attribute, so state it plainly on the element. */
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;

    if (v.getAttribute('src') !== src) {
      v.setAttribute('src', src);
      v.load();
    }

    let cancelled = false;
    let settled = false;

    const attempt = () => {
      if (cancelled || settled) return;
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.then(() => {
          settled = true;
        }).catch(() => {
          /* Refused for now. The still is already painted, so the hero is
             never blank; try again when more data arrives, or on a touch. */
        });
      }
    };

    attempt();
    v.addEventListener('loadedmetadata', attempt);
    v.addEventListener('loadeddata', attempt);
    v.addEventListener('canplay', attempt);

    /* Low Power Mode, and Safari's stricter moments, refuse autoplay until a
       gesture. The reader's first touch or click anywhere starts it, once. */
    const onGesture = () => {
      attempt();
      if (!v.paused) removeGesture();
    };
    const removeGesture = () => {
      document.removeEventListener('touchstart', onGesture);
      document.removeEventListener('pointerdown', onGesture);
      document.removeEventListener('click', onGesture);
    };
    document.addEventListener('touchstart', onGesture, { passive: true });
    document.addEventListener('pointerdown', onGesture, { passive: true });
    document.addEventListener('click', onGesture);

    /* A tab restored from the background pauses; resume when it returns. */
    const onVisible = () => {
      if (document.visibilityState === 'visible' && v.paused) {
        settled = false;
        attempt();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      v.removeEventListener('loadedmetadata', attempt);
      v.removeEventListener('loadeddata', attempt);
      v.removeEventListener('canplay', attempt);
      document.removeEventListener('visibilitychange', onVisible);
      removeGesture();
    };
  }, [src]);

  return (
    <section
      id="top"
      data-hero
      data-parallax-section
      className="relative min-h-[100svh] w-full overflow-hidden"
    >
      {/* Full bleed footage.
          The still is painted by CSS on this wrapper, chosen by media query.
          Orientation is only known after mount, so a server-rendered poster
          attribute meant the phone fetched the landscape still and then the
          portrait one as well: 210 KB where 113 KB was needed. A <picture>
          was tried instead and was worse, because Chromium's preload scanner
          fetches the <img src> fallback alongside the matching <source>.
          One media query, one file, painted before any JavaScript runs. */}
      <div className="hero-media hero-still absolute inset-0" data-parallax="0.12">
        <video
          ref={videoRef}
          /* The subject sits high in frame in both cuts, so the crop is
             anchored above centre. Dead centre decapitates him. */
          className="relative h-full w-full object-cover"
          /* Both cuts are now framed at their real aspect, so the crop only
             needs a nudge upward rather than a rescue. */
          style={{ objectPosition: portrait ? '52% 18%' : '50% 38%' }}
          autoPlay
          muted
          loop
          playsInline
          /* Safe to leave at auto: with no src there is nothing to preload,
             and once the effect assigns one the file should load at once.
             "none" actively discouraged iOS from ever starting. */
          preload="auto"
          /* Set only once orientation is known, and always to the file the
             CSS above has already fetched, so this costs no extra request
             and gives the video element something to paint immediately. */
          poster={
            src
              ? portrait
                ? '/img/hero-poster-mobile-v2.jpg'
                : '/img/hero-poster-v2.jpg'
              : undefined
          }
          disablePictureInPicture
          aria-label="Nana Oyeadieyie Barima Essoun I walking in adinkra regalia beneath the royal umbrella"
        />
      </div>

      {/* Flat scrims, no decorative background gradient */}
      <div className="absolute inset-0 bg-black/60 sm:bg-black/45" aria-hidden="true" />
      {/* Legibility scrim on the reading side, so the copy never sits on a face */}
      <div
        className="absolute inset-y-0 left-0 hidden w-[62%] bg-ebony/80 lg:block"
        style={{
          maskImage: 'linear-gradient(to right, #000 32%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, #000 32%, transparent)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[62%] bg-ebony/90 sm:h-[45%] sm:bg-ebony/85"
        style={{ maskImage: 'linear-gradient(to top, #000 20%, transparent)', WebkitMaskImage: 'linear-gradient(to top, #000 20%, transparent)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-300 pb-400 pt-800 sm:px-500 sm:pb-500 sm:pt-900 lg:px-800">
        <div className="mx-auto w-full max-w-[1280px]">
          {/* Eyebrow */}
          <div
            data-hero-item
            data-hero-eyebrow
            className="flex items-center gap-100"
          >
            <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              {HERO.eyebrow}
            </p>
          </div>

          {/* B5: max width 680px, meaningful line breaks, cream to muted gradient */}
          <h1
            data-hero-item
            data-hero-headline
            className="mt-200 max-w-measure font-display text-4xl font-600 leading-[1.06] sm:text-6xl lg:text-7xl"
          >
            {HERO.headline.map((line) => (
              <span key={line} className="hero-line-mask">
                <span className="hero-line heading-gradient">{line}</span>
              </span>
            ))}
          </h1>

          <p
            data-hero-item
            data-hero-sub
            className="mt-300 max-w-measure text-base leading-relaxed text-ivory/75 sm:text-lg"
          >
            {lens === 'regal'
              ? HERO.sub
              : 'Nana Oyeadieyie Barima Essoun I runs DeoMetals Ltd, a licensed precious metals business, and holds the Nkosuo stool of Adrobaa. The commercial record and the development record are the same record.'}
          </p>

          {/* One primary action. B2 button padding, B1 button type. */}
          <div
            data-hero-item
            data-hero-cta
            className="mt-400 flex w-full flex-col gap-100 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-200"
          >
            <a
              href={HERO.primary.href}
              data-magnetic="0.24"
              className="group inline-flex min-h-[52px] w-full items-center justify-center gap-75 rounded-xl bg-gold px-200 py-100 text-base font-semibold text-ebony transition-all duration-700 ease-fluid hover:bg-[#e6c34d] active:scale-[0.98] sm:w-auto sm:justify-start"
            >
              {HERO.primary.label}
              <ArrowRight
                weight="bold"
                className="h-[16px] w-[16px] transition-transform duration-700 ease-fluid group-hover:translate-x-[3px]"
                aria-hidden="true"
              />
            </a>
            <a
              href={HERO.secondary.href}
              data-magnetic="0.16"
              className="group inline-flex min-h-[52px] w-full items-center justify-center gap-75 rounded-xl border border-white/20 px-200 py-100 text-base font-semibold text-ivory backdrop-blur-sm transition-all duration-700 ease-fluid hover:border-gold hover:text-gold active:scale-[0.98] sm:w-auto sm:justify-start"
            >
              {HERO.secondary.label}
              <ArrowDownRight
                weight="bold"
                className="h-[16px] w-[16px] transition-transform duration-700 ease-fluid group-hover:translate-y-[2px]"
                aria-hidden="true"
              />
            </a>
          </div>

          {/* Proof beside the claim */}
          <ul
            data-hero-item
            data-hero-proof
            className="mt-400 flex flex-wrap items-center gap-x-300 gap-y-75 border-t border-white/10 pt-200 sm:mt-500 sm:pt-300"
          >
            {HERO.proof.map((item) => (
              <li key={item} className="flex items-center gap-75 text-xs text-ivory/55">
                <span className="h-[3px] w-[3px] rounded-full bg-gold" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <p className="sr-only">
            {CHIEF.fullName}, {CHIEF.title}, {CHIEF.place}, {CHIEF.region}.
          </p>
        </div>
      </div>
    </section>
  );
}
