"use client";

import React, { useEffect } from "react";
import { SubmissionResult } from "./interface";
import { CasesPassedChart } from "@/components/casesPassedChart";
import { Loader2 } from "lucide-react";
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
      <div className="p-4">
        Please Submit Your Code to see current Submission
      </div>
    );
  }

  // Show loading state while submission is being processed
  if (!TERMINAL_STATUSES.has(results.status)) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <div>
              <CardTitle>Your code is submitting…</CardTitle>
              <CardDescription className="mt-1">
                Please wait while your submission is being processed.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Determine status display content
  const getStatusDisplay = () => {
    switch (results.status) {
      case "ACCEPTED":
        return (
          <div className="text-green-600 text-2xl font-bold">✓ Accepted</div>
        );
      case "PARTIAL":
        return (
          <div className="text-yellow-600 text-2xl font-bold">
            ⚠ Partially Correct
          </div>
        );
      case "WRONG_ANSWER":
        return (
          <div className="text-red-600 text-2xl font-bold">✗ Wrong Answer</div>
        );
      case "TIME_LIMIT":
        return (
          <div className="text-yellow-600 text-2xl font-bold">
            ⚠ Time Limit Exceeded
          </div>
        );
      case "MEMORY_LIMIT":
        return (
          <div className="text-yellow-600 text-2xl font-bold">
            ⚠ Memory Limit Exceeded
          </div>
        );
      case "RUNTIME_ERROR":
        return (
          <div className="text-red-600 text-2xl font-bold">✗ Runtime Error</div>
        );
      case "COMPILE_ERROR":
        return (
          <div className="text-red-600 text-2xl font-bold">
            ✗ Compilation Error
          </div>
        );
      case "INTERNAL_ERROR":
        return (
          <div className="text-red-600 text-2xl font-bold">
            ✗ Internal Server Error
          </div>
        );
      case "BAD_SCALING":
        return (
          <div className="text-yellow-600 text-2xl font-bold">
            ⚠ Time Complexity Issue
          </div>
        );
      default:
        return (
          <div className="text-gray-600 text-2xl font-bold">
            ⊘ Unknown Status
          </div>
        );
    }
  };

  const passedTestcases = results.passedTestcases ?? 0;
  const totalTestcases = results.totalTestcases ?? 0;

  return (
    <div className="p-4">
      {/* Status Header */}
      <div className="animate-fade-right animate-once mb-4">
        {getStatusDisplay()}
      </div>

      <div>
        {/* Performance Metrics - Show if available */}
        {(results.memory !== undefined ||
          results.executionTime !== undefined) && (
          <div className="mb-4 animate-fade-right animate-once">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {results.memory !== undefined && (
                    <div>
                      <div className="text-sm text-foreground/60">
                        Memory Used
                      </div>
                      <div className="text-lg font-semibold">
                        {results.memory.toFixed(2)} MB
                      </div>
                    </div>
                  )}
                  {results.executionTime !== undefined && (
                    <div>
                      <div className="text-sm text-foreground/60">
                        Execution Time
                      </div>
                      <div className="text-lg font-semibold">
                        {results.executionTime.toFixed(3)} sec
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Cases Chart - Show for ACCEPTED, PARTIAL, and other non-error statuses */}
        {totalTestcases > 0 &&
          (results.status === "ACCEPTED" ||
            results.status === "PARTIAL" ||
            results.status === "BAD_SCALING" ||
            results.status === "WRONG_ANSWER") && (
            <div className="mb-4 animate-fade animate-once">
              <CasesPassedChart
                noOfPassedCases={passedTestcases}
                totalCases={totalTestcases}
              />
            </div>
          )}

        {/* Error Details - Show stderr for error statuses */}
        {results.stderr &&
          (results.status === "RUNTIME_ERROR" ||
            results.status === "COMPILE_ERROR" ||
            results.status === "INTERNAL_ERROR") && (
            <div className="animate-fade-up animate-once">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {results.status === "COMPILE_ERROR"
                      ? "Compilation Error"
                      : results.status === "RUNTIME_ERROR"
                        ? "Runtime Error"
                        : "Error Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 px-4 bg-red-500/10 border border-red-500/20 rounded-md">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-red-600">
                      {results.stderr}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
      </div>
    </div>
  );
}

export default SubmitCode;
