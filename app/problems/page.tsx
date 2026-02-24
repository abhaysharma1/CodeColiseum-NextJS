"use client";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState, use } from "react";
import DetailsBlock from "./detailsBlock";
import CodingBlock from "./codingBlock";
import axios from "axios";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Navbar01 } from "@/components/ui/shadcn-io/navbar";
import { runTestCaseType, submitTestCaseType } from "./interface";
import { AuthProvider } from "@/context/authcontext";
import { ProblemSubmissionItem } from "./interface";
import { getBackendURL } from "@/utils/utilities";
import { Eraser } from "lucide-react";

interface descriptionData {
  id: string;
  number: number;
  difficulty: string;
  description: string;
  title: string;
}

export type aiReviewResult = {
  status: "COMPLETED" | "PENDING";
  data: {
    status: "COMPLETED" | "PENDING";
    data: {
      correctness: String;
      time_complexity: String;
      space_complexity: String;
      edge_cases_missing: String[];
      code_quality: String;
      optimization_suggestions: String[];
      overall_score: number;
    };
  };
};

function QuestionSolvingPageContent({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = use(searchParams);
  const id = params.id;
  const [loadingDetails, setLoadingDetails] = useState(true);
  const router = useRouter();

  const [tabPage, setTabPage] = useState("description");
  const [submissionRefetch, setSubmissionRefetch] = useState(false);

  const [runTestCaseResults, setRunTestCaseResults] = useState<
    runTestCaseType | undefined
  >();
  const [submitTestCaseResults, setSubmitTestCaseResults] = useState<
    submitTestCaseType | undefined
  >();

  const [descriptionData, setDescriptionData] = useState<descriptionData[]>([]);
  const [submissions, setSubmissions] = useState<
    ProblemSubmissionItem[] | undefined
  >(undefined);

  const [performingAiReview, setPerformingAiReview] = useState(false);
  const [aiReviewResult, setAiReviewResult] = useState<
    aiReviewResult | undefined
  >();
  const [startAiReviewResponse, setStartAiReviewResponse] = useState<
    | {
        success: boolean;
        jobId: string;
      }
    | undefined
  >();
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState("cpp");

  const getProblemDescription = async () => {
    try {
      const response = await axios.get(
        `${getBackendURL()}/problems/getproblems`,
        {
          params: { searchValue: id },
          withCredentials: true,
        }
      );
      setDescriptionData(response.data as descriptionData[]);
    } catch (error: any) {
      if (error.status == 400 || error.status == 500) {
        toast.error("Didn't Found Your Problem");
        router.replace("/not-found");
        return;
      }
      toast.error(error);
    }
  };

  const startAiReview = async () => {
    if (!code || !id || !language) {
      toast.error("Please Write some code");
      return;
    }
    try {
      setTabPage("aireviewresult");
      setPerformingAiReview(true);
      const res = await axios.post(
        `${getBackendURL()}/problems/problems/start-ai-review`,
        {
          problemId: id,
          code: code,
          language: language,
        },
        { withCredentials: true }
      );
      const data = res.data as {
        success: boolean;
        jobId: string;
      };

      if (data.success) {
        setStartAiReviewResponse(data);
      } else {
        toast.error("Cannot Review at this time");
      }
    } catch (error) {
      console.log(error);
      setPerformingAiReview(false);
    }
  };

  const getAiReview = async () => {
    if (!startAiReviewResponse) {
      return;
    }
    try {
      const res = await axios.get(
        `${getBackendURL()}/problems/practice-ai-review-status`,
        {
          params: {
            jobId: startAiReviewResponse.jobId,
          },
          withCredentials: true,
        }
      );
      const data = res.data as aiReviewResult;

      setAiReviewResult(data);
      if (data.status === "COMPLETED") {
        setPerformingAiReview(false);
      }
    } catch (error) {
      toast.error("Cannot fetch Review Status");
      console.log(error);
    }
  };

  useEffect(() => {
    if (!performingAiReview || !startAiReviewResponse) return;

    const intervalId = setInterval(async () => {
      await getAiReview();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [performingAiReview, startAiReviewResponse]);

  useEffect(() => {
    if (descriptionData[0]?.id) {
      setLoadingDetails(false);
    }
  }, [descriptionData]);

  useEffect(() => {
    getProblemDescription();
  }, []);

  return (
    <div>
      <div>
        <AuthProvider>
          <Navbar01 />
        </AuthProvider>
      </div>
      <div className="flex justify-center">
        <div>
          <DetailsBlock
            tabPage={tabPage}
            setTabPage={setTabPage}
            data={descriptionData || []}
            loadingDetails={loadingDetails}
            runTestCaseResults={runTestCaseResults}
            submitTestCaseResults={submitTestCaseResults}
            submissionRefetch={submissionRefetch}
            setSubmissionRefetch={setSubmissionRefetch}
            setSubmissions={setSubmissions}
            submissions={submissions}
            aiReviewResult={aiReviewResult}
            performingAiReview={performingAiReview}
          />
        </div>
        <div>
          <CodingBlock
            questionId={id ?? ""}
            setRunTestCaseResults={setRunTestCaseResults}
            setSubmitTestCaseResults={setSubmitTestCaseResults}
            setTabPage={setTabPage}
            setSubmissionRefetch={setSubmissionRefetch}
            setCode={setCode}
            code={code}
            setLanguage={setLanguage}
            language={language}
            startAiReview={startAiReview}
          />
        </div>
      </div>
    </div>
  );
}

function QuestionSolvingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div>
          <Spinner variant="ring" />
        </div>
      }
    >
      <QuestionSolvingPageContent searchParams={searchParams} />
    </Suspense>
  );
}

export default QuestionSolvingPage;
