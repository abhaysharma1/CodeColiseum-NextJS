"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/authcontext";
import {
  SentNotificationListResponse,
  fetchSentNotifications,
  NotificationType,
} from "@/lib/notifications";

export type UseSentNotificationsOptions = {
  page?: number;
  limit?: number;
  type?: NotificationType;
};

export function useSentNotifications(
  options: UseSentNotificationsOptions = {}
) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<SentNotificationListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { page = 1, limit = 20, type } = options;

  const canFetch = !!user && !authLoading;

  const params = useMemo(() => ({ page, limit, type }), [page, limit, type]);

  const load = useCallback(async () => {
    if (!canFetch) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetchSentNotifications(params);
      setData(res);
    } catch (err) {
      console.error("Failed to fetch sent notifications", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [canFetch, params]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    sent: data?.data ?? [],
    pagination: data?.pagination,
    loading,
    error,
    refresh: load,
  };
}
