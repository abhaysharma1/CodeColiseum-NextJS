import React, { useEffect } from "react";
import { submitTestCaseType } from "./interface";
import { CasesPassedChart } from "@/components/casesPassedChart";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SubmitCode({ results }: { results: submitTestCaseType | undefined }) {
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

  if (results.status === "PENDING" || results.status === "RUNNING") {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Submission Queued</CardTitle>
            <CardDescription>
              {results.status === "PENDING"
                ? "Your submission is queued for execution."
                : "Your submission is currently being executed."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const passedCases = results.noOfPassedCases ?? results.passedTestcases ?? 0;
  const totalCases = results.totalCases ?? results.totalTestcases ?? 0;

  // Handle error responses (unstable/unknown complexity)
  if (results.error) {
    return (
      <div className="p-4">
        <div className="animate-fade-right animate-once">
          <div className="text-yellow-600 text-xl font-semibold mb-2">
            ⚠️ Submission Error
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Unable to Process Submission</CardTitle>
              <CardDescription>{results.error}</CardDescription>
            </CardHeader>
            {results.details && (
              <CardContent>
                <div className="text-sm text-foreground/70">
                  <div>Debug Information:</div>
                  <div className="mt-2 p-3 rounded bg-foreground/5 font-mono">
                    <div>Ratio 1 (2n/n): {results.details.r1.toFixed(3)}</div>
                    <div>Ratio 2 (4n/2n): {results.details.r2.toFixed(3)}</div>
                    <div>Average: {results.details.avgRatio.toFixed(3)}</div>
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
        ) : results.status === "BAD_SCALING" ? (
          <div className="text-yellow-600 text-2xl font-bold">
            ⚠ Time Complexity Not Optimal
          </div>
        ) : (
          <div className="text-red-600 text-2xl font-bold">✗ Wrong Answer</div>
        )}
      </div>

      <div>
        {/* Performance Metrics - Show for all statuses if available */}
        {results.totalMemoryUsed !== undefined &&
          results.totalTimeTaken !== undefined && (
            <div className="mb-4 animate-fade-right animate-once">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-foreground/60">
                        Memory Used
                      </div>
                      <div className="text-lg font-semibold">
                        {(results.totalMemoryUsed / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground/60">
                        Time Taken
                      </div>
                      <div className="text-lg font-semibold">
                        {results.totalTimeTaken.toFixed(3)} sec
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        {/* Test Cases Chart - Show for ACCEPTED and BAD_SCALING */}
        {(results.status === "ACCEPTED" || results.status === "BAD_SCALING") &&
          totalCases > 0 && (
            <div className="mb-4 animate-fade animate-once">
              <CasesPassedChart
                noOfPassedCases={passedCases}
                totalCases={totalCases}
              />
            </div>
          )}

        {/* Failed Test Case Details - Show only for BAD_ALGORITHM */}
        {results.status === "BAD_ALGORITHM" &&
          results.failedCaseExecutionDetails && (
            <div className="animate-fade-up animate-once">
              <Card>
                <CardHeader>
                  <CardTitle>Failed Test Case</CardTitle>
                  <CardDescription>
                    {totalCases > 0
                      ? `Passed ${passedCases} out of ${totalCases} test cases`
                      : "The following test case has failed"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md overflow-hidden">
                    <div className="p-3 px-4 dark:bg-background/40 bg-foreground/10 border-b border-foreground/10">
                      <div className="text-xs font-semibold text-foreground/60 mb-1">
                        INPUT
                      </div>
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {results.failedCase?.stdin}
                      </pre>
                    </div>
                    <div className="p-3 px-4 dark:bg-background/40 bg-foreground/10 border-b border-foreground/10">
                      <div className="text-xs font-semibold text-foreground/60 mb-1">
                        EXPECTED OUTPUT
                      </div>
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {results.failedCase?.expected_output}
                      </pre>
                    </div>
                    {results.failedCaseExecutionDetails.stdout &&
                      results.failedCaseExecutionDetails.stdout.length > 0 && (
                        <div className="p-3 px-4 dark:bg-background/40 bg-foreground/10 border-b border-foreground/10">
                          <div className="text-xs font-semibold text-foreground/60 mb-1">
                            YOUR OUTPUT
                          </div>
                          <pre className="whitespace-pre-wrap font-mono text-sm">
                            {results.failedCaseExecutionDetails.stdout}
                          </pre>
                        </div>
                      )}
                    {results.failedCaseExecutionDetails.stderr && (
                      <div className="p-3 px-4 bg-red-500/10 border-b border-red-500/20">
                        <div className="text-xs font-semibold text-red-600 mb-1">
                          RUNTIME ERROR
                        </div>
                        <pre className="whitespace-pre-wrap font-mono text-sm text-red-600">
                          {results.failedCaseExecutionDetails.stderr}
                        </pre>
                      </div>
                    )}
                    {results.failedCaseExecutionDetails.status.id > 3 && (
                      <div className="p-3 px-4 bg-red-500/10">
                        <div className="text-xs font-semibold text-red-600 mb-1">
                          {results.failedCaseExecutionDetails.status.description.toUpperCase()}
                        </div>
                        {results.failedCaseExecutionDetails.compile_output && (
                          <pre className="whitespace-pre-wrap font-mono text-sm text-red-600">
                            {results.failedCaseExecutionDetails.compile_output}
                          </pre>
                        )}
                      </div>
                    )}
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

        {(results.status === "BAD_ALGORITHM" ||
          results.status === "BAD_SCALING") &&
          !!results.stderr &&
          !results.failedCaseExecutionDetails?.stderr && (
            <div className="animate-fade-up animate-once mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Runtime Error</CardTitle>
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
