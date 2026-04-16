"use client";
import { Button } from "@/components/ui/button";
import {
  Exam,
  ExamAttempt,
  ExamProblem,
  Problem,
  RunTestCase,
} from "@/interfaces/DB Schema";
import handleExamError from "@/utils/examErrorHandler";
import { getBackendURL } from "@/utils/utilities";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, use } from "react";
import Description, { SubmitCodeResponse } from "./Description";
import { toast } from "sonner";
import CodingEditor from "./codingEditor";
import { Separator } from "@/components/ui/separator";
import { getLanguageId } from "@/utils/getLanguageId";
import { runTestCaseType } from "./interface";
import { useRemainingTime } from "./getRemainingTime";

const defaultRuntimeLanguageId = 54;
const terminalStatuses = new Set([
  "ACCEPTED",
  "PARTIAL",
  "WRONG_ANSWER",
  "COMPILE_ERROR",
  "RUNTIME_ERROR",
  "TIME_LIMIT",
  "INTERNAL_ERROR",
  "MEMORY_LIMIT",
]);

function Page({ params }: { params: Promise<{ "exam-id": string }> }) {
  const { "exam-id": examId } = use(params);

  const [examDetails, setExamDetails] = useState<Exam | undefined>();
  const [examProblems, setExamProblems] = useState<ExamProblem[] | undefined>();
  const [examAttempt, setExamAttempt] = useState<ExamAttempt | undefined>();

  const [currProblem, setCurrProblem] = useState<number | undefined>(1);

  const [error, setError] = useState<any>();

  const [descriptionData, setDescriptionData] = useState<Problem | undefined>();
  const [testCases, setTestCases] = useState<RunTestCase | undefined>();

  const [code, setCode] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [language, setLanguage] = useState("cpp");
  const [runningResults, setRunningResults] = useState<
    runTestCaseType | undefined
  >();
  const [submittingResults, setSubmittingResults] = useState<
    SubmitCodeResponse | undefined
  >();
  const [currentTab, setCurrentTab] = useState("description");

  const remainingTime = useRemainingTime(examAttempt?.expiresAt);

  const router = useRouter();

  const [sebError, setSebError] = useState(false);
  const [sebMessage, setSebMessage] = useState("Not opened in SEB");

  const [templateCode, setTemplateCode] = useState("");

  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [groupId, setGroupId] = useState<string>("");

  function getErrorMessage(err: any) {
    if (!err) return "Something went wrong. Please try again.";
    if (typeof err === "string") return err;

    const responseData = err?.response?.data;
    if (typeof responseData === "string") return responseData;
    if (typeof responseData?.message === "string") return responseData.message;
    if (typeof responseData?.error === "string") return responseData.error;
    if (typeof err?.message === "string") return err.message;

    return "Something went wrong. Please try again.";
  }

  useEffect(() => {
    const getTestDetails = async () => {
      try {
        const res = await axios.get(
          `${getBackendURL()}/student/exam/exam-details`,
          {
            params: {
              examId: examId,
            },
            withCredentials: true,
          }
        );
        setExamDetails(res.data as Exam);
      } catch (err: any) {
        console.log(err);
        if (typeof error === "string") {
          toast.error(error);
        }

        if (err?.response?.status === 401) {
          toast.error("You are not allowed to give this Test");
          router.replace("/dashboard");
        }
        handleExamError(err);
        setError(err);
      }
    };
    getTestDetails();
  }, [examId]);

  useEffect(() => {
    if (!examDetails?.id) return;

    const startTest = async () => {
      try {
        const attempt = await axios.post(
          `${getBackendURL()}/student/exam/start-test`,
          {
            examId: examDetails.id,
          },
          { withCredentials: true }
        );
        setExamAttempt(attempt.data as ExamAttempt);

        if (attempt.data) {
          const problems = await axios.post(
            `${getBackendURL()}/student/exam/test-problems`,
            {
              examId: examDetails.id,
            },
            { withCredentials: true }
          );
          setExamProblems(problems.data as ExamProblem[]);
        }
      } catch (err: any) {
        if (err?.response?.status === 403) {
          setSebError(true);
          setSebMessage(getErrorMessage(err));
        }
        setError(err);
      }
    };

    const getAiEnabledStatusAndGroupId = async () => {
      try {
        const res = await axios.get(
          `${getBackendURL()}/student/exam/ai/isenabledandgetgroupid`,
          {
            params: {
              examId: examDetails.id,
            },
            withCredentials: true,
          }
        );

        const data = res.data as { enabled: boolean; groupId?: string };
        setGroupId(data.groupId ?? "");
        setIsAiEnabled(data.enabled);
      } catch (error) {
        console.log(error);
      }
    };

    startTest();
    getAiEnabledStatusAndGroupId();
  }, [examDetails?.id]);

  useEffect(() => {
    if (currProblem && examProblems && examId && examDetails) {
      if (code && code !== "//Example Code" && typeof language === "string") {
        const problemId = examProblems[currProblem - 1].problemId;
        const storageKey = `code_${problemId}_${language}_${examDetails?.id}`;
        const toBeSaved = JSON.stringify({
          savedCode: code,
          savedLanguage: language,
          problemIdSaved: problemId,
        });
        localStorage.setItem(storageKey, toBeSaved);
      }
    }
  }, [code]);

  useEffect(() => {
    if (currProblem && examProblems && examId) {
      const problemId = examProblems[currProblem - 1].problemId;

      const getDescriptionData = async () => {
        try {
          const res = await axios.get(
            `${getBackendURL()}/student/exam/problem-description?problemId=${problemId}`,
            { withCredentials: true }
          );
          setDescriptionData(res.data as Problem);
        } catch (error: any) {
          if (error.status == 400 || error.status == 500) {
            toast.error("Didn't Found Your Problem");
            return;
          }
        }
        console.log(error);
      };
      const getTestCases = async () => {
        try {
          const res = await axios.get(
            `${getBackendURL()}/student/exam/test-cases?questionId=${problemId}`,
            { withCredentials: true }
          );
          setTestCases(res.data as RunTestCase);
        } catch (error: any) {
          console.log(error);
        }
      };

      getDescriptionData();
      getTestCases();
      getTemplateCode();

      setRunningResults(undefined);
      setSubmittingResults(undefined);
    }
  }, [currProblem, examProblems, examId]);

  useEffect(() => {
    getTemplateCode();
  }, [language]);

  useEffect(() => {
    // Only submit if we have a valid exam attempt and the time has actually expired
    if (
      !error &&
      !sebError &&
      examAttempt &&
      examAttempt.expiresAt &&
      remainingTime !== undefined &&
      remainingTime === 0
    ) {
      // Additional check to ensure the exam has actually expired
      const now = new Date();
      const expiryTime = new Date(examAttempt.expiresAt);

      if (now >= expiryTime) {
        submitExam();
      }
    }
  }, [remainingTime, examAttempt, error, sebError]);

  useEffect(() => {
    // heartbeat sender
    const interval = setInterval(() => {
      if (examDetails && examAttempt) {
        console.log(error, sebError);
        axios.post(
          `${getBackendURL()}/student/exam/heartbeat`,
          {},
          { withCredentials: true }
        );
      }
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, []);

  const getTemplateCode = async () => {
    if (!currProblem || !examProblems || !examId) return;

    const problemId = examProblems[currProblem - 1].problemId;
    const res = await axios.post(
      `${getBackendURL()}/problems/gettemplatecode`,
      {
        languageId: getLanguageId(language),
        problemId: problemId,
      },
      { withCredentials: true }
    );

    const { template, languageId } = res.data as {
      template: string;
      languageId: number;
    };

    setTemplateCode(template);

    const storageKey = `code_${problemId}_${language}_${examDetails?.id}`;
    const savedData = localStorage.getItem(storageKey);

    if (!savedData) {
      setCode(template);
      return;
    }

    const { savedCode, savedLanguage, problemIdSaved } = JSON.parse(savedData);

    if (problemIdSaved != problemId) {
      setCode(template);
    }

    if (savedLanguage === language) {
      setCode(savedCode);
    }
  };

  const onRun = async () => {
    if (!examDetails || !examProblems || !currProblem) {
      return;
    }
    if (!code || code.length < 2) {
      toast.error("Please provide some code");
      return;
    }
    if (!language) {
      toast.error("Please select a language");
      return;
    }
    try {
      setRunning(true);
      setCurrentTab("runresults");
      const languageId = getLanguageId(language) ?? defaultRuntimeLanguageId;

      const sentData = {
        examId: examDetails.id,
        problemId: examProblems[currProblem - 1].problemId,
        sourceCode: code,
        languageId,
      };

      const response = await axios.post(
        `${getBackendURL()}/student/exam/runcode`,
        sentData,
        {
          withCredentials: true,
        }
      );

      setRunningResults(response.data as runTestCaseType);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setSebError(true);
        setSebMessage(getErrorMessage(error));
        return;
      }
      toast.error(error?.message ?? "Failed to run code");
      console.log(error);
    } finally {
      setRunning(false);
    }
  };

  const onSubmit = async () => {
    if (!examDetails || !examProblems || !currProblem) {
      return;
    }
    if (!code || code.length < 2) {
      toast.error("Please provide some code");
      return;
    }
    if (!language) {
      toast.error("Please select a language");
      return;
    }
    setSubmitting(true);
    setSubmittingResults(undefined);
    const languageId = getLanguageId(language);
    const sentData = {
      examId: examDetails.id,
      problemId: examProblems[currProblem - 1].problemId,
      sourceCode: code,
      languageId: languageId,
    };
    try {
      setCurrentTab("submitcode");
      const res = await axios.post(
        `${getBackendURL()}/student/exam/submit-code`,
        sentData,
        {
          withCredentials: true,
        }
      );
      const queuedResult = res.data as SubmitCodeResponse;
      setSubmittingResults(queuedResult);

      if (!queuedResult || !("submissionId" in queuedResult)) {
        return;
      }

      const maxPolls = 90;
      const pollDelayMs = 1000;

      for (let attempt = 0; attempt < maxPolls; attempt++) {
        const statusResponse = await axios.get(
          `${getBackendURL()}/student/exam/submission-status/${queuedResult.submissionId}`,
          {
            withCredentials: true,
          }
        );

        const latestResult = statusResponse.data as SubmitCodeResponse;
        setSubmittingResults(latestResult);

        if (
          "status" in latestResult &&
          terminalStatuses.has(latestResult.status)
        ) {
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, pollDelayMs));
      }

      toast.error("Submission is still processing. Please refresh shortly.");
    } catch (error: any) {
      if (error.status == 403) {
        setSebError(true);
        setSebMessage(getErrorMessage(error));
      }
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  const submitExam = async () => {
    try {
      setSubmittingExam(true);
      const res = await axios.post(
        `${getBackendURL()}/student/exam/submit-test`,
        {
          examId: examDetails?.id,
        },
        { withCredentials: true }
      );
      if (res.status == 200) {
        // Clear all drafts when exam is submitted
        if (examId) {
          localStorage.clear();
        }
        toast.success("Your Test has been Submitted");
        if (router) {
          router.replace("/dashboard");
        }
      }
    } catch (error: any) {
      if (error?.response?.status && error?.response?.status === 403) {
        setSebError(true);
        setSebMessage(getErrorMessage(error));
      }
      if (typeof error === "string") {
        toast.error(error);
      }
      console.log(error);
    } finally {
      setSubmittingExam(false);
    }
  };

  const resetCode = async () => {
    if (templateCode) {
      setCode(templateCode);
    }
  };

  if (sebError) {
    return (
      <div className="p-8 text-red-500 w-full h-screen flex justify-center items-center">
        {sebMessage}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500 w-full h-screen flex justify-center items-center">
        {getErrorMessage(error)}
      </div>
    );
  }

  return (
    <div>
      <div className="w-full flex justify-between items-center h-13 px-5 ">
        <div className="font-logoFont font-bold">CODECOLISEUM</div>
        <div>{examDetails?.title}</div>
        <div>
          Remaining Time:{" "}
          {remainingTime !== undefined
            ? `${Math.floor(remainingTime / 60)} min ${remainingTime % 60} sec`
            : "N/A"}
        </div>
        <div>
          <Button
            className="h-8 cursor-pointer"
            variant={"secondary"}
            onClick={submitExam}
            disabled={submittingExam}
          >
            {submittingExam ? "Submitting..." : "Submit Exam"}
          </Button>
        </div>
      </div>
      <Separator></Separator>
      <div className="flex p-2 gap-3">
        <div className="min-w-17 w-fit h-[calc(100vh-7rem)] overflow-y-scroll scroll-smooth m-5 outline-1 outline-offset-8 rounded-md px-4 py-3 box-border bg-accent/30">
          <h1 className="mb-4 font-semibold">Problem List</h1>

          {/* Changed grid to flex with wrap */}
          <div className="flex flex-wrap gap-2 justify-start">
            {examProblems?.map((p) => (
              <div key={p.id}>
                <Button
                  variant={currProblem === p.order ? "default" : "outline"}
                  onClick={() => setCurrProblem(p.order)}
                  // Added w-10 (or similar) to keep buttons uniform and square-ish
                  // className="w-10 h-10 p-0"
                >
                  {p.order}
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Description
            descriptionData={descriptionData}
            testcases={testCases}
            runningResults={runningResults}
            attemptId={examAttempt?.id}
            problemId={
              examProblems && currProblem
                ? examProblems[currProblem - 1]?.problemId
                : undefined
            }
            submittingResults={submittingResults}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            isAiEnabled={isAiEnabled}
            groupId={groupId}
            examId={examId}
            code={code}
            language={language}
          />
        </div>
        <div className="flex-1">
          <CodingEditor
            code={code}
            running={running}
            submitting={submitting}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            onRun={onRun}
            onSubmit={onSubmit}
            resetCode={resetCode}
          />
        </div>
      </div>
    </div>
  );
}

export default Page;
