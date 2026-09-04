'use client';

import { useEffect, useState } from 'react';
import { GLYPHS } from './adinkraGlyphs';

/**
 * The cloth the whole site is printed on.
 *
 * A chief's adinkra cloth is stamped edge to edge, so this is one fixed layer
 * behind every section rather than a decoration inside a few of them.
 *
 * It renders only as many stamps as the viewport actually needs. A fixed count
 * put 420 inline SVGs on a phone, most of them below the fold: dead DOM that
 * still costs memory and style recalculation on the devices least able to
 * afford it. Decorative, so it is hidden from assistive tech and never takes
 * a pointer event.
 */
const KEYS = Object.keys(GLYPHS);

/* Hand set order. Random would differ between server and client. */
const ORDER = [
  0, 3, 6, 1, 8, 4, 9, 2, 5, 7,
  5, 9, 2, 7, 0, 6, 3, 8, 1, 4,
  8, 1, 7, 4, 9, 2, 5, 0, 6, 3,
  2, 6, 0, 9, 3, 7, 1, 4, 8, 5,
];

export function AdinkraCloth({ opacity = 0.04 }: { opacity?: number }) {
  const [grid, setGrid] = useState<{ cell: number; count: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      /* Larger stamps on a narrow screen. A fine texture sized for a desktop
         just turns to noise at phone width. */
      const cell = w < 640 ? 96 : w < 1024 ? 88 : 84;
      const gap = Math.round(cell * 0.62);
      const pitch = cell + gap;
      const cols = Math.ceil((w * 1.14) / pitch);
      const rows = Math.ceil((window.innerHeight * 1.3) / pitch);
      setGrid({ cell, count: Math.min(cols * rows, 420) });
    };
    measure();

    let t: number;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(measure, 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (!grid) return null;

  return (
    <div className="cloth-layer" aria-hidden="true" data-parallax="0.06">
      <div
        style={{
          opacity,
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${grid.cell}px, 1fr))`,
          gap: `${Math.round(grid.cell * 0.62)}px`,
          /* Rows must be explicit. With auto rows the stamps have no height
             to fill and the layer collapses to nothing. */
          gridAutoRows: `${grid.cell}px`,
          alignContent: 'start',
          width: '100%',
          transition: 'opacity 900ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {Array.from({ length: grid.count }).map((_, i) => {
          const g = GLYPHS[KEYS[ORDER[i % ORDER.length] % KEYS.length]];
          if (!g) return null;
          const row = Math.floor(i / 6);
          return (
            <svg
              key={i}
              viewBox={g.viewBox}
              className="h-full w-full text-gold"
              style={{
                transform: row % 2 ? `translateX(${grid.cell * 0.32}px)` : undefined,
              }}
            >
              {g.el}
            </svg>
          );
        })}
      </div>
    </div>
  );
}
