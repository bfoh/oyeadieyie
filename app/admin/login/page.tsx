import type { Metadata } from 'next';
import { LoginForm } from '@/components/admin/LoginForm';
import { CHIEF } from '@/lib/content';
import { Crest } from '@/components/Crest';

export const metadata: Metadata = {
  title: 'Palace admin',
  robots: { index: false, follow: false },
};

/**
 * This page no longer reads the environment at all.
 *
 * It used to call `isConfigured()` and render either the form or a "not
 * switched on" notice. Marking it `force-dynamic` fixed that for the CDN but
 * not for the device: a phone that had already been handed the old static
 * HTML kept showing the notice from its own cache. The page is now the same
 * for every deployment whether or not a password is set, so there is nothing
 * left for a cache anywhere to get wrong; the password check happens in
 * /api/admin/login, which is never cached.
 */

export default function AdminLogin() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-ebony px-300 py-500">
      {/* Centred column. The card is the only thing on the page, so it is
          balanced about its own axis rather than left-aligned against an
          empty half-screen. */}
      <div className="w-full max-w-[400px] text-center">
        {/* The same lockup the sidebar carries — crest and wordmark together.
            This page sits outside the admin layout, so it had no mark at all
            until now. */}
        <span className="inline-flex items-center gap-100">
          <Crest className="h-[40px] w-[40px] shrink-0 text-gold" />
          <span className="font-wordmark text-sm font-600 uppercase leading-none tracking-[0.16em] text-ivory">
            {CHIEF.shortName}
          </span>
        </span>

        <p className="mt-400 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Office of the {CHIEF.title}
        </p>
        <h1 className="mt-100 text-balance text-4xl font-700 tracking-tight leading-tight text-ivory">
          Palace admin
        </h1>
        <p className="mx-auto mt-200 max-w-[34ch] text-sm leading-relaxed text-ivory/60">
          For the office only. Everything here produces material issued under
          the stool&apos;s name.
        </p>

        <LoginForm />
      </div>
    </main>
  );
}
