'use client';

import { useState } from 'react';
import { ADINKRA } from '@/lib/content';
import { GLYPHS } from './adinkraGlyphs';
import { Reveal } from './Reveal';

/**
 * The proverbs behind the symbols.
 *
 * These were previously revealed by `group-hover` and `group-focus-visible`
 * alone. A touch device has no hover, and tapping a button sets `:focus` but
 * not `:focus-visible`, so on a phone the gloss stayed at `max-height: 0` and
 * ten Akan proverbs, the most culturally substantial content on the site,
 * were unreachable. Traffic here is overwhelmingly mobile.
 *
 * So the card is now a real disclosure: it opens on click, reports its state
 * with `aria-expanded`, and hover remains as an enhancement on pointer
 * devices only.
 */
export function Adinkra() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section
      aria-labelledby="adinkra-heading"
      data-choreo className="relative border-t border-ebony-line bg-transparent px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
    >

      <div className="relative mx-auto w-full max-w-[1280px]">
        <Reveal>
          <div className="flex items-center gap-100">
            <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
            <p data-choreo-label className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Adinkra
            </p>
          </div>
          <h2
            id="adinkra-heading"
            data-choreo-heading className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl"
          >
            The symbols on the cloth
          </h2>
          <p data-choreo-lead className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70">
            Akan adinkra carry proverbs. The regalia worn at the durbar is not
            decoration, it is a sentence. Choose a symbol to read it.
          </p>
        </Reveal>

        <ul data-reveal-group className="mt-600 grid grid-cols-2 gap-200 sm:grid-cols-3 lg:grid-cols-5">
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
                    isOpen
                      ? 'border-gold bg-ebony-card'
                      : 'border-ebony-line',
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
      </div>
    </section>
  );
}
