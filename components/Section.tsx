import { chapter, type SectionId } from '@/lib/content';
import { Reveal } from './Reveal';

/**
 * The section frame.
 *
 * Every section used to open with the same gold rule over the same tracked
 * capitals — a category label above a heading, nine times over, which is
 * chrome rather than information.
 *
 * It briefly carried Roman numerals instead, and those were worse. Numbered
 * markers earn their place on a sequence: a stepped process, a timeline, a
 * ranked list. These nine sections are not one. Nobody reads About, then
 * Chieftaincy, then Speeches in order — they arrive from the nav at the one
 * they came for, so a numeral asserts an order the content does not have. The
 * numerals were also hard to read: VI, VII and VIII differ by a stroke, and
 * at small size with open tracking a reader has to count them.
 *
 * What actually fixed the monotony was the three openings below, and they
 * never needed a number. The heading says what the section is; nothing above
 * it has to.
 *
 * Three openings, cycled, so nine sections do not read as one section nine
 * times:
 *
 *   `wide`   hairline, name and lead across the measure
 *   `split`  hairline and name held in a narrow column, content beside them
 *   `quiet`  nothing drawn at all; the content is its own heading
 *
 * A `quiet` section is still named — `<Section>` puts an sr-only heading in
 * place and points `aria-labelledby` at it, so the outline a screen reader
 * builds has all nine sections in it whether or not they are drawn.
 */

type Ground = 'plain' | 'raised' | 'deep';

const GROUND: Record<Ground, string> = {
  plain: 'bg-transparent',
  raised: 'bg-ebony-raised/45',
  /* The two full-stop moments: the statement and the photographs. */
  deep: 'bg-ebony-raised/80',
};

/**
 * The chapter mark, for a page that is not one of the nine.
 *
 * `/media-kit` and the 404 are not sections of the home page, but they belong
 * to the same site: the same gold hairline, the same sentence case, so the
 * site reads as one thing rather than as two design systems that met in a nav
 * bar. Unlike a section opening, these carry a label, because a sub page's
 * heading benefits from being placed.
 *
 * This exists because the tracked all-caps eyebrow it replaces is gone from
 * the home page, and a sub page that kept it looked like the version of the
 * site from before the restructure.
 */
export function Kicker({
  children,
  className = '',
  choreo = true,
}: {
  children: React.ReactNode;
  className?: string;
  /* `data-choreo-label` is hidden by CSS until GSAP reveals it, and GSAP only
     reveals labels that sit inside a `[data-choreo]` section on a page where
     MotionProvider is mounted. On a page with neither — the 404 — the
     attribute is at best dead weight and at worst a label that never appears.
     Opt out there rather than tagging markup nothing will animate. */
  choreo?: boolean;
}) {
  return (
    <p
      {...(choreo ? { 'data-choreo-label': '' } : {})}
      className={['flex items-center gap-100 text-sm text-gold', className].join(
        ' ',
      )}
    >
      <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

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
 * The section opening: hairline, name, lead.
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
  const { name } = chapter(id);
  const headingId = `${id}-heading`;

  /* A hairline and nothing else. It anchors the heading and matches the rule
     in `Kicker` on the sub pages, and it says nothing, which is right —
     everything there is to say is in the heading directly beneath it. */
  const mark = (
    <p data-choreo-label aria-hidden="true">
      <span className="rule-gold block w-[40px]" />
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
