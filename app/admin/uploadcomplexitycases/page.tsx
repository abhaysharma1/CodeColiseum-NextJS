"use client";

import { Input } from "@/components/ui/input";
import { complexityTestingCases, Problem } from "@/generated/prisma/client";
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
import uploadComplexityCases from "@/app/actions/admin/uploadComplexityCases";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card, CardContent, CardDescription } from "@/components/ui/card";

type validationResponse = {
  validation: "Successful" | "Failed";
  expectedComplexity: String;
  yourComplexity: String;
  ratio: number;
};

function Page() {
  const [searchValue, setSearchValue] = useState("");
  const [foundProblems, setFoundProblems] = useState<Problem[] | undefined>();
  const [problem, setProblem] = useState<Problem | undefined>();
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [files, setFiles] = useState<File[] | undefined>();
  const [response, setResponse] = useState<
    complexityTestingCases | undefined
  >();
  const [uploading, setUploading] = useState(false);

  const [validationResponse, setValidationResponse] = useState<
    validationResponse | undefined
  >();
  const [validating, setValidating] = useState(false);
  const [didPassValidation, setDidPassValidation] = useState(false);

  const exampleTemplate = `
  {
    expectedComplexity : N | LOGN | NLOGN | N2 | N3,
    cases: [
      { input : 1\\n 23232, output: "20"},
      { input : "1\\n 2323232", output: "40"},
    ]
  }`;

  const fetchProblems = async () => {
    try {
      setLoadingProblems(true);
      const problem = await axios.post("/api/problems/getproblems", {
        searchValue,
        take: 10,
        skip: 0,
      });
      setFoundProblems(problem.data as Problem[]);
    } catch (error) {
      if (typeof error === "string") {
        toast.error(error);
      }
    } finally {
      setLoadingProblems(false);
    }
  };

  const uploadComplexityCasesFunc = async () => {
    if (!problem) {
      toast.error("Please Select a problem");
      return;
    }

    if (!files || files.length === 0) {
      toast.error("Please select a JSON file first.");
      return;
    }

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

      const data = await uploadComplexityCases(problem.id, json);
      console.log(data);
      setResponse(data);
    } catch (error: any) {
      if (typeof error.message === "string") {
        toast.error(error.message);
        console.log(error);
      }
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const validateProblems = async () => {
    if (!problem) {
      toast.error("Please Select a problem");
      return;
    }

    if (!files || files.length === 0) {
      toast.error("Please select a JSON file first.");
      return;
    }

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

    let json: any;
    try {
      json = JSON.parse(jsonText);
    } catch (error) {
      toast.error("Invalid JSON file.");
      console.log(error);
    }

    try {
      setValidating(true);

      const data = {
        problemId: problem.id,
        casesData: json,
      };

      const res = await axios.post("/api/admin/validateComplexityCases", data);
      const valRes = res.data as validationResponse;
      setValidationResponse(valRes);

      if (valRes.validation === "Successful") {
        setDidPassValidation(true);
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProblems();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  return (
    <div className="p-20">
      <div className="flex gap-2">
        <Combobox>
          <ComboboxInput
            placeholder="Select a problem"
            className="w-100"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (problem) setProblem(undefined);
            }}
          />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
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

        <Button
          variant={"outline"}
          onClick={() => {
            setProblem(undefined);
            setSearchValue("");
          }}
        >
          Clear Problem
        </Button>
        <Button
          variant={"outline"}
          onClick={() => {
            setResponse(undefined);
            setFiles(undefined);
            setProblem(undefined);
            setSearchValue("");
          }}
        >
          Clear Everything
        </Button>
      </div>

      <div className="flex gap-40">
        <div className="mt-5">
          <div className="w-[400px]">
            <h1 className="mb-2 text-lg">
              Upload Complexity Cases In JSON Format
            </h1>
            <Dropzone
              className="w-[400px]"
              accept={{
                "application/json": [".json"],
              }}
              maxFiles={1}
              onDrop={(file) => setFiles(file)}
            >
              <DropzoneEmptyState>
                <div className="flex w-full items-center gap-4 p-0">
                  <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <UploadIcon size={24} />
                  </div>
                  <div className="text-left">
                    {!files ? (
                      <div>
                        <p className="font-medium text-sm">
                          Upload a JSON file containing{" "}
                        </p>
                        <p className="font-medium text-sm">
                          Cases in the Provided Format
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Drag and drop or click to upload
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs flex justify-end w-[100%]">
                        {files[0].name}
                      </p>
                    )}
                  </div>
                </div>
              </DropzoneEmptyState>
              <DropzoneContent />
            </Dropzone>
            <div className="w-full flex justify-end mt-2 gap-3">
              <Button
                className="w-fit cursor-pointer"
                onClick={() => {
                  setResponse(undefined);
                  setDidPassValidation(false);
                  setFiles(undefined);
                  setProblem(undefined);
                  setValidationResponse(undefined);
                }}
                disabled={validating || uploading}
                variant={"outline"}
              >
                Clear Everything
              </Button>
              <Button
                className="w-fit cursor-pointer"
                onClick={validateProblems}
                disabled={validating || uploading}
                variant={"outline"}
              >
                {validating ? "Validating..." : "Validate"}
              </Button>
              <Button
                className="w-fit cursor-pointer"
                onClick={uploadComplexityCasesFunc}
                disabled={validating || uploading || !didPassValidation}
                variant={"default"}
              >
                {uploading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>

          <div>
            {validationResponse && (
              <div className="mt-8">
                <Card>
                  <CardContent>
                    <CardDescription className="flex flex-col gap-3 ">
                      {didPassValidation ? (
                        <span className="text-green-600">Accepted</span>
                      ) : (
                        <span className="text-red-600">Rejected</span>
                      )}
                      <span>
                        Expected Complexity:{" "}
                        {validationResponse.expectedComplexity}
                      </span>
                      <span>
                        Your Complexity: {validationResponse.yourComplexity}
                      </span>
                      <span>Complexity Ratio: {validationResponse.ratio}</span>
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            )}
            {response && (
              <Card className="mt-5 w-200 overflow-x-scroll">
                <CardContent>
                  {response.updatedAt ? (
                    <h1 className="text-green-400">Accepted</h1>
                  ) : (
                    <h1 className="text-red-400">Declined</h1>
                  )}{" "}
                  <SyntaxHighlighter
                    language="json"
                    style={atomDark}
                    className="rounded-md outline-1"
                  >
                    {JSON.stringify(response.cases, null, 2)}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
            )}
            {}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
