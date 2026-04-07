"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Problem, RunTestCase, TestCaseItem } from "@/interfaces/DB Schema";
import { Separator } from "@/components/ui/separator";
import { runTestCaseType } from "./interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import TestSubmitCode from "./TestSubmitCode";
import AiChatBot from "./aiChatbot";

export type SubmissionHistoryItem = {
  id: string;
  language: string;
  sourceCode: string;
  status: string;
  score: number;
  result: any;
  createdAt: Date;
};

export type GetSubmissionsResponse = {
  submissions: SubmissionHistoryItem[];
};

interface SubmitCodeSuccessResponse {
  success: true;
  submissionId: string;
  status:
    | "PENDING"
    | "RUNNING"
    | "ACCEPTED"
    | "PARTIAL"
    | "WRONG_ANSWER"
    | "COMPILE_ERROR"
    | "RUNTIME_ERROR"
    | "TIME_LIMIT"
    | "MEMORY_LIMIT"
    | "INTERNAL_ERROR";
  score?: number;
  passedCount?: number;
  totalCount?: number;
  stderr?: string | null;
  results?: TestCaseResult[];
  yourTimeComplexity?: string | null;
  expectedTimeComplexity?: string | null;
}

interface TestCaseResult {
  status: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string;
  memory: number;
}

interface SubmitCodeErrorResponse {
  error: string;
  details?: string;
}

export type SubmitCodeResponse =
  | SubmitCodeSuccessResponse
  | SubmitCodeErrorResponse;

const normalizeOutput = (value?: string | null) =>
  (value ?? "").replace(/\s+/g, " ").trim();

