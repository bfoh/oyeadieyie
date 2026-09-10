'use client';

import { useEffect, useRef } from 'react';
import { ArrowDownRight, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { HERO, CHIEF } from '@/lib/content';

/* Versioned so the immutable cache headers cannot serve the old encode. */
const VIDEO_ID = 'hero-video';
const SRC_DESKTOP = '/video/hero-v4.mp4';
const SRC_MOBILE = '/video/hero-mobile-v4.mp4';
const POSTER_DESKTOP = '/img/hero-poster-v2.jpg';
const POSTER_MOBILE = '/img/hero-poster-mobile-v2.jpg';

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  /**
   * Keep the hero moving; do not start it.
   *
   * The inline script beneath the element has already chosen the cut and set
   * the source, during HTML parse, which is what finally made an iPhone
   * autoplay it: Safari grants autoplay to a muted inline video that has a
   * source when the parser reaches it, and refuses a play() call made later
   * from a hydration effect. Nothing here touches the source.
   *
   * What is left is recovery. Autoplay is refused outright in Low Power Mode
   * whatever the markup says, and a tab restored from the background comes
   * back paused. So retry as data arrives, on the reader's first touch, and
   * when the tab becomes visible again.
   */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let cancelled = false;

    const attempt = () => {
      if (cancelled || !v.paused) return;
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          /* Refused for now. The still is already painted, so the hero is
             never blank; try again on the next signal. */
        });
      }
    };

    attempt();
    v.addEventListener('loadeddata', attempt);
    v.addEventListener('canplay', attempt);

    const onGesture = () => {
      attempt();
      if (!v.paused) removeGesture();
    };
    const removeGesture = () => {
      document.removeEventListener('touchstart', onGesture);
      document.removeEventListener('pointerdown', onGesture);
    };
    document.addEventListener('touchstart', onGesture, { passive: true });
    document.addEventListener('pointerdown', onGesture, { passive: true });

    const onVisible = () => {
      if (document.visibilityState === 'visible') attempt();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      v.removeEventListener('loadeddata', attempt);
      v.removeEventListener('canplay', attempt);
      document.removeEventListener('visibilitychange', onVisible);
      removeGesture();
    };
  }, []);

  return (
    <section
      id="top"
      data-hero
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
      <div className="hero-still absolute inset-0">
        <video
          id={VIDEO_ID}
          ref={videoRef}
          className="hero-video relative h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          /* Old iOS wants the vendor spelling as well, and React will not
             emit an unknown camelCase prop, hence the literal attribute. */
          {...{ 'webkit-playsinline': 'true' }}
          preload="auto"
          disablePictureInPicture
          aria-label="Nana Oyeadieyie Barima Essoun I walking in adinkra regalia beneath the royal umbrella"
        />
        {/* Source the video DURING PARSE, not after hydration.
            This is the whole reason the hero would not start on an iPhone.
            The orientation is only knowable in the browser, so React could
            not put a src in the server-rendered HTML, and by the time the
            effect ran and called play(), Safari had already decided the page
            was past its autoplay window and refused. Setting src here, in a
            blocking script directly beneath the element, means the video has
            its source before the parser moves on and Safari's own autoplay
            handles it — no play() call required, and no user gesture. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var v=document.getElementById(${JSON.stringify(VIDEO_ID)});if(!v)return;var p=window.matchMedia('(max-aspect-ratio: 1/1)').matches;v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('poster',p?${JSON.stringify(POSTER_MOBILE)}:${JSON.stringify(POSTER_DESKTOP)});v.src=p?${JSON.stringify(SRC_MOBILE)}:${JSON.stringify(SRC_DESKTOP)};v.style.objectPosition=p?'52% 18%':'50% 38%';var t=v.play();if(t&&t.catch)t.catch(function(){});}catch(e){}})();`,
          }}
        />
      </div>

      {/* Legibility scrims.
          These were mask-image on a filled div, which is the expensive way to
          draw a fade: a mask makes the compositor re-composite the masked
          area against everything beneath it, and beneath these is a playing
          video. A gradient background is the same picture and costs the
          compositor nothing, which is most of why the hero used to stutter. */}
      <div className="absolute inset-0 bg-black/60 sm:bg-black/45" aria-hidden="true" />
      <div
        className="absolute inset-y-0 left-0 hidden w-[62%] lg:block"
        style={{
          background:
            'linear-gradient(to right, rgba(17,17,17,0.8) 0%, rgba(17,17,17,0.8) 32%, rgba(17,17,17,0) 100%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[62%] sm:h-[45%]"
        style={{
          background:
            'linear-gradient(to top, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.9) 20%, rgba(17,17,17,0) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-300 pb-400 pt-800 sm:px-500 sm:pb-500 sm:pt-900 lg:px-800">
        <div className="mx-auto w-full max-w-[1280px]">
          {/* The title block, as the office set it out: the name, the office
              he holds in full, and the four words under it.

              The name is set in the wordmark treatment — Roman capitals,
              light, widely letterspaced. Caps set tight read as a shout; caps
              set open read as an inscription, and this is an inscription. */}
          <div data-hero-item data-hero-eyebrow>
            <p className="font-wordmark text-base font-600 uppercase leading-tight tracking-[0.15em] text-ivory sm:text-xl sm:tracking-[0.18em]">
              {CHIEF.fullName}
            </p>
            <p className="mt-75 text-sm text-gold sm:text-base">{CHIEF.title}</p>

            {/* Four words, and four words is what a screen reader hears: the
                separators are drawn between the items rather than typed into
                them, so nothing reads out a row of dots. */}
            <ul className="mt-200 flex flex-wrap items-center gap-y-50">
              {CHIEF.strapline.map((word, i) => (
                <li
                  key={word}
                  className="flex items-center text-sm italic text-ivory/70 sm:text-base"
                >
                  {/* The separator sits in the gap, not against the word
                      before it: it is drawn as the first child of the item
                      that follows, with equal space either side of it. */}
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="mx-200 h-[3px] w-[3px] shrink-0 rounded-full bg-gold sm:mx-300"
                    />
                  )}
                  {word}
                </li>
              ))}
            </ul>
          </div>

          {/* B5: max width 680px, meaningful line breaks, cream to muted gradient */}
          <h1
            data-hero-item
            data-hero-headline
            className="mt-300 max-w-measure font-display text-4xl font-600 leading-[1.06] sm:text-6xl lg:text-7xl"
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
            {HERO.sub}
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

          {/* The place, which the title block does not carry and the headline
              should not. Everything else it used to duplicate is now printed
              above, where a sighted reader sees it too. */}
          <p className="sr-only">
            {CHIEF.place}, {CHIEF.region}.
          </p>
        </div>
      </div>
    </section>
  );
}
