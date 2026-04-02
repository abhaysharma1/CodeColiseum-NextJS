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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Medal } from "lucide-react";
import Link from "next/link";

export interface TopStudent {
  id: string;
  name: string;
  email: string;
  rank: number;
  avgScore: number;
  completionPercentage: number;
  avatar?: string;
}

interface TopStudentPreviewProps {
  students: TopStudent[];
  loading?: boolean;
  onViewAll?: string;
}

const medalColors = {
  1: "text-yellow-500 dark:text-yellow-400",
  2: "text-gray-400 dark:text-gray-500",
  3: "text-orange-600 dark:text-orange-400",
};

export function TopStudentPreview({
  students,
  loading = false,
  onViewAll,
}: TopStudentPreviewProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Performing Students</CardTitle>
          <CardDescription>Best performers this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Top Performing Students</CardTitle>
          <CardDescription>Best performers this month</CardDescription>
        </div>
        <Medal className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No student data available
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              {students.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Badge
                      variant="outline"
                      className="w-8 h-8 p-0 flex items-center justify-center font-bold"
                    >
                      {idx + 1}
                    </Badge>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {Math.round(student.avgScore)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(student.completionPercentage)}% done
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {onViewAll && (
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link href={onViewAll}>
                  View All Students
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
