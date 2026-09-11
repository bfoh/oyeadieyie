'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  List,
  X,
  ArrowSquareOut,
  SignOut,
  House,
  Envelope,
  CalendarBlank,
  NotePencil,
  Buildings,
  Palette,
  ListChecks,
} from '@phosphor-icons/react/dist/ssr';
import { CHIEF } from '@/lib/content';
import { Crest } from '../Crest';

/**
 * The admin's top band.
 *
 * Modelled on the guest-portal reference the office supplied: a band across
 * the full width with a bright block cut into its right edge, and the work
 * itself on a plainer field beneath.
 *
 * The reference puts a DARK band on a LIGHT field. This site is dark
 * throughout, so the relationship is inverted rather than the colours: the
 * band LIFTS to `ebony-raised` and the working field stays `ebony`. What
 * matters is that the band separates from the page and the gold cuts into the
 * band, and both survive the inversion. The sister site at
 * officeofnkosuohene runs the same component the other way up.
 *
 * A band rather than a sidebar. The reference puts navigation behind one
 * button at every width, which suits an admin the office opens on a phone far
 * more often than on a desk, and it gives the work the whole width instead of
 * surrendering 248px of it to seven links that are read once a session.
 *
 * Icons are Phosphor at one stroke weight, which is what the reference does
 * with its tiles and what this project already depends on.
 */
export const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: House },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Envelope },
  { href: '/admin/calendar', label: 'Calendar', icon: CalendarBlank },
  { href: '/admin/content', label: 'Manage the site', icon: NotePencil },
  { href: '/admin/projects', label: 'Development record', icon: Buildings },
  { href: '/admin/branding-hub', label: 'Branding hub', icon: Palette },
  { href: '/admin/checklist', label: 'Launch checklist', icon: ListChecks },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  /* The panel is modal: focus moves in, is kept in, and is handed back. The
     same discipline the public site's menu uses, for the same reason — a
     keyboard user must not tab through a panel into the page behind it. */
  useEffect(() => {
    if (!open) return;
    const opener = toggleRef.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    const raf = requestAnimationFrame(() => focusables()[0]?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const el = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (el === first || !panelRef.current?.contains(el))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && el === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      if (panelRef.current?.contains(document.activeElement)) opener?.focus();
    };
  }, [open]);

  const current = ADMIN_LINKS.find((l) => l.href === pathname);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-stretch border-b border-ebony-line bg-ebony-raised text-ivory">
        <div className="flex min-w-0 flex-1 items-center gap-200 px-200 py-200 sm:gap-300 sm:px-400">
          <button
            type="button"
            ref={toggleRef}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="admin-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl text-ivory transition-colors duration-500 ease-fluid hover:bg-white/10 active:scale-[0.96]"
          >
            {open ? (
              <X size={22} weight="bold" aria-hidden="true" />
            ) : (
              <List size={22} weight="bold" aria-hidden="true" />
            )}
          </button>

          <Crest className="hidden h-[26px] w-[26px] shrink-0 text-gold sm:block" />

          <span className="min-w-0">
            <span className="block truncate font-wordmark text-[12px] font-600 uppercase leading-none tracking-[0.16em] text-ivory sm:text-sm">
              {CHIEF.shortName}
            </span>
            {/* Where you are, in the band rather than repeated as a page
                heading below it. */}
            <span className="mt-50 block truncate text-xs text-ivory/60">
              {current ? current.label : 'Administration'}
            </span>
          </span>
        </div>

        {/* The gold block. In the reference this is where the utilities live,
            cut into the dark band at its right edge rather than floated on it.
            Ebony on gold measures 8.98:1, so these read as buttons and not as
            decoration. */}
        <div className="flex shrink-0 items-center gap-25 bg-gold px-100 sm:gap-100 sm:px-200">
          <Link
            href="/"
            className="inline-flex h-[44px] items-center gap-75 rounded-xl px-100 text-sm font-semibold text-ebony transition-colors duration-500 ease-fluid hover:bg-ebony/10 sm:px-200"
          >
            <ArrowSquareOut size={18} weight="bold" aria-hidden="true" />
            <span className="hidden sm:inline">Visit the site</span>
            <span className="sr-only sm:hidden">Visit the site</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-[44px] items-center gap-75 rounded-xl px-100 text-sm font-semibold text-ebony transition-colors duration-500 ease-fluid hover:bg-ebony/10 sm:px-200"
          >
            <SignOut size={18} weight="bold" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
            <span className="sr-only sm:hidden">Sign out</span>
          </button>
        </div>
      </header>

      {/* The menu. A sheet under the band rather than a full-screen takeover:
          the band stays visible so the office never loses the way out. */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        id="admin-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Admin sections"
        hidden={!open}
        className="fixed inset-x-0 top-[76px] z-30 border-b border-ebony-line bg-ebony-card shadow-[0_24px_60px_rgba(0,0,0,0.65)] sm:top-[80px]"
      >
        <nav aria-label="Admin" className="mx-auto grid w-full max-w-[1180px] gap-100 p-300 sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_LINKS.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex min-h-[56px] items-center gap-200 rounded-tile border px-300 text-base font-semibold transition-all duration-500 ease-fluid active:scale-[0.99]',
                  active
                    ? 'border-gold/50 bg-gold/15 text-ivory'
                    : 'border-ebony-line bg-ebony text-ivory/70 hover:border-gold-dim hover:text-ivory',
                ].join(' ')}
              >
                <Icon
                  size={22}
                  weight="regular"
                  aria-hidden="true"
                  className={active ? 'text-gold' : 'text-ivory/60'}
                />
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
