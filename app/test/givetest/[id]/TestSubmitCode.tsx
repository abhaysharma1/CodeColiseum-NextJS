import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CasesPassedChart } from "@/components/casesPassedChart";
import { SubmitCodeResponse } from "./Description";

function TestSubmitCode({
  results,
}: {
  results: SubmitCodeResponse | undefined;
}) {
  if (!results) {
    return (
      <div className="p-4">
        Please Submit Your Code to see current Submission
      </div>
    );
  }

  // Handle error responses
  if ("error" in results) {
    return (
      <div className="p-4">
        <div className="animate-fade-right animate-once">
          <div className="text-red-600 text-xl font-semibold mb-2">
            ❌ Submission Error
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Unable to Process Submission</CardTitle>
              <CardDescription>{results.error}</CardDescription>
            </CardHeader>
            {results.details && (
              <CardContent>
                <div className="text-sm text-foreground/70">
                  <div>Details:</div>
                  <div className="mt-2 p-3 rounded bg-foreground/5 font-mono">
                    {results.details}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Map complexity codes to readable names
  const complexityNames: Record<string, string> = {
    LOGN: "O(log n)",
    N: "O(n)",
    NLOGN: "O(n log n)",
    N2: "O(n²)",
    N3: "O(n³)",
    EXP: "O(2^n)",
  };

  const getComplexityDisplay = (complexity: string) => {
    return complexityNames[complexity] || complexity;
  };

  return (
    <div className="p-4">
      {/* Status Header */}
      <div className="animate-fade-right animate-once mb-4">
        {results.status === "ACCEPTED" ? (
          <div className="text-green-600 text-2xl font-bold">✓ Accepted</div>
        ) : results.status === "PARTIAL" ? (
          <div className="text-yellow-600 text-2xl font-bold">
            ⚠ Partial Solution
          </div>
        ) : results.status === "COMPILE_ERROR" ? (
          <div className="text-red-600 text-2xl font-bold">
            ✗ Compilation Error
          </div>
        ) : results.status === "RUNTIME_ERROR" ? (
          <div className="text-red-600 text-2xl font-bold">✗ Runtime Error</div>
        ) : results.status === "TIME_LIMIT" ? (
          <div className="text-red-600 text-2xl font-bold">
            ✗ Time Limit Exceeded
          </div>
        ) : (
          <div className="text-red-600 text-2xl font-bold">✗ Wrong Answer</div>
        )}
      </div>

      <div>
        {/* Performance Metrics - Show for all statuses if available */}
        <div className="mb-4 animate-fade-right animate-once">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-foreground/60">Score</div>
                  <div className="text-lg font-semibold">
                    {results.score}/100
                  </div>
                </div>
                <div>
                  <div className="text-sm text-foreground/60">Test Cases</div>
                  <div className="text-lg font-semibold">
                    {results.passedCount}/{results.totalCount}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-foreground/60">Success Rate</div>
                  <div className="text-lg font-semibold">
                    {Math.round(
                      (results.passedCount / results.totalCount) * 100
                    )}
                    %
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Cases Chart - Show for all statuses */}
        <div className="mb-4 animate-fade animate-once">
          <CasesPassedChart
            noOfPassedCases={results.passedCount}
            totalCases={results.totalCount}
          />
        </div>

        {/* Time Complexity Analysis
        {results.yourTimeComplexity && (
          <div className="mb-4 animate-fade animate-once">
            <Card>
              <CardHeader>
                <CardTitle>Time Complexity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-foreground/60">Your Complexity</div>
                    <div className="text-lg font-semibold">
                      {getComplexityDisplay(results.yourTimeComplexity)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-foreground/60">Expected Complexity</div>
                    <div className="text-lg font-semibold">
                      {results.expectedTimeComplexity 
                        ? getComplexityDisplay(results.expectedTimeComplexity)
                        : "Not specified"}
                    </div>
                  </div>
                </div>
                {results.expectedTimeComplexity && 
                 results.yourTimeComplexity !== results.expectedTimeComplexity && (
                  <div className="mt-3 p-3 bg-yellow-500/10 rounded-md">
                    <div className="text-yellow-600 text-sm">
                      ⚠️ Your solution's time complexity is not optimal. Consider optimizing your algorithm.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )} */}

        {/* Failed Test Case Details - Show only if there are failures */}
        {results.passedCount < results.totalCount && (
          <div className="animate-fade-up animate-once">
            <Card>
              <CardHeader>
                <CardTitle>Failed Test Cases</CardTitle>
                <CardDescription>
                  {results.passedCount > 0
                    ? `Passed ${results.passedCount} out of ${results.totalCount} test cases`
                    : "All test cases failed"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.results
                    .map((result, index) => {
                      if (result.status === "ACCEPTED") return null;

                      return (
                        <div
                          key={index}
                          className="rounded-md overflow-hidden border border-foreground/10"
                        >
                          <div className="p-3 px-4 bg-red-500/5 border-b border-red-500/20">
                            <div className="flex justify-between items-center">
                              <div className="text-sm font-semibold text-foreground/80">
                                Test Case {index + 1}
                              </div>
                              <Badge variant="destructive">
                                {result.status.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mt-2">
                              <div>
                                <span className="font-medium">Time:</span>{" "}
                                {Number(result.time).toFixed(3)}s
                              </div>
                              <div>
                                <span className="font-medium">Memory:</span>{" "}
                                {(result.memory / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </div>

                          {result.stderr && (
                            <div className="p-3 px-4 bg-red-500/10 border-b border-red-500/20">
                              <div className="text-xs font-semibold text-red-600 mb-1">
                                RUNTIME ERROR
                              </div>
                              <pre className="whitespace-pre-wrap font-mono text-sm text-red-600">
                                {result.stderr}
                              </pre>
                            </div>
                          )}

                          {result.compile_output && (
                            <div className="p-3 px-4 bg-red-500/10 border-b border-red-500/20">
                              <div className="text-xs font-semibold text-red-600 mb-1">
                                COMPILE ERROR
                              </div>
                              <pre className="whitespace-pre-wrap font-mono text-sm text-red-600">
                                {result.compile_output}
                              </pre>
                            </div>
                          )}

                          {result.stdout && (
                            <div className="p-3 px-4 dark:bg-background/40 bg-foreground/10">
                              <div className="text-xs font-semibold text-foreground/60 mb-1">
                                YOUR OUTPUT
                              </div>
                              <pre className="whitespace-pre-wrap font-mono text-sm">
                                {result.stdout}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })
                    .filter(Boolean)}
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-foreground/70">
                  💡 Debug your code and try again. Make sure your solution
                  handles all edge cases.
                </p>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestSubmitCode;
