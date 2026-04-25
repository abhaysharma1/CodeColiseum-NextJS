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

export interface ProblemRow {
  problemId: string;
  problemNumber: number;
  problemTitle: string;
  difficulty: string;
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
}

interface ProblemTableProps {
  data: ProblemRow[];
  isLoading?: boolean;
  onRowExpand?: (problemId: string) => void;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({
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
        <CardTitle className="text-base">Problems ({data.length})</CardTitle>
      </CardHeader>
      <CardContent className="px-7">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Problem</TableHead>
                <TableHead className="whitespace-nowrap">Tier</TableHead>
                <TableHead className="whitespace-nowrap">Success</TableHead>
                <TableHead className="whitespace-nowrap">Failure</TableHead>
                <TableHead className="whitespace-nowrap">Attempted</TableHead>
                <TableHead className="whitespace-nowrap">Avg Time</TableHead>
                <TableHead className="whitespace-nowrap">
                  Total Attempts
                </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    No problems found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.problemId}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          #{row.problemNumber} {row.problemTitle}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {row.difficulty}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.difficultyTier === "hard"
                            ? "destructive"
                            : row.difficultyTier === "easy"
                              ? "default"
                              : "secondary"
                        }
                        className="whitespace-nowrap"
                      >
                        {row.difficultyTier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.successRate < 50
                            ? "destructive"
                            : row.successRate < 80
                              ? "secondary"
                              : "default"
                        }
                        className="whitespace-nowrap"
                      >
                        {row.successRate.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.failureRate.toFixed(0)}%
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.attemptedCount}/{row.totalStudents}
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {Math.round(row.avgTime)} min
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.totalAttempts}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRowExpand?.(row.problemId)}
                        aria-label="View problem details"
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

export default ProblemTable;
