"use client";

import { useEffect, useState } from "react";
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
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type GeneratorPatternOption = "RANDOM" | "SORTED" | "REVERSE" | "CONSTANT";

type GeneratorData = {
  pattern: GeneratorPatternOption;
  minValue: number;
  maxValue: number;
  sizes: number[];
  cppTimeLimitMs: number;
  javaTimeLimitMs: number;
  pythonTimeLimitMs: number;
  jsTimeLimitMs: number;
  memoryLimitMB: number;
};

type FieldErrors = {
  pattern?: string;
  minValue?: string;
  maxValue?: string;
  sizes?: string;
  form?: string;
};

import { getBackendURL } from "@/utils/utilities";

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

async function fetchGenerator(
  problemId: string
): Promise<GeneratorData | null> {
  try {
    const res = await axios.get(
      `${getBackendURL()}/admin/problem-test-generator`,
      {
        params: { problemId },
        withCredentials: true,
      }
    );

    const data = res.data as {
      generator: {
        pattern: GeneratorPatternOption;
        minValue: number;
        maxValue: number;
        sizes: number[];
        cppTimeLimitMs: number;
        javaTimeLimitMs: number;
        pythonTimeLimitMs: number;
        jsTimeLimitMs: number;
        memoryLimitMB: number;
      } | null;
    };
    if (!data || !data.generator) return null;

    return {
      pattern: data.generator.pattern,
      minValue: data.generator.minValue,
      maxValue: data.generator.maxValue,
      sizes: data.generator.sizes,
      cppTimeLimitMs: data.generator.cppTimeLimitMs,
      javaTimeLimitMs: data.generator.javaTimeLimitMs,
      pythonTimeLimitMs: data.generator.pythonTimeLimitMs,
      jsTimeLimitMs: data.generator.jsTimeLimitMs,
      memoryLimitMB: data.generator.memoryLimitMB,
    };
  } catch (error) {
    throw new Error("Failed to load generator");
  }
}

async function saveGenerator(payload: {
  problemId: string;
  pattern: GeneratorPatternOption;
  minValue: number;
  maxValue: number;
  sizes: number[];
  cppTimeLimitMs: number;
  javaTimeLimitMs: number;
  pythonTimeLimitMs: number;
  jsTimeLimitMs: number;
  memoryLimitMB: number;
}) {
  try {
    const res = await axios.post(
      `${getBackendURL()}/admin/problem-test-generator`,
      {
        problemId: payload.problemId,
        type: "ARRAY",
        pattern: payload.pattern,
        minValue: payload.minValue,
        maxValue: payload.maxValue,
        sizes: payload.sizes,
        cppTimeLimitMs: payload.cppTimeLimitMs,
        javaTimeLimitMs: payload.javaTimeLimitMs,
        pythonTimeLimitMs: payload.pythonTimeLimitMs,
        jsTimeLimitMs: payload.jsTimeLimitMs,
        memoryLimitMB: payload.memoryLimitMB,
      },
      { withCredentials: true }
    );

    return res.data;
  } catch (error: any) {
    const maybeResponse = (error as any)?.response;
    const message =
      maybeResponse?.data?.error ||
      error?.message ||
      "Failed to save generator";
    throw new Error(message);
  }
}

function parseSizes(value: string): { sizes: number[]; error?: string } {
  const trimmed = value.trim();

  if (!trimmed) {
    return { sizes: [], error: "Size is required" };
  }

  const n = Number(trimmed);

  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { sizes: [], error: "Size must be a valid integer" };
  }

  if (n <= 0) {
    return { sizes: [], error: "Size must be greater than 0" };
  }

  return { sizes: [n] };
}

