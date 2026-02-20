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

interface descriptionData {
  id: string;
  number: number;
  difficulty: string;
  description: string;
  title: string;
}

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

  useEffect(() => {
    if (descriptionData[0]?.id) {
      setLoadingDetails(false);
    }
  }, [descriptionData]);

  useEffect(() => {
    getProblemDescription();
  }, []);

  useEffect(() => {
    console.log(submissionRefetch);
    console.log(submissions);
  }, [submissions]);

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
          />
        </div>
        <div>
          <CodingBlock
            questionId={id ?? ""}
            setRunTestCaseResults={setRunTestCaseResults}
            setSubmitTestCaseResults={setSubmitTestCaseResults}
            setTabPage={setTabPage}
            setSubmissionRefetch={setSubmissionRefetch}
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
