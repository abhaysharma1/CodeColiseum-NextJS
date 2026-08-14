"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Circle,
  Search,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useStudentModuleAttempts,
  useStudentProblemSubmissions,
  useTeacherStudentProgress,
  type SortOrder,
  type StudentModuleAttemptProblem,
  type StudentProgress,
  type StudentProgressSortBy,
} from "@/hooks/use-labs";
import { SubmissionStatusBadge } from "./submission-status";

const PAGE_SIZE = 20;

interface StudentProgressTableProps {
  moduleId: string;
  groupId?: string;
}

export function StudentProgressTable({
  moduleId,
  groupId,
}: StudentProgressTableProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<StudentProgressSortBy>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, pagination, loading } = useTeacherStudentProgress(
    moduleId,
    groupId,
    PAGE_SIZE,
    page * PAGE_SIZE,
    debouncedSearch,
    sortBy,
    sortOrder,
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, sortBy, sortOrder, groupId]);

  const handleSort = useCallback((key: StudentProgressSortBy) => {
    setSortBy((current) => {
      if (current === key) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        return current;
      }
      setSortOrder("asc");
      return key;
    });
  }, []);

  const total = pagination?.total ?? 0;
  const pages = pagination?.pages ?? 0;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          {loading ? "Loading..." : `${total} student${total !== 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortHeader
                  label="Student"
                  sortKey="name"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label="Solved"
                  sortKey="solvedProblems"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>Total</TableHead>
              <TableHead>
                <SortHeader
                  label="Completion"
                  sortKey="completionPercentage"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <div className="space-y-3 p-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {debouncedSearch
                    ? "No students match your search"
                    : "No student data available"}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <StudentRow
                  key={row.studentId}
                  row={row}
                  moduleId={moduleId}
                  expanded={expanded === row.studentId}
                  onToggle={() =>
                    setExpanded((cur) =>
                      cur === row.studentId ? null : row.studentId,
                    )
                  }
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages - 1 || loading}
              onClick={() => setPage((p) => p + 1)}
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

function SortHeader({
  label,
  sortKey,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  sortKey: StudentProgressSortBy;
  sortBy: StudentProgressSortBy;
  sortOrder: SortOrder;
  onSort: (key: StudentProgressSortBy) => void;
}) {
  const active = sortBy === sortKey;
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-2 gap-1 font-medium h-8")}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {active ? (
        sortOrder === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </Button>
  );
}

function StudentRow({
  row,
  moduleId,
  expanded,
  onToggle,
}: {
  row: StudentProgress;
  moduleId: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Fragment>
      <TableRow
        className="cursor-pointer transition-colors hover:bg-accent/40"
        onClick={onToggle}
      >
        <TableCell className="font-medium">{row.studentName}</TableCell>
        <TableCell className="tabular-nums">{row.solvedProblems}</TableCell>
        <TableCell className="tabular-nums">{row.totalProblems}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  row.completionPercentage >= 70
                    ? "bg-green-500"
                    : row.completionPercentage >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500",
                )}
                style={{ width: `${row.completionPercentage}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground tabular-nums">
              {row.completionPercentage}%
            </span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <ChevronDown
            className={cn(
              "h-4 w-4 ml-auto transition-transform duration-200 text-muted-foreground",
              expanded && "rotate-180",
            )}
          />
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={5} className="p-0">
            <StudentAttemptDetails
              moduleId={moduleId}
              studentId={row.studentId}
              studentName={row.studentName}
            />
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}

