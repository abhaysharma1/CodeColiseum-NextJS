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

export interface StudentData {
  id: string;
  rank: number;
  name: string;
  email: string;
  avgScore: number;
  totalAttempts: number;
  avgAttemptsPerProblem: number;
  completionPercentage: number;
  weakTopics: string[];
  strongTopics: string[];
  scoreTrend: string;
  lastActive: Date | null;
  avgTimePerProblem: number;
}

interface StudentTableProps {
  data: StudentData[];
  isLoading?: boolean;
  onRowExpand?: (studentId: string) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
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
        <CardTitle className="text-base">
          Student Performance ({data.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Avg Time</TableHead>
                <TableHead>Weak Topics</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>#{row.rank}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{row.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {row.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{row.avgScore.toFixed(1)}%</TableCell>
                    <TableCell>{row.totalAttempts}</TableCell>
                    <TableCell>
                      {Math.round(row.avgTimePerProblem)} min
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(row.weakTopics || []).slice(0, 2).map((topic) => (
                          <Badge
                            key={topic}
                            variant="destructive"
                            className="text-xs"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {Math.round(row.completionPercentage)}%
                    </TableCell>
                    <TableCell>
                      {row.lastActive
                        ? formatDistanceToNow(new Date(row.lastActive), {
                            addSuffix: true,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRowExpand?.(row.id)}
                        aria-label="View student details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentTable;
