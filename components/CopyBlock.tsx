'use client';

import { useState } from 'react';
import { Copy, Check } from '@phosphor-icons/react/dist/ssr';

/**
 * A block of approved copy a journalist can lift verbatim.
 * Falls back to selecting the text when the clipboard API is unavailable
 * (older browsers, insecure origins), so the copy is never trapped.
 */
export function CopyBlock({
  label,
  text,
  wordCount,
}: {
  label: string;
  text: string;
  wordCount: string;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
      setTimeout(() => setState('idle'), 2200);
    } catch {
      setState('failed');
      setTimeout(() => setState('idle'), 3500);
    }
  }

  return (
    <div className="rounded-2xl border border-ebony-line bg-ebony-raised/70 p-300 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-200">
        <div>
          <h3 className="font-display text-xl font-600 text-ivory">{label}</h3>
          <p className="mt-25 text-xs text-ivory/40">{wordCount}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-[44px] items-center gap-75 rounded-xl border border-white/20 px-200 py-100 text-sm font-semibold text-ivory transition-all duration-700 ease-fluid hover:border-gold hover:text-gold active:scale-[0.98]"
        >
          {state === 'copied' ? (
            <>
              <Check size={15} weight="bold" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy size={15} weight="bold" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>

      {state === 'failed' && (
        <p role="status" className="mt-100 text-sm text-crimson">
          Your browser blocked the clipboard. Select the text below and copy it
          by hand.
        </p>
      )}

      <div className="mt-200 grid gap-200 border-t border-ebony-line pt-200">
        {text.split('\n\n').map((para, i) => (
          <p key={i} className="text-base leading-relaxed text-ivory/70">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
