import Link from 'next/link';
import { contactValue } from '@/lib/content';

/**
 * TO DO BEFORE ANY LEGAL RELIANCE: have this reviewed by counsel. It is
 * written to describe what the site actually does, but it has not been
 * checked against Ghana's Data Protection Act, 2012 (Act 843). Keep this
 * note in the code, never on the page: a published document that announces
 * itself as an unreviewed draft is worse than one that simply is.
 */

export const metadata = {
  title: 'Privacy policy, Office of the Nkosuo Hene of Adrobaa',
  description:
    'How the Office of the Nkosuo Hene of Adrobaa handles information submitted through this site.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

export default function Privacy() {
  /* Null until the palace supplies it, so no bracketed token is published. */
  const email = contactValue('email');

  return (
    <main id="main" className="mx-auto max-w-[760px] px-300 py-800 sm:px-500 sm:py-900">
      <Link
        href="/"
        className="text-sm text-gold transition-colors duration-700 ease-fluid hover:text-ivory"
      >
        Back to the home page
      </Link>
      <h1 className="mt-300 font-display text-5xl font-600 leading-tight text-ivory">
        Privacy policy
      </h1>
      <p className="mt-200 text-sm text-ivory/50">
        Last reviewed for the launch of this site. Written to cover what the
        engagement form on the home page collects, and nothing beyond it.
      </p>

      <div className="mt-500 grid gap-400">
        <section>
          <h2 className="font-display text-2xl font-600 text-ivory">
            What we collect
          </h2>
          <p className="mt-100 text-base leading-relaxed text-ivory/65">
            When you write to the office through the form on this site we
            receive the name, email address, organisation and engagement details
            you enter. We collect nothing else and we set no advertising
            cookies.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-600 text-ivory">
            Why we hold it
          </h2>
          <p className="mt-100 text-base leading-relaxed text-ivory/65">
            Solely to answer your request, check it against the traditional
            calendar and keep a record of correspondence with the office.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-600 text-ivory">
            Who sees it
          </h2>
          <p className="mt-100 text-base leading-relaxed text-ivory/65">
            Staff of the Office of the Nkosuo Hene. We do not sell information
            and we do not pass it to third parties for marketing.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-600 text-ivory">
            Asking us to delete it
          </h2>
          <p className="mt-100 text-base leading-relaxed text-ivory/65">
            Write to the office and we will remove your details from our
            records.{email ? ' ' : ''}
            {email && <a href={`mailto:${email}`} className="text-gold">{email}</a>}
          </p>
        </section>
      </div>
    </main>
  );
}
