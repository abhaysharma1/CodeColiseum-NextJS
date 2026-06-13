"use client";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState, use } from "react";
import DetailsBlock from "./detailsBlock";
import CodingBlock from "./codingBlock";
import axios from "axios";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Navbar01 } from "@/components/ui/shadcn-io/navbar";
import {
  runTestCaseType,
  SubmissionResult,
  ProblemPageMode,
} from "./interface";
import { AuthProvider } from "@/context/authcontext";
import { ProblemSubmissionItem } from "./interface";
import { getBackendURL } from "@/utils/utilities";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useModuleProblemData } from "@/hooks/use-module-problem";
import { useModuleProblemsList } from "@/hooks/use-module-problems-list";
import { ModuleHeader } from "./moduleHeader";
import { ModuleSidebar } from "./moduleSidebar";
import { PrevNextNavigation } from "./prevNextNavigation";

interface descriptionData {
  id: string;
  number: number;
  difficulty: string;
  description: string;
  title: string;
}

export type aiReviewResult = {
  status: "COMPLETED" | "PENDING";
  data: {
    status: "COMPLETED" | "PENDING";
    data: {
      correctness: String;
      time_complexity: String;
      space_complexity: String;
      edge_cases_missing: String[];
      code_quality: String;
      optimization_suggestions: String[];
      overall_score: number;
    };
  };
};

