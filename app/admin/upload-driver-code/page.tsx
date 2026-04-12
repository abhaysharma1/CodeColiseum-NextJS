"use client";

import { Input } from "@/components/ui/input";
import {
  complexityTestingCases,
  driverCode,
  Problem,
} from "@/generated/prisma/client";
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

function Page() {
  const [searchValue, setSearchValue] = useState("");
  const [foundProblems, setFoundProblems] = useState<Problem[] | undefined>();
  const [problem, setProblem] = useState<Problem | undefined>();
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [files, setFiles] = useState<File[] | undefined>();
  const [response, setResponse] = useState<driverCode | undefined>();
  const [uploading, setUploading] = useState(false);
  const exampleTemplate = ` {
    "languageId": 71,
    "header": "#include <bits/stdc++.h>\\nusing namespace std;",
    "template": "bool checkSortedAndRotated(vector<int>& nums) {\\n    // WRITE YOUR CODE HERE\\n}",
    "footer": "int main() {\\n    int n;\\n    cin >> n;\\n    vector<int> nums(n);\\n    for (int i = 0; i < n; i++) cin >> nums[i];\\n    bool res = checkSortedAndRotated(nums);\\n    cout << (res ? \"true\" : \"false\");\\n    return 0;\\n}"
  }
`;

  const codeWithID = `
  {
    id: 50,
    name: "C (GCC 9.2.0)",
  },
  {
    id: 54,
    name: "C++ (GCC 9.2.0)",
  },
  {
    id: 62,
    name: "Java (OpenJDK 13.0.1)",
  },

  {
    id: 71,
    name: "Python (3.8.1)",
  }
    `;

  const fetchProblems = async () => {
    try {
      setLoadingProblems(true);
      const problem = await axios.get(
        `${getBackendURL()}/problems/getproblems`,
        {
          params: { searchValue, take: 10, skip: 0 },
          withCredentials: true,
        }
      );
      setFoundProblems(problem.data as Problem[]);
    } catch (error) {
      if (typeof error === "string") {
        toast.error(error);
      }
    } finally {
      setLoadingProblems(false);
    }
  };

  const uploadDriverCodeFunc = async () => {
    if (!problem) {
      toast.error("Please Select a problem");
      return;
    }

    if (!files || files.length === 0) {
      toast.error("Please select a JSON file first.");
      return;
    }
    try {
      setUploading(true);
      const file = files[0];

      let jsonText: string;
      try {
        jsonText = await file.text();
      } catch (err) {
        toast.error("Failed to read file.");
        return;
      }

      let json: any;
      try {
        json = JSON.parse(jsonText);
      } catch (error) {
        toast.error("Invalid JSON file.");
        console.log(error);
      }
      console.log("uploading");
      const res = await axios.post(
        `${getBackendURL()}/admin/driver-code`,
        { problemId: problem.id, ...json },
        { withCredentials: true }
      );
      setResponse((res.data as any)?.data as any);
      console.log(res.data);
    } catch (error: any) {
      if (typeof error.message === "string") {
        toast.error(error.message);
      }
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProblems();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  return (
    <div className="flex-1 px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Upload Driver Code
          </h1>
          <p className="text-sm text-muted-foreground">
            Attach a JSON driver template to a problem. The file should contain
            header, template, and footer fields.
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
                  Search and choose the problem you want to attach driver code
                  to.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Combobox>
                      <ComboboxInput
                        placeholder="Search problems"
                        className="w-full"
                        value={searchValue}
                        onChange={(e) => {
                          setSearchValue(e.target.value);
                          if (problem) setProblem(undefined);
                        }}
                      />
                      <ComboboxContent>
                        {!loadingProblems && !foundProblems ? (
                          <ComboboxEmpty>No items found.</ComboboxEmpty>
                        ) : null}
                        <ComboboxList>
                          {loadingProblems
                            ? "Loading..."
                            : foundProblems?.map((item) => (
                                <ComboboxItem
                                  key={item.id}
                                  onClick={() => {
                                    setProblem(item);
                                    setSearchValue(item.title);
                                  }}
                                >
                                  {item.number}
                                  {"\t"}
                                  {item.title}
                                </ComboboxItem>
                              ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProblem(undefined);
                      setSearchValue("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium leading-none">
                    Upload JSON file
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Only one .json file is allowed. It should match the expected
                    driver format.
                  </p>
                </div>

                <Dropzone
                  className="mt-1 w-full rounded-md border border-dashed border-muted-foreground/30 bg-muted/20"
                  accept={{
                    "application/json": [".json"],
                  }}
                  maxFiles={1}
                  onDrop={(file) => setFiles(file)}
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

              {response && (
                <Card className="border-dashed bg-muted/30">
                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Upload status</span>
                      {response.updatedAt ? (
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
                      {`${JSON.stringify(response.header, null, 2)}\n${JSON.stringify(
                        response.template,
                        null,
                        2
                      )}\n${JSON.stringify(response.footer, null, 2)}`}
                    </SyntaxHighlighter>
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
                <p className="text-sm font-medium leading-none">Language IDs</p>
                <p className="text-xs text-muted-foreground">
                  Supported language names with their corresponding IDs.
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
