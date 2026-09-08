import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  DownloadSimple,
  ArrowLeft,
  Check,
  FilmSlate,
} from '@phosphor-icons/react/dist/ssr';
import { CHIEF, COMPANY, CONTACT, FILM, contactValue } from '@/lib/content';
import {
  KIT,
  ADDRESS,
  ADDRESS_NOTE,
  BIO_SHORT,
  BIO_LONG,
  PHOTO_SETS,
  KIT_TERMS,
} from '@/lib/presskit';
import { LensProvider } from '@/components/LensContext';
import { Nav } from '@/components/Nav';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { AdinkraCloth } from '@/components/AdinkraCloth';
import { CopyBlock } from '@/components/CopyBlock';
import { Reveal } from '@/components/Reveal';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Press kit, Nana Oyeadieyie Barima Essoun I',
  description:
    'Approved biographies, cleared photography, correct forms of address and company information for editorial use.',
  alternates: { canonical: '/media-kit' },
  robots: { index: true, follow: true },
};

export default function MediaKit() {
  /* Null until the palace supplies it, so no bracketed token is published. */
  const press = contactValue('press');

  return (
    <LensProvider>
      <MotionProvider />
      <AdinkraCloth />
      <Nav />

      <main id="main" className="relative z-10">
        {/* Header */}
        <section
          data-choreo
          className="relative px-300 pb-700 pt-900 sm:px-500 lg:px-800"
        >
          <div className="relative mx-auto w-full max-w-[1280px]">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center gap-75 text-sm text-gold transition-colors duration-700 ease-fluid hover:text-ivory"
            >
              <ArrowLeft size={15} weight="bold" aria-hidden="true" />
              Back to the home page
            </Link>

            <div className="mt-300 flex items-center gap-100">
              <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
              <p
                data-choreo-label
                className="text-xs font-semibold uppercase tracking-[0.18em] text-gold"
              >
                For editorial use
              </p>
            </div>
            <h1
              data-choreo-heading
              className="mt-200 max-w-measure font-display text-5xl font-600 leading-tight text-ivory sm:text-6xl"
            >
              Press kit
            </h1>
            <p
              data-choreo-lead
              className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70"
            >
              Everything a newsroom needs to cover {CHIEF.fullName} correctly:
              approved biographies, cleared photography, and the forms of
              address a traditional office expects to see in print.
            </p>

            <Reveal delay={120}>
              <div className="mt-500 flex flex-wrap items-center gap-200">
                <a
                  href={KIT.file}
                  download
                  data-magnetic="0.2"
                  className="group inline-flex min-h-[44px] items-center gap-75 rounded-xl bg-gold px-200 py-100 text-base font-semibold text-ebony transition-all duration-700 ease-fluid hover:bg-[#e6c34d] active:scale-[0.98]"
                >
                  Download the full kit
                  <DownloadSimple
                    size={16}
                    weight="bold"
                    aria-hidden="true"
                    className="transition-transform duration-700 ease-fluid group-hover:translate-y-[2px]"
                  />
                </a>
                <p className="text-sm text-ivory/50">
                  ZIP · {KIT.size} · {KIT.count}, biography and protocol notes
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Forms of address */}
        <section
          data-choreo
          className="relative border-t border-ebony-line bg-ebony-raised/45 px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
        >
          <div className="relative mx-auto w-full max-w-[1280px]">
            <p
              data-choreo-label
              className="text-xs font-semibold uppercase tracking-[0.18em] text-gold"
            >
              Protocol
            </p>
            <h2
              data-choreo-heading
              className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl"
            >
              How to refer to him in print
            </h2>

            <div className="mt-500 grid gap-500 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-start">
              <Reveal>
                <dl className="grid gap-200">
                  {ADDRESS.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-2xl border border-ebony-line bg-ebony/70 p-300 backdrop-blur-sm"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                        {row.label}
                      </dt>
                      <dd className="mt-75 font-display text-xl leading-snug text-ivory">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
              <Reveal delay={120}>
                <p className="max-w-measure text-base leading-relaxed text-ivory/70">
                  {ADDRESS_NOTE}
                </p>
                <p className="mt-300 text-sm text-ivory/50">
                  {CHIEF.place} · {CHIEF.region}
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Biographies */}
        <section
          data-choreo
          className="relative border-t border-ebony-line bg-transparent px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
        >
          <div className="relative mx-auto w-full max-w-[1280px]">
            <p
              data-choreo-label
              className="text-xs font-semibold uppercase tracking-[0.18em] text-gold"
            >
              Approved copy
            </p>
            <h2
              data-choreo-heading
              className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl"
            >
              Biography, long and short
            </h2>
            <p
              data-choreo-lead
              className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70"
            >
              Both versions are cleared for publication as written. Copy either
              one straight into your piece.
            </p>

            <div className="mt-500 grid gap-300 lg:grid-cols-2 lg:items-start">
              <Reveal>
                <CopyBlock
                  label="Short biography"
                  wordCount="About 50 words"
                  text={BIO_SHORT}
                />
              </Reveal>
              <Reveal delay={120}>
                <CopyBlock
                  label="Long biography"
                  wordCount="About 150 words"
                  text={BIO_LONG}
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* Photography */}
        <section
          data-choreo
          className="relative border-t border-ebony-line bg-ebony-raised/45 px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
        >
          <div className="relative mx-auto w-full max-w-[1280px]">
            <p
              data-choreo-label
              className="text-xs font-semibold uppercase tracking-[0.18em] text-gold"
            >
              Photography
            </p>
            <h2
              data-choreo-heading
              className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl"
            >
              Cleared images
            </h2>
            <p
              data-choreo-lead
              className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70"
            >
              Click any frame to download it on its own, or take the whole set
              in the kit above.
            </p>

            <div className="mt-600 grid gap-700">
              {PHOTO_SETS.map((set) => (
                <div key={set.id}>
                  <h3 className="font-display text-2xl font-600 text-ivory">
                    {set.title}
                  </h3>
                  <p className="mt-75 max-w-measure text-sm leading-relaxed text-ivory/55">
                    {set.body}
                  </p>
                  <ul
                    data-reveal-group
                    className="mt-300 grid grid-cols-2 gap-200 md:grid-cols-4"
                  >
                    {set.shots.map((shot) => (
                      <Reveal as="li" item key={shot.src}>
                        <a
                          href={shot.src}
                          download={shot.name}
                          className="group block overflow-hidden rounded-2xl border border-ebony-line bg-ebony transition-all duration-700 ease-fluid hover:-translate-y-[3px] hover:border-gold active:scale-[0.99]"
                        >
                          <span className="relative block aspect-[4/3] w-full overflow-hidden bg-ebony-card">
                            <Image
                              src={shot.src}
                              alt={shot.alt}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover transition-transform duration-[1200ms] ease-fluid group-hover:scale-[1.06]"
                            />
                            {shot.note && (
                              <span className="absolute bottom-75 left-75 rounded-full bg-ebony/85 px-100 py-25 text-xs text-ivory/75 backdrop-blur-sm">
                                {shot.note}
                              </span>
                            )}
                          </span>
                          <span className="flex items-center justify-between gap-100 p-200">
                            <span className="truncate text-xs text-ivory/55">
                              {shot.name}
                            </span>
                            <DownloadSimple
                              size={15}
                              weight="bold"
                              aria-hidden="true"
                              className="shrink-0 text-gold transition-transform duration-700 ease-fluid group-hover:translate-y-[2px]"
                            />
                          </span>
                        </a>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Film and company */}
        <section
          data-choreo
          className="relative border-t border-ebony-line bg-transparent px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
        >
          <div className="relative mx-auto w-full max-w-[1280px]">
            <p
              data-choreo-label
              className="text-xs font-semibold uppercase tracking-[0.18em] text-gold"
            >
              Film and company
            </p>
            <h2
              data-choreo-heading
              className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl"
            >
              Footage and DeoMetals Ltd
            </h2>

            <div className="mt-500 grid gap-300 lg:grid-cols-2 lg:items-start">
              <Reveal>
                <div className="h-full rounded-2xl border border-ebony-line bg-ebony-raised/70 p-300 backdrop-blur-sm">
                  <span className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-ebony-line bg-ebony text-gold">
                    <FilmSlate size={22} weight="light" aria-hidden="true" />
                  </span>
                  <h3 className="mt-200 font-display text-2xl font-600 text-ivory">
                    {FILM.title}
                  </h3>
                  <p className="mt-100 text-base leading-relaxed text-ivory/65">
                    The full ceremony at Adrobaa. A web copy plays on the home
                    page; broadcast quality masters come from the press desk on
                    request.
                  </p>
                  <div className="mt-300 flex flex-wrap gap-200">
                    <Link
                      href="/#media"
                      className="inline-flex min-h-[44px] items-center rounded-xl border border-white/20 px-200 py-100 text-sm font-semibold text-ivory transition-all duration-700 ease-fluid hover:border-gold hover:text-gold active:scale-[0.98]"
                    >
                      Watch the film
                    </Link>
                    <a
                      href={FILM.src}
                      download
                      className="inline-flex min-h-[44px] items-center gap-75 rounded-xl border border-white/20 px-200 py-100 text-sm font-semibold text-ivory transition-all duration-700 ease-fluid hover:border-gold hover:text-gold active:scale-[0.98]"
                    >
                      Download the web copy
                      <DownloadSimple size={14} weight="bold" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="h-full rounded-2xl border border-ebony-line bg-ebony-raised/70 p-300 backdrop-blur-sm">
                  <h3 className="font-display text-2xl font-600 text-ivory">
                    {COMPANY.name}
                  </h3>
                  <p className="mt-75 text-sm text-gold">{COMPANY.group}</p>
                  <p className="mt-200 text-base leading-relaxed text-ivory/65">
                    {COMPANY.promise}.
                  </p>
                  <ul className="mt-200 grid gap-75">
                    {COMPANY.services.map((s) => (
                      <li
                        key={s}
                        className="flex items-start gap-75 text-sm text-ivory/70"
                      >
                        <span
                          className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-gold"
                          aria-hidden="true"
                        />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Terms and contact */}
        <section
          data-choreo
          className="relative border-t border-ebony-line bg-ebony-raised/45 px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
        >
          <div className="relative mx-auto w-full max-w-[1280px]">
            <p
              data-choreo-label
              className="text-xs font-semibold uppercase tracking-[0.18em] text-gold"
            >
              Terms
            </p>
            <h2
              data-choreo-heading
              className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl"
            >
              Using this material
            </h2>

            <div className="mt-500 grid gap-500 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
              <Reveal>
                <ul className="grid gap-100">
                  {KIT_TERMS.map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-100 text-base text-ivory/70"
                    >
                      <Check
                        size={16}
                        weight="bold"
                        className="mt-[5px] shrink-0 text-gold"
                        aria-hidden="true"
                      />
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={120}>
                <div className="rounded-2xl border border-ebony-line bg-ebony/70 p-300 backdrop-blur-sm">
                  <h3 className="font-display text-xl font-600 text-ivory">
                    Press desk
                  </h3>
                  <p className="mt-100 text-sm leading-relaxed text-ivory/60">
                    Anything not in the pack, including broadcast masters and
                    interview requests.
                  </p>
                  <ul className="mt-200 grid gap-50 text-sm text-ivory/70">
                    {press && (
                      <li>
                        <a
                          href={`mailto:${press}`}
                          className="transition-colors duration-700 ease-fluid hover:text-gold"
                        >
                          {press}
                        </a>
                      </li>
                    )}
                    <li>{CONTACT.office}</li>
                  </ul>
                  <Link
                    href="/#engage"
                    className="mt-300 inline-flex min-h-[44px] items-center rounded-xl bg-gold px-200 py-100 text-base font-semibold text-ebony transition-all duration-700 ease-fluid hover:bg-[#e6c34d] active:scale-[0.98]"
                  >
                    Write to the office
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </LensProvider>
  );
}
