"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setAppTheme: (theme: Theme) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  isDark: true,
  setAppTheme: () => {},
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);
export const useTheme = useAppTheme;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  const setAppTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vocaship_app_theme", newTheme);
        localStorage.setItem("vocaship_reader_theme", newTheme);
      } catch {}
      document.documentElement.setAttribute("data-theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      window.dispatchEvent(new Event("vocaship-theme-change"));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setAppTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setAppTheme]);

  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const stored = (localStorage.getItem("vocaship_app_theme") ||
          localStorage.getItem("vocaship_reader_theme") ||
          "dark") as Theme;
        const resolved: Theme = stored === "light" ? "light" : "dark";
        setThemeState(resolved);
        document.documentElement.setAttribute("data-theme", resolved);
        document.documentElement.classList.toggle("dark", resolved === "dark");
      } catch {}
    };

    syncFromStorage();

    window.addEventListener("vocaship-theme-change", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("vocaship-theme-change", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        setAppTheme,
        setTheme: setAppTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

