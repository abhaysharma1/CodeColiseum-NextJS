"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";

import { useState } from "react";
import { ProblemHeader } from "./problem-header";
import { ProblemTabs } from "./problem-tabs";
import {
  Difficulty,
  DriverCodeByLanguage,
  LanguageId,
  ProblemEditorState,
  TestCaseGroups,
  ReferenceSolution,
} from "./types";
import { toast } from "sonner";

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
  sections: {
    description: "",
    constraints: "",
    inputFormat: "",
    outputFormat: "",
  },
  testCases: initialTestCases(),
  driverCode: initialDriverCode(),
  solutions: [],
  status: "DRAFT",
};

function validateForPublish(state: ProblemEditorState): string[] {
  const errors: string[] = [];

  if (!state.title.trim()) {
    errors.push("Title is required.");
  }

  if (!state.difficulty) {
    errors.push("Difficulty is required.");
  }

  if (!state.sections.description.trim()) {
    errors.push("Problem description is required.");
  }

  const hasValidPublicCase = state.testCases.public.some(
    (testCase) => testCase.input.trim() && testCase.output.trim()
  );

  if (!hasValidPublicCase) {
    errors.push(
      "At least one public test case with input and output is required."
    );
  }

  const hasTemplate = Object.values(state.driverCode).some(
    (section) => section.template.trim().length > 0
  );

  if (!hasTemplate) {
    errors.push("At least one language must have template driver code.");
  }

  const hasSolution = state.solutions.some((solution) => solution.code.trim());

  if (!hasSolution) {
    errors.push("At least one reference solution is required.");
  }

  return errors;
}

function ProblemEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const problemId = searchParams.get("id");

  const [availableProblems, setAvailableProblems] = useState<
    Array<{ id: string; title: string; isPublished: boolean }>
  >([]);

  useEffect(() => {
    // Fetch all available problems for the dropdown
    axios
      .get(`${getBackendURL()}/admin/problems`, { withCredentials: true })
      .then((res: any) => {
        if (res.data?.problems) {
          setAvailableProblems(res.data.problems);
        }
      })
      .catch((err) => {
        console.error("Failed to load problem list", err);
      });
  }, []);

  useEffect(() => {
    if (problemId) {
      axios
        .get(`${getBackendURL()}/admin/problems/${problemId}`, {
          withCredentials: true,
        })
        .then((res: any) => {
          if (res.data) {
            setState((prev) => ({ ...prev, ...res.data }));
          }
        })
        .catch((err) => {
          toast.error("Failed to load problem");
          console.error(err);
        });
    }
  }, [problemId]);
  const [state, setState] = useState<ProblemEditorState>(initialState);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [activeDriverLanguage, setActiveDriverLanguage] =
    useState<LanguageId>("cpp");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        : { ...prev, tags: [...prev.tags, value] }
    );
  };

  const handleRemoveTag = (value: string) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== value),
    }));
  };

  const handleChangeSections = (sections: ProblemEditorState["sections"]) => {
    setState((prev) => ({ ...prev, sections }));
  };

  const handleChangeTestCases = (testCases: TestCaseGroups) => {
    setState((prev) => ({ ...prev, testCases }));
  };

  const handleChangeDriverCode = (
    lang: LanguageId,
    section: "header" | "template" | "footer",
    value: string
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

  const handleSave = async (mode: "draft" | "publish") => {
    if (mode === "draft") {
      if (!state.title.trim()) {
        toast.error("Please add a title before saving a draft.");
        return;
      }
    } else {
      const errors = validateForPublish(state);
      if (errors.length > 0) {
        toast.error("Please fix the highlighted issues before publishing.");
        errors.forEach((message) => toast(message));
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...state,
        status: mode === "publish" ? "PUBLISHED" : "DRAFT",
      };

      let res: any;
      if (problemId) {
        res = await axios.put(
          `${getBackendURL()}/admin/problems/${problemId}`,
          payload,
          { withCredentials: true }
        );
      } else {
        res = await axios.post(`${getBackendURL()}/admin/problems`, payload, {
          withCredentials: true,
        });
      }

      setState(payload as any);
      toast.success(
        mode === "publish"
          ? "Problem marked as published successfully!"
          : "Draft saved successfully!"
      );

      if (!problemId && res.data.id) {
        router.push(`/admin/problem-editor?id=${res.data.id}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save problem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    void handleSave("draft");
  };

  const handlePublish = () => {
    void handleSave("publish");
  };

  return (
    <div className="flex w-full flex-col min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-[1400px]">
          <ProblemHeader
            title={state.title}
            difficulty={state.difficulty}
            tags={state.tags}
            onChangeTitle={handleChangeTitle}
            onChangeDifficulty={handleChangeDifficulty}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            isSubmitting={isSubmitting}
            availableProblems={availableProblems}
            onSelectProblem={(id) => {
              if (id === "new") {
                router.push("/admin/problem-editor");
                setState(initialState);
              } else {
                router.push(`/admin/problem-editor?id=${id}`);
              }
            }}
            currentProblemId={problemId || "new"}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col p-4 md:p-6 lg:p-8">
        <ProblemTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          state={state}
          onChangeSections={handleChangeSections}
          onChangeTestCases={handleChangeTestCases}
          onChangeDriverCode={handleChangeDriverCode}
          onChangeDriverLanguage={handleChangeDriverLanguage}
          activeDriverLanguage={activeDriverLanguage}
          onChangeSolutions={handleChangeSolutions}
        />
      </main>
    </div>
  );
}

export default function ProblemEditorPage() {
  return (
    <Suspense fallback={<div>Loading problem editor...</div>}>
      <ProblemEditorContent />
    </Suspense>
  );
}
