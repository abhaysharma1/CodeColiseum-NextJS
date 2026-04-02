"use client";

import { Bell } from "lucide-react";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/NotificationDropdown";

export function NotificationBell() {
  const { unreadCount } = useUnreadCount();

  const displayCount = unreadCount > 9 ? "9+" : String(unreadCount || "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              aria-label={`${unreadCount} unread notifications`}
              className="absolute -right-1 -top-1 h-4 min-w-[1rem] justify-center rounded-full px-1 text-[10px]"
            >
              {displayCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <NotificationDropdown />
    </DropdownMenu>
  );
}
