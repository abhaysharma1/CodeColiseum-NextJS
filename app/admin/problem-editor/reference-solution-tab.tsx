"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBackendURL } from "@/utils/utilities";
import { getLanguageId } from "@/utils/getLanguageId";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageId, ReferenceSolution, TestCaseGroups } from "./types";
import { Plus, Trash2, CodeSquare, CheckCircle, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useMemo, useState } from "react";

interface ReferenceSolutionTabProps {
  solutions: ReferenceSolution[];
  testCases: TestCaseGroups;
  onChangeSolutions: (solutions: ReferenceSolution[]) => void;
}

const languageOptions: { value: LanguageId; label: string; monaco: string }[] =
  [
    { value: "c", label: "C", monaco: "c" },
    { value: "cpp", label: "C++", monaco: "cpp" },
    { value: "python", label: "Python", monaco: "python" },
    { value: "java", label: "Java", monaco: "java" },
  ];

export function ReferenceSolutionTab(props: ReferenceSolutionTabProps) {
  const { solutions, testCases, onChangeSolutions } = props;
  const { theme } = useTheme();

  type RunResult = {
    responses: Array<{
      language: string;
      version: string;
      run: {
        stdout: string;
        stderr: string;
        output: string;
        code: number | null;
        signal: string | null;
      };
      compile?: {
        stdout: string;
        stderr: string;
        output: string;
        code: number | null;
        signal: string | null;
      };
    }>;
    cases: Array<{ input: string; output: string }>;
    results: Array<{
      input: string;
      expectedOutput: string;
      actualOutput: string;
      passed: boolean;
    }>;
    passedCount: number;
    totalCount: number;
  };

  const [runningId, setRunningId] = useState<string | null>(null);
  const [runResults, setRunResults] = useState<Record<string, RunResult>>({});

  const runnableCases = useMemo(() => {
    const all = [...(testCases.public ?? []), ...(testCases.hidden ?? [])];
    return all
      .map((t) => ({ input: t.input ?? "", output: t.output ?? "" }))
      .filter((t) => t.input.trim().length > 0 && t.output.trim().length > 0);
  }, [testCases.hidden, testCases.public]);

  const editorTheme = theme === "dark" ? "vs-dark" : "vs-light";

  const addSolution = () => {
    const next: ReferenceSolution = {
      id: crypto.randomUUID(),
      language: "cpp",
      code: "",
    };
    onChangeSolutions([...solutions, next]);
  };

  const updateSolution = (
    id: string,
    update: Partial<Pick<ReferenceSolution, "language" | "code">>
  ) => {
    onChangeSolutions(
      solutions.map((solution) =>
        solution.id === id ? { ...solution, ...update } : solution
      )
    );
  };

  const deleteSolution = (id: string) => {
    onChangeSolutions(solutions.filter((solution) => solution.id !== id));
  };

  const commonEditorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    automaticLayout: true,
    renderLineHighlight: "none" as const,
    hideCursorInOverviewRuler: true,
    padding: { top: 16, bottom: 16 },
  };

  const runSolution = async (solution: ReferenceSolution) => {
    if (!solution.code.trim()) {
      toast.error("Add code before running.");
      return;
    }

    if (runnableCases.length === 0) {
      toast.error("No test cases available to run.");
      return;
    }

    const languageId = getLanguageId(solution.language);
    if (!languageId) {
      toast.error("Unsupported language.");
      return;
    }

    setRunningId(solution.id);
    try {
      const res = await axios.post(
        `${getBackendURL()}/admin/problems/run-reference-solution`,
        {
          languageId,
          code: solution.code,
          cases: runnableCases,
        },
        { withCredentials: true }
      );

      setRunResults((prev) => ({
        ...prev,
        [solution.id]: res.data as RunResult,
      }));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to run solution";
      toast.error(message);
    } finally {
      setRunningId((prev) => (prev === solution.id ? null : prev));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Reference Solutions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Provide official answers used for validation or student reference.
          </p>
        </div>
        <Button onClick={addSolution} size="sm" className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Solution
        </Button>
      </div>

      {solutions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 shadow-none bg-muted/10">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CodeSquare className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium">No solutions provided</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
            Adding at least one reference solution will help you verify your
            test cases before publishing.
          </p>
          <Button variant="outline" onClick={addSolution} className="gap-2">
            <Plus className="h-4 w-4" /> Add your first solution
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {solutions.map((solution, index) => {
            const monacoLang =
              languageOptions.find((l) => l.value === solution.language)
                ?.monaco ?? "cpp";

            return (
              <Card
                key={solution.id}
                className="overflow-hidden border-muted-foreground/20 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all group"
              >
                <div className="bg-muted/30 px-4 py-3 border-b border-muted-foreground/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-background border text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </div>
                    <Select
                      value={solution.language}
                      onValueChange={(value) =>
                        updateSolution(solution.id, {
                          language: value as LanguageId,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 w-[140px] bg-background border-muted-foreground/20 font-medium">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {solution.code.trim().length > 10 && (
                      <Badge
                        variant="outline"
                        className="hidden sm:inline-flex bg-green-500/10 text-green-600 border-green-500/20 gap-1 px-2 font-normal"
                      >
                        <CheckCircle className="h-3 w-3" /> Configured
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-2"
                      onClick={() => void runSolution(solution)}
                      disabled={runningId === solution.id}
                      title={
                        runnableCases.length === 0
                          ? "Add test cases first"
                          : "Run solution against test cases"
                      }
                    >
                      <Play className="h-4 w-4" />
                      {runningId === solution.id ? "Running..." : "Run"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteSolution(solution.id)}
                      title="Delete Solution"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Editor
                  height="300px"
                  language={monacoLang}
                  theme={editorTheme}
                  value={solution.code}
                  onChange={(value) =>
                    updateSolution(solution.id, { code: value || "" })
                  }
                  options={commonEditorOptions}
                  className="w-full"
                />

                {runResults[solution.id] && (
                  <div className="border-t border-muted-foreground/10 bg-background px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium">
                        Result: {runResults[solution.id].passedCount}/
                        {runResults[solution.id].totalCount} passed
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          runResults[solution.id].passedCount ===
                          runResults[solution.id].totalCount
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                        }
                      >
                        {runResults[solution.id].passedCount ===
                        runResults[solution.id].totalCount
                          ? "Accepted"
                          : "Failed"}
                      </Badge>
                    </div>

                    {(() => {
                      const first = runResults[solution.id].responses?.[0];
                      const compileErr = first?.compile?.stderr?.trim();
                      const runtimeErr = first?.run?.stderr?.trim();

                      if (compileErr) {
                        return (
                          <pre className="mt-3 whitespace-pre-wrap break-words rounded-md bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
                            {compileErr}
                          </pre>
                        );
                      }

                      if (runtimeErr) {
                        return (
                          <pre className="mt-3 whitespace-pre-wrap break-words rounded-md bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
                            {runtimeErr}
                          </pre>
                        );
                      }

                      const failed = runResults[solution.id].results?.find(
                        (r) => !r.passed
                      );
                      if (!failed) {
                        return null;
                      }

                      return (
                        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                          <div className="rounded-md bg-muted/40 p-3 text-xs whitespace-pre-wrap break-words">
                            <div className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">
                              Expected
                            </div>
                            {failed.expectedOutput || "(empty)"}
                          </div>
                          <div className="rounded-md bg-muted/40 p-3 text-xs whitespace-pre-wrap break-words">
                            <div className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">
                              Actual
                            </div>
                            {failed.actualOutput || "(empty)"}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
