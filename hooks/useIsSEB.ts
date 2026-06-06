"use client";

import { useState, useEffect } from "react";

// Extend the global Window interface to recognize SEB's custom API
declare global {
  interface Window {
    SafeExamBrowser?: {
      version?: string;
      getBrowserExamKey?: () => string;
      getConfigKey?: () => string;
    };
  }
}

/**
 * Hook to detect if the current browser environment is Safe Exam Browser (SEB).
 * Safely handles Next.js SSR by executing strictly on the client side.
 */
export function useIsSEB(): boolean {
  const [isSEB, setIsSEB] = useState<boolean>(false);

  useEffect(() => {
    // 1. Fallback to false if window or navigator is not defined
    if (typeof window === "undefined" || !window.navigator) {
      setIsSEB(false);
      return;
    }

    // 2. Check the User Agent string for "SEB"
    const userAgentContainsSEB = /SEB/i.test(navigator.userAgent);

    // 3. Check for the modern Safe Exam Browser JavaScript API object
    const hasSEBObject = typeof window.SafeExamBrowser !== "undefined";

    console.log(userAgentContainsSEB || hasSEBObject);

    console.log(navigator.userAgent);
    console.log(window.SafeExamBrowser);

    // Update state if either condition is true
    setIsSEB(userAgentContainsSEB || hasSEBObject);
  }, []);

  return isSEB;
}