function Description({
  descriptionData,
  testcases,
  runningResults,
  attemptId,
  problemId,
  submittingResults,
  currentTab,
  setCurrentTab,
  isAiEnabled,
  groupId,
  examId,
  code,
  language,
}: {
  descriptionData: Problem | undefined;
  testcases: RunTestCase | undefined;
  runningResults: runTestCaseType | undefined;
  attemptId: string | undefined;
  problemId: string | undefined;
  submittingResults: any;
  currentTab: string;
  setCurrentTab: (data: string) => void;
  isAiEnabled: boolean;
  groupId: string;
  examId: string;
  code: string;
  language: string;
}) {
  const [jsonCases, setJsonCases] = useState<TestCaseItem[] | undefined>();
  const [submissions, setSubmissions] = useState<SubmissionHistoryItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    if (testcases) {
      try {
        // Check if cases is already an object or a string
        const converted =
          typeof testcases.cases === "string"
            ? JSON.parse(testcases.cases)
            : testcases.cases;
        setJsonCases(converted);
      } catch (error) {
        console.error("Failed to parse test cases:", error);
        setJsonCases(undefined);
      }
    }
  }, [testcases]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!attemptId || !problemId) return;

      try {
        setLoadingSubmissions(true);
        const response = await axios.get<GetSubmissionsResponse>(
          `${getBackendURL()}/student/exam/submissions?attemptId=${attemptId}&problemId=${problemId}`,
          { withCredentials: true }
        );
        setSubmissions(response.data.submissions);
        console.log(response.data.submissions);
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
        toast.error("Failed to load submission history");
      } finally {
        setLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [attemptId, problemId, submittingResults]);

  const getStatusBadge = (status: string) => {
    if (!status) {
      return (
        <Badge variant="outline" className="text-gray-600">
          Unknown
        </Badge>
      );
    }
    const statusConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        color: string;
      }
    > = {
      ACCEPTED: { variant: "default", color: "text-green-600" },
      PARTIAL: { variant: "secondary", color: "text-yellow-600" },
      WRONG_ANSWER: { variant: "destructive", color: "text-red-600" },
      TIME_LIMIT: { variant: "destructive", color: "text-red-600" },
      MEMORY_LIMIT: { variant: "destructive", color: "text-red-600" },
      RUNTIME_ERROR: { variant: "destructive", color: "text-red-600" },
      COMPILE_ERROR: { variant: "destructive", color: "text-red-600" },
      PENDING: { variant: "outline", color: "text-gray-600" },
      RUNNING: { variant: "outline", color: "text-blue-600" },
      INTERNAL_ERROR: { variant: "destructive", color: "text-red-600" },
    };

    const config = statusConfig[status] || {
      variant: "outline" as const,
      color: "text-gray-600",
    };
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <div>
      <div
        title="tab navbar"
        className="w-[calc(35vw-2.5rem)] h-[calc(100vh-7rem)] overflow-y-scroll scroll-smooth m-5 outline-1 outline-offset-8 rounded-md py-3 px-7  box-border bg-accent/30"
      >
        <Tabs className="w-full h-full " value={currentTab}>
          <TabsList>
            <TabsTrigger
              value="description"
              onClick={() => setCurrentTab("description")}
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="testcases"
              onClick={() => setCurrentTab("testcases")}
            >
              Test Cases
            </TabsTrigger>
            {isAiEnabled && (
              <TabsTrigger
                value="aichat"
                onClick={() => setCurrentTab("aichat")}
              >
                AI Assist
              </TabsTrigger>
            )}
            <TabsTrigger
              value="runresults"
              onClick={() => setCurrentTab("runresults")}
            >
              Run Results
            </TabsTrigger>
            <TabsTrigger
              value="submitcode"
              onClick={() => setCurrentTab("submitcode")}
            >
              Submit Code
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              onClick={() => setCurrentTab("submissions")}
            >
              Submissions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="my-4 mx-1">
            {!descriptionData ? (
              <div className="w-full h-full flex justify-center items-center">
                <Spinner variant="ring" />
              </div>
            ) : (
              <div className="text-foreground ">
                <div className="text-3xl font-bold mb-3">
                  {descriptionData?.number}
                  {". "}
                  {descriptionData?.title}
                </div>
                <div
                  className="w-fit px-2 py-0.5 flex bg-accent text-center rounded-xl text-xs"
                  style={{
                    color:
                      descriptionData.difficulty.toLowerCase() === "hard"
                        ? "red"
                        : descriptionData.difficulty.toLowerCase() === "medium"
                          ? "orange"
                          : "green",
                  }}
                >
                  {descriptionData?.difficulty.at(0)?.toUpperCase() +
                    descriptionData?.difficulty.slice(1)?.toLowerCase()}
                </div>
                <div className="mt-5">
                  <div className={`markdown-wrapper text-foreground mb-6 `}>
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {descriptionData?.description}
                    </Markdown>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="testcases" className="my-4 mx-1">
            <div className="mt-7 flex flex-col h-full">
              <div className=" flex flex-col h-full">
                {!testcases ? (
                  <div className="w-full flex flex-col justify-center items-center">
                    <Spinner variant="ring" />
                  </div>
                ) : (
                  <div className="">
                    <div className="mb-2 w-full flex justify-between px-10">
                      <div>Input</div>
                      <div>Output</div>
                    </div>
                    {jsonCases?.map((item, index) => (
                      <div
                        className="text-foreground/70 w-full whitespace-pre-line"
                        key={item.input}
                      >
                        <div className="my-3 flex w-full justify-between pl-10">
                          <div>{item.input}</div>
                          <div className="pr-14">{item.output}</div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="runresults" className="my-4 mx-1">
            <div className="">
              {!runningResults ? (
                <div>Please Run your code to see results</div>
              ) : (
                runningResults?.responses.map((item, index) => (
                  <div
                    key={`${item.language}-${index}`}
                    className="my-4 animate-fade-down animate-once animate-delay-[10ms]"
                  >
                    {(() => {
                      const expected =
                        runningResults.cases[index]?.output ?? "";
                      const stdout = item.run?.stdout ?? "";
                      const compileError = item.compile?.stderr ?? "";
                      const runtimeError = item.run?.stderr ?? "";
                      const hasExitCodeFailure =
                        typeof item.run?.code === "number" &&
                        item.run.code !== 0;

                      const passed =
                        !compileError &&
                        !runtimeError &&
                        !hasExitCodeFailure &&
                        normalizeOutput(stdout) === normalizeOutput(expected);

                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle>Test {index + 1}</CardTitle>
                            <CardDescription className="flex justify-between">
                              <div>
                                Exit code: {item.run?.code ?? "N/A"}
                                {item.run?.signal ? (
                                  <>
                                    <br />
                                    Signal: {item.run.signal}
                                  </>
                                ) : null}
                              </div>
                              <div>
                                {passed ? (
                                  <span className="text-green-600">
                                    Accepted
                                  </span>
                                ) : (
                                  <span className="text-red-600">Failed</span>
                                )}
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="rounded-md">
                              <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces rounded-t-md">
                                Input
                                <br />
                                {runningResults?.cases[index].input}
                              </div>
                              <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces">
                                Expected Output
                                <br />
                                {runningResults.cases[index].output}
                              </div>
                              <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces rounded-b-md">
                                Your Output
                                <br />
                                {stdout || "(no stdout)"}
                              </div>
                              {compileError && (
                                <div className="p-2 px-4 bg-red-500/10 whitespace-break-spaces rounded-b-md mt-2">
                                  Compile Error
                                  <br />
                                  {compileError}
                                </div>
                              )}
                              {runtimeError && (
                                <div className="p-2 px-4 bg-red-500/10 whitespace-break-spaces rounded-b-md mt-2">
                                  Runtime Error
                                  <br />
                                  {runtimeError}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="submitcode" className="my-4 mx-1">
            <TestSubmitCode results={submittingResults} />
          </TabsContent>
          <TabsContent value="submissions" className="my-4 mx-1">
            <div className="space-y-4">
              {loadingSubmissions ? (
                <div className="w-full flex justify-center items-center py-8">
                  <Spinner variant="ring" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No submissions yet. Submit your code to see your submission
                  history.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-4">
                    Total Submissions: {submissions.length}
                  </div>
                  {submissions.map((submission, index) => (
                    <Card
                      key={submission.id}
                      className="animate-fade-down animate-once"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              Submission #{submissions.length - index}
                            </CardTitle>
                            <CardDescription>
                              {new Date(submission.createdAt).toLocaleString()}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(submission.status)}
                            <Badge variant="outline">
                              Score: {submission.score}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                              Language:
                            </span>
                            <Badge variant="secondary">
                              {submission.language.toUpperCase()}
                            </Badge>
                          </div>

                          {submission.result &&
                            Array.isArray(submission.result) &&
                            submission.result.length > 0 && (
                              <div className="mt-3 p-3 rounded-md bg-accent/50 text-sm space-y-2">
                                <div className="font-medium mb-2">
                                  Execution Summary:
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                  <div>
                                    <span className="font-medium">
                                      Test Cases:
                                    </span>{" "}
                                    {submission.result.length}
                                  </div>
                                  <div>
                                    <span className="font-medium">Passed:</span>{" "}
                                    {
                                      submission.result.filter(
                                        (r: any) => r.status === "ACCEPTED"
                                      ).length
                                    }
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Avg Time:
                                    </span>{" "}
                                    {(
                                      submission.result.reduce(
                                        (acc: number, r: any) =>
                                          acc + Number(r.time || 0),
                                        0
                                      ) / submission.result.length
                                    ).toFixed(3)}
                                    s
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Avg Memory:
                                    </span>{" "}
                                    {(
                                      submission.result.reduce(
                                        (acc: number, r: any) =>
                                          acc + Number(r.memory || 0),
                                        0
                                      ) /
                                      submission.result.length /
                                      1024
                                    ).toFixed(2)}{" "}
                                    MB
                                  </div>
                                </div>

                                {submission.result.some(
                                  (r: any) => r.compile_output
                                ) && (
                                  <div className="mt-2">
                                    <div className="font-medium text-destructive">
                                      Compile Error:
                                    </div>
                                    <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto">
                                      {
                                        submission.result.find(
                                          (r: any) => r.compile_output
                                        )?.compile_output
                                      }
                                    </pre>
                                  </div>
                                )}

                                {submission.result.some(
                                  (r: any) => r.stderr
                                ) && (
                                  <div className="mt-2">
                                    <div className="font-medium text-destructive">
                                      Runtime Error:
                                    </div>
                                    <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto">
                                      {
                                        submission.result.find(
                                          (r: any) => r.stderr
                                        )?.stderr
                                      }
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}

                          <details className="mt-3">
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
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          {isAiEnabled && (
            <TabsContent value="aichat" className="my-4 mx-1">
              <AiChatBot
                groupId={groupId}
                examId={examId}
                problemId={problemId ?? ""}
                code={code}
                language={language}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default Description;
