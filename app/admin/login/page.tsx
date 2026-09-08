import type { Metadata } from 'next';
import { isConfigured } from '@/lib/admin-auth';
import { LoginForm } from '@/components/admin/LoginForm';
import { CHIEF } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Palace admin',
  robots: { index: false, follow: false },
};

export default function AdminLogin() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-ebony px-300 py-500">
      <div className="w-full max-w-[400px]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
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
