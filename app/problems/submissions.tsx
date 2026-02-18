import React, { useEffect, useState } from "react";
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
import {
  GetProblemSubmissionsResponse,
  ProblemSubmissionItem,
} from "@/app/api/problems/getsubmissions/route";

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
  // const [submissions, setSubmissions] = useState<ProblemSubmissionItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const fetchSubmissions = async () => {
    if (!problemId) return;

    try {
      setLoadingSubmissions(true);
      const response = await axios.post<GetProblemSubmissionsResponse>(
        "/api/problems/getsubmissions",
        {
          problemId,
        },
      );
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      toast.error("Failed to load submission history");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (!submissions) {
      fetchSubmissions();
    }
  }, [problemId]);

  useEffect(() => {
    if (submissionRefetch == true) {
      fetchSubmissions();
      setSubmissionRefetch(false);
    }
  }, [submissionRefetch]);

  if (loadingSubmissions) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <Spinner variant="ring" />
      </div>
    );
  }

  if (!submissions) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No submissions yet. Submit your code to see your submission history.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Total Submissions: {submissions.length}
      </div>
      {submissions.map((submission, index) => (
        <Card key={submission.id} className="animate-fade-down animate-once">
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
                <Badge variant="outline">
                  Test Cases Passed: {submission.noOfPassedCases}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Language:</span>
                <Badge variant="secondary">
                  {submission.language.toUpperCase()}
                </Badge>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  View Code
                </summary>
                <pre className="mt-2 p-3 bg-accent/30 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                  {submission.code}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
