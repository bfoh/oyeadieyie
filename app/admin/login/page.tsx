import type { Metadata } from 'next';
import { isConfigured } from '@/lib/admin-auth';
import { LoginForm } from '@/components/admin/LoginForm';
import { CHIEF } from '@/lib/content';
import { Crest } from '@/components/Crest';

export const metadata: Metadata = {
  title: 'Palace admin',
  robots: { index: false, follow: false },
};

/**
 * Rendered on every request, never prerendered.
 *
 * `isConfigured()` reads ADMIN_PASSWORD out of the environment, which is a
 * fact about the running deployment. Next prerendered this page to a static
 * login.html at build time, so that question was answered once during the
 * build and then served to everybody from the edge cache — the office opened
 * the admin on a phone and was told "The admin is not switched on" from a
 * copy over ten hours old, while a desktop with a newer copy showed the form.
 * A page whose content depends on the runtime environment must not be static.
 */
export const dynamic = 'force-dynamic';

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
        <h1 className="mt-100 text-balance font-display text-4xl font-600 leading-tight text-ivory">
          Palace admin
        </h1>
        <p className="mx-auto mt-200 max-w-[34ch] text-sm leading-relaxed text-ivory/60">
          For the office only. Everything here produces material issued under
          the stool&apos;s name.
        </p>

        <LoginForm configured={isConfigured()} />
      </div>
    </main>
  );
}
