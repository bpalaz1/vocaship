"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  const applyTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vocaship_app_theme", newTheme);
        localStorage.setItem("vocaship_reader_theme", newTheme);
      } catch {}
      document.documentElement.setAttribute("data-theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      window.dispatchEvent(new Event("vocaship-theme-change"));
    }
  }, []);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [theme, applyTheme]);

  useEffect(() => {
    const readInitialTheme = () => {
      try {
        const stored = (localStorage.getItem("vocaship_app_theme") ||
          localStorage.getItem("vocaship_reader_theme")) as Theme | null;
        if (stored === "light" || stored === "dark") {
          setThemeState(stored);
          document.documentElement.setAttribute("data-theme", stored);
          if (stored === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      } catch {}
    };

    readInitialTheme();

    const handleThemeChange = () => {
      try {
        const stored = (localStorage.getItem("vocaship_app_theme") ||
          localStorage.getItem("vocaship_reader_theme")) as Theme | null;
        if (stored === "light" || stored === "dark") {
          setThemeState(stored);
        }
      } catch {}
    };

    window.addEventListener("vocaship-theme-change", handleThemeChange);
    window.addEventListener("storage", handleThemeChange);
    return () => {
      window.removeEventListener("vocaship-theme-change", handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

