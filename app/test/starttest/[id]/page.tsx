"use client";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Exam } from "@/interfaces/DB Schema";
import handleExamError from "@/utils/examErrorHandler";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = use(params);

  const [error, setError] = useState<any>();

  const [examDetails, setExamDetails] = useState<Exam | undefined>();
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const getTestDetails = async () => {
      try {
        const res = await axios.get(
          `/api/student/exam/exam-details?examId=${examId}`,
          { withCredentials: true }
        );
        const det = res.data as Exam;
        setExamDetails(det);
        console.log(res);
        router.push(`/test/givetest/${det.id}`);
      } catch (err: any) {
        if (err.status >= 400) {
          router.replace("/dashboard");
        }
        handleExamError(err);
        setError(err);
      }
    };
    getTestDetails();
  }, [examId]);

  function ExamInstructions() {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="text-xl">Important Instructions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Please read the following instructions carefully before starting the
            exam.
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed">
            <li>
              This is a{" "}
              <span className="font-medium">
                timed online coding examination
              </span>
              . Once started, the timer cannot be paused.
            </li>

            <li>
              You may start the exam only within the scheduled time window. Late
              entry is not permitted.
            </li>

            <li>
              The exam will be{" "}
              <span className="font-medium">automatically submitted</span> when
              the allotted time expires.
            </li>

            <li>
              Ensure you have a stable internet connection. Technical issues
              will not be considered for extra time.
            </li>

            <li>
              You may refresh or rejoin the exam if required, but the timer will
              continue to run.
            </li>

            <li>
              Only <span className="font-medium">one attempt</span> is allowed.
              Multiple attempts may lead to disqualification.
            </li>

            <li>
              The use of external help such as search engines, online
              repositories, AI tools, or assistance from others is strictly
              prohibited unless stated otherwise.
            </li>

            <li>
              All activities during the exam are logged and monitored.
              Suspicious behavior may result in termination of the exam.
            </li>

            <li>
              Code submissions are evaluated automatically. Partial or incorrect
              solutions may receive partial or zero credit.
            </li>

            <li>
              Once you click <span className="font-medium">Final Submit</span>,
              you will not be able to make further changes.
            </li>
          </ol>

          <div className="mt-6 rounded-md border border-border bg-muted p-4 text-sm">
            By clicking <span className="font-medium">“Start Exam”</span>, you
            confirm that you have read, understood, and agreed to all the above
            instructions.
          </div>

          <div className="mt-6 flex justify-end">
            <Button>
              <Link href={`/test/givetest/${examDetails?.id}`}>Start Exam</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        You are not allowed to give this test, or the exam has ended
      </div>
    );
  }

  if (!examDetails) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spinner variant="ring" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <ExamInstructions />
    </div>
  );
}

export default Page;
