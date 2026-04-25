"use client";

import { useEffect, useState } from "react";

function getIsTabFocused() {
  if (typeof document === "undefined") return true;

  const isVisible =
    typeof document.visibilityState === "string"
      ? document.visibilityState === "visible"
      : true;

  const isFocused =
    typeof document.hasFocus === "function" ? document.hasFocus() : true;

  return isVisible && isFocused;
}

export function useTabFocus() {
  const [isTabFocused, setIsTabFocused] = useState(() => getIsTabFocused());

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const onChange = () => setIsTabFocused(getIsTabFocused());

    document.addEventListener("visibilitychange", onChange);
    window.addEventListener("focus", onChange);
    window.addEventListener("blur", onChange);

    return () => {
      document.removeEventListener("visibilitychange", onChange);
      window.removeEventListener("focus", onChange);
      window.removeEventListener("blur", onChange);
    };
  }, []);

  return isTabFocused;
}
