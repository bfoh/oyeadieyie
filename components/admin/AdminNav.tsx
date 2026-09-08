'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CHIEF } from '@/lib/content';
import { Crest } from '../Crest';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/content', label: 'Manage the site' },
  { href: '/admin/branding-hub', label: 'Branding hub' },
  { href: '/admin/checklist', label: 'Launch checklist' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <>
      {/* Phone bar. The sidebar is a drawer below lg. */}
      <div className="flex items-center justify-between border-b border-white/10 bg-ebony px-300 py-200 lg:hidden">
        <span className="flex items-center gap-100">
          <Crest className="h-[22px] w-[22px] shrink-0 text-gold" />
          <span className="font-wordmark text-[11px] font-600 uppercase tracking-[0.16em] text-ivory">
            Palace admin
          </span>
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="rounded-lg border border-white/15 px-200 py-75 text-xs font-semibold text-ivory/80"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <aside
        className={[
          'w-full shrink-0 border-white/10 bg-ebony lg:block lg:w-[248px] lg:border-r',
          open ? 'block border-b' : 'hidden',
        ].join(' ')}
      >
        <div className="hidden items-center gap-150 border-b border-white/10 px-300 py-400 lg:flex">
          <Crest className="h-[30px] w-[30px] shrink-0 text-gold" />
          <span className="font-wordmark text-[11px] font-600 uppercase leading-tight tracking-[0.16em] text-ivory">
            {CHIEF.shortName}
            <span className="mt-50 block text-[9px] tracking-[0.2em] text-gold">Palace admin</span>
          </span>
        </div>

        <nav aria-label="Admin" className="grid gap-25 p-200">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex min-h-[44px] items-center rounded-xl px-200 text-sm font-semibold transition-all',
                  active ? 'bg-gold text-ebony' : 'text-ivory/65 hover:bg-white/5 hover:text-ivory',
                ].join(' ')}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto grid gap-25 border-t border-white/10 p-200">
          <Link
            href="/"
            className="flex min-h-[44px] items-center rounded-xl px-200 text-sm text-ivory/60 transition-colors hover:text-gold"
          >
            Visit the site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex min-h-[44px] items-center rounded-xl px-200 text-left text-sm text-crimson transition-colors hover:text-[#c23b28]"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
