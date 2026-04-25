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

export interface ProblemDetailResponse {
  problem: {
    id: string;
    number: number;
    title: string;
    difficulty: string;
  };
  stats: {
    difficultyTier: string;
    successRate: number;
    failureRate: number;
    totalStudents: number;
    attemptedCount: number;
    acceptedCount: number;
    totalAttempts: number;
    avgRuntime: number;
    avgMemory: number;
    avgTime: number;
    updatedAt: string | Date;
  };
}

export interface ProblemStudentRow {
  studentId: string;
  name: string;
  email: string;
  attempts: number;
  solved: boolean;
  isWeak: boolean;
  successRate: number;
  avgTime: number;
  lastAttemptAt: string | Date | null;
}

export interface ProblemStudentsResponse {
  data: ProblemStudentRow[];
}

export interface ProblemExpandedRowProps {
  problemName: string;
  isLoading?: boolean;
  details?: ProblemDetailResponse;
  students?: ProblemStudentsResponse;
}

export const ProblemExpandedRow: React.FC<ProblemExpandedRowProps> = ({
  problemName,
  isLoading = false,
  details,
  students,
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "students">("summary");

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">
            Loading details for {problemName}...
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

  if (!details) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">
            No problem details available
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="mt-4 rounded-lg border bg-muted/20 p-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
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
                <TableCell>Detected Tier</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      details.stats.difficultyTier === "hard"
                        ? "destructive"
                        : details.stats.difficultyTier === "easy"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {details.stats.difficultyTier}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Success Rate</TableCell>
                <TableCell>{Math.round(details.stats.successRate)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Failure Rate</TableCell>
                <TableCell>{Math.round(details.stats.failureRate)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Attempted</TableCell>
                <TableCell>
                  {details.stats.attemptedCount}/{details.stats.totalStudents}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Attempts</TableCell>
                <TableCell>{details.stats.totalAttempts}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Accepted</TableCell>
                <TableCell>{details.stats.acceptedCount}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Avg Time</TableCell>
                <TableCell>{Math.round(details.stats.avgTime)} min</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Updated</TableCell>
                <TableCell>
                  {details.stats.updatedAt
                    ? formatDistanceToNow(new Date(details.stats.updatedAt), {
                        addSuffix: true,
                      })
                    : "-"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="students" className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Success</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Attempt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!students?.data?.length ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No student data.
                  </TableCell>
                </TableRow>
              ) : (
                students.data.map((s) => (
                  <TableRow key={s.studentId}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{s.attempts}</TableCell>
                    <TableCell>{Math.round(s.successRate)}%</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.solved
                            ? "default"
                            : s.isWeak
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {s.solved ? "Solved" : s.isWeak ? "Weak" : "Attempted"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.lastAttemptAt
                        ? formatDistanceToNow(new Date(s.lastAttemptAt), {
                            addSuffix: true,
                          })
                        : "-"}
                    </TableCell>
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

export default ProblemExpandedRow;
