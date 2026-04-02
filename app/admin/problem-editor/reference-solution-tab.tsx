"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageId, ReferenceSolution } from "./types";
import { Plus, Trash2, CodeSquare, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReferenceSolutionTabProps {
  solutions: ReferenceSolution[];
  onChangeSolutions: (solutions: ReferenceSolution[]) => void;
}

const languageOptions: { value: LanguageId; label: string; monaco: string }[] =
  [
    { value: "cpp", label: "C++", monaco: "cpp" },
    { value: "python", label: "Python", monaco: "python" },
    { value: "java", label: "Java", monaco: "java" },
    { value: "javascript", label: "JavaScript", monaco: "javascript" },
  ];

export function ReferenceSolutionTab(props: ReferenceSolutionTabProps) {
  const { solutions, onChangeSolutions } = props;
  const { theme } = useTheme();

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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
