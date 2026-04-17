"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_PREFIX = "sorteio-app:";

export function usePersistedState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const fullKey = STORAGE_PREFIX + key;
  const [state, setState] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const isFirst = useRef(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(fullKey);
      if (stored) setState(JSON.parse(stored));
    } catch { /* ignore */ }
    setHydrated(true);
  }, [fullKey]);

  useEffect(() => {
    if (!hydrated) return;
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    try {
      localStorage.setItem(fullKey, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [fullKey, state, hydrated]);

  return [state, setState, hydrated];
}

export function clearPersistedState() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
  keys.forEach((k) => localStorage.removeItem(k));
}
