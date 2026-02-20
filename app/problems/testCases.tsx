"use client";
import { Separator } from "@/components/ui/separator";
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
  cases: string;
}

function TestCases({ questionId }: { questionId: string }) {
  const [testData, setTestData] = useState<TestCase[]>();

  const [loading, setLoading] = useState(true);

  const getCases = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/problems/gettestcases?id=${questionId}`,
        { withCredentials: true }
      );
      const { cases } = res.data as RunTestCase;
      const jsonCases = await JSON.parse(JSON.stringify(cases));
      setTestData(jsonCases);
    } catch (error) {
      console.log(error);
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
        ) : (
          <div className="">
            <div className="mb-2 w-full flex justify-between px-10">
              <div>Input</div>
              <div>Output</div>
            </div>
            {testData?.map((item, index) => (
              <div
                className="text-foreground/70 w-full whitespace-pre-line"
                key={item.input}
              >
                <div className="my-3 flex w-full justify-between pl-10">
                  <div>{item.input}</div>
                  <div className="pr-14">{item.output}</div>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TestCases;
