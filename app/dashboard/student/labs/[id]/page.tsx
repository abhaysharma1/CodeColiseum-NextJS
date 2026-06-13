"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Badge } from "@/components/ui/badge";
import { ProgressCard } from "@/components/labs/progress-card";
import { ModuleCard } from "@/components/labs/module-card";
import { useStudentMyLab } from "@/hooks/use-labs";

export default function StudentLabDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: lab, loading } = useStudentMyLab(id);

  if (loading) {
    return (
      <div className="w-full h-full">
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
  const completedModules = lab.modules.filter((m) => m.moduleStatus === "COMPLETED").length;

  const sortedModules = [...lab.modules].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="w-full h-full">
      <SiteHeader name={lab.title} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/student/labs")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">{lab.title}</h1>
                  <Badge variant="secondary" className="text-xs">
                    {completedModules}/{lab.modules.length} modules done
                  </Badge>
                </div>
                {lab.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                    {lab.description}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <ProgressCard
                  completedProblems={totalCompleted}
                  totalProblems={totalProblems}
                  completionPercentage={overallPercentage}
                  showLabel={false}
                  size="sm"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Layers className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Modules</h2>
                <span className="text-sm text-muted-foreground">
                  ({lab.modules.length} module{lab.modules.length !== 1 ? "s" : ""})
                </span>
              </div>
            </motion.div>

            {sortedModules.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Layers className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No modules available yet</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-1">
                {sortedModules.map((mod, i) => (
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
  );
}
