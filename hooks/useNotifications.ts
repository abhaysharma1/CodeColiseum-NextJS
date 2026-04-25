"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/authcontext";
import { useTabFocus } from "@/hooks/useTabFocus";
import {
  FetchNotificationsParams,
  NotificationItem,
  NotificationListResponse,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
} from "@/lib/notifications";

export type UseNotificationsOptions = {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: FetchNotificationsParams["type"];
  priority?: FetchNotificationsParams["priority"];
  pollIntervalMs?: number;
};

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { user, loading: authLoading } = useAuth();
  const isTabFocused = useTabFocus();
  const [data, setData] = useState<NotificationListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    page = 1,
    limit = 20,
    isRead,
    type,
    priority,
    pollIntervalMs = 30000,
  } = options;

  const canFetch = !!user && !authLoading;
  const canPoll = canFetch && isTabFocused;

  const params: FetchNotificationsParams = useMemo(
    () => ({ page, limit, isRead, type, priority }),
    [page, limit, isRead, type, priority]
  );

  const load = useCallback(async () => {
    if (!canFetch) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetchNotifications(params);
      setData(res);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [canFetch, params]);

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

  const markAsRead = useCallback(
    async (recipientId: string) => {
      if (!canFetch || !recipientId) return;
      try {
        await markNotificationsRead([recipientId]);
        setData((prev) => {
          if (!prev) return prev;
          const updatedData = prev.data.map((item) =>
            item.recipientId === recipientId
              ? { ...item, isRead: true, readAt: new Date().toISOString() }
              : item
          );
          const unreadCount = Math.max(
            0,
            prev.unreadCount -
              (prev.data.find((i) => i.recipientId === recipientId)?.isRead
                ? 0
                : 1)
          );
          return { ...prev, data: updatedData, unreadCount };
        });
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    },
    [canFetch]
  );

  const markAllAsRead = useCallback(async () => {
    if (!canFetch) return;
    try {
      await markAllNotificationsRead();
      setData((prev) => {
        if (!prev) return prev;
        const updatedData = prev.data.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt ?? new Date().toISOString(),
        }));
        return { ...prev, data: updatedData, unreadCount: 0 };
      });
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  }, [canFetch]);

  return {
    notifications: data?.data ?? [],
    pagination: data?.pagination,
    unreadCount: data?.unreadCount ?? 0,
    loading,
    error,
    refresh: load,
    markAsRead,
    markAllAsRead,
  };
}
