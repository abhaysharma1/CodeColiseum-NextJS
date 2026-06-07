"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { getBackendURL } from "@/utils/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import { toast } from "sonner";
import {
  ArrowLeft,
  FlaskConical,
  Loader2,
  Zap,
  Timer,
  Gauge,
  MemoryStick,
  BrainCircuit,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface NormalCase {
  testcaseId: string;
  status: "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR";
}

interface NormalCasesResult {
  totalRuntimeMs: number;
  totalMemoryKb: number;
  passedCount: number;
  totalCount: number;
  cases: NormalCase[];
}

interface StressCaseResult {
  size: number;
  runtimeMs: number;
  memoryKb: number;
  inputBytes: number;
  generatorType: string;
  pattern: string;
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
  stressCases: StressCaseResult[];
  summary: Summary | null;
  compilationError?: string;
}

interface ProblemInfo {
  id: string;
  number: number;
  title: string;
  difficulty: string;
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
};

const statusBadge: Record<string, string> = {
  ACCEPTED: "bg-green-500/10 text-green-600 border-green-500/20",
  WRONG_ANSWER: "bg-red-500/10 text-red-600 border-red-500/20",
  RUNTIME_ERROR: "bg-orange-500/10 text-orange-600 border-orange-500/20",
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
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!problemId) return;
    const fetchProblem = async () => {
      try {
        const res = await axios.get<{
          id: string; number: number; title: string; difficulty: string;
        }>(`${getBackendURL()}/admin/problems/${problemId}`, {
          withCredentials: true,
        });
        const data = res.data;
        setProblem({
          id: data.id ?? problemId,
          number: data.number,
          title: data.title ?? "Unknown Problem",
          difficulty: data.difficulty ?? "MEDIUM",
        });
      } catch {
        toast.error("Failed to load problem");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

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
            Paste code and benchmark it against test cases and generated stress inputs.
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
              <Select value={language} onValueChange={setLanguage}>
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
          <span>Running analysis against test cases and stress generators...</span>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Testcase</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.normalCases.cases.map((tc) => (
                        <TableRow key={tc.testcaseId}>
                          <TableCell className="font-mono text-sm">{tc.testcaseId}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`gap-1 ${statusBadge[tc.status] ?? ""}`}>
                              {statusIcon[tc.status]}
                              {tc.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
          )}

          {/* Stress Cases */}
          {result.stressCases.length > 0 && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Stress Cases</CardTitle>
                  </div>
                  <CardDescription>
                    Generator: {result.stressCases[0].generatorType} &middot;
                    Pattern: {result.stressCases[0].pattern}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>Runtime (ms)</TableHead>
                        <TableHead>Memory (KB)</TableHead>
                        <TableHead>Input Size (bytes)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.stressCases.map((sc) => (
                        <TableRow key={sc.size}>
                          <TableCell className="font-mono">{sc.size.toLocaleString()}</TableCell>
                          <TableCell className="font-mono">{sc.runtimeMs}</TableCell>
                          <TableCell className="font-mono">{sc.memoryKb}</TableCell>
                          <TableCell className="font-mono">{sc.inputBytes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardChart
                  title="Runtime vs Input Size"
                  description="Execution time as input size grows"
                  data={result.stressCases.map(sc => ({
                    size: sc.size,
                    "Runtime (ms)": sc.runtimeMs,
                  }))}
                  chartType="line"
                  dataKey="Runtime (ms)"
                  xAxisKey="size"
                  height={280}
                />
                <DashboardChart
                  title="Memory vs Input Size"
                  description="Memory usage as input size grows"
                  data={result.stressCases.map(sc => ({
                    size: sc.size,
                    "Memory (KB)": sc.memoryKb,
                  }))}
                  chartType="line"
                  dataKey="Memory (KB)"
                  xAxisKey="size"
                  height={280}
                />
              </div>

              {/* Summary Cards */}
              {result.summary && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-base font-semibold tracking-tight mb-4">Summary</h3>
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
          {!result.compilationError && result.normalCases === null && result.stressCases.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FlaskConical className="h-8 w-8 mb-3" />
                <p>No test cases or stress generator configured for this problem.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
