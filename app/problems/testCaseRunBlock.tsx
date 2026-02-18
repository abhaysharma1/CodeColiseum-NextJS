import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect } from "react";

interface runTestCaseType {
  responses: {
    stdout: string | null;
    time: string | null;
    memory: number | null;
    stderr: string | null;
    token: string;
    compile_output: string | null;
    message: string | null;
    status: {
      id: number;
      description: string;
    };
  }[];
  cases: {
    input: string;
    output: string;
  }[];
}

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
          key={item.token}
          className="my-4 animate-fade-down animate-once animate-delay-10"
        >
          <Card>
            <CardHeader>
              <CardTitle>Test {index + 1}</CardTitle>
              <CardDescription className="flex justify-between">
                <div>
                  Time taken: {Number(item.time).toFixed(2)} sec
                  <br />
                  Memory used: {(item.memory && item.memory / 1024)?.toFixed(
                    2,
                  )}{" "}
                  mb
                </div>
                <div>
                  {item.status.description === "Accepted" ? (
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
                {item.stdout && (
                  <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces rounded-b-md">
                    Your Output
                    <br />
                    {item.stdout}
                  </div>
                )}
                {item.status.id > 3 && (
                  <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces rounded-b-md text-red-400 mt-2">
                    Error:
                    <br />
                    {item.status.description}
                    <br />
                    {item.compile_output}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

export default TestCaseRunBlock;
