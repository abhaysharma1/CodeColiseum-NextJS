"use client";
import ProblemsTable from "@/app/problem-list/problemsTable";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

function Problems() {
  const router = useRouter();

  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full">
        <SiteHeader name="Problems" />
      </div>

      <div className="flex-1 h-full w-full rounded-b-lg p-7 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Browse public problems and your own submissions
          </p>
          <Button onClick={() => router.push("/dashboard/teacher/my-problems/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Problem
          </Button>
        </div>
        <ProblemsTable />
      </div>
    </div>
  );
}

export default Problems;
