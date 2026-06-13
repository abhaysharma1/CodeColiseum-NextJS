"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { ProgressCard } from "@/components/labs/progress-card";
import { ModuleCard } from "@/components/labs/module-card";
import { useStudentMyLab } from "@/hooks/use-labs";

export default function StudentLabDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: lab, loading } = useStudentMyLab(id);

  if (loading) {
    return (
      <div className="w-full h-full animate-fade-left animate-once">
        <SiteHeader name="Lab" />
        <div className="flex items-center justify-center py-20">
          <Spinner variant="infinite" />
        </div>
      </div>
    );
  }

  if (!lab) return null;

  const totalCompleted = lab.modules.reduce((s, m) => s + m.completedProblems, 0);
  const totalProblems = lab.modules.reduce((s, m) => s + m.totalProblems, 0);
  const overallPercentage = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name={lab.title} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/student/labs")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{lab.title}</h1>
                {lab.description && (
                  <p className="text-sm text-muted-foreground">{lab.description}</p>
                )}
              </div>
            </div>

            <ProgressCard
              completedProblems={totalCompleted}
              totalProblems={totalProblems}
              completionPercentage={overallPercentage}
            />

            <div className="space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Modules
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {lab.modules.length} module{lab.modules.length !== 1 ? "s" : ""} in this lab
              </p>

              {lab.modules.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Layers className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No modules available yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {lab.modules
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((mod) => (
                      <ModuleCard
                        key={mod.id}
                        weekNumber={mod.weekNumber}
                        title={mod.title}
                        unlockAt={mod.unlockAt}
                        dueAt={mod.dueAt}
                        problemsCount={mod.problemsCount}
                        variant="student"
                        studentStatus={mod.moduleStatus}
                        completionPercentage={mod.completionPercentage}
                        onView={
                          mod.moduleStatus !== "LOCKED"
                            ? () => router.push(`/dashboard/student/modules/${mod.id}`)
                            : undefined
                        }
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
