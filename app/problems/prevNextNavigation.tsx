"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PrevNextNavigationProps {
  previous: { id: string; problemId: string } | null;
  next: { id: string; problemId: string } | null;
}

export function PrevNextNavigation({
  previous,
  next,
}: PrevNextNavigationProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mx-5 mb-5 mt-0">
      <div>
        {previous && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(
                `/problems?id=${previous.problemId}&moduleProblemId=${previous.id}`
              )
            }
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous Problem
          </Button>
        )}
      </div>
      <div>
        {next && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(
                `/problems?id=${next.problemId}&moduleProblemId=${next.id}`
              )
            }
          >
            Next Problem
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
