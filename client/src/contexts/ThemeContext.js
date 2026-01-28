import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "beautytime.theme";

const THEMES = {
  light: {
    background: "#F2F2F2",
    card: "#FFFFFF",
    text: "#111111",
    textMuted: "#777777",
    border: "#E0E0E0",
    primary: "#000000",
    primaryText: "#FFFFFF",
    secondary: "#9A9A9A",
    secondaryText: "#FFFFFF",
    accent: "#000000",
    onAccent: "#FFFFFF",
    danger: "#D32F2F",
    dangerText: "#FFFFFF",
    inputBg: "#F0F0F0",
    tabBar: "#C4C4C4",
    overlay: "rgba(0,0,0,0.3)",
  },
  dark: {
    background: "#121212",
    card: "#1E1E1E",
    text: "#F5F5F5",
    textMuted: "#B0B0B0",
    border: "#2C2C2C",
    primary: "#FFFFFF",
    primaryText: "#121212",
    secondary: "#5C5C5C",
    secondaryText: "#FFFFFF",
    accent: "#4DA3FF",
    onAccent: "#FFFFFF",
    danger: "#FF6B6B",
    dangerText: "#121212",
    inputBg: "#2A2A2A",
    tabBar: "#1A1A1A",
    overlay: "rgba(0,0,0,0.5)",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!mounted) return;
        if (stored === "light" || stored === "dark") {
          setTheme(stored);
        }
      })
      .finally(() => {
        if (mounted) setIsThemeLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setAndPersistTheme = useCallback((nextTheme) => {
    setTheme(nextTheme);
    AsyncStorage.setItem(STORAGE_KEY, nextTheme).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      colors: THEMES[theme],
      isThemeLoading,
      toggleTheme,
      setTheme: setAndPersistTheme,
    }),
    [theme, isThemeLoading, toggleTheme, setAndPersistTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }
  return context;
}