function Page() {
  const [searchValue, setSearchValue] = useState("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);

  const [pattern, setPattern] = useState<GeneratorPatternOption>("RANDOM");
  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("");
  const [sizeInput, setSizeInput] = useState<string>("");
  const [cppTimeLimitMs, setCppTimeLimitMs] = useState<string>("1000");
  const [javaTimeLimitMs, setJavaTimeLimitMs] = useState<string>("2000");
  const [pythonTimeLimitMs, setPythonTimeLimitMs] = useState<string>("4000");
  const [jsTimeLimitMs, setJsTimeLimitMs] = useState<string>("3000");
  const [memoryLimitMB, setMemoryLimitMB] = useState<string>("256");

  const [hasExistingGenerator, setHasExistingGenerator] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoadingGenerator, setIsLoadingGenerator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        if (!cancelled) {
          setProblems(items);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
        }
      } finally {
        if (!cancelled) {
          setLoadingProblems(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [searchValue]);

  const resetForm = () => {
    setPattern("RANDOM");
    setMinValue("");
    setMaxValue("");
    setSizeInput("");
    setCppTimeLimitMs("1000");
    setJavaTimeLimitMs("2000");
    setPythonTimeLimitMs("4000");
    setJsTimeLimitMs("3000");
    setMemoryLimitMB("256");
    setFieldErrors({});
    setSuccessMessage(null);
  };

  const loadGeneratorForProblem = async (p: Problem) => {
    setIsLoadingGenerator(true);
    setFieldErrors({});
    setSuccessMessage(null);

    try {
      const existing = await fetchGenerator(p.id);
      if (existing) {
        setHasExistingGenerator(true);
        setPattern(existing.pattern);
        setMinValue(String(existing.minValue));
        setMaxValue(String(existing.maxValue));
        setSizeInput(String(existing.sizes[0] ?? ""));
        setCppTimeLimitMs(String(existing.cppTimeLimitMs));
        setJavaTimeLimitMs(String(existing.javaTimeLimitMs));
        setPythonTimeLimitMs(String(existing.pythonTimeLimitMs));
        setJsTimeLimitMs(String(existing.jsTimeLimitMs));
        setMemoryLimitMB(String(existing.memoryLimitMB));
      } else {
        setHasExistingGenerator(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setHasExistingGenerator(false);
      resetForm();
      setFieldErrors({ form: "Failed to load existing generator" });
    } finally {
      setIsLoadingGenerator(false);
    }
  };

  const handleSelectProblem = (p: Problem) => {
    setProblem(p);
    setSearchValue(p.title);
    loadGeneratorForProblem(p);
  };

  const validateForm = (): {
    valid: boolean;
    payload?: {
      minValue: number;
      maxValue: number;
      sizes: number[];
      cppTimeLimitMs: number;
      javaTimeLimitMs: number;
      pythonTimeLimitMs: number;
      jsTimeLimitMs: number;
      memoryLimitMB: number;
    };
  } => {
    const errors: FieldErrors = {};
    let hasError = false;

    const min = Number(minValue);
    const max = Number(maxValue);

    if (!minValue.trim()) {
      errors.minValue = "Min value is required";
      hasError = true;
    } else if (!Number.isFinite(min)) {
      errors.minValue = "Min value must be a number";
      hasError = true;
    }

    if (!maxValue.trim()) {
      errors.maxValue = "Max value is required";
      hasError = true;
    } else if (!Number.isFinite(max)) {
      errors.maxValue = "Max value must be a number";
      hasError = true;
    }

    if (!hasError && min >= max) {
      errors.minValue = "Min value must be less than Max";
      errors.maxValue = "Max value must be greater than Min";
      hasError = true;
    }

    const { sizes, error } = parseSizes(sizeInput);
    if (error) {
      errors.sizes = error;
      hasError = true;
    }

    setFieldErrors(errors);

    if (hasError) {
      return { valid: false };
    }

    return {
      valid: true,
      payload: {
        minValue: min,
        maxValue: max,
        sizes,
        cppTimeLimitMs: Number(cppTimeLimitMs),
        javaTimeLimitMs: Number(javaTimeLimitMs),
        pythonTimeLimitMs: Number(pythonTimeLimitMs),
        jsTimeLimitMs: Number(jsTimeLimitMs),
        memoryLimitMB: Number(memoryLimitMB),
      },
    };
  };

  const handleDelete = async () => {
    if (!problem) return;

    try {
      setIsDeleting(true);
      setFieldErrors({});
      setSuccessMessage(null);

      await axios.delete(`${getBackendURL()}/admin/problem-test-generator`, {
        params: { problemId: problem.id },
        withCredentials: true,
      });

      setHasExistingGenerator(false);
      resetForm();
      setSuccessMessage("Generator configuration deleted successfully.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to delete generator";
      setFieldErrors({ form: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!problem) {
      setFieldErrors({ form: "Please select a problem first" });
      return;
    }

    const { valid, payload } = validateForm();
    if (!valid || !payload) return;

    try {
      setIsSaving(true);
      setFieldErrors({});
      setSuccessMessage(null);

      await saveGenerator({
        problemId: problem.id,
        pattern,
        minValue: payload.minValue,
        maxValue: payload.maxValue,
        sizes: payload.sizes,
        cppTimeLimitMs: payload.cppTimeLimitMs,
        javaTimeLimitMs: payload.javaTimeLimitMs,
        pythonTimeLimitMs: payload.pythonTimeLimitMs,
        jsTimeLimitMs: payload.jsTimeLimitMs,
        memoryLimitMB: payload.memoryLimitMB,
      });

      setSuccessMessage("Generator configuration saved successfully.");
    } catch (err: any) {
      const message =
        typeof err?.message === "string"
          ? err.message
          : "Failed to save generator";
      setFieldErrors({ form: message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 px-4 py-6 md:px-8 lg:px-10">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <div className="space-y-1.5">
            <CardTitle>Complexity Test Generator</CardTitle>
            <CardDescription>
              Configure an input generator for a problem. This controls how
              complexity test cases will be generated.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-8 space-y-3">
            <Label>Select Problem</Label>
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setProblem(null);
                resetForm();
              }}
              placeholder="Search by title, description, or ID"
            />
            {loadingProblems && (
              <p className="mt-1 text-xs text-gray-500">Loading problems...</p>
            )}
            {!loadingProblems && problems.length > 0 && (
              <ul className="mt-3 max-h-48 overflow-y-auto rounded-md border bg-background text-sm">
                {problems.map((p) => (
                  <li
                    key={p.id}
                    className="cursor-pointer border-b px-3 py-2 last:border-b-0 hover:bg-muted/70"
                    onClick={() => handleSelectProblem(p)}
                  >
                    <div className="font-medium">
                      #{p.number} {p.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{p.id}</div>
                  </li>
                ))}
              </ul>
            )}
            {searchValue && !loadingProblems && problems.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">No problems found.</p>
            )}
          </div>

          {problem && (
            <Card className="mb-4">
              <CardContent className="py-3">
                <CardDescription>
                  <div className="font-medium">Editing generator for:</div>
                  <div>
                    #{problem.number} {problem.title}
                  </div>
                </CardDescription>
              </CardContent>
            </Card>
          )}

          {fieldErrors.form && (
            <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {fieldErrors.form}
            </div>
          )}

          {successMessage && (
            <Card className="mb-4 text-green-600">
              <CardContent className="py-3">
                <CardDescription className="text-green-700">
                  {successMessage}
                </CardDescription>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={!problem || isLoadingGenerator}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label className="mb-2">Generator Type</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-muted-foreground"
                    disabled
                  >
                    ARRAY (fixed)
                  </Button>
                  <p className="mt-1 text-xs text-gray-500 mb-3">
                    Only ARRAY generators are supported for now.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="mb-2">Pattern</Label>
                  <Select
                    value={pattern}
                    onValueChange={(value) =>
                      setPattern(value as GeneratorPatternOption)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RANDOM">RANDOM</SelectItem>
                      <SelectItem value="SORTED">SORTED</SelectItem>
                      <SelectItem value="REVERSE">REVERSE</SelectItem>
                      <SelectItem value="CONSTANT">CONSTANT</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.pattern && (
                    <p className="mt-1 text-xs text-red-600">
                      {fieldErrors.pattern}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="mb-2">Min Value</Label>
                  <Input
                    type="number"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    aria-invalid={!!fieldErrors.minValue}
                  />
                  {fieldErrors.minValue && (
                    <p className="mt-1 text-xs text-red-600">
                      {fieldErrors.minValue}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="mb-2">Max Value</Label>
                  <Input
                    type="number"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    aria-invalid={!!fieldErrors.maxValue}
                  />
                  {fieldErrors.maxValue && (
                    <p className="mt-1 text-xs text-red-600">
                      {fieldErrors.maxValue}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="mb-2">C++ Time Limit (ms)</Label>
                  <Input
                    type="number"
                    value={cppTimeLimitMs}
                    onChange={(e) => setCppTimeLimitMs(e.target.value)}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Java Time Limit (ms)</Label>
                  <Input
                    type="number"
                    value={javaTimeLimitMs}
                    onChange={(e) => setJavaTimeLimitMs(e.target.value)}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Python Time Limit (ms)</Label>
                  <Input
                    type="number"
                    value={pythonTimeLimitMs}
                    onChange={(e) => setPythonTimeLimitMs(e.target.value)}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">JS Time Limit (ms)</Label>
                  <Input
                    type="number"
                    value={jsTimeLimitMs}
                    onChange={(e) => setJsTimeLimitMs(e.target.value)}
                    min={1}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label className="mb-2">Memory Limit (MB)</Label>
                <Input
                  type="number"
                  value={memoryLimitMB}
                  onChange={(e) => setMemoryLimitMB(e.target.value)}
                  min={1}
                  className="max-w-xs"
                />
              </div>

              <div className="mt-2 space-y-2">
                <Label className="mb-2">Size</Label>
                <Input
                  type="number"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="e.g. 1000000"
                  aria-invalid={!!fieldErrors.sizes}
                />
                <p className="mt-1 text-xs text-gray-500">
                  The length of the complexity test case input.
                </p>
                {fieldErrors.sizes && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.sizes}
                  </p>
                )}
              </div>
            </fieldset>

            <CardFooter className="mt-2 flex items-center justify-between px-0">
              <div className="text-xs text-gray-500">
                {isLoadingGenerator &&
                  problem &&
                  "Loading existing generator..."}
              </div>
              <div className="flex items-center gap-3">
                {hasExistingGenerator && problem && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isDeleting || isLoadingGenerator}
                      >
                        {isDeleting ? "Deleting..." : "Delete Generator"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Generator</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete the complexity
                          generator for <strong>#{problem.number} {problem.title}</strong>?
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="button" variant="destructive" onClick={handleDelete}>
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <Button
                  type="submit"
                  disabled={!problem || isSaving || isLoadingGenerator}
                >
                  {isSaving ? "Saving..." : "Save Generator"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
