import axios from "axios";
import { getBackendURL } from "@/utils/utilities";

export type NotificationType = "EXAM" | "ANNOUNCEMENT" | "SYSTEM" | "REMINDER";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type NotificationItem = {
  recipientId: string;
  notificationId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  createdAt: string;
  isRead: boolean;
  readAt?: string | null;
  examId?: string | null;
  groupId?: string | null;
};

export type NotificationListResponse = {
  data: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
};

export type SentNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  createdAt: string;
  examId?: string | null;
  groupId?: string | null;
  recipientsCount: number;
};

export type SentNotificationListResponse = {
  data: SentNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type FetchNotificationsParams = {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
};

export async function fetchNotifications(
  params: FetchNotificationsParams = {}
) {
  const backendUrl = getBackendURL();

  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (typeof params.isRead === "boolean")
    searchParams.set("isRead", String(params.isRead));
  if (params.type) searchParams.set("type", params.type);
  if (params.priority) searchParams.set("priority", params.priority);

  const url = `${backendUrl}/api/notifications?${searchParams.toString()}`;

  const res = await axios.get<NotificationListResponse>(url, {
    withCredentials: true,
  });

  return res.data;
}

export async function fetchSentNotifications(
  params: {
    page?: number;
    limit?: number;
    type?: NotificationType;
  } = {}
) {
  const backendUrl = getBackendURL();

  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.type) searchParams.set("type", params.type);

  const url = `${backendUrl}/api/notifications/sent?${searchParams.toString()}`;

  const res = await axios.get<SentNotificationListResponse>(url, {
    withCredentials: true,
  });

  return res.data;
}

export async function markNotificationsRead(recipientIds: string[]) {
  const backendUrl = getBackendURL();
  const url = `${backendUrl}/api/notifications/read`;

  const res = await axios.patch<{ updatedCount: number; unreadCount: number }>(
    url,
    { recipientIds },
    { withCredentials: true }
  );

  return res.data;
}

export async function markAllNotificationsRead() {
  const backendUrl = getBackendURL();
  const url = `${backendUrl}/api/notifications/read-all`;

  const res = await axios.patch<{ updatedCount: number; unreadCount: number }>(
    url,
    {},
    { withCredentials: true }
  );

  return res.data;
}
