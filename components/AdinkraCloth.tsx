'use client';

import { useEffect, useState } from 'react';
import { GLYPHS } from './adinkraGlyphs';

/**
 * The cloth the whole site is printed on.
 *
 * A chief's adinkra cloth is stamped edge to edge, so this is one fixed layer
 * behind every section rather than a decoration inside a few of them.
 *
 * It is a SINGLE <svg>: the ten stamps are declared once as <symbol>s and
 * placed with <use>. The earlier version rendered one <svg> element per
 * stamp, up to 420 of them, and each root gave the compositor its own paint
 * context. Under the nav's backdrop blur — which has to re-blur whatever
 * moves beneath it every frame — that collapsed scrolling to a few frames a
 * second while the hero video was playing. Same picture, one paint context.
 *
 * Decorative, so it is hidden from assistive tech and never takes a pointer
 * event.
 */
const KEYS = Object.keys(GLYPHS);

/* Hand set order. Random would differ between server and client. */
const ORDER = [
  0, 3, 6, 1, 8, 4, 9, 2, 5, 7,
  5, 9, 2, 7, 0, 6, 3, 8, 1, 4,
  8, 1, 7, 4, 9, 2, 5, 0, 6, 3,
  2, 6, 0, 9, 3, 7, 1, 4, 8, 5,
];

type Grid = { cell: number; cols: number; rows: number; pitch: number; w: number; h: number };

export function AdinkraCloth({ opacity = 0.04 }: { opacity?: number }) {
  const [grid, setGrid] = useState<Grid | null>(null);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      /* Larger stamps on a narrow screen. A fine texture sized for a desktop
         just turns to noise at phone width. */
      const cell = vw < 640 ? 104 : vw < 1024 ? 98 : 94;
      const gap = Math.round(cell * 0.78);
      const pitch = cell + gap;
      /* The layer is inset past the viewport on every side so the parallax
         drift never exposes an edge. */
      const w = vw * 1.14;
      const h = vh * 1.3;
      setGrid({
        cell,
        pitch,
        w,
        h,
        cols: Math.ceil(w / pitch) + 1,
        rows: Math.ceil(h / pitch) + 1,
      });
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

  const stamps: { key: string; id: string; x: number; y: number }[] = [];
  let i = 0;
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const id = KEYS[ORDER[i % ORDER.length] % KEYS.length];
      if (GLYPHS[id]) {
        stamps.push({
          key: `${row}-${col}`,
          id,
          /* Every other row is offset, the way a hand stamped cloth falls. */
          x: col * grid.pitch + (row % 2 ? grid.cell * 0.32 : 0),
          y: row * grid.pitch,
        });
      }
      i++;
    }
  }

  return (
    /* No data-parallax here any more. Six per cent of drift was not
       perceptible, and paying for it meant this fixed, full-viewport layer
       was re-composited on every scroll frame — underneath a backdrop-blurred
       nav, which then had to re-blur moving content continuously. Static, it
       is painted once and never again. */
    <div className="cloth-layer" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${Math.round(grid.w)} ${Math.round(grid.h)}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity, display: 'block' }}
        className="text-gold"
      >
        <defs>
          {KEYS.map((key) => {
            const g = GLYPHS[key];
            if (!g) return null;
            return (
              <symbol key={key} id={`cloth-${key}`} viewBox={g.viewBox}>
                {g.el}
              </symbol>
            );
          })}
        </defs>
        {stamps.map((s) => (
          <use
            key={s.key}
            href={`#cloth-${s.id}`}
            x={s.x}
            y={s.y}
            width={grid.cell}
            height={grid.cell}
          />
        ))}
      </svg>
    </div>
  );
}
