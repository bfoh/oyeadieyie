'use client';

import Link from 'next/link';
import { CHIEF, COMPANY, CONTACT, NAV_LINKS, sectionHref } from '@/lib/content';
import { useContactValue, useWhatsappHref, useTelHref } from './ContactContext';

/**
 * The footer.
 *
 * Two things govern the layout, and both are consequences of decisions taken
 * elsewhere on the site.
 *
 * **Nine sections do not belong in one column.** A single stack of nine links
 * ran seven hundred pixels down the page while the identity block beside it
 * ended at three hundred, so the footer was mostly a ladder standing next to a
 * void. The index is a grid instead — two columns on a phone, three from `sm`,
 * back to two where the column itself is narrow — which makes it three compact
 * rows and puts the whole thing back in proportion.
 *
 * **The office column may not exist.** Every contact line is conditional,
 * because the palace has not supplied them and a bracketed placeholder must
 * never reach the public. A fixed three-column grid reserved a third of the
 * width for a block that renders nothing, which is what left the empty space
 * on the right. The columns are declared from `hasOffice`, so the footer takes
 * the shape of what it is actually showing.
 */
export function Footer() {
  const email = useContactValue('email');
  const phone = useContactValue('phone');
  const press = useContactValue('press');
  const whatsapp = useWhatsappHref();
  const tel = useTelHref();
  /* Every line here is conditional. The office column disappears entirely
     rather than printing a bracketed placeholder to the public. */
  const hasOffice = Boolean(email || phone || press || whatsapp);

  const officeLink =
    'flex min-h-[44px] items-center text-sm text-ivory/65 transition-colors duration-700 ease-fluid hover:text-gold';

  return (
    <footer className="relative border-t border-ebony-line bg-ebony px-300 py-600 sm:px-500 sm:py-700 lg:px-800">
      <div className="mx-auto w-full max-w-[1280px]">
        <div
          className={[
            'grid gap-500 lg:gap-700',
            hasOffice
              ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)]'
              : 'lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]',
          ].join(' ')}
        >
          {/* Whose office this is */}
          <div>
            <p className="font-display text-2xl font-600 leading-snug text-ivory">
              {CHIEF.fullName}
            </p>
            <p className="mt-75 text-sm text-gold">
              {CHIEF.title}, the {CHIEF.titleMeaning}
            </p>

            <ul className="mt-100 flex flex-wrap items-center gap-y-25">
              {CHIEF.strapline.map((word, i) => (
                <li
                  key={word}
                  className="flex items-center text-sm italic text-ivory/60"
                >
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="mx-200 h-[3px] w-[3px] shrink-0 rounded-full bg-gold"
                    />
                  )}
                  {word}
                </li>
              ))}
            </ul>

            <p className="mt-300 font-display text-lg not-italic text-ivory/80">
              {CHIEF.motto}
            </p>

            {/* Address and company as one block of standing detail. As two
                paragraphs a full line apart they read as unrelated notes. */}
            <div className="mt-300 grid gap-75 border-t border-ebony-line pt-300 text-sm leading-relaxed text-ivory/50">
              <p className="max-w-measure">{CONTACT.office}</p>
              <p>
                {COMPANY.name},{' '}
                {COMPANY.group.replace(/^A member/, 'a member')}
              </p>
            </div>
          </div>

          {/* The index. Plain links: a footer is where a reader goes to reach
              a section quickly, and a number in front of each name is one more
              thing to read past on the way to the word they are looking for. */}
          <nav aria-label="Footer">
            <p className="text-sm text-ivory/50">Sections</p>
            <ul className="mt-100 grid grid-cols-2 gap-x-300 sm:grid-cols-3 lg:grid-cols-2">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <a
                    href={sectionHref(l.id)}
                    className="flex min-h-[44px] items-center text-sm text-ivory/65 transition-colors duration-700 ease-fluid hover:text-gold"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {hasOffice && (
            <div>
              <p className="text-sm text-ivory/50">Office</p>
              <ul className="mt-100 grid">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className={officeLink}>
                      {email}
                    </a>
                  </li>
                )}
                {phone && tel && (
                  <li>
                    <a href={tel} className={officeLink}>
                      {phone}
                    </a>
                  </li>
                )}
                {whatsapp && (
                  <li>
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={officeLink}
                    >
                      WhatsApp
                    </a>
                  </li>
                )}
                {press && (
                  <li>
                    <a href={`mailto:${press}`} className={officeLink}>
                      Press: {press}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-600 flex flex-col gap-100 border-t border-ebony-line pt-300 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-ivory/50">
            © {new Date().getFullYear()} Office of the Nkosuo Hene of Adrobaa.
            All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-300">
            <li>
              <Link
                href="/privacy"
                className="flex min-h-[44px] items-center text-xs text-ivory/50 transition-colors duration-700 ease-fluid hover:text-gold"
              >
                Privacy policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="flex min-h-[44px] items-center text-xs text-ivory/50 transition-colors duration-700 ease-fluid hover:text-gold"
              >
                Terms of use
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
