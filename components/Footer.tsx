'use client';

import Link from 'next/link';
import { CHIEF, COMPANY, CONTACT, NAV_LINKS, sectionHref } from '@/lib/content';
import { useContactValue, useWhatsappHref, useTelHref } from './ContactContext';

export function Footer() {
  const email = useContactValue('email');
  const phone = useContactValue('phone');
  const press = useContactValue('press');
  const whatsapp = useWhatsappHref();
  const tel = useTelHref();
  /* Every line here is conditional. The office column disappears entirely
     rather than printing a bracketed placeholder to the public. */
  const hasOffice = Boolean(email || phone || press || whatsapp);

  return (
    <footer className="relative border-t border-ebony-line bg-ebony px-300 py-600 sm:px-500 sm:py-700 lg:px-800">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="grid gap-500 md:grid-cols-[minmax(0,6fr)_minmax(0,3fr)_minmax(0,3fr)]">
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
            <p className="mt-200 font-display text-lg not-italic text-ivory/80">
              {CHIEF.motto}
            </p>
            <p className="mt-200 max-w-measure text-sm leading-relaxed text-ivory/50">
              {CONTACT.office}
            </p>
            <p className="mt-200 text-sm text-ivory/50">
              {COMPANY.name}, {COMPANY.group.replace(/^A member/, 'a member')}
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ivory/50">
              Sections
            </p>
            <ul className="mt-100 grid">
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
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ivory/50">
                Office
              </p>
              <ul className="mt-200 grid gap-75 text-sm text-ivory/65">
                {email && (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="flex min-h-[44px] items-center transition-colors duration-700 ease-fluid hover:text-gold"
                    >
                      {email}
                    </a>
                  </li>
                )}
                {phone && tel && (
                  <li>
                    <a
                      href={tel}
                      className="flex min-h-[44px] items-center transition-colors duration-700 ease-fluid hover:text-gold"
                    >
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
                      className="flex min-h-[44px] items-center transition-colors duration-700 ease-fluid hover:text-gold"
                    >
                      WhatsApp
                    </a>
                  </li>
                )}
                {press && (
                  <li>
                    <a
                      href={`mailto:${press}`}
                      className="flex min-h-[44px] items-center transition-colors duration-700 ease-fluid hover:text-gold"
                    >
                      Press: {press}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-600 flex flex-col gap-200 border-t border-ebony-line pt-300 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ivory/50">
            © {new Date().getFullYear()} Office of the Nkosuo Hene of Adrobaa.
            All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-300">
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
