"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PerformanceConstraints,
  PerformanceTestCase,
} from "./types";
import { toast } from "sonner";
import { Gauge, Plus, Trash2, Upload } from "lucide-react";

interface PerformanceTabProps {
  constraints?: PerformanceConstraints;
  testCases?: PerformanceTestCase[];
  onChangeConstraints?: (constraints: PerformanceConstraints) => void;
  onChangeTestCases?: (testCases: PerformanceTestCase[]) => void;
}

const defaultConstraints: PerformanceConstraints = {
  cppTimeLimitMs: 1000,
  javaTimeLimitMs: 2000,
  pythonTimeLimitMs: 4000,
  jsTimeLimitMs: 3000,
  memoryLimitMB: 256,
};

export function PerformanceTab(props: PerformanceTabProps) {
  const {
    constraints = defaultConstraints,
    testCases = [],
    onChangeConstraints,
    onChangeTestCases,
  } = props;

  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const outputFileRef = useRef<HTMLInputElement | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const updateConstraint = (
    field: keyof PerformanceConstraints,
    value: number
  ) => {
    onChangeConstraints?.({ ...constraints, [field]: value });
  };

  const addTestCase = () => {
    const next: PerformanceTestCase = {
      id: crypto.randomUUID(),
      name: `tc${testCases.length + 1}`,
      inputFileKey: "",
      outputFileKey: "",
    };
    onChangeTestCases?.([...testCases, next]);
  };

  const deleteTestCase = (id: string) => {
    onChangeTestCases?.(testCases.filter((tc) => tc.id !== id));
  };

  const handleFileUpload = async (
    testCaseId: string,
    field: "inputFileKey" | "outputFileKey",
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFor(testCaseId);
    try {
      // In a real implementation, this would upload to S3 and return a key
      // For now, we store the filename as a placeholder
      onChangeTestCases?.(
        testCases.map((tc) =>
          tc.id === testCaseId ? { ...tc, [field]: file.name } : tc
        )
      );
      toast.success(`${field === "inputFileKey" ? "Input" : "Output"} file selected: ${file.name}`);
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploadingFor(null);
    }
    event.target.value = "";
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-8">
      <div className="flex flex-col gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Set time and memory limits for code execution across languages.
          </p>
        </div>
      </div>

      {/* Performance Constraints */}
      <Card className="p-6 border-muted-foreground/20">
        <h3 className="text-sm font-semibold mb-4">Time & Memory Limits</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { key: "cppTimeLimitMs" as const, label: "C++ Time (ms)", placeholder: "1000" },
            { key: "javaTimeLimitMs" as const, label: "Java Time (ms)", placeholder: "2000" },
            { key: "pythonTimeLimitMs" as const, label: "Python Time (ms)", placeholder: "4000" },
            { key: "jsTimeLimitMs" as const, label: "JavaScript Time (ms)", placeholder: "3000" },
            { key: "memoryLimitMB" as const, label: "Memory Limit (MB)", placeholder: "256" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {label}
              </label>
              <Input
                type="number"
                min={1}
                value={constraints[key]}
                onChange={(e) =>
                  updateConstraint(key, parseInt(e.target.value) || 0)
                }
                placeholder={placeholder}
                className="h-9 text-sm"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Test Cases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Performance Test Cases</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload input/output file pairs for performance testing.
            </p>
          </div>
          <Button onClick={addTestCase} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Test Case
          </Button>
        </div>

        {testCases.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 shadow-none bg-muted/10">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium">No performance test cases</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm">
              Upload input and output file pairs to test the performance of
              submitted solutions.
            </p>
            <Button variant="outline" size="sm" onClick={addTestCase} className="gap-2">
              <Plus className="h-4 w-4" />
              Add your first test case
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {testCases.map((tc) => (
              <Card
                key={tc.id}
                className="p-4 border-muted-foreground/20 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="text-sm font-medium">Name:</span>
                    <Input
                      value={tc.name}
                      onChange={(e) =>
                        onChangeTestCases?.(
                          testCases.map((t) =>
                            t.id === tc.id ? { ...t, name: e.target.value } : t
                          )
                        )
                      }
                      className="h-8 text-sm w-28"
                      placeholder="tc1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => inputFileRef.current?.click()}
                      disabled={uploadingFor === tc.id}
                    >
                      <Upload className="h-3 w-3" />
                      {tc.inputFileKey ? tc.inputFileKey.split("/").pop() : "Input File"}
                    </Button>
                    <input
                      ref={inputFileRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload(tc.id, "inputFileKey", e)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => outputFileRef.current?.click()}
                      disabled={uploadingFor === tc.id}
                    >
                      <Upload className="h-3 w-3" />
                      {tc.outputFileKey ? tc.outputFileKey.split("/").pop() : "Output File"}
                    </Button>
                    <input
                      ref={outputFileRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload(tc.id, "outputFileKey", e)}
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => deleteTestCase(tc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
