"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { useTheme } from "@teispace/next-themes";
import { getBackendURL } from "@/utils/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  ArrowLeft,
  FlaskConical,
  Loader2,
  Zap,
  Timer,
  Gauge,
  MemoryStick,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface NormalCase {
  testcaseId: string;
  status: "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR";
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  stderr?: string;
}

interface NormalCasesResult {
  totalRuntimeMs: number;
  totalMemoryKb: number;
  passedCount: number;
  totalCount: number;
  cases: NormalCase[];
}

interface PerformanceCaseResult {
  id: string;
  name: string;
  runtimeMs: number;
  memoryKb: number;
  inputBytes: number;
  status: "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "TIME_LIMIT_EXCEEDED";
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  stderr?: string;
}

interface Summary {
  fastestRuntimeMs: number;
  slowestRuntimeMs: number;
  averageRuntimeMs: number;
  maxMemoryKb: number;
  averageMemoryKb: number;
}

interface AnalysisResult {
  normalCases: NormalCasesResult | null;
  performanceCases: PerformanceCaseResult[];
  summary: Summary | null;
  compilationError?: string;
}

interface DriverCodeEntry {
  header: string;
  template: string;
  footer: string;
}

interface ProblemInfo {
  id: string;
  number: number;
  title: string;
  difficulty: string;
  driverCode: Record<string, DriverCodeEntry>;
}

const languageOptions = [
  { value: "c", label: "C", monaco: "c" },
  { value: "cpp", label: "C++", monaco: "cpp" },
  { value: "python", label: "Python", monaco: "python" },
  { value: "java", label: "Java", monaco: "java" },
];

