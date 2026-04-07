import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { runTestCaseType } from "./interface";

const normalizeOutput = (value?: string | null) =>
  (value ?? "").replace(/\s+/g, " ").trim();

function TestCaseRunBlock({
  results,
}: {
  results: runTestCaseType | undefined;
}) {
  if (!results) {
    return <div className="p-4">Please Run Your Code to See Results</div>;
  }

  return (
    <div className="">
      {results?.responses.map((item, index) => (
        <div
          key={`${item.language}-${index}`}
          className="my-4 animate-fade-down animate-once animate-delay-10"
        >
          {(() => {
            const expected = results.cases[index]?.output ?? "";
            const stdout = item.run?.stdout ?? "";
            const compileError = item.compile?.stderr ?? "";
            const runtimeError = item.run?.stderr ?? "";
            const hasExitCodeFailure =
              typeof item.run?.code === "number" && item.run.code !== 0;

            const passed =
              !compileError &&
              !runtimeError &&
              !hasExitCodeFailure &&
              normalizeOutput(stdout) === normalizeOutput(expected);

            return (
              <Card>
                <CardHeader>
                  <CardTitle>Test {index + 1}</CardTitle>
                  <CardDescription className="flex justify-between">
                    <div>
                      Exit code: {item.run?.code ?? "N/A"}
                      {item.run?.signal ? (
                        <>
                          <br />
                          Signal: {item.run.signal}
                        </>
                      ) : null}
                    </div>
                    <div>
                      {passed ? (
                        <span className="text-green-600">Accepted</span>
                      ) : (
                        <span className="text-red-600">Failed</span>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md">
                    <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces rounded-t-md">
                      Input
                      <br />
                      {results?.cases[index].input}
                    </div>
                    <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces">
                      Expected Output
                      <br />
                      {results.cases[index].output}
                    </div>
                    <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces rounded-b-md">
                      Your Output
                      <br />
                      {stdout || "(no stdout)"}
                    </div>
                    {compileError && (
                      <div className="p-2 px-4 bg-red-500/10 whitespace-break-spaces rounded-b-md mt-2">
                        Compile Error
                        <br />
                        {compileError}
                      </div>
                    )}
                    {runtimeError && (
                      <div className="p-2 px-4 bg-red-500/10 whitespace-break-spaces rounded-b-md mt-2">
                        Runtime Error
                        <br />
                        {runtimeError}
                      </div>
                    )}
                    {!compileError && !runtimeError && item.run?.output && (
                      <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces rounded-b-md mt-2">
                        Engine Output
                        <br />
                        {item.run.output}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

export default TestCaseRunBlock;
