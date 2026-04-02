"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  LucideIcon,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ActivityItem {
  id: string;
  type:
    | "exam_created"
    | "student_submission"
    | "exam_published"
    | "group_created";
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const activityIcons: Record<string, LucideIcon> = {
  exam_created: FileText,
  student_submission: CheckCircle2,
  exam_published: BookOpen,
  group_created: Users,
};

const activityColors: Record<string, string> = {
  exam_created: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  student_submission: "bg-green-500/10 text-green-700 dark:text-green-400",
  exam_published: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  group_created: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

const activityBadgeVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  exam_created: "secondary",
  student_submission: "default",
  exam_published: "default",
  group_created: "outline",
};

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
  emptyMessage?: string;
}

export function RecentActivity({
  activities,
  loading = false,
  emptyMessage = "No recent activity",
}: RecentActivityProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <CardDescription>Latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type] || Clock;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b last:pb-0 last:border-0"
                >
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      activityColors[activity.type]
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {activity.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={activityBadgeVariants[activity.type]}
                    className="whitespace-nowrap text-xs flex-shrink-0"
                  >
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
