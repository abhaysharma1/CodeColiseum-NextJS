"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Problem } from "@/generated/prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Upload, Clock, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { getBackendURL } from "@/utils/utilities";

interface ConstraintsData {
  cppTimeLimitMs: number;
  javaTimeLimitMs: number;
  pythonTimeLimitMs: number;
  jsTimeLimitMs: number;
  memoryLimitMB: number;
}

interface PerformanceTestCaseData {
  id: string;
  name: string;
  inputFileKey: string;
  outputFileKey: string;
  createdAt: string;
}

async function fetchProblems(searchValue: string): Promise<Problem[]> {
  const res = await axios.get<Problem[]>(
    `${getBackendURL()}/problems/getproblems`,
    {
      params: { searchValue, take: 10, skip: 0 },
      withCredentials: true,
    }
  );
  return res.data;
}

async function fetchConstraints(
  problemId: string
): Promise<ConstraintsData | null> {
  try {
    const res = await axios.get(
      `${getBackendURL()}/admin/performance-constraints`,
      {
        params: { problemId },
        withCredentials: true,
      }
    );
    const data = res.data as { constraints: ConstraintsData | null };
    return data.constraints;
  } catch {
    return null;
  }
}

async function fetchTestCases(
  problemId: string
): Promise<PerformanceTestCaseData[]> {
  try {
    const res = await axios.get(
      `${getBackendURL()}/admin/performance-test-cases`,
      {
        params: { problemId },
        withCredentials: true,
      }
    );
    const data = res.data as { testCases: PerformanceTestCaseData[] };
    return data.testCases ?? [];
  } catch {
    return [];
  }
}

