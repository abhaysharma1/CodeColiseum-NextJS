"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Users,
  FileText,
  TrendingUp,
  User,
  Clock,
  Eye,
  BarChart3,
  Edit,
  Send,
  Play,
} from "lucide-react";
import Link from "next/link";

export interface ExamCardData {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  studentCount: number;
  problemCount: number;
  passingPercentage: number;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface ExamCardProps {
  exam: ExamCardData;
  selected: boolean;
  onSelectChange: (checked: boolean) => void;
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  DRAFT: {
    label: "Draft",
    variant: "secondary",
    className: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
  SCHEDULED: {
    label: "Scheduled",
    variant: "outline",
    className: "border-blue-500/50 text-blue-600 dark:text-blue-400",
  },
  ACTIVE: {
    label: "Active",
    variant: "default",
    className: "bg-green-600 text-white hover:bg-green-700",
  },
  COMPLETED: {
    label: "Completed",
    variant: "secondary",
    className: "bg-muted-foreground/20 text-muted-foreground",
  },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ExamCard({ exam, selected, onSelectChange }: ExamCardProps) {
  const config = statusConfig[exam.status] || statusConfig.DRAFT;

  return (
    <Card className="group relative transition-all duration-200 hover:shadow-md hover:border-primary/30">
      <div className="absolute top-3 left-3 z-10">
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onSelectChange(!!v)}
          aria-label={`Select ${exam.title}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity data-[state=checked]:opacity-100"
        />
      </div>

      <CardContent className="p-5 pt-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-base leading-tight line-clamp-1 flex-1 pt-2 group-hover:pt-0 transition-all">
            {exam.title}
          </h3>
          <Badge className={config.className} variant={config.variant}>
            {config.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {formatDate(exam.startDate)}
          </span>
          <span className="text-muted-foreground/40">→</span>
          <span>
            {formatDate(exam.endDate)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{exam.studentCount}</span>
            <span className="text-muted-foreground text-xs">students</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{exam.problemCount}</span>
            <span className="text-muted-foreground text-xs">problems</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            {exam.passingPercentage > 0 ? (
              <>
                <span className="font-medium">
                  {Math.round(exam.passingPercentage)}%
                </span>
                <span className="text-muted-foreground text-xs">passing</span>
              </>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{exam.createdBy.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(exam.createdAt)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-4 pt-0 flex gap-2 flex-wrap">
        {exam.status === "DRAFT" && (
          <>
            <Button size="sm" variant="outline" className="flex-1 gap-1.5" asChild>
              <Link href={`/dashboard/teacher/tests/edit/${exam.id}`}>
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
            <Button size="sm" className="flex-1 gap-1.5" asChild>
              <Link href={`/dashboard/teacher/tests/edit/${exam.id}`}>
                <Send className="h-3.5 w-3.5" />
                Publish
              </Link>
            </Button>
          </>
        )}
        {exam.status === "SCHEDULED" && (
          <Button size="sm" variant="outline" className="flex-1 gap-1.5" asChild>
            <Link href={`/dashboard/teacher/tests/edit/${exam.id}`}>
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        )}
        {exam.status === "ACTIVE" && (
          <>
            <Button size="sm" variant="outline" className="flex-1 gap-1.5" asChild>
              <Link href={`/dashboard/teacher/tests/results/${exam.id}`}>
                <Eye className="h-3.5 w-3.5" />
                Monitor
              </Link>
            </Button>
            <Button size="sm" className="flex-1 gap-1.5" asChild>
              <Link href={`/dashboard/teacher/tests/results/${exam.id}`}>
                <BarChart3 className="h-3.5 w-3.5" />
                View Results
              </Link>
            </Button>
          </>
        )}
        {exam.status === "COMPLETED" && (
          <>
            <Button size="sm" variant="outline" className="flex-1 gap-1.5" asChild>
              <Link href={`/dashboard/teacher/tests/results/${exam.id}`}>
                <BarChart3 className="h-3.5 w-3.5" />
                View Results
              </Link>
            </Button>
            <Button size="sm" className="flex-1 gap-1.5" asChild>
              <Link href={`/dashboard/teacher/analytics?examId=${exam.id}`}>
                <TrendingUp className="h-3.5 w-3.5" />
                Analytics
              </Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
