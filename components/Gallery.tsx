'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { X, CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';
import type { GalleryImage } from '@/lib/store';
import { HOME_LIMITS } from '@/lib/limits';
import { Section, SectionHead } from './Section';
import { Reveal } from './Reveal';

/**
 * Gallery.
 *
 * These photographs used to hang off the bottom of the Adrobaa section, under
 * a heading that arrived without warning. As a chapter of their own they get
 * the one thing a grid of thumbnails always needed and never had: a way to
 * look at the picture.
 *
 * The viewer is modal, and modal here means what it means in the nav overlay:
 * focus moves in, is kept in, and is handed back to the tile that opened it.
 * Lenis is stopped through the same `nav:lock` / `nav:unlock` events rather
 * than by reaching into the motion system, so the page behind cannot scroll
 * under the overlay.
 */
export function Gallery({ images }: { images: GalleryImage[] }) {
  const shown = images.slice(0, HOME_LIMITS.gallery);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpenAt(null), []);

  const step = useCallback(
    (delta: number) =>
      setOpenAt((i) =>
        i === null ? null : (i + delta + shown.length) % shown.length,
      ),
    [shown.length],
  );

  useEffect(() => {
    if (openAt === null) return;

    const opener = openerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('nav:lock'));

    const focusables = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    /* Next frame: the dialog has to be painted before it can take focus. */
    const raf = requestAnimationFrame(() => focusables()[0]?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
        return;
      }
      if (e.key !== 'Tab') return;

      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      window.dispatchEvent(new CustomEvent('nav:unlock'));
      opener?.focus();
    };
    /* `close` and `step` are stable; the effect runs on open and close only,
       so moving between photographs does not tear the trap down and rebuild
       it — which would steal focus back to the close button on every arrow
       press. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAt === null]);

  if (!shown.length) return null;

  const active = openAt === null ? null : shown[openAt];

  return (
    <Section id="gallery" ground="deep">
      <SectionHead
        id="gallery"
        lead="The court in session, the durbar ground, and the town. Choose a photograph to see it whole."
      />

      <ul
        data-reveal-group
        className="mt-600 grid grid-cols-2 gap-200 md:grid-cols-3"
      >
        {shown.map((shot, i) => (
          <Reveal as="li" item key={shot.id} delay={i * 60}>
            <button
              type="button"
              onClick={(e) => {
                openerRef.current = e.currentTarget;
                setOpenAt(i);
              }}
              className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl border border-ebony-line bg-ebony-card transition-colors duration-700 ease-fluid hover:border-gold-dim"
            >
              <Image
                src={shot.url}
                alt={shot.alt}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 50vw, 30vw"
                className="object-cover transition-transform duration-[1200ms] ease-fluid group-hover:scale-[1.05]"
              />
              <span className="sr-only">Open photograph</span>
            </button>
          </Reveal>
        ))}
      </ul>

      {active && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          className="fixed inset-0 z-[80] flex flex-col bg-ebony/95 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-300 py-200 sm:px-500">
            <p className="text-sm text-ivory/60">
              {openAt! + 1} of {shown.length}
            </p>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-ebony-line text-ivory transition-colors duration-700 ease-fluid hover:border-gold hover:text-gold"
            >
              <X size={20} weight="bold" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="relative flex-1 px-300 pb-200 sm:px-500">
            <Image
              key={active.id}
              src={active.url}
              alt={active.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <div className="flex items-center justify-between gap-200 px-300 pb-400 sm:px-500">
            <button
              type="button"
              onClick={() => step(-1)}
              className="inline-flex h-[44px] min-w-[44px] items-center justify-center gap-75 rounded-xl border border-ebony-line px-200 text-sm font-semibold text-ivory transition-colors duration-700 ease-fluid hover:border-gold hover:text-gold"
            >
              <CaretLeft size={16} weight="bold" aria-hidden="true" />
              Previous
            </button>
            <p className="min-w-0 flex-1 truncate text-center text-sm text-ivory/60">
              {active.alt}
            </p>
            <button
              type="button"
              onClick={() => step(1)}
              className="inline-flex h-[44px] min-w-[44px] items-center justify-center gap-75 rounded-xl border border-ebony-line px-200 text-sm font-semibold text-ivory transition-colors duration-700 ease-fluid hover:border-gold hover:text-gold"
            >
              Next
              <CaretRight size={16} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}
