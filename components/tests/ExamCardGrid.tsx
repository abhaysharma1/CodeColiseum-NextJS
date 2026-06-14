"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExamCard, ExamCardData } from "@/components/tests/ExamCard";
import { FileQuestion, ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface ExamCardGridProps {
  exams: ExamCardData[];
  loading: boolean;
  pagination?: PaginationInfo;
  selectedIds: Set<string>;
  onSelectChange: (id: string, checked: boolean) => void;
  onPageChange: (page: number) => void;
  onCreateExam: () => void;
}

function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-4 w-2/3 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onCreateExam }: { onCreateExam: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No exams found</h3>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
        Create your first assessment to get started.
      </p>
      <Button onClick={onCreateExam}>Create Exam</Button>
    </div>
  );
}

export function ExamCardGrid({
  exams,
  loading,
  pagination,
  selectedIds,
  onSelectChange,
  onPageChange,
  onCreateExam,
}: ExamCardGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!exams.length) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <EmptyState onCreateExam={onCreateExam} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <ExamCard
            key={exam.id}
            exam={exam}
            selected={selectedIds.has(exam.id)}
            onSelectChange={(checked) => onSelectChange(exam.id, checked)}
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
            <span className="ml-1">
              ({pagination.totalCount} exam
              {pagination.totalCount !== 1 ? "s" : ""})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
