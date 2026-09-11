'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { usePathname } from 'next/navigation';
import { ADMIN_LINKS } from './AdminNav';

/**
 * The way in.
 *
 * The reference the office supplied opens its portal on a greeting, a search
 * field, and a field of large tiles carrying one outline icon each. That is a
 * good pattern for exactly this situation: someone arriving with one task in
 * mind, on a phone, who wants the door rather than a report.
 *
 * The tiles are the same seven destinations as the menu, which is deliberate.
 * A dashboard whose tiles and whose navigation disagree teaches the reader
 * that one of them is lying, so both read from `ADMIN_LINKS`.
 *
 * Search filters the tiles rather than querying the content. It is honest
 * about what it does — the placeholder says so — and it earns its place
 * because destinations with long names are faster to filter than to scan
 * when you already know the word you want.
 */
export function DashboardTiles() {
  const [q, setQ] = useState('');
  const pathname = usePathname();

  /* The page you are on is not a door out of itself. Dropping it also takes
     the tiles from seven to six, which grids evenly at two and three up
     instead of leaving one stranded on a row of its own. */
  const doors = useMemo(
    () => ADMIN_LINKS.filter((l) => l.href !== pathname),
    [pathname],
  );

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return doors;
    return doors.filter((l) => l.label.toLowerCase().includes(term));
  }, [q, doors]);

  /* The greeting follows the READER's clock, set after mount.
     Rendering it on the server would greet a reader in Adrobaa using
     whichever timezone the deployment happens to run in, and computing it
     during render would mismatch what the server sent on hydration. "Welcome" is the
     honest value until the browser can say better. */
  const [greeting, setGreeting] = useState('Welcome');
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
  }, []);

  return (
    <section aria-labelledby="dash-greeting">
      <div className="flex flex-col gap-300 sm:flex-row sm:items-center sm:justify-between">
        <h1
          id="dash-greeting"
          className="text-3xl font-700 leading-tight tracking-tight text-ivory sm:text-4xl"
        >
          {greeting}
        </h1>

        {/* The search pill, as the reference draws it: a full round field with
            the glass at the head and a hairline separating it from the input. */}
        <div className="relative flex w-full items-center rounded-full border border-white/20 bg-ebony-card sm:w-[320px]">
          <label htmlFor="dash-search" className="sr-only">
            Filter the sections below
          </label>
          <MagnifyingGlass
            size={20}
            weight="bold"
            aria-hidden="true"
            className="ml-200 shrink-0 text-gold"
          />
          <span className="mx-200 h-[20px] w-px shrink-0 bg-white/20" aria-hidden="true" />
          <input
            id="dash-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a section"
            className="min-h-[48px] w-full rounded-full bg-transparent pr-200 text-base text-ivory placeholder:text-ivory/45 focus:outline-none"
          />
        </div>
      </div>

      {shown.length > 0 ? (
        <ul className="mt-400 grid gap-200 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((l) => {
            const Icon = l.icon;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group flex h-full flex-col items-center justify-center gap-200 rounded-tile border border-ebony-line bg-ebony-card px-300 py-500 text-center transition-all duration-500 ease-fluid hover:-translate-y-[2px] hover:border-gold-dim hover:bg-[#262626] active:translate-y-0 active:scale-[0.99]"
                >
                  <Icon
                    size={48}
                    weight="regular"
                    aria-hidden="true"
                    className="text-gold transition-transform duration-500 ease-fluid group-hover:scale-105"
                  />
                  <span className="text-lg font-600 text-ivory">{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-400 rounded-tile border border-ebony-line bg-ebony-card p-400 text-base text-ivory/65">
          Nothing here matches <strong className="text-ivory">{q}</strong>. The
          search filters these seven sections by name; it does not look inside
          updates, projects or enquiries.
        </p>
      )}
    </section>
  );
}
