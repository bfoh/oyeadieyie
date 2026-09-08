import Link from 'next/link';
import { isSupplied } from '@/lib/content';
import { readContent } from '@/lib/store';

/**
 * TO DO BEFORE ANY LEGAL RELIANCE: have this reviewed by counsel. It is
 * written to describe what the site actually does, but it has not been
 * checked against Ghana's Data Protection Act, 2012 (Act 843). Keep this
 * note in the code, never on the page: a published document that announces
 * itself as an unreviewed draft is worse than one that simply is.
 */

export const metadata = {
  title: 'Terms of use, Office of the Nkosuo Hene of Adrobaa',
  description:
    'Terms governing use of this site and of the photography and press material published on it.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

/* Contact details are editable in the admin, so they have to be read at
   request time. These pages used the build-time constants, which meant the
   office could set the press desk address and this page would keep showing
   nothing until someone redeployed. */
export const revalidate = 30;

export default async function Terms() {
  const { contact } = await readContent();
  /* Null until the palace supplies it, so no bracketed token is published. */
  const email = isSupplied(contact.email) ? contact.email : null;

  return (
    <main id="main" className="mx-auto max-w-[760px] px-300 py-800 sm:px-500 sm:py-900">
      <Link
        href="/"
        className="text-sm text-gold transition-colors duration-700 ease-fluid hover:text-ivory"
      >
        Back to the home page
      </Link>
      <h1 className="mt-300 font-display text-5xl font-600 leading-tight text-ivory">
        Terms of use
      </h1>
      <p className="mt-200 text-sm text-ivory/50">
        Last reviewed for the launch of this site. These terms cover use of the
        material published here, including the press kit.
      </p>

      <div className="mt-500 grid gap-400">
        <section>
          <h2 className="font-display text-2xl font-600 text-ivory">
            Photography and film
          </h2>
          <p className="mt-100 text-base leading-relaxed text-ivory/65">
            Images and footage on this site belong to the Office of the Nkosuo
            Hene of Adrobaa. Editorial use is permitted where the material comes
            from the press kit and carries the correct credit. Commercial use
            requires written permission.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-600 text-ivory">
            Titles and forms of address
          </h2>
          <p className="mt-100 text-base leading-relaxed text-ivory/65">
            Traditional titles carry protocol. The press kit sets out correct
            usage and we ask that publications follow it.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-600 text-ivory">
            Accuracy
          </h2>
          <p className="mt-100 text-base leading-relaxed text-ivory/65">
            Project information reflects the stage each project has reached at
            the time of publication. Figures are published once the traditional
            council has confirmed them.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-600 text-ivory">
            Contact
          </h2>
          <p className="mt-100 text-base leading-relaxed text-ivory/65">
            Questions about these terms go to the office of the Nkosuo Hene.
            {email && (
              <>
                {' '}
                <a href={`mailto:${email}`} className="text-gold">
                  {email}
                </a>
              </>
            )}
          </p>
        </section>
      </div>
    </main>
  );
}
