"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const PREFERENCE_KEY = "theme-preference";
const LEGACY_KEY = "theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(PREFERENCE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
}

function resolvePreference(pref: ThemePreference): ResolvedTheme {
  return pref === "system" ? getSystemTheme() : pref;
}

/**
 * Single source of truth for theme state in `frontend-v2`.
 *
 * Guarantees:
 * - Toggles the `.dark` class on `<html>` so Tailwind `dark:` variants fire.
 * - Mirrors state to `data-theme` and `color-scheme` for native form controls.
 * - Persists to `localStorage` and syncs across tabs.
 * - Reacts to OS-level dark-mode changes when preference is `system`.
 */
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Initial mount: hydrate from localStorage and align DOM.
  useEffect(() => {
    const initialPref = readPreference();
    const initialResolved = resolvePreference(initialPref);
    setPreferenceState(initialPref);
    setResolvedTheme(initialResolved);
    applyTheme(initialResolved);
    setMounted(true);
  }, []);

  // React to OS-level dark-mode changes when preference is `system`.
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      const next: ResolvedTheme = e.matches ? "dark" : "light";
      setResolvedTheme(next);
      applyTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  // Sync across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== PREFERENCE_KEY) return;
      const next = readPreference();
      const resolved = resolvePreference(next);
      setPreferenceState(next);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    const resolved = resolvePreference(next);
    setPreferenceState(next);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    try {
      window.localStorage.setItem(PREFERENCE_KEY, next);
      window.localStorage.setItem(LEGACY_KEY, resolved);
    } catch {
      // storage unavailable — ignore
    }
  }, []);

  const toggle = useCallback(() => {
    const next: ResolvedTheme = resolvedTheme === "dark" ? "light" : "dark";
    setPreference(next);
  }, [resolvedTheme, setPreference]);

  return {
    preference,
    resolvedTheme,
    setPreference,
    toggle,
    mounted,
  };
}

export default useTheme;
