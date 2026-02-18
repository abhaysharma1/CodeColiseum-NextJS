"use client";
import { ExamResultResponse } from "@/app/api/tests/getresult/route";
import { Navbar01 } from "@/components/ui/shadcn-io/navbar";
import axios from "axios";
import React, { useEffect, useState, use } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Code,
  Award,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [result, setResult] = useState<ExamResultResponse | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const getResults = async (): Promise<void> => {
      try {
        const res = await axios.post<ExamResultResponse>(
          "/api/tests/getresult",
          { examId: id },
        );
        setResult(res.data);
        console.log(res.data);
      } catch (error: unknown) {
        console.log(error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          if (axiosError.response?.data?.message) {
            toast.error(axiosError.response.data.message);
          } else {
            toast.error("Failed to load exam results");
          }
        } else if (typeof error === "string") {
          toast.error(error);
        } else {
          toast.error("Failed to load exam results");
        }
      } finally {
        setLoading(false);
      }
    };
    getResults();
  }, [id]);

  const formatDate = (dateString: string | Date): string => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatDuration = (start: string | Date, end: string | Date): string => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusColor = (status: string): string => {
    return status === "ACCEPTED"
      ? "bg-green-500/10 text-green-500 border-green-500/20"
      : "bg-red-500/10 text-red-500 border-red-500/20";
  };

  if (loading) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <Spinner variant="infinite" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <Card className="max-w-md mx-auto mt-20">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>Failed to load exam results</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const { examDetails, examAttempt, finalScore, submissionReports, ranking } =
    result;
  const totalProblems: number = examDetails.problems.length;
  const solvedProblems: number = submissionReports.filter(
    (s) => s.isSuccessful,
  ).length;
  const scorePercentage: number = (finalScore / examAttempt.totalScore) * 100;

  return (
    <div className="min-h-screen">
      <SiteHeader name="See Result" />
      <div className="container mx-auto py-4  px-4 max-w-7xl">
        {/* Hero Section - Score & Rank */}
        <div className="mb-8">
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Score */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary mb-1">
                    {finalScore}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    out of {examAttempt.totalScore}
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {scorePercentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                {/* Rank */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 mb-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div className="text-4xl font-bold text-yellow-600 mb-1">
                    #{ranking.currentStudent?.rank ?? "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">Your Rank</div>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {ranking.currentStudent
                        ? `Top ${((ranking.currentStudent.rank / ranking.allRankings.length) * 100).toFixed(0)}%`
                        : "N/A"}
                    </Badge>
                  </div>
                </div>

                {/* Problems Solved */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-3">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="text-4xl font-bold text-green-600 mb-1">
                    {solvedProblems}/{totalProblems}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Problems Solved
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-500/10 "
                    >
                      {examAttempt.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exam Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Exam Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold mb-1 flex justify-between">
                  {examDetails.title}
                  {examDetails.examStatus === "FINISHED" && (
                    <Button
                      variant={"secondary"}
                      onClick={() =>
                        router.push(
                          `/dashboard/student/seeresults/${examDetails.id}/airesults`,
                        )
                      }
                    >
                      <Sparkles />
                      See AI Evaluation
                    </Button>
                  )}
                </div>
                {examDetails.description && (
                  <p className="text-muted-foreground text-sm">
                    {examDetails.description}
                  </p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Duration</div>
                    <div className="font-medium">
                      {examDetails.durationMin} minutes
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Created by</div>
                    <div className="font-medium">
                      {examDetails.creator.name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Start Date</div>
                    <div className="font-medium text-xs">
                      {formatDate(examDetails.startDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">End Date</div>
                    <div className="font-medium text-xs">
                      {formatDate(examDetails.endDate)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Attempt Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Started At</div>
                  <div className="font-medium text-xs">
                    {formatDate(examAttempt.startedAt)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Submitted At</div>
                  <div className="font-medium text-xs">
                    {examAttempt.submittedAt
                      ? formatDate(examAttempt.submittedAt)
                      : "N/A"}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Time Taken</div>
                  <div className="font-medium">
                    {examAttempt.submittedAt
                      ? formatDuration(
                          examAttempt.startedAt,
                          examAttempt.submittedAt,
                        )
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Status</div>
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-500/30  "
                  >
                    {examAttempt.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Problems & Submissions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Problem Submissions</CardTitle>
            <CardDescription>Detailed results for each problem</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {examDetails.problems.map((prob) => {
                const submission = submissionReports.find(
                  (s) => s.problemId === prob.problem.id,
                );
                return (
                  <AccordionItem key={prob.problem.id} value={prob.problem.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          {submission?.isSuccessful ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                Problem {prob.order}: {prob.problem.title}
                              </span>
                              <Badge
                                className={getDifficultyColor(
                                  prob.problem.difficulty,
                                )}
                                variant="outline"
                              >
                                {prob.problem.difficulty}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Problem #{prob.problem.number}
                            </p>
                          </div>
                        </div>
                        {submission && (
                          <div className="flex items-center gap-3">
                            <Badge
                              className={getStatusColor(submission.status)}
                            >
                              {submission.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        {submission ? (
                          <>
                            {/* Submission Info */}
                            <div className="grid md:grid-cols-3 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                              <div>
                                <div className="text-muted-foreground">
                                  Language
                                </div>
                                <div className="font-medium">
                                  {submission.language}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Submitted At
                                </div>
                                <div className="font-medium text-xs">
                                  {formatDate(submission.createdAt)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Test Cases Passed
                                </div>
                                <div className="font-medium">
                                  {submission.passedTestcases} /{" "}
                                  {submission.totalTestcases}
                                </div>
                              </div>
                            </div>

                            {/* Code */}
                            <div>
                              <h4 className="font-semibold mb-2">Your Code</h4>
                              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm border">
                                <code>{submission.code}</code>
                              </pre>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No submission for this problem
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Leaderboard
            </CardTitle>
            <CardDescription>
              See how you rank among all students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.allRankings.map((student) => (
                  <TableRow
                    key={student.studentId}
                    className={
                      student.studentId === ranking.currentStudent?.studentId
                        ? "bg-primary/5"
                        : ""
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {student.rank === 1 && (
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="font-bold">#{student.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.studentName}
                      {student.studentId ===
                        ranking.currentStudent?.studentId && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          You
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.studentEmail}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold">
                        {student.totalScore}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {student.submittedAt
                        ? formatDate(student.submittedAt)
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Page;
