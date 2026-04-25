"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/authcontext";
import { useTabFocus } from "@/hooks/useTabFocus";
import { fetchNotifications } from "@/lib/notifications";

export function useUnreadCount(pollIntervalMs: number = 30000) {
  const { user, loading: authLoading } = useAuth();
  const isTabFocused = useTabFocus();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const canFetch = !!user && !authLoading;
  const canPoll = canFetch && isTabFocused;

  const load = useCallback(async () => {
    if (!canFetch) return;
    try {
      setLoading(true);
      const res = await fetchNotifications({ page: 1, limit: 1 });
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error("Failed to fetch unread notification count", err);
    } finally {
      setLoading(false);
    }
  }, [canFetch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!canPoll || !pollIntervalMs) return;

    const id = setInterval(() => {
      load();
    }, pollIntervalMs);

    return () => clearInterval(id);
  }, [canPoll, pollIntervalMs, load]);

  return { unreadCount, loading, refresh: load };
}
