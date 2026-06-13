import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProblemAnalytics } from "@/hooks/use-labs";

interface ProblemAnalyticsTableProps {
  data: ProblemAnalytics[];
  loading?: boolean;
}

export function ProblemAnalyticsTable({
  data,
  loading,
}: ProblemAnalyticsTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No problem data available
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Problem</TableHead>
            <TableHead>Attempted</TableHead>
            <TableHead>Solved</TableHead>
            <TableHead>Solve Rate</TableHead>
            <TableHead>Avg Attempts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.problemId}>
              <TableCell>
                <div className="font-medium">
                  {row.problemNumber}. {row.problemTitle}
                </div>
              </TableCell>
              <TableCell>{row.attemptedStudents}</TableCell>
              <TableCell>{row.solvedStudents}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        row.solveRate >= 70
                          ? "bg-green-500"
                          : row.solveRate >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${row.solveRate}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {row.solveRate}%
                  </span>
                </div>
              </TableCell>
              <TableCell>{row.averageAttempts.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
