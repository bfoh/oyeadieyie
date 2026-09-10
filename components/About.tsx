import Image from 'next/image';
import { PROFILES, COMPANY, CHIEF } from '@/lib/content';
import { BIO_LONG } from '@/lib/presskit';
import { Section, SectionHead } from './Section';
import { Reveal } from './Reveal';

/**
 * About Nana.
 *
 * Both offices, on one screen. This was two tabs behind a regal/modern
 * toggle, which meant a reader who never touched the control saw half of him
 * and never learned the other half existed. The point the site is making is
 * that the commercial record and the development record are the same record,
 * and a control that hides one of them argues against it.
 *
 * The biography is `BIO_LONG` from the press kit — the text already approved
 * for a newsroom to reprint. Using it here means the page and the press pack
 * cannot describe him differently.
 */

const PANELS = [PROFILES.stool, PROFILES.business] as const;

export function About() {
  const paragraphs = BIO_LONG.split('\n\n').filter(Boolean);

  return (
    <Section id="about">
      <SectionHead
        id="about"
        lead={`${CHIEF.titleMeaning} of ${CHIEF.place}, and a licensed precious metals dealer. One office builds the stool; the other funds it.`}
      />

      <div className="mt-600 grid gap-500 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-700">
        <Reveal>
          <figure>
            <div
              data-image-reveal
              className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-ebony-line bg-ebony-card"
            >
              <Image
                src={PROFILES.stool.image}
                alt={PROFILES.stool.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority={false}
              />
            </div>
            <figcaption className="mt-200 text-sm leading-relaxed text-ivory/50">
              {CHIEF.fullName}, {CHIEF.titleShort}.
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={120}>
          <div className="max-w-measure">
            {paragraphs.map((para, i) => (
              <p
                key={para.slice(0, 32)}
                className={[
                  'text-base leading-relaxed text-ivory/75 sm:text-lg',
                  i === 0 ? '' : 'mt-300',
                ].join(' ')}
              >
                {para}
              </p>
            ))}
          </div>
        </Reveal>
      </div>

      {/* The two offices. Neither is subordinate to the other on the page,
          because neither is subordinate to the other in fact. */}
      <div data-reveal-group className="mt-700 grid gap-300 lg:grid-cols-2">
        {PANELS.map((panel, i) => (
          <Reveal as="article" item key={panel.key} delay={i * 90}>
            <div className="flex h-full flex-col rounded-2xl border border-ebony-line bg-ebony-raised/80 p-300 backdrop-blur-sm sm:p-400">
              <h3 className="font-display text-2xl font-600 leading-snug text-ivory sm:text-3xl">
                {panel.heading}
              </h3>
              <p className="mt-200 max-w-measure text-base leading-relaxed text-ivory/65">
                {panel.lead}
              </p>

              <dl className="mt-400 grid gap-200 border-t border-ebony-line pt-300">
                {panel.facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="grid gap-25 sm:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] sm:gap-200"
                  >
                    <dt className="text-sm text-ivory/50">{fact.label}</dt>
                    <dd>
                      <span className="block text-base font-500 text-ivory">
                        {fact.value}
                      </span>
                      <span className="mt-25 block text-sm leading-relaxed text-ivory/55">
                        {fact.note}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              {panel.key === 'business' && (
                <ul className="mt-400 flex flex-wrap gap-75">
                  {COMPANY.services.map((service) => (
                    <li
                      key={service}
                      className="rounded-full border border-ebony-line px-200 py-50 text-xs text-ivory/60"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
