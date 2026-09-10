import Link from 'next/link';
import { CHIEF } from '@/lib/content';
import { Kicker } from '@/components/Section';

export const metadata = { title: 'Page not found, Adrobaa' };

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-[100svh] flex-col items-center justify-center px-300 py-800 text-center sm:px-500"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-[72px] w-[72px]"
      >
        <path d="M12 20.5c4 0 6.6-3 6.6-6.6 0-3.2-2.3-5.9-5.4-5.9-2.6 0-4.5 1.9-4.5 4.2 0 1.9 1.4 3.3 3.1 3.3 1.4 0 2.4-1 2.4-2.2" />
        <path d="M12 3.5v5.2" />
        <path d="m9.4 6.1 2.6-2.6 2.6 2.6" />
      </svg>

      {/* The page is centred, so the kicker's hairline is centred with it
          rather than hanging off the left as it does in a section. */}
      <Kicker choreo={false} className="mt-300 justify-center">Sankofa, go back and get it</Kicker>
      <h1 className="mt-200 max-w-measure font-display text-5xl font-600 leading-tight text-ivory sm:text-6xl">
        This page is not on the stool
      </h1>
      <p className="mt-200 max-w-measure text-base leading-relaxed text-ivory/65">
        The address you followed does not exist on the official site of{' '}
        {CHIEF.fullName}. The way back is below.
      </p>

      <div className="mt-400 flex flex-wrap items-center justify-center gap-200">
        <Link
          href="/"
          className="rounded-xl bg-gold px-200 py-100 text-base font-semibold text-ebony transition-all duration-700 ease-fluid hover:bg-[#e6c34d] active:scale-[0.98]"
        >
          Return to the home page
        </Link>
        <Link
          href="/#engage"
          className="rounded-xl border border-white/20 px-200 py-100 text-base font-semibold text-ivory transition-all duration-700 ease-fluid hover:border-gold hover:text-gold active:scale-[0.98]"
        >
          Write to the office
        </Link>
      </div>
    </main>
  );
}
