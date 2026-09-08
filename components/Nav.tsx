'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV_LINKS, CHIEF, sectionHref } from '@/lib/content';
import { useLens } from './LensContext';

/* Royal crest mark. Adinkra derived lozenge over the stool line. */
function Crest({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.5 20 12l-8 9.5L4 12 12 2.5Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 6.8 16.6 12 12 17.2 7.4 12 12 6.8Z" stroke="currentColor" strokeWidth="1.1" />
      <path d="M9.4 12h5.2" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  /* `open` drives behaviour, `mounted` drives presence. They separate so the
     closing transition has something to animate: with the `hidden` attribute
     applied the instant `open` flips, the fade out never played. */
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { lens, setLens } = useLens();
  const pathname = usePathname();
  /* Nothing on a sub page responds to the lens, so showing the control there
     would be a button that genuinely does nothing. */
  const showLens = pathname === '/';

  /**
   * Has the page moved off the top?
   *
   * A one pixel sentinel at the document top, watched by IntersectionObserver.
   * A scroll listener would fire on every frame and fight Lenis for the main
   * thread; this fires twice in the life of the page.
   */
  useEffect(() => {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    /* Tall enough to still be intersecting at scroll zero. A 1px sentinel
       with a negative rootMargin reports "scrolled" the moment the page
       loads, which is exactly the bug this replaced. */
    sentinel.style.cssText =
      'position:absolute;top:0;left:0;width:1px;height:6px;pointer-events:none;';
    document.body.prepend(sentinel);

    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(sentinel);

    return () => {
      io.disconnect();
      sentinel.remove();
    };
  }, []);

  /**
   * Current section indicator.
   *
   * Uses a thin trigger band with threshold 0, NOT an area ratio. A ratio is
   * measured against the section's own height, so with a shrunken root a tall
   * section can never reach it: Adrobaa and Projects capped at 0.16 and never
   * highlighted at all. Whichever section crosses the band is the active one,
   * regardless of how tall it is.
   */
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    const order = new Map(sections.map((el, i) => [el.id, i]));
    const inBand = new Set<string>();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) inBand.add(id);
          else inBand.delete(id);
        });

        if (!inBand.size) return;
        /* Sections are contiguous, so two can share the band on a boundary.
           Take the one further down the page: that is the one being entered. */
        const next = [...inBand].sort(
          (a, b) => (order.get(b) ?? 0) - (order.get(a) ?? 0),
        )[0];
        setActive(next);
      },
      { threshold: 0, rootMargin: '-42% 0px -52% 0px' },
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  /* Keep the overlay in the tree until its transition has finished. */
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!mounted) return;
    const t = window.setTimeout(() => setMounted(false), 700);
    return () => window.clearTimeout(t);
  }, [open, mounted]);

  /**
   * Modal behaviour while the overlay is open.
   *
   * Focus moves in, is kept in, and is handed back to the button that opened
   * it. Without this a keyboard or screen reader user tabbed straight through
   * the overlay and on into the page behind it, which is still there under a
   * full screen backdrop.
   *
   * Lenis is stopped as well as the body overflow: Lenis drives its own RAF
   * loop, so an overflow lock alone does not necessarily hold it.
   */
  useEffect(() => {
    if (!open) return;

    const opener = toggleRef.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('nav-open');
    /* MotionProvider owns Lenis; it listens for these rather than the nav
       reaching across into the motion system. */
    window.dispatchEvent(new CustomEvent('nav:lock'));

    const focusables = () =>
      Array.from(
        overlayRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    /* Next frame: the overlay has to be visible before it can take focus. */
    const raf = requestAnimationFrame(() => focusables()[0]?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;

      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (e.shiftKey && (activeEl === first || !overlayRef.current?.contains(activeEl))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prev;
      document.documentElement.classList.remove('nav-open');
      window.dispatchEvent(new CustomEvent('nav:unlock'));
      window.removeEventListener('keydown', onKey);
      /* Only reclaim focus if it is still inside the overlay: on a route
         change the browser has already moved it somewhere better. */
      if (overlayRef.current?.contains(document.activeElement)) opener?.focus();
    };
  }, [open]);

  return (
    <>
      {/* Floating glass pill, detached from the top edge */}
      <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
        <nav
          aria-label="Primary"
          className={[
            'pointer-events-auto mt-300 mx-auto w-max max-w-[calc(100vw-24px)] rounded-full transition-all duration-700 ease-fluid',
            /* Desktop keeps the glass pill at all times. On a phone the
               chrome dissolves the moment the page moves, so the bar stops
               sitting on top of the content. The controls keep their own
               surfaces so they stay legible and tappable over any image. */
            scrolled && !open
              ? 'border border-transparent bg-transparent shadow-none backdrop-blur-none sm:border-white/10 sm:bg-black/60 sm:shadow-[0_8px_40px_rgba(0,0,0,0.55)] sm:backdrop-blur-md'
              : 'border border-white/10 bg-black/60 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-md',
          ].join(' ')}
        >
          <div className="flex items-center gap-200 py-75 pl-200 pr-75">
            <a
              href="/"
              className={[
                'flex min-h-[44px] items-center gap-75 rounded-full px-75 py-50 text-gold transition-all duration-700 ease-fluid hover:bg-white/5 active:scale-[0.98]',
                scrolled && !open ? 'bg-ebony/70 backdrop-blur-md sm:bg-transparent sm:backdrop-blur-none' : '',
              ].join(' ')}
            >
              <Crest className="h-[22px] w-[22px] shrink-0" />
              <span className="sr-only">{CHIEF.fullName}, home</span>
              {/* The full name needs room the phone pill does not have beside
                  the action and the menu, so the wordmark steps down to the
                  correct later reference form. Both are his name, neither is
                  an abbreviation invented for layout. */}
              {/* Set in inscriptional capitals. Cinzel is drawn for caps, so
                  the name reads as a cut inscription rather than as shouting,
                  and the tracking is opened slightly because capitals set
                  tight close up on one another. */}
              <span
                aria-hidden="true"
                /* nowrap: a wordmark that breaks across two lines stops
                   reading as a mark. The phone gets the shorter form and a
                   smaller size so it stays on one line inside the pill. */
                className="whitespace-nowrap font-wordmark text-[12px] font-600 uppercase leading-none tracking-[0.16em] text-ivory sm:text-[13.5px] sm:tracking-[0.18em] lg:text-[15px] lg:tracking-[0.15em]"
              >
                <span className="lg:hidden">Nana Oyeadieyie</span>
                <span className="hidden lg:inline">{CHIEF.fullName}</span>
              </span>
            </a>

            <span className="hidden h-[18px] w-px bg-white/15 lg:block" aria-hidden="true" />

            <ul className="hidden items-center gap-25 lg:flex">
              {NAV_LINKS.map((link) => {
                const isActive = active === link.id;
                return (
                  <li key={link.id}>
                    <a
                      href={sectionHref(link.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={[
                        'flex min-h-[44px] items-center rounded-full px-100 py-50 text-sm font-medium transition-all duration-700 ease-fluid active:scale-[0.98]',
                        isActive
                          ? 'bg-white/10 text-gold'
                          : 'text-ivory/70 hover:bg-white/5 hover:text-ivory',
                      ].join(' ')}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Lens toggle */}
            <div
              role="group"
              aria-label="Viewing lens"
              className={[
                'items-center rounded-full border border-white/10 bg-white/[0.04] p-25',
                showLens ? 'hidden md:flex' : 'hidden',
              ].join(' ')}
            >
              {(
                [
                  { key: 'regal', label: 'Regal' },
                  { key: 'modern', label: 'Modern' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setLens(opt.key)}
                  aria-pressed={lens === opt.key}
                  className={[
                    'rounded-full px-100 py-50 text-xs font-semibold transition-all duration-700 ease-fluid active:scale-[0.98]',
                    lens === opt.key
                      ? 'bg-gold text-ebony'
                      : 'text-ivory/60 hover:text-ivory',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Full label from sm up */}
            <a
              href="/#engage"
              className="hidden min-h-[44px] items-center rounded-full bg-gold px-100 py-75 text-sm font-semibold text-ebony transition-all duration-700 ease-fluid hover:bg-[#e6c34d] active:scale-[0.98] sm:inline-flex"
            >
              Request an appearance
            </a>
            {/* Compact on a phone, so the primary action is never buried
                inside the menu overlay */}
            <a
              href="/#engage"
              className="inline-flex min-h-[44px] items-center rounded-full bg-gold px-100 py-50 text-sm font-semibold text-ebony transition-all duration-700 ease-fluid active:scale-[0.98] sm:hidden"
            >
              Request
            </a>

            {/* Hamburger that morphs into an X */}
            <button
              type="button"
              ref={toggleRef}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="nav-overlay"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className={[
                'relative h-[44px] w-[44px] shrink-0 rounded-full border transition-all duration-700 ease-fluid hover:bg-white/10 active:scale-[0.96] lg:hidden',
                scrolled && !open
                  ? 'border-white/15 bg-ebony/70 backdrop-blur-md sm:border-white/10 sm:bg-white/[0.04] sm:backdrop-blur-none'
                  : 'border-white/10 bg-white/[0.04]',
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'absolute left-1/2 h-[1.5px] w-[16px] -translate-x-1/2 bg-ivory transition-all duration-700 ease-fluid',
                  open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[15px] rotate-0',
                ].join(' ')}
              />
              <span
                aria-hidden="true"
                className={[
                  'absolute left-1/2 h-[1.5px] w-[16px] -translate-x-1/2 bg-ivory transition-all duration-700 ease-fluid',
                  open
                    ? 'top-1/2 -translate-y-1/2 -rotate-45'
                    : 'top-[23px] rotate-0',
                ].join(' ')}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Screen filling overlay with staggered mask reveal */}
      <div
        id="nav-overlay"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!mounted}
        className={[
          'fixed inset-0 z-40 bg-ebony/95 backdrop-blur-md transition-all duration-700 ease-fluid',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      >
        <div className="flex h-full flex-col justify-center px-300 pb-[env(safe-area-inset-bottom)] sm:px-400">
          <ul className="mx-auto w-full max-w-measure">
            {NAV_LINKS.map((link, i) => (
              <li key={link.id} className="overflow-hidden">
                <a
                  href={sectionHref(link.id)}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: `${open ? 80 + i * 50 : 0}ms` }}
                  className={[
                    'flex items-baseline justify-between gap-200 border-b border-white/10 py-200 font-display text-4xl text-ivory transition-all duration-700 ease-fluid hover:text-gold active:text-gold sm:py-300',
                    open
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-12 opacity-0',
                  ].join(' ')}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className="font-sans text-xs tracking-[0.2em] text-gold/70"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div
            style={{ transitionDelay: `${open ? 80 + NAV_LINKS.length * 50 : 0}ms` }}
            className={[
              'mx-auto mt-500 w-full max-w-measure transition-all duration-700 ease-fluid',
              open ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0',
            ].join(' ')}
          >
            {/* The lens toggle belongs on every screen size, not desktop alone */}
            <div className={showLens ? 'md:hidden' : 'hidden'}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ivory/50">
                Viewing lens
              </p>
              <div
                role="group"
                aria-label="Viewing lens"
                className="mt-100 grid grid-cols-2 gap-50 rounded-2xl border border-white/10 bg-white/[0.04] p-50"
              >
                {(
                  [
                    { key: 'regal', label: 'Regal tradition' },
                    { key: 'modern', label: 'Modern vision' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setLens(opt.key)}
                    aria-pressed={lens === opt.key}
                    /* nested radius: outer 16px minus the 4px gap = 12px */
                    className={[
                      'rounded-xl px-100 py-75 text-sm font-semibold transition-all duration-700 ease-fluid active:scale-[0.98]',
                      lens === opt.key
                        ? 'bg-gold text-ebony'
                        : 'text-ivory/60 hover:text-ivory',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <a
              href="/#engage"
              onClick={() => setOpen(false)}
              className="mt-300 block rounded-xl bg-gold px-200 py-100 text-center text-base font-semibold text-ebony transition-all duration-700 ease-fluid hover:bg-[#e6c34d] active:scale-[0.98] md:mt-0"
            >
              Request an appearance
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
