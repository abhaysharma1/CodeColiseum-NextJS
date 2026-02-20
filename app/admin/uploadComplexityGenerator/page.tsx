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

type GeneratorPatternOption = "RANDOM" | "SORTED" | "REVERSE" | "CONSTANT";

type ExpectedComplexityOption = "LOGN" | "N" | "NLOGN" | "N2" | "N3" | "EXP";

type GeneratorData = {
  pattern: GeneratorPatternOption;
  minValue: number;
  maxValue: number;
  sizes: number[];
  expectedComplexity: ExpectedComplexityOption;
};

type FieldErrors = {
  pattern?: string;
  minValue?: string;
  maxValue?: string;
  sizes?: string;
  expectedComplexity?: string;
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
        expectedComplexity?: ExpectedComplexityOption | null;
      } | null;
    };
    if (!data || !data.generator) return null;

    return {
      pattern: data.generator.pattern,
      minValue: data.generator.minValue,
      maxValue: data.generator.maxValue,
      sizes: data.generator.sizes,
      expectedComplexity: data.generator.expectedComplexity ?? "N",
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
  expectedComplexity: ExpectedComplexityOption;
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
        expectedComplexity: payload.expectedComplexity,
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
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (parts.length < 3) {
    return { sizes: [], error: "Provide at least 3 sizes" };
  }

  const sizes = parts.map((p) => Number(p));

  if (sizes.some((n) => !Number.isFinite(n) || !Number.isInteger(n))) {
    return { sizes: [], error: "Sizes must be valid integers" };
  }

  if (sizes.some((n) => n <= 0)) {
    return { sizes: [], error: "Sizes must be greater than 0" };
  }

  for (let i = 1; i < sizes.length; i++) {
    if (sizes[i] <= sizes[i - 1]) {
      return {
        sizes: [],
        error: "Sizes must be strictly increasing (e.g. 1000,2000,4000)",
      };
    }
  }

  return { sizes };
}

function Page() {
  const [searchValue, setSearchValue] = useState("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);

  const [pattern, setPattern] = useState<GeneratorPatternOption>("RANDOM");
  const [expectedComplexity, setExpectedComplexity] =
    useState<ExpectedComplexityOption>("N");
  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("");
  const [sizesInput, setSizesInput] = useState<string>("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoadingGenerator, setIsLoadingGenerator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    setExpectedComplexity("N");
    setMinValue("");
    setMaxValue("");
    setSizesInput("");
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
        setPattern(existing.pattern);
        setMinValue(String(existing.minValue));
        setMaxValue(String(existing.maxValue));
        setSizesInput(existing.sizes.join(","));
        setExpectedComplexity(existing.expectedComplexity);
      } else {
        resetForm();
      }
    } catch (err) {
      console.error(err);
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
      expectedComplexity: ExpectedComplexityOption;
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

    const { sizes, error } = parseSizes(sizesInput);
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
        expectedComplexity,
      },
    };
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
        expectedComplexity: payload.expectedComplexity,
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

              <div className="mt-4 space-y-2 mb-4">
                <Label className="mb-2">Expected Time Complexity</Label>
                <Select
                  value={expectedComplexity}
                  onValueChange={(value) =>
                    setExpectedComplexity(value as ExpectedComplexityOption)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select expected complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOGN">O(log N)</SelectItem>
                    <SelectItem value="N">O(N)</SelectItem>
                    <SelectItem value="NLOGN">O(N log N)</SelectItem>
                    <SelectItem value="N2">O(N^2)</SelectItem>
                    <SelectItem value="N3">O(N^3)</SelectItem>
                    <SelectItem value="EXP">Exponential</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-500">
                  Used when checking if the observed scaling of the user&apos;s
                  solution matches this expected complexity.
                </p>
                {fieldErrors.expectedComplexity && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.expectedComplexity}
                  </p>
                )}
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

              <div className="mt-2 space-y-2">
                <Label className="mb-2">Sizes</Label>
                <Input
                  type="text"
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  placeholder="e.g. 1000,2000,4000"
                  aria-invalid={!!fieldErrors.sizes}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Comma-separated list of input sizes. Must be at least 3
                  numbers, all &gt; 0 and strictly increasing.
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
              <Button
                type="submit"
                disabled={!problem || isSaving || isLoadingGenerator}
              >
                {isSaving ? "Saving..." : "Save Generator"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
