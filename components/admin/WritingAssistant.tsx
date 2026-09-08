'use client';

import { useState } from 'react';

/**
 * Drafting help, attached to one field.
 *
 * It writes into the field and stops there: the office reads it, edits it and
 * approves it before anything is printed. Nothing it produces reaches the
 * public site or a downloaded file without a person pressing a button first,
 * which is the only footing on which a machine should be drafting words that
 * go out under a chief's name.
 */
export function WritingAssistant({
  kind,
  context,
  onDraft,
  placeholder,
}: {
  kind: string;
  context?: string;
  onDraft: (text: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function draft() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, instruction, context }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.error === 'ai_not_configured'
            ? 'The assistant is not switched on for this deployment yet.'
            : 'That draft did not come back. Try again.',
        );
        return;
      }
      onDraft(String(data.text ?? ''));
      setInstruction('');
      setOpen(false);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-75 inline-flex items-center gap-50 rounded-lg border border-gold/40 px-100 py-50 text-xs font-semibold text-gold transition-colors hover:border-gold hover:bg-gold/10"
      >
        <span aria-hidden="true">✦</span>
        Help me write this
      </button>
    );
  }

  return (
    <div className="mt-100 rounded-xl border border-gold/30 bg-gold/[0.04] p-200">
      <label htmlFor={`assist-${kind}`} className="block text-xs font-semibold uppercase tracking-[0.12em] text-gold">
        What should it say?
      </label>
      <textarea
        id={`assist-${kind}`}
        rows={2}
        value={instruction}
        maxLength={400}
        placeholder={placeholder}
        onChange={(e) => setInstruction(e.target.value)}
        className="mt-75 w-full resize-y rounded-lg border border-white/10 bg-ebony px-100 py-75 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold focus:outline-none"
      />
      {error && (
        <p role="alert" className="mt-75 text-xs text-crimson">
          {error}
        </p>
      )}
      <div className="mt-100 flex items-center gap-100">
        <button
          type="button"
          onClick={draft}
          disabled={busy || instruction.trim().length < 3}
          className="rounded-lg bg-gold px-200 py-50 text-xs font-bold uppercase tracking-[0.08em] text-ebony transition-all hover:bg-[#e6c34d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Drafting…' : 'Draft it'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); }}
          className="text-xs font-semibold text-ivory/50 transition-colors hover:text-ivory"
        >
          Cancel
        </button>
        <span className="ml-auto text-xs text-ivory/40">You approve it before it prints</span>
      </div>
    </div>
  );
}
