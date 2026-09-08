import Image from 'next/image';
import { PROVENANCE_LABEL } from '@/lib/content';
import type { StoredProject } from '@/lib/store';
import { Reveal } from './Reveal';

/**
 * The work in sequence.
 *
 * The section above this is headed "Renders become buildings", and until now
 * it showed the render alone: the photographs of the foundation, the footprint
 * and the blockwork were sitting unreferenced in public/img while three cards
 * carried generated illustrations instead.
 *
 * Each frame is captioned with what is visible in it and nothing more, and
 * labelled with its provenance, so a render is never mistaken for a building
 * that stands.
 */
export function ProjectProgress({ projects }: { projects: StoredProject[] }) {
  const sequences = projects.filter((p) => p.progress?.length);
  if (!sequences.length) return null;

  return (
    <div className="mt-600 grid gap-400">
      {sequences.map((project, s) => (
        /* min-w-0: a grid item defaults to min-width:auto, so without it the
           row refuses to shrink below the width of the scrolling strip inside
           it, and the whole page scrolls sideways. */
        <Reveal key={project.id} delay={s * 80} className="min-w-0">
          <figure className="min-w-0 rounded-2xl border border-ebony-line bg-ebony p-300 sm:p-400">
            <figcaption className="flex flex-wrap items-baseline justify-between gap-100">
              <h3 className="font-display text-2xl font-600 text-ivory">
                {project.title}
              </h3>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                {project.status}
              </span>
            </figcaption>

            {/* Scrolls rather than shrinks: four frames squeezed into a phone
                width would show nothing of the work in any of them. */}
            {/* Column count follows the sequence length, so a three frame
                row fills its width instead of leaving a gap where a fourth
                photograph would be. */}
            <ol
              className={[
                '-mx-300 mt-300 flex snap-x snap-mandatory gap-200 overflow-x-auto px-300 pb-100 [scrollbar-width:thin] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0',
                project.progress!.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4',
              ].join(' ')}
            >
              {project.progress!.map((frame, i) => {
                const label = PROVENANCE_LABEL[frame.provenance];
                return (
                  <li
                    key={frame.src}
                    className="w-[78vw] shrink-0 snap-start sm:w-auto"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-ebony-line bg-ebony-card">
                      <Image
                        src={frame.src}
                        alt={frame.alt}
                        fill
                        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 22vw"
                        className="object-cover"
                      />
                      {label && (
                        <span className="absolute bottom-75 left-75 rounded-full bg-ebony/85 px-100 py-25 text-xs font-medium text-ivory/80 backdrop-blur-sm">
                          {label}
                        </span>
                      )}
                    </div>
                    <p className="mt-100 flex items-baseline gap-75 text-sm text-ivory/65">
                      <span
                        aria-hidden="true"
                        className="font-display text-xs text-gold"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {frame.caption}
                    </p>
                  </li>
                );
              })}
            </ol>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
