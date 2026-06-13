import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

interface StudentProblem {
  id: string;
  problemTitle: string;
  problemNumber: number;
  difficulty: string;
  attempts: number;
  lastAttemptAt: string | null;
  isSolved: boolean;
}

interface AssessmentData {
  score: number | null;
  submissionTime: string | null;
}

interface StudentDrawerProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  problems?: StudentProblem[];
  assessment?: AssessmentData | null;
  loading?: boolean;
}

export function StudentDrawer({
  open,
  onClose,
  studentName,
  problems,
  assessment,
  loading,
}: StudentDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{studentName}</DrawerTitle>
          <DrawerDescription>Student progress details</DrawerDescription>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-4 space-y-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              {problems && problems.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Problems</h4>
                  <div className="space-y-2">
                    {problems.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex-shrink-0">
                            {p.isSolved ? (
                              <span className="text-green-500">✓</span>
                            ) : p.attempts > 0 ? (
                              <span className="text-yellow-500">🟡</span>
                            ) : (
                              <span className="text-muted-foreground">⚪</span>
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {p.problemNumber}. {p.problemTitle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.attempts} attempt{p.attempts !== 1 ? "s" : ""}
                              {p.lastAttemptAt &&
                                ` · Last: ${new Date(
                                  p.lastAttemptAt
                                ).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            p.difficulty === "EASY"
                              ? "text-green-600"
                              : p.difficulty === "MEDIUM"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {p.difficulty}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assessment && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Assessment</h4>
                  <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="text-2xl font-bold">
                      {assessment.score !== null
                        ? assessment.score
                        : "—"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {assessment.score !== null
                        ? "Score"
                        : "Not attempted"}
                      {assessment.submissionTime && (
                        <>
                          <br />
                          Submitted:{" "}
                          {new Date(assessment.submissionTime).toLocaleString()}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <DrawerFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
