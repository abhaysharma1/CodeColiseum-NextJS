import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBackendURL } from "@/utils/utilities";
import {
  GetProblemSubmissionsResponse,
  ProblemSubmissionItem,
  ExecutionStatusType,
} from "./interface";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 20;

const statusConfig: Record<
  ExecutionStatusType,
  { icon: React.ReactNode; label: string; color: string; bgColor: string }
> = {
  ACCEPTED: {
    icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    label: "Accepted",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
  },
  PARTIAL: {
    icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
    label: "Partially Correct",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  },
  WRONG_ANSWER: {
    icon: <XCircle className="h-4 w-4 text-red-600" />,
    label: "Wrong Answer",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  },
  TIME_LIMIT: {
    icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
    label: "Time Limit Exceeded",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  },
  MEMORY_LIMIT: {
    icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
    label: "Memory Limit Exceeded",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  },
  RUNTIME_ERROR: {
    icon: <XCircle className="h-4 w-4 text-red-600" />,
    label: "Runtime Error",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  },
  COMPILE_ERROR: {
    icon: <XCircle className="h-4 w-4 text-red-600" />,
    label: "Compilation Error",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  },
  INTERNAL_ERROR: {
    icon: <XCircle className="h-4 w-4 text-red-600" />,
    label: "Internal Error",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  },
  BAD_SCALING: {
    icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
    label: "Scaling Error",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  },
  PENDING: {
    icon: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    label: "Pending",
    color: "text-muted-foreground",
    bgColor: "bg-muted border-border",
  },
  RUNNING: {
    icon: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    label: "Running",
    color: "text-muted-foreground",
    bgColor: "bg-muted border-border",
  },
};

function getStatusConfig(status: ExecutionStatusType) {
  return (
    statusConfig[status] ?? {
      icon: <AlertCircle className="h-4 w-4 text-gray-600" />,
      label: status,
      color: "text-gray-700 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800",
    }
  );
}

function Pagination({
  currentPage,
  totalPages,
  total,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="text-sm text-muted-foreground">
        Showing {startItem}–{endItem} of {total}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 7) {
            pageNum = i + 1;
          } else if (currentPage <= 4) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 3) {
            pageNum = totalPages - 6 + i;
          } else {
            pageNum = currentPage - 3 + i;
          }
          return (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "outline"}
              size="sm"
              className="min-w-[36px]"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export function Submissions({
  problemId,
  submissionRefetch,
  setSubmissionRefetch,
  submissions,
  setSubmissions,
}: {
  problemId?: string;
  submissionRefetch: boolean;
  setSubmissionRefetch: (data: boolean) => void;
  submissions: ProblemSubmissionItem[] | undefined;
  setSubmissions: (data: ProblemSubmissionItem[]) => void;
}) {
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  const fetchSubmissions = useCallback(async () => {
    if (!problemId) return;

    try {
      setLoadingSubmissions(true);
      const skip = (currentPage - 1) * PAGE_SIZE;
      const response = await axios.post<GetProblemSubmissionsResponse>(
        `${getBackendURL()}/problems/getsubmissions`,
        {
          problemId,
          skip,
          take: PAGE_SIZE,
        },
        { withCredentials: true }
      );
      setSubmissions(response.data.submissions);
      setTotalSubmissions(response.data.total);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      toast.error("Failed to load submission history");
    } finally {
      setLoadingSubmissions(false);
    }
  }, [problemId, currentPage, setSubmissions]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    if (submissionRefetch == true) {
      setCurrentPage(1);
      fetchSubmissions();
      setSubmissionRefetch(false);
    }
  }, [submissionRefetch, fetchSubmissions, setSubmissionRefetch]);

  if (loadingSubmissions) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <Spinner variant="ring" />
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No submissions yet. Submit your code to see your submission history.
      </div>
    );
  }

  const totalPages = Math.ceil(totalSubmissions / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Total Submissions: {totalSubmissions}
      </div>
      {submissions.map((submission, index) => {
        const config = getStatusConfig(submission.status);
        return (
          <Card key={submission.id} className="animate-fade-down animate-once">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-md border ${config.bgColor}`}
                  >
                    {config.icon}
                    <span
                      className={`text-xs font-semibold ${config.color}`}
                    >
                      {config.label}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base">
                      Submission #{totalSubmissions - (currentPage - 1) * PAGE_SIZE - index}
                    </CardTitle>
                    <CardDescription>
                      {new Date(submission.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
                {submission.totalTestcases > 0 && (
                  <Badge variant="outline" className="shrink-0">
                    {submission.noOfPassedCases}/{submission.totalTestcases} passed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Language:</span>
                    <Badge variant="secondary">
                      {submission.language.toUpperCase()}
                    </Badge>
                  </div>
                  {submission.executionTime !== null &&
                    submission.executionTime !== undefined && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>Time:</span>
                        <span className="font-medium tabular-nums text-foreground">
                          {submission.executionTime}
                        </span>
                        <span>ms</span>
                      </div>
                    )}
                  {submission.memory !== null &&
                    submission.memory !== undefined && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>Memory:</span>
                        <span className="font-medium tabular-nums text-foreground">
                          {submission.memory}
                        </span>
                        <span>KB</span>
                      </div>
                    )}
                </div>

                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    View Code
                  </summary>
                  <pre className="mt-2 p-3 bg-accent/30 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                    {submission.sourceCode}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        );
      })}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={totalSubmissions}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
