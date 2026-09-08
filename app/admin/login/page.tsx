import type { Metadata } from 'next';
import { isConfigured } from '@/lib/admin-auth';
import { LoginForm } from '@/components/admin/LoginForm';
import { CHIEF } from '@/lib/content';
import { Crest } from '@/components/Crest';

export const metadata: Metadata = {
  title: 'Palace admin',
  robots: { index: false, follow: false },
};

export default function AdminLogin() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-ebony px-300 py-500">
      <div className="w-full max-w-[400px]">
        {/* The same lockup the sidebar carries — crest and wordmark together.
            This page sits outside the admin layout, so it had no mark at all,
            and a crest on its own left the column looking unfinished beside
            the full-width type below it. */}
        <span className="flex items-center gap-150">
          <Crest className="h-[40px] w-[40px] shrink-0 text-gold" />
          <span className="font-wordmark text-sm font-600 uppercase leading-none tracking-[0.16em] text-ivory">
            {CHIEF.shortName}
          </span>
        </span>
        <p className="mt-300 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Office of the {CHIEF.title}
        </p>
        <h1 className="mt-200 font-display text-4xl font-600 leading-tight text-ivory">
          Palace admin
        </h1>
        <p className="mt-200 text-sm leading-relaxed text-ivory/60">
          For the office only. Everything here produces material issued under
          the stool&apos;s name.
        </p>
        <LoginForm configured={isConfigured()} />
      </div>
    </main>
  );
}
