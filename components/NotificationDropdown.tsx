"use client";

import Link from "next/link";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export function NotificationDropdown() {
  const { notifications, loading, markAllAsRead, markAsRead } =
    useNotifications({
      page: 1,
      limit: 5,
    });

  return (
    <DropdownMenuContent align="end" className="w-80 p-0">
      <div className="flex items-center justify-between px-4 py-2">
        <DropdownMenuLabel className="px-0 py-0 text-sm font-semibold">
          Notifications
        </DropdownMenuLabel>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => markAllAsRead()}
        >
          Mark all read
        </Button>
      </div>
      <DropdownMenuSeparator />
      <ScrollArea className="max-h-80">
        {loading && (
          <div className="space-y-2 px-4 py-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}
        {!loading && notifications.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            You&apos;re all caught up.
          </div>
        )}
        {!loading && notifications.length > 0 && (
          <div className="py-1">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.recipientId}
                className="flex cursor-pointer flex-col items-start gap-1 px-4 py-2 text-xs focus:bg-muted/60"
                onClick={() => markAsRead(n.recipientId)}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span
                    className={`line-clamp-1 font-medium ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {n.title}
                  </span>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <div className="line-clamp-2 w-full text-left text-[11px] text-muted-foreground">
                  {n.message}
                </div>
                <div className="mt-1 flex w-full items-center justify-between text-[10px] text-muted-foreground">
                  <div className="flex gap-1">
                    <Badge variant="outline" className="px-1 py-0 text-[10px]">
                      {n.type}
                    </Badge>
                    <Badge
                      variant={
                        n.priority === "HIGH" || n.priority === "URGENT"
                          ? "destructive"
                          : "secondary"
                      }
                      className="px-1 py-0 text-[10px]"
                    >
                      {n.priority}
                    </Badge>
                  </div>
                  <span>{formatDate(n.createdAt)}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </ScrollArea>
      <Separator className="mt-1" />
      <div className="flex items-center justify-between px-3 py-2">
        <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
          <Link href="/dashboard/student/notifications">View all</Link>
        </Button>
      </div>
    </DropdownMenuContent>
  );
}
