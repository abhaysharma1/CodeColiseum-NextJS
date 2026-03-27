"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function StudentNotificationsPage() {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);

  const { notifications, pagination, loading, markAsRead, markAllAsRead } =
    useNotifications({
      page,
      limit: 20,
      isRead: tab === "unread" ? false : undefined,
    });

  const totalPages = pagination?.pages ?? 1;

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            Stay up to date with exams, groups, and announcements.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
          Mark all as read
        </Button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as "all" | "unread");
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
      </Tabs>

      <Separator />

      <Card className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-4">
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            )}

            {!loading &&
              notifications.map((n) => (
                <div
                  key={n.recipientId}
                  className={`flex flex-col gap-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                    !n.isRead ? "bg-muted/60" : "bg-background"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{n.title}</span>
                      {!n.isRead && (
                        <Badge variant="default" className="text-[10px]">
                          Unread
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      {n.type}
                    </Badge>
                    <Badge
                      variant={
                        n.priority === "HIGH" || n.priority === "URGENT"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {n.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-7 px-2 text-[11px]"
                      onClick={() => markAsRead(n.recipientId)}
                      disabled={n.isRead}
                    >
                      Mark as read
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
          <span>
            Page {pagination?.page ?? 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((p) =>
                  totalPages ? Math.min(totalPages, p + 1) : p + 1
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
