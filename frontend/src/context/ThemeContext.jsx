/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const resolveTheme = (pref) => {
  if (pref === "dark") return "dark";
  if (pref === "light") return "light";
  return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreference] = useState(() => {
    return localStorage.getItem("posthub_theme_preference") || localStorage.getItem("posthub_theme") || "system";
  });

  const appliedTheme = resolveTheme(themePreference);

  useEffect(() => {
    const current = resolveTheme(themePreference);
    document.documentElement.setAttribute("data-theme", current);
    document.documentElement.setAttribute("data-bs-theme", current);
    localStorage.setItem("posthub_theme_preference", themePreference);
    localStorage.setItem("posthub_theme", current);

    if (themePreference === "system" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e) => {
        const sysTheme = e.matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", sysTheme);
        document.documentElement.setAttribute("data-bs-theme", sysTheme);
        localStorage.setItem("posthub_theme", sysTheme);
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [themePreference]);

  const toggleTheme = () => {
    setThemePreference((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setThemeMode = (mode) => {
    setThemePreference(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme: appliedTheme, themePreference, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
