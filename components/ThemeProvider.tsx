"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES, type ThemeName } from "@/lib/theme";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
      if (stored === "default" || stored === "pink" || stored === "blue") {
        setThemeState(stored);
      }
    } catch {
      // localStorage unavailable (private mode) — fall back to default theme
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    const accent = THEMES.find((t) => t.id === theme)?.previewAccent;
    if (meta && accent) meta.setAttribute("content", accent);
  }, [theme]);

  function setTheme(next: ThemeName) {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // per-device preference only — safe to skip persistence if unavailable
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
