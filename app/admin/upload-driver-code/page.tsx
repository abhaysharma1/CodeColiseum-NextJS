"use client";

import { Input } from "@/components/ui/input";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { UploadIcon } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card, CardContent } from "@/components/ui/card";
import { getBackendURL } from "@/utils/utilities";

interface AdminProblem {
  id: string;
  number: number;
  title: string;
  isPublished: boolean;
  difficulty: string;
  hidden: boolean;
}

interface UploadResult {
  language: string;
  success: boolean;
  error?: string;
}

function Page() {
  const [availableProblems, setAvailableProblems] = useState<AdminProblem[]>(
    []
  );
  const [selectedProblemId, setSelectedProblemId] = useState<
    string | undefined
  >();
  const [searchValue, setSearchValue] = useState("");
  const [files, setFiles] = useState<File[] | undefined>();
  const [results, setResults] = useState<UploadResult[] | undefined>();
  const [uploading, setUploading] = useState(false);

  const exampleTemplate = `{
  "language": "cpp",
  "header": "#include <bits/stdc++.h>\\nusing namespace std;",
  "template": "bool checkSortedAndRotated(vector<int>& nums) {\\n    // WRITE YOUR CODE HERE\\n}",
  "footer": "int main() {\\n    int n;\\n    cin >> n;\\n    vector<int> nums(n);\\n    for (int i = 0; i < n; i++) cin >> nums[i];\\n    bool res = checkSortedAndRotated(nums);\\n    cout << (res ? \\"true\\" : \\"false\\");\\n    return 0;\\n}"
}`;

  const codeWithID = `[
  { "language": "c",      "label": "C",           "languageId": 1 },
  { "language": "cpp",    "label": "C++",         "languageId": 2 },
  { "language": "python", "label": "Python",      "languageId": 3 },
  { "language": "java",   "label": "Java",        "languageId": 4 }
]`;

  const selectedProblem = availableProblems.find(
    (p) => p.id === selectedProblemId
  );

  const fetchProblems = async () => {
    try {
      const res = await axios.get(`${getBackendURL()}/admin/problems`, {
        withCredentials: true,
      });
      setAvailableProblems((res.data as any)?.problems ?? []);
    } catch (error) {
      if (typeof error === "string") {
        toast.error(error);
      }
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const filteredProblems = availableProblems.filter((p) =>
    p.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  const uploadDriverCodeFunc = async () => {
    if (!selectedProblemId || !selectedProblem) {
      toast.error("Please select a problem");
      return;
    }

    if (!files || files.length === 0) {
      toast.error("Please select at least one JSON file.");
      return;
    }

    setUploading(true);
    setResults(undefined);
    const uploadResults: UploadResult[] = [];

    for (const file of files) {
      let jsonText: string;
      try {
        jsonText = await file.text();
      } catch {
        uploadResults.push({
          language: file.name,
          success: false,
          error: "Failed to read file",
        });
        continue;
      }

      let json: any;
      try {
        json = JSON.parse(jsonText);
      } catch {
        uploadResults.push({
          language: file.name,
          success: false,
          error: "Invalid JSON",
        });
        continue;
      }

      try {
        const res = await axios.post(
          `${getBackendURL()}/admin/driver-code`,
          { problemId: selectedProblem.id, ...json },
          { withCredentials: true }
        );
        const language =
          (res.data as any)?.data?.language ?? file.name;
        uploadResults.push({ language, success: true });
      } catch (error: any) {
        const msg =
          error?.response?.data?.error || error.message || "Upload failed";
        uploadResults.push({
          language: file.name,
          success: false,
          error: msg,
        });
      }
    }

    setResults(uploadResults);
    setUploading(false);
    const successCount = uploadResults.filter((r) => r.success).length;
    const failCount = uploadResults.filter((r) => !r.success).length;
    if (failCount === 0) {
      toast.success(
        `All ${successCount} driver code(s) uploaded successfully`
      );
    } else {
      toast.error(`${successCount} succeeded, ${failCount} failed`);
    }
  };

  return (
    <div className="flex-1 px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Upload Driver Code
          </h1>
          <p className="text-sm text-muted-foreground">
            Attach JSON driver template(s) to a problem. Select up to 4 files
            (one per language).
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <p className="text-sm font-medium leading-none">
                  Select problem
                </p>
                <p className="text-xs text-muted-foreground">
                  Search and choose the problem to attach driver code to.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Combobox
                      value={selectedProblemId || ""}
                      onValueChange={(val) => {
                        setSelectedProblemId(val || undefined);
                        const p = availableProblems.find(
                          (x) => x.id === val
                        );
                        if (p)
                          setSearchValue(`#${p.number} ${p.title}`);
                      }}
                    >
                      <ComboboxInput
                        placeholder="Search problems"
                        className="w-full"
                        value={searchValue}
                        onChange={(e) => {
                          setSearchValue(e.target.value);
                          if (selectedProblemId)
                            setSelectedProblemId(undefined);
                        }}
                        showTrigger
                      />
                      <ComboboxContent>
                        <ComboboxList>
                          {filteredProblems.length === 0 ? (
                            <ComboboxEmpty>
                              No problems found.
                            </ComboboxEmpty>
                          ) : (
                            filteredProblems.map((p) => (
                              <ComboboxItem key={p.id} value={p.id}>
                                #{p.number} — {p.title}
                              </ComboboxItem>
                            ))
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProblemId(undefined);
                      setSearchValue("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
                {selectedProblem && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="py-2">
                      <p className="text-sm font-medium">
                        Selected: #{selectedProblem.number} —{" "}
                        {selectedProblem.title}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium leading-none">
                    Upload JSON file(s)
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Select up to 4 JSON files (one per language). Each file
                    should match the expected driver format.
                  </p>
                </div>

                <Dropzone
                  className="mt-1 w-full rounded-md border border-dashed border-muted-foreground/30 bg-muted/20"
                  accept={{
                    "application/json": [".json"],
                  }}
                  maxFiles={4}
                  onDrop={(file) => setFiles(file)}
                >
                  <DropzoneEmptyState>
                    <div className="flex w-full items-center gap-4 p-4">
                      <div className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <UploadIcon size={20} />
                      </div>
                      <div className="flex-1 text-left">
                        {!files || files.length === 0 ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Drag and drop JSON files here
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Or click to browse. Up to 4 files accepted.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {files.length} file(s) selected
                            </p>
                            <ul className="list-inside list-disc text-xs text-muted-foreground">
                              {files.map((f, i) => (
                                <li key={i}>{f.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </DropzoneEmptyState>
                  <DropzoneContent />
                </Dropzone>

                <div className="flex justify-end pt-2">
                  <Button
                    className="w-fit"
                    onClick={uploadDriverCodeFunc}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Submit"}
                  </Button>
                </div>
              </div>

              {results && results.length > 0 && (
                <Card className="border-dashed bg-muted/30">
                  <CardContent className="space-y-3 pt-4">
                    <p className="text-sm font-medium">Upload Results</p>
                    {results.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{r.language}</span>
                        {r.success ? (
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                            Accepted
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500">
                            {r.error || "Failed"}
                          </span>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Example driver JSON
                </p>
                <p className="text-xs text-muted-foreground">
                  Use this as a reference for the required structure.
                </p>
              </div>
              <SyntaxHighlighter
                language="json"
                style={atomDark}
                className="max-h-64 overflow-auto rounded-md border border-border text-xs"
              >
                {exampleTemplate}
              </SyntaxHighlighter>

              <div className="space-y-1 pt-2">
                <p className="text-sm font-medium leading-none">
                  Supported Languages
                </p>
                <p className="text-xs text-muted-foreground">
                  Language keys and their corresponding IDs.
                </p>
              </div>
              <SyntaxHighlighter
                language="json"
                style={atomDark}
                className="max-h-64 overflow-auto rounded-md border border-border text-xs"
              >
                {codeWithID}
              </SyntaxHighlighter>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Page;