function StudentAttemptDetails({
  moduleId,
  studentId,
  studentName,
}: {
  moduleId: string;
  studentId: string;
  studentName: string;
}) {
  const { data, loading } = useStudentModuleAttempts(moduleId, studentId, true);
  const [openProblems, setOpenProblems] = useState<string[]>([]);

  useEffect(() => {
    setOpenProblems([]);
  }, [studentId]);

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <XCircle className="h-4 w-4" />
        Failed to load attempt details
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">{data.studentName || studentName}</span>
        <Badge variant="secondary" className="tabular-nums">
          {data.solvedProblems} solved
        </Badge>
        <Badge variant="outline" className="tabular-nums">
          {data.totalProblems} problems
        </Badge>
      </div>

      {data.problems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No problems in this module
        </p>
      ) : (
        <Accordion
          type="multiple"
          value={openProblems}
          onValueChange={setOpenProblems}
        >
          {data.problems.map((problem) => (
            <AccordionItem
              key={problem.moduleProblemId}
              value={problem.moduleProblemId}
              className="border-b border-border/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex flex-1 items-center justify-between gap-3 pr-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <ProblemStatusIcon
                      isSolved={problem.isSolved}
                      attemptCount={problem.attemptCount}
                    />
                    <span className="truncate font-medium">
                      {problem.problemNumber}. {problem.problemTitle}
                    </span>
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground whitespace-nowrap">
                    {problem.bestSubmission ? (
                      <>
                        <SubmissionStatusBadge
                          status={problem.bestSubmission.status}
                        />
                        <span className="tabular-nums">
                          {problem.bestSubmission.passedTestcases}/
                          {problem.bestSubmission.totalTestcases} passed
                        </span>
                      </>
                    ) : (
                      <span>Not attempted</span>
                    )}
                    <span>
                      {problem.attemptCount} attempt
                      {problem.attemptCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ProblemSubmissions
                  moduleId={moduleId}
                  studentId={studentId}
                  problem={problem}
                  open={openProblems.includes(problem.moduleProblemId)}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

function ProblemSubmissions({
  moduleId,
  studentId,
  problem,
  open,
}: {
  moduleId: string;
  studentId: string;
  problem: StudentModuleAttemptProblem;
  open: boolean;
}) {
  const { data, loading } = useStudentProblemSubmissions(
    moduleId,
    studentId,
    problem.moduleProblemId,
    open,
  );
  const [showCodeId, setShowCodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setShowCodeId(null);
  }, [open]);

  if (loading) {
    return (
      <div className="space-y-2 py-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <p className="py-2 text-xs text-muted-foreground">
        Failed to load submissions
      </p>
    );
  }

  if (data.submissions.length === 0) {
    return (
      <p className="py-2 text-xs text-muted-foreground">
        No submissions for this problem
      </p>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {data.submissions.map((s, idx) => (
        <div key={s.id} className="rounded-lg border bg-background p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                #{idx + 1}
              </span>
              <SubmissionStatusBadge status={s.status} />
              <span className="text-xs text-muted-foreground tabular-nums">
                {s.passedTestcases}/{s.totalTestcases} test
                {s.totalTestcases !== 1 ? "s" : ""} passed
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="uppercase">{s.language}</span>
              {s.executionTime != null && (
                <span className="tabular-nums">{s.executionTime}s</span>
              )}
              {s.memory != null && (
                <span className="tabular-nums">{s.memory} MB</span>
              )}
              <span>{new Date(s.createdAt).toLocaleString()}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() =>
                  setShowCodeId((cur) => (cur === s.id ? null : s.id))
                }
              >
                {showCodeId === s.id ? "Hide code" : "View code"}
              </Button>
            </div>
          </div>
          {showCodeId === s.id && (
            <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap break-all">
              {s.sourceCode || "(no source code saved)"}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

function ProblemStatusIcon({
  isSolved,
  attemptCount,
}: {
  isSolved: boolean;
  attemptCount: number;
}) {
  if (isSolved) {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />;
  }
  if (attemptCount > 0) {
    return <Circle className="h-4 w-4 shrink-0 text-yellow-500 fill-yellow-500/20" />;
  }
  return <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs",
        difficulty === "EASY"
          ? "text-green-600"
          : difficulty === "MEDIUM"
            ? "text-yellow-600"
            : "text-red-600",
      )}
    >
      {difficulty}
    </Badge>
  );
}
