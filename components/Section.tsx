import { chapter, type SectionId } from '@/lib/content';
import { Reveal } from './Reveal';

/**
 * The chapter frame.
 *
 * The site reads as nine chapters of one record, and this is what marks them.
 * Every section used to open with the same gold rule and the same tracked
 * capitals — a category label above a heading, nine times, which is chrome
 * rather than information. The mark here carries something the reader
 * actually needs: where they are in the nine.
 *
 * The numerals are Roman because the holder of the stool is Essoun the First.
 * The device is his; it would be borrowed anywhere else.
 *
 * Three openings, cycled, so nine sections do not read as one section nine
 * times:
 *
 *   `wide`   numeral, name and lead across the measure
 *   `split`  numeral and name held in a narrow column, content beside them
 *   `quiet`  nothing drawn at all; the content is its own heading
 *
 * A `quiet` section is still named — `<Section>` puts an sr-only heading in
 * place and points `aria-labelledby` at it, so the outline a screen reader
 * builds has all nine chapters in it whether or not they are drawn.
 */

type Ground = 'plain' | 'raised' | 'deep';

const GROUND: Record<Ground, string> = {
  plain: 'bg-transparent',
  raised: 'bg-ebony-raised/45',
  /* The two full-stop moments: the statement and the photographs. */
  deep: 'bg-ebony-raised/80',
};

export function Section({
  id,
  ground = 'plain',
  quiet = false,
  className = '',
  children,
}: {
  id: SectionId;
  ground?: Ground;
  /* True when nothing draws the chapter's name, so it needs an sr-only one. */
  quiet?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { name } = chapter(id);
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      data-choreo
      className={[
        'relative border-t border-ebony-line px-300 py-700 sm:px-500 sm:py-800 lg:px-800',
        GROUND[ground],
        className,
      ].join(' ')}
    >
      {quiet && (
        <h2 id={headingId} className="sr-only">
          {name}
        </h2>
      )}
      <div className="relative mx-auto w-full max-w-[1280px]">{children}</div>
    </section>
  );
}

/**
 * The chapter mark: numeral, hairline, name.
 *
 * `note` is a place or a qualifier and sits under the lead, not above the
 * heading. Above the heading it would be the capitals eyebrow again with a
 * different name; below it, it reads as what it is — a caption on the chapter.
 */
export function SectionHead({
  id,
  lead,
  note,
  variant = 'wide',
}: {
  id: SectionId;
  lead?: string;
  note?: string;
  variant?: 'wide' | 'split';
}) {
  const { name, numeral } = chapter(id);
  const headingId = `${id}-heading`;

  const mark = (
    <p
      data-choreo-label
      className="flex items-center gap-100 font-display text-sm font-600 tracking-[0.26em] text-gold"
    >
      <span aria-hidden="true">{numeral}</span>
      {/* The numeral is decoration to a screen reader; the heading below
          already names the chapter and the nav already counts them. */}
      <span className="sr-only">Chapter {numeral}.</span>
      <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
    </p>
  );

  const heading = (
    <h2
      id={headingId}
      data-choreo-heading
      className="mt-200 font-display text-4xl font-600 leading-[1.06] text-ivory sm:text-5xl"
    >
      {name}
    </h2>
  );

  if (variant === 'split') {
    return (
      <Reveal className="grid gap-300 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-500">
        <div>
          {mark}
          {heading}
        </div>
        <div className="lg:pt-500">
          {lead && (
            <p
              data-choreo-lead
              className="max-w-measure text-base leading-relaxed text-ivory/70 sm:text-lg"
            >
              {lead}
            </p>
          )}
          {note && (
            <p className="mt-200 text-sm text-ivory/50">{note}</p>
          )}
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal>
      {mark}
      <div className="max-w-measure">{heading}</div>
      {lead && (
        <p
          data-choreo-lead
          className="mt-300 max-w-measure text-base leading-relaxed text-ivory/70 sm:text-lg"
        >
          {lead}
        </p>
      )}
      {note && <p className="mt-200 text-sm text-ivory/50">{note}</p>}
    </Reveal>
  );
}
