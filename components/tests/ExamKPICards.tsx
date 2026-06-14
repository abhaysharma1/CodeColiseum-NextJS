"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, FileEdit, PlayCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalExams: number;
  draftExams: number;
  activeExams: number;
  completedExams: number;
}

interface ExamKPICardsProps {
  stats?: DashboardStats;
  loading: boolean;
}

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  variant: "default" | "primary" | "success" | "warning" | "destructive";
}

function KpiCard({ title, value, icon: Icon, variant }: KpiCardProps) {
  const variantStyles = {
    default: "bg-card border-border",
    primary: "bg-primary/5 border-primary/20",
    success: "bg-green-500/5 border-green-500/20",
    warning: "bg-yellow-500/5 border-yellow-500/20",
    destructive: "bg-red-500/5 border-red-500/20",
  };

  const iconColors = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    destructive: "text-red-600 dark:text-red-400",
  };

  return (
    <Card className={cn("transition-all duration-300", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", iconColors[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

export function ExamKPICards({ stats, loading }: ExamKPICardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total Exams"
        value={stats.totalExams}
        icon={FileText}
        variant="primary"
      />
      <KpiCard
        title="Draft Exams"
        value={stats.draftExams}
        icon={FileEdit}
        variant="warning"
      />
      <KpiCard
        title="Active Exams"
        value={stats.activeExams}
        icon={PlayCircle}
        variant="success"
      />
      <KpiCard
        title="Completed Exams"
        value={stats.completedExams}
        icon={CheckCircle2}
        variant="default"
      />
    </div>
  );
}
