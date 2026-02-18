"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { useAuth } from "@/context/authcontext";
import axios from "axios";
import { UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { FinalResponse } from "./types";

type RowResult =
  | { title: string; result: "created"; number: number }
  | { title: string; result: "error"; message: string };

interface responseType {
  error?: boolean;
  success?: boolean;
  results: RowResult[];
}

function Page() {
  const [files, setFiles] = useState<File[] | undefined>();
  const [response, setResponse] = useState<responseType | undefined>();
  const [validationResponse, setValidationResponse] = useState<
    FinalResponse | undefined
  >();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [didPassValidation, setDidPassValidation] = useState(false);

  const { logout } = useAuth();

  const router = useRouter();

  const exampleTemplate = `[
    {
      title: "Two Sum",
      description: "Given an array of integers and a target,. in Markdown Format",
      difficulty: "EASY",
      source: "Internal",
      tags: ["array", "hashmap"],
      publicTests: [
        { input: "2 7 11 15\\n9", output: "0 1" },
        { input: "1 2 3\\n 3", output: "0 2" },
      ],
      hiddenTests: [{ input: "5 5 5 5\\n10", output: "0 1" }],
      referenceSolution: {
        languageId: 54,
        code: "#include<iostream>"
      }
    },
    {},
  ];`;

  const uploadProblems = async () => {
    if (!files || files.length === 0) {
      toast.error("Please select a JSON file first.");
      return;
    }

    if (!validationResponse) {
      toast.error("Please Validate and then Upload your problems");
      return;
    }

    if (!didPassValidation) {
      toast.error(
        "Please Make sure that all the test cases pass before you upload them",
      );
      return;
    }

    setLoading(true);
    const file = files[0];

    let jsonText: string;
    try {
      jsonText = await file.text();
    } catch (err) {
      toast.error("Failed to read file.");
      return;
    }

    let json: unknown;
    try {
      json = JSON.parse(jsonText);
    } catch (error) {
      toast.error("Invalid JSON file.");
      console.log(error);
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/admin/uploadproblems", json, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(res);
      setResponse(res.data as responseType);
    } catch (error: any) {
      if (typeof error === "string") {
        toast.error(error);
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const validateProblems = async () => {
    if (!files || files.length === 0) {
      toast.error("Please select a JSON file first.");
      return;
    }

    const file = files[0];

    let jsonText: string;

    try {
      jsonText = await file.text();
    } catch (err) {
      toast.error("Failed to read file.");
      return;
    }

    let json: unknown;
    try {
      json = JSON.parse(jsonText);
    } catch (error) {
      toast.error("Invalid JSON file.");
      console.log(error);
    }

    try {
      setValidating(true);

      const res = await axios.post("/api/admin/validateProblem", json, {
        headers: { "Content-Type": "application/json" },
      });

      setValidationResponse(res.data as FinalResponse);
      const result = res.data as FinalResponse;

      for (const p of result.responses) {
        if (p.status.id != 3) {
          setDidPassValidation(false);
          return;
        }
      }
      setDidPassValidation(true);
    } catch (error: any) {
      toast.error("Error");
      console.log(error);
    } finally {
      setValidating(false);
    }
  };

  const handleDrop = (files: File[]) => {
    console.log(files);
    setFiles(files);
  };

  return (
    <div className="flex-1 px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Upload Problems
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload and validate a JSON file containing one or more problems
              before publishing them.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.loading("Logging out");
              logout();
              toast.dismiss();
              router.replace("/login");
            }}
          >
            Logout
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium leading-none">
                  Upload JSON file
                </p>
                <p className="text-xs text-muted-foreground">
                  Only one .json file is allowed. It should follow the specified
                  problem schema.
                </p>
              </div>

              <Dropzone
                className="mt-1 w-full rounded-md border border-dashed border-muted-foreground/30 bg-muted/20"
                accept={{
                  "application/json": [".json"],
                }}
                maxFiles={1}
                onDrop={handleDrop}
              >
                <DropzoneEmptyState>
                  <div className="flex w-full items-center gap-4 p-4">
                    <div className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <UploadIcon size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      {!files ? (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Drag and drop your JSON file here
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Or click to browse from your computer.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Selected file: {files[0].name}
                        </p>
                      )}
                    </div>
                  </div>
                </DropzoneEmptyState>
                <DropzoneContent />
              </Dropzone>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDidPassValidation(false);
                    setFiles(undefined);
                    setValidationResponse(undefined);
                    setResponse(undefined);
                    setLoading(false);
                    setValidating(false);
                  }}
                  disabled={loading || validating}
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={validateProblems}
                  disabled={loading || validating}
                >
                  {validating ? "Validating..." : "Validate"}
                </Button>
                <Button
                  size="sm"
                  onClick={uploadProblems}
                  disabled={loading || validating || !didPassValidation}
                >
                  {loading ? "Uploading..." : "Submit"}
                </Button>
              </div>
              {response && (
                <div className="mt-3 space-y-3 rounded-md border border-border bg-muted/40 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Upload result</span>
                    {response.success ? (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                        Accepted
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500">
                        Declined
                      </span>
                    )}
                  </div>
                  <SyntaxHighlighter
                    language="json"
                    style={atomDark}
                    className="max-h-64 overflow-auto rounded-md border border-border text-xs"
                  >
                    {JSON.stringify(response.results, null, 2)}
                  </SyntaxHighlighter>
                </div>
              )}

              {validationResponse && (
                <div className="mt-3 space-y-3 rounded-md border border-border bg-muted/40 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Validation results</span>
                    {didPassValidation ? (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                        All test cases passed
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500">
                        Some test cases failed
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {validationResponse.responses.map((res) => (
                      <div
                        key={res.stdin}
                        className="rounded-md border border-border/60 bg-background/70 p-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-medium text-foreground">
                            Input: {res.stdin}
                          </span>
                          {res.status.id === 3 ? (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                              Accepted
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-500">
                              {res.status.description}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 grid gap-1 sm:grid-cols-3">
                          <span>
                            <span className="font-medium">Expected:</span>{" "}
                            {res.expected_output}
                          </span>
                          <span>
                            <span className="font-medium">Your output:</span>{" "}
                            {res.stdout}
                          </span>
                          {res.compile_output && res.status.id !== 3 && (
                            <span className="text-red-500">
                              <span className="font-medium">Compile:</span>{" "}
                              {res.compile_output}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Example problems JSON
                </p>
                <p className="text-xs text-muted-foreground">
                  Use this as a reference for how to structure your problems
                  file.
                </p>
              </div>
              <SyntaxHighlighter
                language="json"
                style={atomDark}
                className="max-h-80 overflow-auto rounded-md border border-border text-xs"
              >
                {exampleTemplate}
              </SyntaxHighlighter>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Page;
