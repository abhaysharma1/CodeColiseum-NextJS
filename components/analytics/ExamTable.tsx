"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ExamAnalyticsSummary {
  totalEnrolled: number;
  totalAttempted: number;
  totalCompleted: number;
  completionRate: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
  medianScore: number;
  scoreDistribution: Record<string, number>;
  avgTimeToComplete: number;
  avgAttempts: number;
  totalSubmissions: number;
  acceptedCount: number;
  partialCount: number;
  failedCount: number;
  updatedAt: string | Date;
}

export interface ExamRow {
  examId: string;
  examTitle: string;
  status: string;
  startDate: string | Date;
  endDate: string | Date;
  durationMin: number;
  analytics: ExamAnalyticsSummary | null;
}

interface ExamTableProps {
  data: ExamRow[];
  isLoading?: boolean;
  onRowExpand?: (examId: string) => void;
}

export const ExamTable: React.FC<ExamTableProps> = ({
  data,
  isLoading = false,
  onRowExpand,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Exams ({data.length})</CardTitle>
      </CardHeader>
      <CardContent className="px-7">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Avg Score</TableHead>
                <TableHead className="whitespace-nowrap">Completion</TableHead>
                <TableHead className="whitespace-nowrap">Students</TableHead>
                <TableHead className="whitespace-nowrap">Ended</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No exams found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => {
                  const avgScore = row.analytics?.avgScore;
                  const completion = row.analytics?.completionRate;
                  return (
                    <TableRow key={row.examId}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{row.examTitle}</span>
                          <span className="text-xs text-muted-foreground">
                            {row.durationMin} min
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "finished" ? "default" : "secondary"
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {avgScore == null ? (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        ) : (
                          <Badge
                            variant={
                              avgScore < 50
                                ? "destructive"
                                : avgScore < 80
                                  ? "secondary"
                                  : "default"
                            }
                            className="whitespace-nowrap"
                          >
                            {avgScore.toFixed(1)}%
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {completion == null ? (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        ) : (
                          <span>{Math.round(completion)}%</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {row.analytics
                          ? `${row.analytics.totalCompleted}/${row.analytics.totalEnrolled}`
                          : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.endDate
                          ? formatDistanceToNow(new Date(row.endDate), {
                              addSuffix: true,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRowExpand?.(row.examId)}
                          aria-label="View exam details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamTable;
