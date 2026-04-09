"use client";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getBackendURL } from "@/utils/utilities";

export interface TestCase {
  input: string;
  output: string;
}

export interface RunTestCase {
  id: string;
  problemId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  cases: unknown;
}

const CASE_START_TOKEN = "_CASE_START_";
const CASE_END_TOKEN = "_CASE_END_";

const parseDelimitedOutputs = (output: string) => {
  if (!output.includes(CASE_START_TOKEN) || !output.includes(CASE_END_TOKEN)) {
    return [];
  }

  const matches = [
    ...output.matchAll(/_CASE_START_\s*([\s\S]*?)\s*_CASE_END_/g),
  ];
  return matches
    .map((match) => (match[1] ?? "").trim())
    .filter((value) => value !== "");
};

const splitBundledInput = (input: string, expectedCases: number) => {
  if (expectedCases <= 1) {
    return [input.trim()];
  }

  const lines = input.split(/\r?\n/).map((line) => line.trimEnd());
  const firstLine = lines[0]?.trim() ?? "";
  const declaredCount = Number.parseInt(firstLine, 10);
  const hasLeadingCount =
    Number.isFinite(declaredCount) && declaredCount === expectedCases;

  const inputLines = hasLeadingCount ? lines.slice(1) : lines;
  if (inputLines.length === 0) {
    return Array.from({ length: expectedCases }, () => "");
  }

  if (inputLines.length % expectedCases === 0) {
    const linesPerCase = inputLines.length / expectedCases;
    return Array.from({ length: expectedCases }, (_, index) => {
      const start = index * linesPerCase;
      const end = start + linesPerCase;
      return inputLines.slice(start, end).join("\n").trim();
    });
  }

  return Array.from({ length: expectedCases }, (_, index) =>
    (inputLines[index] ?? "").trim()
  );
};

const normalizeCases = (rawCases: unknown): TestCase[] => {
  let parsedCases = rawCases;

  if (typeof parsedCases === "string") {
    try {
      parsedCases = JSON.parse(parsedCases);
    } catch {
      return [];
    }
  }

  const sourceCases = Array.isArray(parsedCases)
    ? parsedCases
    : parsedCases && typeof parsedCases === "object"
      ? [parsedCases]
      : [];

  const normalized: TestCase[] = [];

  for (const caseItem of sourceCases) {
    if (!caseItem || typeof caseItem !== "object") {
      continue;
    }

    const input =
      typeof (caseItem as { input?: unknown }).input === "string"
        ? ((caseItem as { input: string }).input ?? "")
        : "";
    const output =
      typeof (caseItem as { output?: unknown }).output === "string"
        ? ((caseItem as { output: string }).output ?? "")
        : "";

    if (!input && !output) {
      continue;
    }

    const outputBlocks = parseDelimitedOutputs(output);
    if (outputBlocks.length <= 1) {
      normalized.push({
        input: input.trim(),
        output: output.trim(),
      });
      continue;
    }

    const inputBlocks = splitBundledInput(input, outputBlocks.length);
    const pairCount = Math.min(inputBlocks.length, outputBlocks.length);

    for (let index = 0; index < pairCount; index += 1) {
      normalized.push({
        input: (inputBlocks[index] ?? "").trim(),
        output: (outputBlocks[index] ?? "").trim(),
      });
    }
  }

  return normalized;
};

function TestCases({ questionId }: { questionId: string }) {
  const [testData, setTestData] = useState<TestCase[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const getCases = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await axios.get(
        `${getBackendURL()}/problems/gettestcases?id=${questionId}`,
        { withCredentials: true }
      );
      const { cases } = res.data as RunTestCase;
      setTestData(normalizeCases(cases));
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to load test cases right now.");
      setTestData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questionId) {
      getCases();
    }
  }, [questionId]);

  return (
    <div className="mt-7 flex flex-col h-full">
      <div className=" flex flex-col h-full">
        {loading ? (
          <div className="w-full flex flex-col justify-center items-center">
            <Spinner variant="ring" />
          </div>
        ) : errorMessage ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : testData.length === 0 ? (
          <div className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            No test cases available.
          </div>
        ) : (
          <div className="space-y-4">
            {testData.map((item, index) => (
              <div
                className="rounded-lg border bg-card p-4"
                key={`${index}-${item.input.slice(0, 24)}`}
              >
                <div className="mb-3 text-sm font-semibold text-foreground/90">
                  Test Case {index + 1}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Input
                    </div>
                    <pre className="max-h-44 overflow-auto rounded-md bg-muted/50 p-3 text-xs whitespace-pre-wrap break-words">
                      {item.input || "-"}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Output
                    </div>
                    <pre className="max-h-44 overflow-auto rounded-md bg-muted/50 p-3 text-xs whitespace-pre-wrap break-words">
                      {item.output || "-"}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TestCases;