function QuestionSolvingPageContent({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; moduleProblemId?: string }>;
}) {
  const params = use(searchParams);
  const id = params.id;
  const moduleProblemId = params.moduleProblemId;
  const mode: ProblemPageMode = moduleProblemId
    ? { type: "module", moduleProblemId }
    : { type: "practice" };
  const router = useRouter();
  const queryClient = useQueryClient();

  const [tabPage, setTabPage] = useState("description");
  const [submissionRefetch, setSubmissionRefetch] = useState(false);

  const [runTestCaseResults, setRunTestCaseResults] = useState<
    runTestCaseType | undefined
  >();
  const [submitTestCaseResults, setSubmitTestCaseResults] = useState<
    SubmissionResult | undefined
  >();

  const [submissions, setSubmissions] = useState<
    ProblemSubmissionItem[] | undefined
  >(undefined);

  const [performingAiReview, setPerformingAiReview] = useState(false);
  const [aiReviewResult, setAiReviewResult] = useState<
    aiReviewResult | undefined
  >();
  const [startAiReviewResponse, setStartAiReviewResponse] = useState<
    | {
        success: boolean;
        jobId: string;
      }
    | undefined
  >();
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState("cpp");

  const {
    data: descriptionData = [],
    isLoading: loadingDetails,
    error: problemError,
  } = useQuery({
    queryKey: ["problem", id],
    queryFn: async () => {
      const response = await axios.get(
        `${getBackendURL()}/problems/getproblems`,
        {
          params: { searchValue: id, withDescription: true },
          withCredentials: true,
        }
      );
      return response.data as descriptionData[];
    },
    enabled: !!id,
    retry: false,
  });

  useEffect(() => {
    if (!problemError) return;
    const err = problemError as any;
    if (err?.response?.status === 400 || err?.response?.status === 500) {
      toast.error("Didn't Found Your Problem");
      router.replace("/not-found");
    }
  }, [problemError, router]);

  const moduleQuery = useModuleProblemData(
    mode.type === "module" ? mode.moduleProblemId : undefined
  );

  const moduleProblemsQuery = useModuleProblemsList(
    moduleQuery.data?.module.id
  );

  const startAiReview = async () => {
    if (!code || !id || !language) {
      toast.error("Please Write some code");
      return;
    }
    try {
      setTabPage("aireviewresult");
      setPerformingAiReview(true);
      const res = await axios.post(
        `${getBackendURL()}/problems/start-ai-review`,
        {
          problemId: id,
          code: code,
          language: language,
        },
        { withCredentials: true }
      );
      const data = res.data as {
        success: boolean;
        jobId: string;
      };

      if (data.success) {
        setStartAiReviewResponse(data);
      } else {
        toast.error("Cannot Review at this time");
      }
    } catch (error) {
      console.log(error);
      setPerformingAiReview(false);
    }
  };

  const getAiReview = async () => {
    if (!startAiReviewResponse) {
      return;
    }
    try {
      const res = await axios.get(
        `${getBackendURL()}/problems/practice-ai-review-status`,
        {
          params: {
            jobId: startAiReviewResponse.jobId,
          },
          withCredentials: true,
        }
      );
      const data = res.data as aiReviewResult;

      setAiReviewResult(data);
      if (data.status === "COMPLETED") {
        setPerformingAiReview(false);
      }
    } catch (error) {
      toast.error("Cannot fetch Review Status");
      console.log(error);
    }
  };

  useEffect(() => {
    if (!performingAiReview || !startAiReviewResponse) return;

    const intervalId = setInterval(async () => {
      await getAiReview();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [performingAiReview, startAiReviewResponse]);

  return (
    <div>
      <div>
        <AuthProvider>
          <Navbar01 />
        </AuthProvider>
      </div>
      {mode.type === "module" && moduleQuery.data && moduleProblemsQuery.data && (
        <ModuleHeader
          lab={moduleQuery.data.lab}
          module={moduleQuery.data.module}
          completedProblems={moduleProblemsQuery.data.completedProblems}
          totalProblems={moduleProblemsQuery.data.totalProblems}
          completionPercentage={moduleProblemsQuery.data.completionPercentage}
        />
      )}
      {(() => {
        const workspace = (
          <div className="flex justify-center">
            <div>
              <DetailsBlock
                tabPage={tabPage}
                setTabPage={setTabPage}
                data={descriptionData || []}
                loadingDetails={loadingDetails}
                runTestCaseResults={runTestCaseResults}
                submitTestCaseResults={submitTestCaseResults}
                submissionRefetch={submissionRefetch}
                setSubmissionRefetch={setSubmissionRefetch}
                setSubmissions={setSubmissions}
                submissions={submissions}
                aiReviewResult={aiReviewResult}
                performingAiReview={performingAiReview}
              />
            </div>
            <div>
              <CodingBlock
                mode={mode}
                questionId={id ?? ""}
                setRunTestCaseResults={setRunTestCaseResults}
                setSubmitTestCaseResults={setSubmitTestCaseResults}
                setTabPage={setTabPage}
                setSubmissionRefetch={setSubmissionRefetch}
                setCode={setCode}
                code={code}
                setLanguage={setLanguage}
                language={language}
                startAiReview={startAiReview}
                performingAiReview={performingAiReview}
                onSubmitModuleRefresh={() => {
                  if (mode.type === "module") {
                    queryClient.invalidateQueries({
                      queryKey: ["module-problem", mode.moduleProblemId],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["module-problems-list", moduleQuery.data?.module.id],
                    });
                  }
                }}
              />
            </div>
          </div>
        );

        if (mode.type === "module" && moduleProblemsQuery.data) {
          return (
            <div className="flex items-start">
              <ModuleSidebar
                problems={moduleProblemsQuery.data.problems}
                currentModuleProblemId={mode.moduleProblemId}
              />
              <div className="flex-1 min-w-0 overflow-x-auto">
                {workspace}
              </div>
            </div>
          );
        }
        return workspace;
      })()}
      {mode.type === "module" && moduleQuery.data && (
        <PrevNextNavigation
          previous={moduleQuery.data.previousProblem}
          next={moduleQuery.data.nextProblem}
        />
      )}
    </div>
  );
}

function QuestionSolvingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; moduleProblemId?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div>
          <Spinner variant="ring" />
        </div>
      }
    >
      <QuestionSolvingPageContent searchParams={searchParams} />
    </Suspense>
  );
}

export default QuestionSolvingPage;