function Page() {
  const [searchValue, setSearchValue] = useState("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);

  const [cppTimeLimitMs, setCppTimeLimitMs] = useState("1000");
  const [javaTimeLimitMs, setJavaTimeLimitMs] = useState("2000");
  const [pythonTimeLimitMs, setPythonTimeLimitMs] = useState("4000");
  const [jsTimeLimitMs, setJsTimeLimitMs] = useState("3000");
  const [memoryLimitMB, setMemoryLimitMB] = useState("256");

  const [hasConstraints, setHasConstraints] = useState(false);
  const [savingConstraints, setSavingConstraints] = useState(false);
  const [deletingConstraints, setDeletingConstraints] = useState(false);

  const [testCases, setTestCases] = useState<PerformanceTestCaseData[]>([]);
  const [loadingTestCases, setLoadingTestCases] = useState(false);

  const [newTestCaseName, setNewTestCaseName] = useState("");
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingTestCaseId, setDeletingTestCaseId] = useState<string | null>(null);

  const inputFileRef = useRef<HTMLInputElement>(null);
  const outputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchValue.trim()) {
      setProblems([]);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        setLoadingProblems(true);
        const items = await fetchProblems(searchValue.trim());
        if (!cancelled) setProblems(items);
      } catch {
        if (!cancelled) console.error("Failed to fetch problems");
      } finally {
        if (!cancelled) setLoadingProblems(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [searchValue]);

  const resetConstraintsForm = () => {
    setCppTimeLimitMs("1000");
    setJavaTimeLimitMs("2000");
    setPythonTimeLimitMs("4000");
    setJsTimeLimitMs("3000");
    setMemoryLimitMB("256");
    setHasConstraints(false);
  };

  const loadDataForProblem = async (p: Problem) => {
    setProblem(p);
    setSearchValue(p.title);

    const [constraints, cases] = await Promise.all([
      fetchConstraints(p.id),
      fetchTestCases(p.id),
    ]);

    if (constraints) {
      setHasConstraints(true);
      setCppTimeLimitMs(String(constraints.cppTimeLimitMs));
      setJavaTimeLimitMs(String(constraints.javaTimeLimitMs));
      setPythonTimeLimitMs(String(constraints.pythonTimeLimitMs));
      setJsTimeLimitMs(String(constraints.jsTimeLimitMs));
      setMemoryLimitMB(String(constraints.memoryLimitMB));
    } else {
      resetConstraintsForm();
    }

    setTestCases(cases);
  };

  const handleSaveConstraints = async () => {
    if (!problem) return;
    setSavingConstraints(true);
    try {
      await axios.post(
        `${getBackendURL()}/admin/performance-constraints`,
        {
          problemId: problem.id,
          cppTimeLimitMs: Number(cppTimeLimitMs),
          javaTimeLimitMs: Number(javaTimeLimitMs),
          pythonTimeLimitMs: Number(pythonTimeLimitMs),
          jsTimeLimitMs: Number(jsTimeLimitMs),
          memoryLimitMB: Number(memoryLimitMB),
        },
        { withCredentials: true }
      );
      setHasConstraints(true);
      toast.success("Constraints saved successfully");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to save constraints";
      toast.error(msg);
    } finally {
      setSavingConstraints(false);
    }
  };

  const handleDeleteConstraints = async () => {
    if (!problem) return;
    setDeletingConstraints(true);
    try {
      await axios.delete(`${getBackendURL()}/admin/performance-constraints`, {
        params: { problemId: problem.id },
        withCredentials: true,
      });
      resetConstraintsForm();
      toast.success("Constraints deleted");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to delete constraints";
      toast.error(msg);
    } finally {
      setDeletingConstraints(false);
    }
  };

  const handleUploadTestCase = async () => {
    if (!problem) return;
    if (!newTestCaseName.trim()) {
      toast.error("Test case name is required");
      return;
    }
    if (!inputFile) {
      toast.error("Input file is required");
      return;
    }
    if (!outputFile) {
      toast.error("Output file is required");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("problemId", problem.id);
      formData.append("name", newTestCaseName.trim());
      formData.append("input", inputFile);
      formData.append("output", outputFile);

      await axios.post(
        `${getBackendURL()}/admin/performance-test-cases`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Test case uploaded");
      setNewTestCaseName("");
      setInputFile(null);
      setOutputFile(null);
      if (inputFileRef.current) inputFileRef.current.value = "";
      if (outputFileRef.current) outputFileRef.current.value = "";

      const updated = await fetchTestCases(problem.id);
      setTestCases(updated);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to upload";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTestCase = async (tc: PerformanceTestCaseData) => {
    setDeletingTestCaseId(tc.id);
    try {
      await axios.delete(
        `${getBackendURL()}/admin/performance-test-cases/${tc.id}`,
        { withCredentials: true }
      );
      toast.success(`Deleted "${tc.name}"`);
      if (problem) {
        const updated = await fetchTestCases(problem.id);
        setTestCases(updated);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to delete";
      toast.error(msg);
    } finally {
      setDeletingTestCaseId(null);
    }
  };

  return (
    <div className="flex-1 px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Problem Constraints & Performance Tests</CardTitle>
            <CardDescription>
              Configure time/memory limits and upload performance test cases for a problem.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Select Problem</Label>
              <Input
                type="text"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setProblem(null);
                  resetConstraintsForm();
                  setTestCases([]);
                }}
                placeholder="Search by title, description, or ID"
              />
              {loadingProblems && (
                <p className="text-xs text-muted-foreground">Loading problems...</p>
              )}
              {!loadingProblems && problems.length > 0 && (
                <ul className="max-h-48 overflow-y-auto rounded-md border bg-background text-sm">
                  {problems.map((p) => (
                    <li
                      key={p.id}
                      className="cursor-pointer border-b px-3 py-2 last:border-b-0 hover:bg-muted/70"
                      onClick={() => loadDataForProblem(p)}
                    >
                      <div className="font-medium">
                        #{p.number} {p.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{p.id}</div>
                    </li>
                  ))}
                </ul>
              )}
              {searchValue && !loadingProblems && problems.length === 0 && (
                <p className="text-xs text-muted-foreground">No problems found.</p>
              )}
            </div>

            {problem && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-3">
                  <p className="text-sm font-medium">
                    Selected: #{problem.number} — {problem.title}
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {problem && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Performance Constraints</CardTitle>
                </div>
                <CardDescription>
                  Language-specific time and memory limits for performance test execution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>C++ Time (ms)</Label>
                    <Input
                      type="number"
                      value={cppTimeLimitMs}
                      onChange={(e) => setCppTimeLimitMs(e.target.value)}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Java Time (ms)</Label>
                    <Input
                      type="number"
                      value={javaTimeLimitMs}
                      onChange={(e) => setJavaTimeLimitMs(e.target.value)}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Python Time (ms)</Label>
                    <Input
                      type="number"
                      value={pythonTimeLimitMs}
                      onChange={(e) => setPythonTimeLimitMs(e.target.value)}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>JS Time (ms)</Label>
                    <Input
                      type="number"
                      value={jsTimeLimitMs}
                      onChange={(e) => setJsTimeLimitMs(e.target.value)}
                      min={1}
                    />
                  </div>
                </div>

                <div className="max-w-xs space-y-2">
                  <Label className="flex items-center gap-1">
                    <HardDrive className="h-4 w-4" />
                    Memory Limit (MB)
                  </Label>
                  <Input
                    type="number"
                    value={memoryLimitMB}
                    onChange={(e) => setMemoryLimitMB(e.target.value)}
                    min={1}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button onClick={handleSaveConstraints} disabled={savingConstraints}>
                    {savingConstraints ? "Saving..." : hasConstraints ? "Update Constraints" : "Save Constraints"}
                  </Button>
                  {hasConstraints && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" disabled={deletingConstraints}>
                          {deletingConstraints ? "Deleting..." : "Delete Constraints"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Constraints</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete the performance constraints
                            for <strong>#{problem.number} {problem.title}</strong>?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button type="button" variant="destructive" onClick={handleDeleteConstraints}>
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Performance Test Cases</CardTitle>
                </div>
                <CardDescription>
                  Upload large input/output file pairs to validate solution scalability.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {testCases.length > 0 && (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testCases.map((tc) => (
                          <TableRow key={tc.id}>
                            <TableCell className="font-medium">{tc.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(tc.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={deletingTestCaseId === tc.id}
                                onClick={() => handleDeleteTestCase(tc)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {testCases.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No performance test cases uploaded yet.
                  </p>
                )}

                <div className="space-y-4 rounded-lg border p-4">
                  <h4 className="text-sm font-medium">Upload New Test Case</h4>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      type="text"
                      value={newTestCaseName}
                      onChange={(e) => setNewTestCaseName(e.target.value)}
                      placeholder="e.g. Large Input - 1M elements"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Input File</Label>
                      <Input
                        ref={inputFileRef}
                        type="file"
                        accept=".txt,.in,.*"
                        onChange={(e) => setInputFile(e.target.files?.[0] ?? null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Output File</Label>
                      <Input
                        ref={outputFileRef}
                        type="file"
                        accept=".txt,.out,.*"
                        onChange={(e) => setOutputFile(e.target.files?.[0] ?? null)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleUploadTestCase} disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default Page;
