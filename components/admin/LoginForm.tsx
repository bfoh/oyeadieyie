'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
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
        data.error === 'not_configured'
          ? 'No admin password is set on this deployment yet.'
          : 'That password is not right.',
      );
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="mt-400 rounded-2xl border border-crimson/40 bg-crimson/5 p-300">
        <p className="text-sm font-semibold text-ivory">The admin is not switched on</p>
        <p className="mt-100 text-sm leading-relaxed text-ivory/65">
          Set <code className="rounded bg-black/40 px-50 text-gold">ADMIN_PASSWORD</code>{' '}
          in the deployment&apos;s environment variables, at least eight
          characters, then reload. Until it is set nothing here will open, which
          is deliberate: a default password on a public address is the same as
          no password at all.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-400" noValidate>
      <label htmlFor="password" className="block text-sm font-semibold text-ivory">
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
          'mt-75 w-full rounded-xl border bg-ebony-raised px-200 py-100 text-base text-ivory transition-colors focus:outline-none',
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
        className="mt-300 w-full rounded-xl bg-gold px-200 py-100 text-base font-semibold text-ebony transition-all hover:bg-[#e6c34d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? 'Checking…' : 'Enter'}
      </button>
    </form>
  );
}
