"use client";
import { useEffect, useMemo, useState } from "react";

export function useRemainingTime(expiresAt: string | Date | undefined) {
  const expiry = useMemo(() => {
    if (!expiresAt) return null;
    return new Date(expiresAt).getTime();
  }, [expiresAt]);
  
  const [remaining, setRemaining] = useState<number | undefined>(() => {
    if (!expiry) return undefined;
    return Math.max(0, Math.floor((expiry - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!expiry) {
      setRemaining(undefined);
      return;
    }

    const interval = setInterval(() => {
      const secondsLeft = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setRemaining(secondsLeft);
      
      if (secondsLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiry]);

  return remaining;
}
