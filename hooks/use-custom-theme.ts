"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { THEMES, ThemeName } from "@/themes";
import { applyThemeObject } from "@/lib/theme-engine";

export function useCustomTheme() {
  const { theme: mode } = useTheme();
  const [selected, setSelected] = useState<ThemeName | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cc-theme") as ThemeName | null;
    if (saved && THEMES[saved]) {
      setSelected(saved);
    } else {
      // Set KIET Default as fallback if nothing is saved
      setSelected("KIET Default" as ThemeName);
    }
  }, []);

  // Apply theme when selected or mode changes
  useEffect(() => {
    if (!selected || !mode) return;

    const themeJson = THEMES[selected];

    if (!themeJson) {
      console.error("Theme not found:", selected);
      return;
    }

    applyThemeObject(themeJson, mode as "light" | "dark");
  }, [selected, mode]);

  const setThemeName = (name: ThemeName) => {
    localStorage.setItem("cc-theme", name as string);
    setSelected(name);
  };

  return { selected, setThemeName };
}
