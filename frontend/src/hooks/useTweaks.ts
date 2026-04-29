'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Tweaks } from '@/types';

const DEFAULTS: Tweaks = {
  theme: 'light',
  background: 'dots',
  density: 'comfortable',
  cardStyle: 'shadow',
};

const STORAGE_KEY = 'plano_tweaks';

function load(): Tweaks {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function useTweaks() {
  const [tweaks, setTweaks] = useState<Tweaks>(load);

  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.dataset.density = tweaks.density;
  }, [tweaks.theme, tweaks.density]);

  const setTweak = useCallback(
    <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
      setTweaks((prev) => {
        const next = { ...prev, [key]: value };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  return { tweaks, setTweak };
}
