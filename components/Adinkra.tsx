'use client';

import { ADINKRA } from '@/lib/content';
import { GLYPHS } from './adinkraGlyphs';
import { Reveal } from './Reveal';

export function Adinkra() {
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
            decoration, it is a sentence. Hover or focus a symbol to read it.
          </p>
        </Reveal>

        <ul data-reveal-group className="mt-600 grid grid-cols-2 gap-200 sm:grid-cols-3 lg:grid-cols-5">
          {ADINKRA.map((sym, i) => {
            const g = GLYPHS[sym.id];
            return (
              <Reveal as="li" item key={sym.id} delay={i * 50}>
                <button
                  type="button"
                  className="group flex h-full w-full flex-col rounded-2xl border border-ebony-line bg-ebony-raised/80 p-200 text-left backdrop-blur-sm transition-all duration-700 ease-fluid hover:-translate-y-[3px] hover:border-gold hover:bg-ebony-card active:scale-[0.98]"
                  aria-describedby={`gloss-${sym.id}`}
                >
                  <span className="flex h-[64px] items-center">
                    {g && (
                      <svg
                        viewBox={g.viewBox}
                        aria-hidden="true"
                        className="h-[56px] w-[56px] text-gold transition-transform duration-[900ms] ease-fluid group-hover:scale-110 group-focus-visible:scale-110"
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
                  <p
                    id={`gloss-${sym.id}`}
                    className="mt-0 max-h-0 overflow-hidden text-sm leading-relaxed text-ivory/55 opacity-0 transition-all duration-[900ms] ease-fluid group-hover:mt-100 group-hover:max-h-[200px] group-hover:opacity-100 group-focus-visible:mt-100 group-focus-visible:max-h-[200px] group-focus-visible:opacity-100"
                  >
                    {sym.gloss}
                  </p>
                </button>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
