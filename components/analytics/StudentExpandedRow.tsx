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

export interface ProblemPerformance {
  problemId: string;
  problemNumber: number;
  problemTitle: string;
  difficulty: string;
  attempts: number;
  solved: boolean;
  isWeak: boolean;
  successRate: number;
  avgTime: number;
}

export interface RecentSubmission {
  id: string;
  problem: string;
  status: string;
  score: number;
  createdAt: string | Date;
}

export interface ExamResult {
  examId: string;
  examTitle: string;
  score: number;
  createdAt: string | Date;
}

export interface StudentExpandedRowProps {
  studentId: string;
  studentName: string;
  isLoading?: boolean;
  data?: {
    problemPerformance: ProblemPerformance[];
    recentSubmissions: RecentSubmission[];
    examHistory: ExamResult[];
  };
}

export const StudentExpandedRow: React.FC<StudentExpandedRowProps> = ({
  studentName,
  isLoading = false,
  data,
}) => {
  const [activeTab, setActiveTab] = useState<
    "problems" | "submissions" | "exams"
  >("problems");

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">
            Loading details for {studentName}...
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
            No detailed data available
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="mt-4 rounded-lg border bg-muted/20 p-4">
      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as "problems" | "submissions" | "exams")
        }
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="problems">Problem Performance</TabsTrigger>
          <TabsTrigger value="submissions">Recent Submissions</TabsTrigger>
          <TabsTrigger value="exams">Exam History</TabsTrigger>
        </TabsList>

        <TabsContent value="problems" className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Success</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.problemPerformance.map((p) => (
                <TableRow key={p.problemId}>
                  <TableCell>
                    #{p.problemNumber} {p.problemTitle}
                  </TableCell>
                  <TableCell>{p.difficulty}</TableCell>
                  <TableCell>{p.attempts}</TableCell>
                  <TableCell>{Math.round(p.successRate)}%</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.solved
                          ? "default"
                          : p.isWeak
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {p.solved ? "Solved" : p.isWeak ? "Weak" : "Attempted"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="submissions" className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentSubmissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.problem}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>{Math.round(s.score)}%</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(s.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="exams" className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.examHistory.map((e) => (
                <TableRow key={e.examId}>
                  <TableCell>{e.examTitle}</TableCell>
                  <TableCell>{Math.round(e.score)}%</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(e.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentExpandedRow;
