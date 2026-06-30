"use client";

import { useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Difficulty,
  DriverCodeByLanguage,
  LanguageId,
  ProblemEditorState,
  TestCaseGroups,
  ReferenceSolution,
  PerformanceConstraints,
  PerformanceTestCase,
} from "@/components/problem-editor/types";
import { ProblemHeader } from "@/components/problem-editor/problem-header";
import { ProblemTabs } from "@/components/problem-editor/problem-tabs";

const initialDriverCode = (): DriverCodeByLanguage => ({
  c: { header: "", template: "", footer: "" },
  cpp: { header: "", template: "", footer: "" },
  python: { header: "", template: "", footer: "" },
  java: { header: "", template: "", footer: "" },
});

const initialTestCases = (): TestCaseGroups => ({
  public: [
    {
      id: "public-1",
      input: "",
      output: "",
    },
  ],
  hidden: [],
});

const initialState: ProblemEditorState = {
  title: "",
  difficulty: "EASY",
  tags: [],
  description: "",
  testCases: initialTestCases(),
  driverCode: initialDriverCode(),
  solutions: [],
  status: "DRAFT",
  hidden: false,
  performanceConstraints: {
    cppTimeLimitMs: 1000,
    javaTimeLimitMs: 2000,
    pythonTimeLimitMs: 4000,
    jsTimeLimitMs: 3000,
    memoryLimitMB: 256,
  },
  performanceTestCases: [],
};

function EditProblemContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [state, setState] = useState<ProblemEditorState>(initialState);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [activeDriverLanguage, setActiveDriverLanguage] =
    useState<LanguageId>("cpp");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [runResults, setRunResults] = useState<
    Record<string, { passedCount: number; totalCount: number }>
  >({});

  const anySolutionPassesAll = Object.values(runResults).some(
    (r) => r.passedCount === r.totalCount && r.totalCount > 0,
  );

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    const fetchProblem = async () => {
      try {
        const res = await axios.get(
          `${getBackendURL()}/teacher/problems/${id}`,
          { withCredentials: true },
        );
        if (res.data) {
          const data = res.data as any;
          setState({
            title: data.title || "",
            difficulty: data.difficulty || "EASY",
            tags: data.tags || [],
            description: data.description || "",
            testCases: data.testCases || initialTestCases(),
            driverCode: data.driverCode || initialDriverCode(),
            solutions: data.solutions || [],
            status: "DRAFT",
            hidden: data.hidden || false,
          });
          setApprovalStatus(data.approvalStatus || null);
          setRejectionReason(data.rejectionReason || null);
          if (data.performanceConstraints) {
            setState((prev) => ({
              ...prev,
              performanceConstraints: data.performanceConstraints,
            }));
          }
          if (data.performanceTestCases) {
            setState((prev) => ({
              ...prev,
              performanceTestCases: data.performanceTestCases,
            }));
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load problem");
        router.push("/dashboard/teacher/my-problems");
      } finally {
        setIsLoading(false);
      }
    };
    void fetchProblem();
  }, [id, router]);

  const handleChangeTitle = (value: string) => {
    setState((prev) => ({ ...prev, title: value }));
  };

  const handleChangeDifficulty = (value: Difficulty) => {
    setState((prev) => ({ ...prev, difficulty: value }));
  };

  const handleAddTag = (value: string) => {
    setState((prev) =>
      prev.tags.includes(value)
        ? prev
        : { ...prev, tags: [...prev.tags, value] },
    );
  };

  const handleRemoveTag = (value: string) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== value),
    }));
  };

  const handleChangeDescription = (value: string) => {
    setState((prev) => ({ ...prev, description: value }));
  };

  const handleChangeTestCases = (testCases: TestCaseGroups) => {
    setState((prev) => ({ ...prev, testCases }));
  };

  const handleChangeDriverCode = (
    lang: LanguageId,
    section: "header" | "template" | "footer",
    value: string,
  ) => {
    setState((prev) => ({
      ...prev,
      driverCode: {
        ...prev.driverCode,
        [lang]: {
          ...prev.driverCode[lang],
          [section]: value,
        },
      },
    }));
  };

  const handleChangeDriverLanguage = (lang: LanguageId) => {
    setActiveDriverLanguage(lang);
  };

  const handleChangeSolutions = (solutions: ReferenceSolution[]) => {
    setState((prev) => ({ ...prev, solutions }));
  };

  const handleChangePerformanceConstraints = (
    constraints: PerformanceConstraints,
  ) => {
    setState((prev) => ({ ...prev, performanceConstraints: constraints }));
  };

  const handleChangePerformanceTestCases = (
    performanceTestCases: PerformanceTestCase[],
  ) => {
    setState((prev) => ({ ...prev, performanceTestCases }));
  };

  const handleSave = async (mode: "draft" | "submit") => {
    if (!state.title.trim()) {
      toast.error("Please add a title before saving.");
      return;
    }

    if (mode === "submit") {
      if (!state.description.trim()) {
        toast.error("Problem description is required.");
        return;
      }
      const hasValidPublicCase = state.testCases.public.some(
        (tc) => tc.input.trim() && tc.output.trim(),
      );
      if (!hasValidPublicCase) {
        toast.error(
          "At least one public test case with input and output is required.",
        );
        return;
      }
      const hasSolutionWithCode = state.solutions.some((s) => s.code.trim());
      if (!hasSolutionWithCode) {
        toast.error("At least one reference solution is required.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...state,
        status: mode === "submit" ? "SUBMIT" : "DRAFT",
      };

      await axios.patch(
        `${getBackendURL()}/teacher/problems/${id}`,
        payload,
        { withCredentials: true },
      );

      toast.success(
        mode === "submit"
          ? "Problem submitted for approval successfully!"
          : "Draft updated successfully!",
      );

      router.push("/dashboard/teacher/my-problems");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.errors?._errors?.[0] ||
          "Failed to save problem",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="w-full">
          <SiteHeader name="Edit Problem" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full">
        <SiteHeader name="Edit Problem" />
      </div>
      <div className="flex-1 p-7">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/teacher/my-problems")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Problems
          </Button>
        </div>

        <div className="top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-[1400px]">
            <ProblemHeader
              title={state.title}
              difficulty={state.difficulty}
              tags={state.tags}
              onChangeTitle={handleChangeTitle}
              onChangeDifficulty={handleChangeDifficulty}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onSaveDraft={() => void handleSave("draft")}
              onSubmit={() => void handleSave("submit")}
              submitDisabled={
                !state.solutions.some((s) => s.code.trim()) ||
                !anySolutionPassesAll
              }
              isSubmitting={isSubmitting}
              approvalStatus={approvalStatus}
              rejectionReason={rejectionReason}
              mode="edit"
            />
          </div>
        </div>

        <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col p-4 md:p-6 lg:p-8">
          <ProblemTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            state={state}
            onChangeDescription={handleChangeDescription}
            onChangeTestCases={handleChangeTestCases}
            onChangeDriverCode={handleChangeDriverCode}
            onChangeDriverLanguage={handleChangeDriverLanguage}
            activeDriverLanguage={activeDriverLanguage}
            onChangeSolutions={handleChangeSolutions}
            onChangePerformanceConstraints={handleChangePerformanceConstraints}
            onChangePerformanceTestCases={handleChangePerformanceTestCases}
            runEndpoint={`${getBackendURL()}/teacher/problems/run-reference-solution`}
            onRunResultsChange={setRunResults}
          />
        </main>
      </div>
    </div>
  );
}

export default function EditProblemPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <EditProblemContent />
    </Suspense>
  );
}
