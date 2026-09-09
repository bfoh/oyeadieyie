'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * The form never asks, at render time, whether the deployment has a password.
 *
 * It used to be handed a `configured` boolean from the server and, when that
 * was false, it rendered "The admin is not switched on" instead of the form.
 * That answer is a fact about the running deployment baked into HTML, and HTML
 * gets cached — by the CDN, by the phone's browser, by a page restored from
 * the back/forward cache. The office kept meeting a months-old "not switched
 * on" on a phone while the same URL showed the form on a desktop.
 *
 * So the form always renders, and the only thing that can say the admin is not
 * switched on is the login route itself, answered live on submit. A stale copy
 * of this page is now harmless: it asks the server, and the server is current.
 */
export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<React.ReactNode>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(
        data.error === 'not_configured' ? (
          <>
            The admin is not switched on. Set{' '}
            <code className="rounded bg-black/40 px-50 text-gold">
              ADMIN_PASSWORD
            </code>{' '}
            in the deployment&apos;s environment variables, at least eight
            characters, then try again.
          </>
        ) : data.error === 'too_many_attempts' ? (
          'Too many attempts. Wait a quarter of an hour and try again.'
        ) : (
          'That password is not right.'
        ),
      );
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-500" noValidate>
      <label
        htmlFor="password"
        className="block text-xs font-semibold uppercase tracking-[0.14em] text-ivory/60"
      >
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'login-error' : undefined}
        className={[
          /* Centred with the rest of the card, and tall enough to be a
             comfortable tap target on a phone. */
          'mt-100 w-full rounded-xl border bg-ebony-raised px-200 py-200 text-center text-base text-ivory transition-colors focus:outline-none',
          error ? 'border-crimson' : 'border-white/10 focus:border-gold',
        ].join(' ')}
      />
      {error && (
        <p id="login-error" role="alert" className="mt-100 text-sm text-crimson">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || password.length === 0}
        className="mt-200 w-full rounded-xl bg-gold px-200 py-200 text-base font-semibold text-ebony transition-all hover:bg-[#e6c34d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? 'Checking…' : 'Enter'}
      </button>
    </form>
  );
}
