import Image from 'next/image';
import { CHIEF, TAGLINE, formatUpdateDate, type Statement } from '@/lib/content';
import { HOME_LIMITS } from '@/lib/limits';
import { Section } from './Section';
import { Reveal } from './Reveal';

/**
 * Speeches and statements.
 *
 * This is the one place on the page where the design is loud, and everything
 * around it is quiet so that it can be. No chapter mark is drawn, no
 * heading, no lead: the sentence is the heading. Words light in reading order
 * as the section crosses the viewport, scrubbed against scroll rather than
 * fired once, so the reader paces it themselves.
 *
 * The sentence ships whole and visible. MotionProvider splits it at runtime
 * and restores an unsplit accessible name, so with JavaScript off this is a
 * paragraph and with a screen reader it is one sentence.
 *
 * Beneath it, what the office has put on the record. The seeded entry carries
 * no date, because his standing words were not said on a day anyone recorded
 * and inventing one would be a lie about a chief. TAGLINE is deliberately not
 * seeded as a card as well: it is already the lead above, and printing the
 * same sentence twice on one screen is a stutter, not a record.
 */

function ordered(statements: Statement[]): Statement[] {
  return [...statements].sort((a, b) => {
    /* Undated last: standing words are not news, and a reader scanning for
       the most recent thing said should not meet them first. */
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
}

export function Speeches({ statements }: { statements: Statement[] }) {
  const shown = ordered(statements).slice(0, HOME_LIMITS.statements);

  return (
    <Section id="speeches" ground="deep" quiet className="sm:py-900">
      <p
        data-scrub-words
        className="max-w-[980px] font-display text-3xl font-500 leading-[1.22] text-ivory sm:text-5xl lg:text-6xl"
      >
        {TAGLINE}
      </p>
      <p className="mt-400 flex items-center gap-200 text-sm text-gold">
        <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
        {CHIEF.fullName}
      </p>

      {shown.length > 0 && (
        /* The grid is sized by how much there is to put in it. Three columns
           holding one card leaves a third of a screen of nothing beside it and
           reads as a section that failed to load, so a lone statement is given
           the measure instead of a third of it. */
        <ul
          data-reveal-group
          className={[
            'mt-800 grid gap-300 border-t border-ebony-line pt-600',
            shown.length === 1
              ? 'max-w-[760px]'
              : shown.length === 2
                ? 'md:grid-cols-2'
                : 'md:grid-cols-2 lg:grid-cols-3',
          ].join(' ')}
        >
          {shown.map((st, i) => (
            <Reveal as="li" item key={st.id} delay={i * 80}>
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-ebony-line bg-ebony transition-colors duration-700 ease-fluid hover:border-gold-dim">
                {st.imageUrl && (
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-ebony-card">
                    <Image
                      src={st.imageUrl}
                      alt={st.imageAlt ?? st.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-300">
                  <h3 className="font-display text-2xl font-600 leading-snug text-ivory">
                    {st.title}
                  </h3>

                  {/* Occasion and date read as one caption line. Either can be
                      absent, and the separator only appears when both are
                      there, so a card never opens or closes on a stray dot. */}
                  {(st.occasion || st.date) && (
                    <p className="mt-75 text-sm text-gold">
                      {st.occasion}
                      {st.occasion && st.date ? ' · ' : ''}
                      {st.date && (
                        <time dateTime={st.date}>
                          {formatUpdateDate(st.date)}
                        </time>
                      )}
                    </p>
                  )}

                  {st.pullQuote && (
                    <blockquote className="mt-200 border-l border-gold/40 pl-200 font-display text-xl font-500 leading-snug text-ivory">
                      {st.pullQuote}
                    </blockquote>
                  )}

                  <p className="mt-200 text-base leading-relaxed text-ivory/65">
                    {st.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}
