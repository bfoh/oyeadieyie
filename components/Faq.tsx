'use client';

import { useState } from 'react';
import { Plus } from '@phosphor-icons/react/dist/ssr';
import { FAQ } from '@/lib/content';
import { Reveal } from './Reveal';

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      data-choreo className="relative border-t border-ebony-line bg-transparent px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <Reveal>
          <div className="flex items-center gap-100">
            <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
            <p data-choreo-label className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Questions
            </p>
          </div>
          <h2 data-choreo-heading className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl">
            Before you write to the office
          </h2>
        </Reveal>

        <ul data-reveal-group className="mx-auto mt-500 max-w-[900px]">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal as="li" item key={item.q} delay={i * 40}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-start justify-between gap-200 border-b border-ebony-line py-300 text-left transition-colors duration-700 ease-fluid hover:text-gold active:scale-[0.995]"
                  >
                    <span className="font-display text-xl font-600 leading-snug text-ivory sm:text-2xl">
                      {item.q}
                    </span>
                    <Plus
                      size={20}
                      weight="light"
                      aria-hidden="true"
                      className={[
                        'mt-[4px] shrink-0 text-gold transition-transform duration-700 ease-fluid',
                        isOpen ? 'rotate-45' : 'rotate-0',
                      ].join(' ')}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  className={[
                    'grid overflow-hidden transition-all duration-700 ease-fluid',
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0',
                  ].join(' ')}
                >
                  <div className="min-h-0">
                    <p className="max-w-measure py-300 text-base leading-relaxed text-ivory/65">
                      {item.a}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
