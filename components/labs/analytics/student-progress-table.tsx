import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { StudentProgress } from "@/hooks/use-labs";

interface StudentProgressTableProps {
  data: StudentProgress[];
  loading?: boolean;
  onViewStudent?: (studentId: string) => void;
}

export function StudentProgressTable({
  data,
  loading,
  onViewStudent,
}: StudentProgressTableProps) {
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
        No student data available
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Solved Problems</TableHead>
            <TableHead>Total Problems</TableHead>
            <TableHead>Completion %</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.studentId}>
              <TableCell className="font-medium">{row.studentName}</TableCell>
              <TableCell>{row.solvedProblems}</TableCell>
              <TableCell>{row.totalProblems}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        row.completionPercentage >= 70
                          ? "bg-green-500"
                          : row.completionPercentage >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${row.completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {row.completionPercentage}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {onViewStudent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewStudent(row.studentId)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
