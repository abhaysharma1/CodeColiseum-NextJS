"use client";

import React, { useEffect } from "react";
import { SubmissionResult, SubmissionTerminalResult } from "./interface";
import { CasesPassedChart } from "@/components/casesPassedChart";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Copy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Terminal statuses are those where execution has finished
const TERMINAL_STATUSES = new Set([
  "ACCEPTED",
  "PARTIAL",
  "WRONG_ANSWER",
  "TIME_LIMIT",
  "MEMORY_LIMIT",
  "RUNTIME_ERROR",
  "COMPILE_ERROR",
  "INTERNAL_ERROR",
  "BAD_SCALING",
]);

function SubmitCode({ results }: { results: SubmissionResult | undefined }) {
  useEffect(() => {
    console.log(results);
  }, [results]);

  if (!results) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Please Submit Your Code to see current Submission
      </div>
    );
  }

  // Show loading state while submission is being processed
  if (!TERMINAL_STATUSES.has(results.status)) {
    return (
      <div className="p-4">
        <div className="relative overflow-hidden rounded-lg">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />

          <Card className="relative border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
                <Loader2 className="w-8 h-8 animate-spin text-primary relative z-10" />
              </div>
              <div className="text-center">
                <CardTitle className="text-lg">
                  Processing Submission…
                </CardTitle>
                <CardDescription className="mt-2">
                  Your code is being executed against test cases. This may take
                  a few moments.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Determine status display content with icons and colors
  const getStatusDisplay = () => {
    const statusConfig: {
      [key: string]: {
        icon: React.ReactNode;
        title: string;
        color: string;
        bgColor: string;
        borderColor: string;
      };
    } = {
      ACCEPTED: {
        icon: <CheckCircle2 className="w-8 h-8 text-green-600" />,
        title: "Accepted",
        color: "text-green-700",
        bgColor: "bg-green-50 dark:bg-green-950/20",
        borderColor: "border-green-200 dark:border-green-800",
      },
      PARTIAL: {
        icon: <AlertCircle className="w-8 h-8 text-amber-600" />,
        title: "Partially Correct",
        color: "text-amber-700",
        bgColor: "bg-amber-50 dark:bg-amber-950/20",
        borderColor: "border-amber-200 dark:border-amber-800",
      },
      WRONG_ANSWER: {
        icon: <XCircle className="w-8 h-8 text-red-600" />,
        title: "Wrong Answer",
        color: "text-red-700",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        borderColor: "border-red-200 dark:border-red-800",
      },
      TIME_LIMIT: {
        icon: <AlertCircle className="w-8 h-8 text-amber-600" />,
        title: "Time Limit Exceeded",
        color: "text-amber-700",
        bgColor: "bg-amber-50 dark:bg-amber-950/20",
        borderColor: "border-amber-200 dark:border-amber-800",
      },
      MEMORY_LIMIT: {
        icon: <AlertCircle className="w-8 h-8 text-amber-600" />,
        title: "Memory Limit Exceeded",
        color: "text-amber-700",
        bgColor: "bg-amber-50 dark:bg-amber-950/20",
        borderColor: "border-amber-200 dark:border-amber-800",
      },
      RUNTIME_ERROR: {
        icon: <XCircle className="w-8 h-8 text-red-600" />,
        title: "Runtime Error",
        color: "text-red-700",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        borderColor: "border-red-200 dark:border-red-800",
      },
      COMPILE_ERROR: {
        icon: <XCircle className="w-8 h-8 text-red-600" />,
        title: "Compilation Error",
        color: "text-red-700",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        borderColor: "border-red-200 dark:border-red-800",
      },
      INTERNAL_ERROR: {
        icon: <XCircle className="w-8 h-8 text-red-600" />,
        title: "Internal Server Error",
        color: "text-red-700",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        borderColor: "border-red-200 dark:border-red-800",
      },
      BAD_SCALING: {
        icon: <AlertCircle className="w-8 h-8 text-amber-600" />,
        title: "Time Complexity Issue",
        color: "text-amber-700",
        bgColor: "bg-amber-50 dark:bg-amber-950/20",
        borderColor: "border-amber-200 dark:border-amber-800",
      },
    };

    const config = statusConfig[results?.status] || {
      icon: <AlertCircle className="w-8 h-8 text-gray-600" />,
      title: "Unknown Status",
      color: "text-gray-700",
      bgColor: "bg-gray-50 dark:bg-gray-950/20",
      borderColor: "border-gray-200 dark:border-gray-800",
    };

    return (
      <div
        className={`flex items-center gap-4 p-4 rounded-lg border ${config.bgColor} ${config.borderColor} mb-6 animate-in fade-in slide-in-from-top-2 duration-300`}
      >
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="flex-1">
          <h2 className={`text-xl font-bold ${config.color}`}>
            {config.title}
          </h2>
        </div>
      </div>
    );
  };

  // Check if we have terminal response with full data
  const hasFullData = results && "sourceCode" in results;
  const terminal = hasFullData
    ? (results as SubmissionTerminalResult & {
        stdout?: string | null;
        message?: string | null;
        error?: string | null;
        yourTimeComplexity?: string | null;
        expectedTimeComplexity?: string | null;
      })
    : null;

  const stdout = terminal?.stdout ?? null;
  const stderr = terminal?.stderr ?? null;
  const extraMessage = terminal?.error ?? terminal?.message ?? null;

  const isErrorStatus =
    results.status === "RUNTIME_ERROR" ||
    results.status === "COMPILE_ERROR" ||
    results.status === "INTERNAL_ERROR" ||
    results.status === "TIME_LIMIT" ||
    results.status === "MEMORY_LIMIT";
  const hasErrorDetails = Boolean(stderr || stdout || extraMessage);

  const showScalingHelp = results.status === "BAD_SCALING";
  const yourTimeComplexity = terminal?.yourTimeComplexity ?? null;
  const expectedTimeComplexity = terminal?.expectedTimeComplexity ?? null;

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      {/* Status Header */}
      {getStatusDisplay()}

      {/* Fallback when backend returns only polling payload */}
      {!hasFullData && (isErrorStatus || showScalingHelp) && (
        <Card
          className={
            showScalingHelp
              ? "border-amber-200 dark:border-amber-800"
              : "border-red-200 dark:border-red-800"
          }
        >
          <CardHeader>
            <CardTitle className="text-base">
              {showScalingHelp
                ? "Performance Issue"
                : results.status === "TIME_LIMIT"
                  ? "Time Limit Exceeded"
                  : results.status === "MEMORY_LIMIT"
                    ? "Memory Limit Exceeded"
                    : "Execution Failed"}
            </CardTitle>
            <CardDescription>
              Detailed output is not available for this submission response. Try
              resubmitting or refreshing the page.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Only show detailed results if we have the full response data */}
      {hasFullData && (
        <div className="space-y-4">
          {/* Performance Metrics - Show if available */}
          {(results.memory !== undefined ||
            results.executionTime !== undefined) && (
            <div
              className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
              style={{ animationDelay: "100ms" }}
            >
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="text-base">
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {results.executionTime !== undefined && (
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Execution Time
                        </span>
                        <span className="mt-1 text-lg font-semibold text-foreground">
                          {results.executionTime}
                          <span className="text-xs ml-1 text-muted-foreground">
                            ms
                          </span>
                        </span>
                      </div>
                    )}
                    {results.memory !== undefined && (
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Memory Used
                        </span>
                        <span className="mt-1 text-lg font-semibold text-foreground">
                          {results.memory}
                          <span className="text-xs ml-1 text-muted-foreground">
                            Kb
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Test Cases Chart - Show for ACCEPTED, PARTIAL, and other non-error statuses */}
          {results &&
            "totalTestcases" in results &&
            results.totalTestcases > 0 &&
            (results.status === "ACCEPTED" ||
              results.status === "PARTIAL" ||
              results.status === "BAD_SCALING" ||
              results.status === "WRONG_ANSWER") && (
              <div
                className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
                style={{ animationDelay: "200ms" }}
              >
                <CasesPassedChart
                  noOfPassedCases={results.passedTestcases}
                  totalCases={results.totalTestcases}
                />
              </div>
            )}

          {/* Failure Details - Show output when available */}
          {(isErrorStatus || showScalingHelp) && (
            <div
              className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
              style={{ animationDelay: "200ms" }}
            >
              <Card
                className={
                  showScalingHelp
                    ? "border-amber-200 dark:border-amber-800"
                    : "border-red-200 dark:border-red-800"
                }
              >
                <CardHeader>
                  <CardTitle className="text-base">
                    {showScalingHelp
                      ? "Performance Issue"
                      : results.status === "COMPILE_ERROR"
                        ? "Compilation Error"
                        : results.status === "RUNTIME_ERROR"
                          ? "Runtime Error"
                          : results.status === "TIME_LIMIT"
                            ? "Time Limit Exceeded"
                            : results.status === "MEMORY_LIMIT"
                              ? "Memory Limit Exceeded"
                              : "Failure Details"}
                  </CardTitle>
                  <CardDescription>
                    {showScalingHelp
                      ? "Your solution did not scale on larger inputs. Optimize and submit again."
                      : "Review the output below and fix your code, then submit again."}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {extraMessage && (
                      <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
                        {extraMessage}
                      </div>
                    )}

                    {showScalingHelp &&
                      (yourTimeComplexity || expectedTimeComplexity) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {yourTimeComplexity && (
                            <div className="rounded-md border border-border bg-muted/40 px-4 py-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Your Time Complexity
                              </div>
                              <div className="mt-1 font-mono text-sm text-foreground">
                                {yourTimeComplexity}
                              </div>
                            </div>
                          )}
                          {expectedTimeComplexity && (
                            <div className="rounded-md border border-border bg-muted/40 px-4 py-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Expected Time Complexity
                              </div>
                              <div className="mt-1 font-mono text-sm text-foreground">
                                {expectedTimeComplexity}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    {stderr && (
                      <div className="relative border border-red-200 dark:border-red-800 rounded-md overflow-hidden bg-red-50 dark:bg-red-950/20">
                        <div className="flex items-center justify-between gap-2 px-4 pt-3">
                          <div className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">
                            Error Output
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(stderr);
                              } catch {
                                // ignore
                              }
                            }}
                          >
                            <Copy className="size-3" />
                            Copy
                          </Button>
                        </div>
                        <pre className="p-4 pt-2 text-sm text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap break-words overflow-auto max-h-96 scrollbar-thin scrollbar-thumb-red-200 dark:scrollbar-thumb-red-800 scrollbar-track-transparent">
                          {stderr}
                        </pre>
                      </div>
                    )}

                    {stdout && (
                      <div className="relative border border-amber-200 dark:border-amber-800 rounded-md overflow-hidden bg-amber-50 dark:bg-amber-950/20">
                        <div className="flex items-center justify-between gap-2 px-4 pt-3">
                          <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                            Program Output
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(stdout);
                              } catch {
                                // ignore
                              }
                            }}
                          >
                            <Copy className="size-3" />
                            Copy
                          </Button>
                        </div>
                        <pre className="p-4 pt-2 text-sm text-amber-700 dark:text-amber-300 font-mono whitespace-pre-wrap break-words overflow-auto max-h-96 scrollbar-thin scrollbar-thumb-amber-200 dark:scrollbar-thumb-amber-800 scrollbar-track-transparent">
                          {stdout}
                        </pre>
                      </div>
                    )}

                    {!hasErrorDetails && (
                      <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                        No output was captured for this run.
                      </div>
                    )}
                  </div>
                </CardContent>

                {(stderr || stdout) && (
                  <CardFooter className="justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        const combined = [
                          stderr ? `--- stderr ---\n${stderr}` : "",
                          stdout ? `--- stdout ---\n${stdout}` : "",
                        ]
                          .filter(Boolean)
                          .join("\n\n");
                        if (!combined) return;
                        try {
                          await navigator.clipboard.writeText(combined);
                        } catch {
                          // ignore
                        }
                      }}
                    >
                      <Copy />
                      Copy All
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SubmitCode;
