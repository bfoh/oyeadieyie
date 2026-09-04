'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { Lens } from '@/lib/content';

type LensState = {
  lens: Lens;
  setLens: (l: Lens) => void;
  toggle: () => void;
};

const Ctx = createContext<LensState | null>(null);

export function LensProvider({ children }: { children: React.ReactNode }) {
  const [lens, setLens] = useState<Lens>('regal');

  const value = useMemo(
    () => ({
      lens,
      setLens,
      toggle: () => setLens((l) => (l === 'regal' ? 'modern' : 'regal')),
    }),
    [lens],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLens() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLens must be used inside LensProvider');
  return ctx;
}