const difficultyColor: Record<string, string> = {
  EASY: "bg-green-500/10 text-green-600 border-green-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  HARD: "bg-red-500/10 text-red-600 border-red-500/20",
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

const statusIcon: Record<string, React.ReactNode> = {
  ACCEPTED: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  WRONG_ANSWER: <XCircle className="h-4 w-4 text-red-600" />,
  RUNTIME_ERROR: <AlertCircle className="h-4 w-4 text-orange-600" />,
  TIME_LIMIT_EXCEEDED: <Clock className="h-4 w-4 text-yellow-600" />,
};

const statusBadge: Record<string, string> = {
  ACCEPTED: "bg-green-500/10 text-green-600 border-green-500/20",
  WRONG_ANSWER: "bg-red-500/10 text-red-600 border-red-500/20",
  RUNTIME_ERROR: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  TIME_LIMIT_EXCEEDED: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
};

export default function RuntimeAnalyzerPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = params?.problemId as string;
  const { theme } = useTheme();
  const editorTheme = theme === "dark" ? "vs-dark" : "vs-light";

  const [problem, setProblem] = useState<ProblemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!problemId) return;
    const fetchProblem = async () => {
      try {
        const res = await axios.get<{
          id: string; number: number; title: string; difficulty: string;
          driverCode: Record<string, { header: string; template: string; footer: string }>;
        }>(`${getBackendURL()}/admin/problems/${problemId}`, {
          withCredentials: true,
        });
        const data = res.data;
        const driverCode = data.driverCode ?? {};
        setProblem({
          id: data.id ?? problemId,
          number: data.number,
          title: data.title ?? "Unknown Problem",
          difficulty: data.difficulty ?? "MEDIUM",
          driverCode,
        });
        const initialLang = "cpp";
        const tmpl = driverCode[initialLang]?.template;
        if (tmpl) {
          setCode(tmpl);
          setTemplateLoaded(true);
        }
      } catch {
        toast.error("Failed to load problem");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  const handleLanguageChange = useCallback((newLang: string) => {
    setLanguage(newLang);
    if (problem?.driverCode[newLang]?.template) {
      setCode(problem.driverCode[newLang].template!);
    }
  }, [problem]);

  const runAnalysis = useCallback(async () => {
    if (!code.trim()) {
      toast.error("Write some code before running analysis.");
      return;
    }

    setRunning(true);
    setResult(null);

    try {
      const res = await axios.post(
        `${getBackendURL()}/admin/problems/${problemId}/runtime-analyzer`,
        { language, sourceCode: code },
        { withCredentials: true },
      );
      setResult(res.data as AnalysisResult);
    } catch (error: any) {
      const msg = error?.response?.data?.error
        ?? error?.response?.data?.message
        ?? error?.message
        ?? "Analysis failed";
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  }, [code, language, problemId]);

  const monacoLanguage = languageOptions.find(l => l.value === language)?.monaco ?? "cpp";

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/runtime-analyzer")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          {loading ? (
            <Skeleton className="h-7 w-64" />
          ) : problem ? (
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">
                Runtime Analyzer — {problem.title}
              </h1>
              <Badge variant="outline" className={difficultyColor[problem.difficulty] ?? ""}>
                {problem.difficulty}
              </Badge>
            </div>
          ) : (
            <h1 className="text-xl font-semibold tracking-tight">Runtime Analyzer</h1>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            Paste code and benchmark it against test cases and performance test cases.
          </p>
        </div>
      </div>

      {/* Editor Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Code</CardTitle>
              <CardDescription>Write or paste your solution</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={runAnalysis}
                disabled={running}
                className="gap-2"
              >
                {running ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FlaskConical className="h-4 w-4" />
                )}
                {running ? "Analyzing..." : "Run Analysis"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Editor
            height="320px"
            language={monacoLanguage}
            theme={editorTheme}
            value={code}
            onChange={(value) => setCode(value ?? "")}
            options={commonEditorOptions}
          />
        </CardContent>
      </Card>

      {/* Results */}
      {running && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-3" />
          <span>Running analysis against test cases and performance test cases...</span>
        </div>
      )}

      {result && !running && (
        <div className="space-y-6">
          {/* Compilation Error */}
          {result.compilationError && (
            <Card className="border-red-500/30">
              <CardHeader>
                <CardTitle className="text-base text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Compilation Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap break-words rounded-md bg-red-500/10 p-4 text-xs text-red-700 dark:text-red-300 font-mono">
                  {result.compilationError}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Normal Test Cases */}
          {result.normalCases && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Normal Test Cases</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      result.normalCases.passedCount === result.normalCases.totalCount
                        ? "bg-green-500/10 text-green-600 border-green-500/20 gap-1"
                        : "bg-red-500/10 text-red-600 border-red-500/20 gap-1"
                    }
                  >
                    {result.normalCases.passedCount}/{result.normalCases.totalCount} Passed
                  </Badge>
                </div>
                <CardDescription>
                  Total runtime: {result.normalCases.totalRuntimeMs}ms &middot;
                  Memory: {result.normalCases.totalMemoryKb}KB
                </CardDescription>
              </CardHeader>
              {result.normalCases.cases.length > 0 && (
                <CardContent className="p-0">
                  <Accordion type="single" collapsible>
                    {result.normalCases.cases.map((tc) => (
                      <AccordionItem key={tc.testcaseId} value={tc.testcaseId} className="px-4">
                        <AccordionTrigger className="hover:no-underline [&>svg]:shrink-0">
                          <div className="flex w-full items-center justify-between pr-2">
                            <span className="font-mono text-sm">{tc.testcaseId}</span>
                            <Badge variant="outline" className={`gap-1 ${statusBadge[tc.status] ?? ""}`}>
                              {statusIcon[tc.status]}
                              {tc.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            <div className="rounded-md bg-muted/40 p-3 text-xs whitespace-pre-wrap break-words">
                              <div className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">Input</div>
                              {tc.input || "(empty)"}
                            </div>
                            {tc.stderr && (
                              <div className="rounded-md bg-red-500/10 p-3 text-xs whitespace-pre-wrap break-words border border-red-500/20">
                                <div className="mb-1 text-[11px] font-semibold uppercase text-red-600">Error</div>
                                <pre className="font-mono text-red-700 dark:text-red-300">{tc.stderr}</pre>
                              </div>
                            )}
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              <div className="rounded-md bg-muted/40 p-3 text-xs whitespace-pre-wrap break-words">
                                <div className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">Expected</div>
                                {tc.expectedOutput || "(empty)"}
                              </div>
                              <div className="rounded-md bg-muted/40 p-3 text-xs whitespace-pre-wrap break-words">
                                <div className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">Actual</div>
                                {tc.actualOutput || "(empty)"}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              )}
            </Card>
          )}

          {/* Performance Test Cases */}
          {result.performanceCases.length > 0 && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Performance Test Cases</CardTitle>
                  </div>
                  <CardDescription>
                    S3-stored large test cases to validate scalability.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible>
                    {result.performanceCases.map((pc) => (
                      <AccordionItem key={pc.id} value={pc.id} className="px-4">
                        <AccordionTrigger className="hover:no-underline [&>svg]:shrink-0">
                          <div className="flex w-full items-center justify-between gap-4 pr-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-medium truncate">{pc.name}</span>
                              <span className="font-mono text-xs text-muted-foreground shrink-0">
                                {pc.runtimeMs}ms / {pc.memoryKb}KB / {pc.inputBytes}B
                              </span>
                            </div>
                            <Badge variant="outline" className={`gap-1 shrink-0 ${statusBadge[pc.status] ?? ""}`}>
                              {statusIcon[pc.status]}
                              {pc.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            <div className="rounded-md bg-muted/40 p-3 text-xs whitespace-pre-wrap break-words">
                              <div className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">Input</div>
                              {pc.input || "(empty)"}
                            </div>
                            {pc.stderr && (
                              <div className="rounded-md bg-red-500/10 p-3 text-xs whitespace-pre-wrap break-words border border-red-500/20">
                                <div className="mb-1 text-[11px] font-semibold uppercase text-red-600">Error</div>
                                <pre className="font-mono text-red-700 dark:text-red-300">{pc.stderr}</pre>
                              </div>
                            )}
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              <div className="rounded-md bg-muted/40 p-3 text-xs whitespace-pre-wrap break-words">
                                <div className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">Expected</div>
                                {pc.expectedOutput || "(empty)"}
                              </div>
                              <div className="rounded-md bg-muted/40 p-3 text-xs whitespace-pre-wrap break-words">
                                <div className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">Actual</div>
                                {pc.actualOutput || "(empty)"}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              {result.summary && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-base font-semibold tracking-tight mb-4">Performance Summary</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                      <StatCard
                        title="Fastest Runtime"
                        value={`${result.summary.fastestRuntimeMs}ms`}
                        icon={Zap}
                        variant="success"
                      />
                      <StatCard
                        title="Slowest Runtime"
                        value={`${result.summary.slowestRuntimeMs}ms`}
                        icon={Timer}
                        variant="warning"
                      />
                      <StatCard
                        title="Average Runtime"
                        value={`${result.summary.averageRuntimeMs}ms`}
                        icon={Timer}
                        variant="primary"
                      />
                      <StatCard
                        title="Peak Memory"
                        value={`${result.summary.maxMemoryKb}KB`}
                        icon={MemoryStick}
                        variant="destructive"
                      />
                      <StatCard
                        title="Average Memory"
                        value={`${result.summary.averageMemoryKb}KB`}
                        icon={Gauge}
                        variant="default"
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* No Results */}
          {!result.compilationError && result.normalCases === null && result.performanceCases.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FlaskConical className="h-8 w-8 mb-3" />
                <p>No test cases or performance test cases configured for this problem.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
