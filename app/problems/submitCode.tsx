"use client";

import React, { useEffect } from "react";
import { SubmissionResult } from "./interface";
import { CasesPassedChart } from "@/components/casesPassedChart";
import { Loader2, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      {/* Status Header */}
      {getStatusDisplay()}

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
                          {results.executionTime.toFixed(3)}
                          <span className="text-xs ml-1 text-muted-foreground">
                            sec
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
                          {results.memory.toFixed(2)}
                          <span className="text-xs ml-1 text-muted-foreground">
                            MB
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

          {/* Error Details - Show stderr for error statuses */}
          {results.stderr &&
            (results.status === "RUNTIME_ERROR" ||
              results.status === "COMPILE_ERROR" ||
              results.status === "INTERNAL_ERROR") && (
              <div
                className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
                style={{ animationDelay: "200ms" }}
              >
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {results.status === "COMPILE_ERROR"
                        ? "Compilation Error"
                        : results.status === "RUNTIME_ERROR"
                          ? "Runtime Error"
                          : "Error Details"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md overflow-hidden">
                      <pre className="p-4 text-sm text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap break-words overflow-auto max-h-96 scrollbar-thin scrollbar-thumb-red-200 dark:scrollbar-thumb-red-800 scrollbar-track-transparent">
                        {results.stderr}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default SubmitCode;
