"use client";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState, use, useCallback } from "react";
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
import { ModuleSidebar } from "./moduleSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PanelRightOpen,
  PanelRightClose,
  Circle,
  CheckCircle2,
  Lock,
  Clock,
  CalendarX,
} from "lucide-react";
import { motion } from "framer-motion";
import { Group, Panel, Separator } from "react-resizable-panels";

interface descriptionData {
  id: string;
  number: number;
  difficulty: string;
  description: string;
  title: string;
  tags?: { tag: { id: string; name: string } }[];
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

function ModuleCenterContent({
  lab,
  module: mod,
  moduleId,
  completedProblems,
  totalProblems,
  completionPercentage,
  previous,
  next,
  currentModuleProblemId,
  isSidebarOpen,
  onToggleSidebar,
}: {
  lab: { title: string };
  module: { title: string; weekNumber: number; dueAt: string | null };
  moduleId: string;
  completedProblems: number;
  totalProblems: number;
  completionPercentage: number;
  previous: { id: string; problemId: string } | null;
  next: { id: string; problemId: string } | null;
  currentModuleProblemId: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const router = useRouter();

  const solvedDots = Math.round((completionPercentage / 100) * 3);
  const remainingDots = 3 - solvedDots;

  return (
    <div className="flex items-center gap-3 text-sm min-w-0">
      <TooltipProvider>
        <div className="flex items-center gap-2 text-muted-foreground min-w-0">
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-6 w-6 shrink-0"
            onClick={() =>
              router.push(`/dashboard/student/modules/${moduleId}`)
            }
            title="Back to module"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="hidden sm:inline truncate max-w-[120px] lg:max-w-[200px]">
            {lab.title}
          </span>
          <span className="hidden sm:inline text-muted-foreground/50">›</span>
          <span className="truncate max-w-[120px] lg:max-w-[240px] font-medium text-foreground">
            {mod.title}
          </span>
        </div>
      </TooltipProvider>

      <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
        {Array.from({ length: solvedDots }).map((_, i) => (
          <CheckCircle2 key={`s-${i}`} className="h-3 w-3 text-green-500" />
        ))}
        {Array.from({ length: remainingDots }).map((_, i) => (
          <Circle key={`r-${i}`} className="h-3 w-3" />
        ))}
        <span className="tabular-nums ml-1">
          {completedProblems}/{totalProblems}
        </span>
      </div>

      {mod.dueAt && (
        <Badge
          variant="outline"
          className="hidden lg:flex items-center gap-1 text-[11px] px-1.5 py-0 h-5"
        >
          <Calendar className="h-3 w-3" />
          {new Date(mod.dueAt).toLocaleDateString()}
        </Badge>
      )}

      <div className="flex items-center gap-0.5 ml-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className={`h-7 w-7 ${!previous ? "opacity-30 pointer-events-none" : ""}`}
              disabled={!previous}
              onClick={() => {
                if (previous) {
                  router.push(
                    `/problems?id=${previous.problemId}&moduleProblemId=${previous.id}`
                  );
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Alt + Left</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className={`h-7 w-7 ${!next ? "opacity-30 pointer-events-none" : ""}`}
              disabled={!next}
              onClick={() => {
                if (next) {
                  router.push(
                    `/problems?id=${next.problemId}&moduleProblemId=${next.id}`
                  );
                }
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Alt + Right</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-5 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="h-7 w-7"
              onClick={onToggleSidebar}
              title={isSidebarOpen ? "Close problem list" : "Open problem list"}
            >
              {isSidebarOpen ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">
              {isSidebarOpen ? "Close" : "Open"} problem list
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isLabAiEnabled, setIsLabAiEnabled] = useState(false);
  const [labId, setLabId] = useState<string>("");

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

  // Check lab AI enablement for module problems
  const currentModuleProblemId = mode.type === "module" ? mode.moduleProblemId : undefined;
  useEffect(() => {
    if (!currentModuleProblemId) return;

    const checkLabAiStatus = async () => {
      try {
        const res = await axios.get(
          `${getBackendURL()}/student/lab/ai/isenabled`,
          {
            params: { moduleProblemId: currentModuleProblemId },
            withCredentials: true,
          }
        );
        const data = res.data as { enabled: boolean; labId: string };
        setIsLabAiEnabled(data.enabled);
        setLabId(data.labId);
      } catch {
        setIsLabAiEnabled(false);
      }
    };

    checkLabAiStatus();
  }, [currentModuleProblemId]);

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

  const accessStatus = mode.type === "module" ? moduleQuery.data?.moduleProblem?.accessStatus : "AVAILABLE";
  const isAccessDenied = accessStatus && accessStatus !== "AVAILABLE";

  if (isAccessDenied) {
    const accessDeniedContent: Record<string, { icon: any; title: string; message: string }> = {
      LOCKED: {
        icon: Lock,
        title: "Problem Locked",
        message: "This problem has not been unlocked by your instructor yet.",
      },
      NOT_YET_AVAILABLE: {
        icon: Clock,
        title: "Problem Not Yet Available",
        message: moduleQuery.data?.moduleProblem?.availableFrom
          ? `This problem will become available on ${new Date(moduleQuery.data.moduleProblem.availableFrom).toLocaleDateString()}.`
          : "This problem is not yet available.",
      },
      EXPIRED: {
        icon: CalendarX,
        title: "Access Window Expired",
        message: "The access window for this problem has ended.",
      },
    };
    const denied = accessDeniedContent[accessStatus] || accessDeniedContent.LOCKED;
    const DeniedIcon = denied.icon;

    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-full bg-muted p-4">
          <DeniedIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">{denied.title}</h2>
        <p className="text-muted-foreground text-center max-w-md">{denied.message}</p>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/student/modules/${moduleQuery.data?.module.id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Module
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <AuthProvider>
          <Navbar01
            centerContent={
              mode.type === "module" &&
              moduleQuery.data &&
              moduleProblemsQuery.data ? (
                <ModuleCenterContent
                  lab={moduleQuery.data.lab}
                  module={moduleQuery.data.module}
                  moduleId={moduleQuery.data.module.id}
                  completedProblems={moduleProblemsQuery.data.completedProblems}
                  totalProblems={moduleProblemsQuery.data.totalProblems}
                  completionPercentage={
                    moduleProblemsQuery.data.completionPercentage
                  }
                  previous={moduleQuery.data.previousProblem}
                  next={moduleQuery.data.nextProblem}
                  currentModuleProblemId={mode.moduleProblemId}
                  isSidebarOpen={isSidebarOpen}
                  onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                />
              ) : undefined
            }
          />
        </AuthProvider>
      </div>
      <div className="relative flex">
        {mode.type === "module" && moduleProblemsQuery.data && (
          <ModuleSidebar
            problems={moduleProblemsQuery.data.problems}
            currentModuleProblemId={mode.moduleProblemId}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        <div className="flex justify-center flex-1 min-w-0">
          <Group orientation="horizontal" className="h-screen w-screen">
            <Panel defaultSize={50} minSize={25}>
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
                  isAiEnabled={mode.type === "module" ? isLabAiEnabled : false}
                  labId={labId}
                  problemId={id ?? ""}
                  code={code}
                  language={language}
                />
              </div>
            </Panel>
            <Separator className="resize-handle my-10 mx-2" />
            <Panel defaultSize={50} minSize={25}>
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
                        queryKey: [
                          "module-problems-list",
                          moduleQuery.data?.module.id,
                        ],
                      });
                    }
                  }}
                />
              </div>
            </Panel>
          </Group>
        </div>
      </div>
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
