"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/authcontext";
import { fetchNotifications } from "@/lib/notifications";

export function useUnreadCount(pollIntervalMs: number = 30000) {
  const { user, loading: authLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const canFetch = !!user && !authLoading;

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
    if (!canFetch || !pollIntervalMs) return;

    const id = setInterval(() => {
      load();
    }, pollIntervalMs);

    return () => clearInterval(id);
  }, [canFetch, pollIntervalMs, load]);

  return { unreadCount, loading, refresh: load };
}
