"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

export interface ExamDetailsResponse {
  exam: {
    id: string;
    title: string;
    status: string;
    startDate: string | Date;
    endDate: string | Date;
    durationMin: number;
  };
  analytics: {
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
  };
  problemDifficulties: Array<{
    problemId: string;
    problemNumber?: number;
    problemTitle?: string;
    difficulty?: string;
    avgScore: number;
    failureRate: number;
  }>;
}

export interface ExamExpandedRowProps {
  examName: string;
  isLoading?: boolean;
  data?: ExamDetailsResponse;
}

export const ExamExpandedRow: React.FC<ExamExpandedRowProps> = ({
  examName,
  isLoading = false,
  data,
}) => {
  const [activeTab, setActiveTab] = useState<
    "summary" | "distribution" | "problems"
  >("summary");

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">
            Loading details for {examName}...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">
            No exam analytics available
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const distributionEntries = Object.entries(
    data.analytics.scoreDistribution || {}
  );

  return (
    <div className="mt-4 rounded-lg border bg-muted/20 p-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="problems">Problems</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      data.exam.status === "finished" ? "default" : "secondary"
                    }
                  >
                    {data.exam.status}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Avg Score</TableCell>
                <TableCell>{data.analytics.avgScore.toFixed(1)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Median Score</TableCell>
                <TableCell>{data.analytics.medianScore.toFixed(1)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Completion Rate</TableCell>
                <TableCell>
                  {Math.round(data.analytics.completionRate)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Students</TableCell>
                <TableCell>
                  {data.analytics.totalCompleted}/{data.analytics.totalEnrolled}{" "}
                  completed
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Avg Time To Complete</TableCell>
                <TableCell>
                  {Math.round(data.analytics.avgTimeToComplete)} min
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Avg Attempts</TableCell>
                <TableCell>
                  {data.analytics.avgAttempts.toFixed(2)} / (student·problem)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Submissions</TableCell>
                <TableCell>
                  {data.analytics.totalSubmissions} total (A:{" "}
                  {data.analytics.acceptedCount}, P:{" "}
                  {data.analytics.partialCount}, F: {data.analytics.failedCount}
                  )
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Updated</TableCell>
                <TableCell>
                  {data.analytics.updatedAt
                    ? formatDistanceToNow(new Date(data.analytics.updatedAt), {
                        addSuffix: true,
                      })
                    : "-"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="distribution" className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Range</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributionEntries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground py-8"
                  >
                    No distribution data.
                  </TableCell>
                </TableRow>
              ) : (
                distributionEntries.map(([range, count]) => (
                  <TableRow key={range}>
                    <TableCell>{range}</TableCell>
                    <TableCell className="tabular-nums">{count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="problems" className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="whitespace-nowrap">Avg Score</TableHead>
                <TableHead className="whitespace-nowrap">Failure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.problemDifficulties.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No per-problem data.
                  </TableCell>
                </TableRow>
              ) : (
                data.problemDifficulties.map((p) => (
                  <TableRow key={p.problemId}>
                    <TableCell>
                      {p.problemNumber != null ? `#${p.problemNumber} ` : ""}
                      {p.problemTitle || p.problemId}
                    </TableCell>
                    <TableCell>{p.difficulty || "-"}</TableCell>
                    <TableCell>{p.avgScore.toFixed(1)}%</TableCell>
                    <TableCell>{Math.round(p.failureRate)}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamExpandedRow;
