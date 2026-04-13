"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MemoryStick,
  Trophy,
  TrendingUp,
  Code2,
  Sparkles,
  FileCode,
  Target,
  Zap,
  ArrowBigLeft,
  ArrowBigLeftIcon,
  ArrowLeft,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { SiteHeader } from "@/components/site-header";
import { Problem } from "@/generated/prisma/client";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getBackendURL } from "@/utils/utilities";
import { Button } from "@/components/ui/button";

type Submission = {
  id: string;
  attemptId: string;
  problemId: string;
  language: string;
  sourceCode: string;
  passedTestcases: number;
  totalTestcases: number;
  executionTime: number;
  memory: number;
  isFinal: boolean;
  aiQueued: boolean;
  aiStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  examId: string | null;
  problem: Problem | null;
};

type AiEvaluation = {
  id: string;
  submissionId: string;
  timeComplexity: string;
  spaceComplexity: string;
  optimal: boolean;
  qualityScore: number;
  aiScore: number;
  feedback: string;
  createdAt: string;
  examId: string | null;
  submission: Submission;
};

type ApiResponse = {
  data: AiEvaluation[];
};

function Page() {
  const params = useParams();
  const examId = useMemo(() => {
    const raw = params?.["result-id"];
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) return raw[0];
    return undefined;
  }, [params]);
  const [results, setResults] = useState<AiEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!examId) {
      setLoading(false);
      setError("Missing exam id.");
      return;
    }

    const fetchEvaluations = async () => {
      setLoading(true);
      setNotFound(false);
      setError(null);

      try {
        const res = await axios.get(
          `${getBackendURL()}/student/getexamairesult`,
          {
            params: {
              examId,
            },
            withCredentials: true,
          }
        );
        const incoming = res.data;
        setResults(incoming as AiEvaluation[]);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setNotFound(true);
        }
        setError("Unable to load AI evaluation right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [examId]);

  const stats = useMemo(() => {
    if (!results.length) {
      return {
        averageQuality: 0,
        averageAiScore: 0,
        optimalRate: 0,
      };
    }

    const averageQuality =
      results.reduce((sum, item) => sum + (item.qualityScore ?? 0), 0) /
      results.length;
    const averageAiScore =
      results.reduce((sum, item) => sum + (item.aiScore ?? 0), 0) /
      results.length;
    const optimalRate =
      (results.filter((item) => item.optimal).length / results.length) * 100;

    return {
      averageQuality,
      averageAiScore,
      optimalRate,
    };
  }, [results]);

  if (notFound) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed p-8">
        <div className="rounded-full bg-muted p-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold">No AI Evaluation Found</p>
          <p className="text-muted-foreground text-sm max-w-md">
            We couldn't find any AI-generated feedback for this exam yet. Check
            back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SiteHeader name="AI Result" />
      <div className="space-y-8 p-10">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Evaluation Results
            </h1>
          </div>
          <p className="text-muted-foreground text-base max-w-3xl">
            Comprehensive AI-powered analysis of your submissions, including
            complexity metrics, optimization insights, and code quality
            assessments.
          </p>
          <Badge variant="outline" className="font-mono text-xs">
            Exam ID: {examId}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  Total Submissions
                </CardDescription>
                <FileCode className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold">{results.length}</p>
                <span className="text-sm text-muted-foreground">evaluated</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  Quality Score
                </CardDescription>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold">
                    {stats.averageQuality.toFixed(1)}
                  </p>
                  <span className="text-sm text-muted-foreground">/ 10</span>
                </div>
                <Progress value={stats.averageQuality * 10} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  AI Score
                </CardDescription>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold">
                    {stats.averageAiScore.toFixed(0)}
                  </p>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <Progress value={stats.averageAiScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  Optimal Rate
                </CardDescription>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold">
                    {stats.optimalRate.toFixed(0)}
                  </p>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <Progress value={stats.optimalRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              <CardTitle>Submission Analysis</CardTitle>
            </div>
            <CardDescription>
              Detailed breakdown of each submission with AI-generated feedback
              and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Loading evaluations...
                  </p>
                </div>
              </div>
            )}

            {!loading && !results.length && (
              <div className="text-center py-12 space-y-3">
                <div className="rounded-full bg-muted p-4 w-fit mx-auto">
                  <FileCode className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No evaluations are available yet.
                </p>
              </div>
            )}

            <Accordion type="single" collapsible className="w-full space-y-3">
              {results.map((item, index) => (
                <AccordionItem
                  value={item.id}
                  key={item.id}
                  className="border rounded-lg px-4 bg-gradient-to-r from-background to-muted/20 hover:shadow-md transition-all"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex flex-col gap-3 text-left w-full pr-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            #{index + 1}
                          </div>
                          <div className="font-semibold">
                            {item.submission.problem?.number}
                            {". "}
                            {item.submission.problem?.title}
                          </div>
                          <Badge variant="secondary" className="font-semibold">
                            <Code2 className="h-3 w-3 mr-1" />
                            {item.submission.language}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {item.timeComplexity}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800"
                          >
                            <MemoryStick className="h-3 w-3 mr-1" />
                            {item.spaceComplexity}
                          </Badge>
                          <Badge
                            variant={item.optimal ? "default" : "outline"}
                            className={
                              item.optimal
                                ? "bg-green-500 hover:bg-green-600"
                                : ""
                            }
                          >
                            {item.optimal ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            )}
                            {item.optimal ? "Optimal" : "Can Improve"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">Quality:</span>
                          <span className="font-semibold text-foreground">
                            {item.qualityScore}/10
                          </span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">AI Score:</span>
                          <span className="font-semibold text-foreground">
                            {item.aiScore}%
                          </span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Passed:</span>
                          <span className="font-semibold text-foreground">
                            {item.submission.passedTestcases}/
                            {item.submission.totalTestcases}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-4 pt-2">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                      {/* Feedback Section */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-primary" />
                            <h3 className="text-base font-semibold">
                              AI Feedback
                            </h3>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-4 border max-h-100 h-fit overflow-y-scroll">
                            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                              <div className="markdown-wrapper text-foreground mb-6 ">
                                <Markdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeHighlight]}
                                >
                                  {item.feedback}
                                </Markdown>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-primary" />
                            <h3 className="text-base font-semibold">
                              Source Code
                            </h3>
                          </div>
                          <ScrollArea className="max-h-80 rounded-lg border bg-background overflow-y-scroll">
                            <div className="p-4">
                              <pre className="text-xs font-mono leading-relaxed">
                                <code>{item.submission.sourceCode}</code>
                              </pre>
                            </div>
                          </ScrollArea>
                        </div>
                      </div>

                      {/* Metrics Sidebar */}
                      <div className="space-y-4">
                        <div className="rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10 p-5 space-y-4">
                          <h3 className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Performance Metrics
                          </h3>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-md bg-background/60 border">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">
                                  Execution
                                </span>
                              </div>
                              <span className="text-sm font-semibold">
                                {item.submission.executionTime} ms
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-md bg-background/60 border">
                              <div className="flex items-center gap-2">
                                <MemoryStick className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-medium">
                                  Memory
                                </span>
                              </div>
                              <span className="text-sm font-semibold">
                                {(item.submission.memory / 1024).toFixed(2)} MB
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-md bg-background/60 border">
                              <div className="flex items-center gap-2">
                                {item.submission.status === "ACCEPTED" ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm font-medium">
                                  Status
                                </span>
                              </div>
                              <Badge
                                variant={
                                  item.submission.status === "ACCEPTED"
                                    ? "default"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {item.submission.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Submission Info
                          </h3>
                          <div className="space-y-2 text-xs">
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground">
                                Submission ID
                              </span>
                              <code className="text-[10px] bg-background p-1.5 rounded border font-mono">
                                {item.submissionId.slice(0, 16)}...
                              </code>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground">
                                Problem ID
                              </span>
                              <code className="text-[10px] bg-background p-1.5 rounded border font-mono">
                                {item.submission.problemId.slice(0, 16)}...
                              </code>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Reviewed
                              </span>
                              <span className="font-medium text-foreground">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Submitted
                              </span>
                              <span className="font-medium text-foreground">
                                {new Date(
                                  item.submission.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Page;
