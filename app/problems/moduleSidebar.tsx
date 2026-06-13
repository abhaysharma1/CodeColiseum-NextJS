"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronLeft, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProblemData } from "@/hooks/use-module-problems-list";

interface ModuleSidebarProps {
  problems: ProblemData[];
  currentModuleProblemId: string;
}

export function ModuleSidebar({
  problems,
  currentModuleProblemId,
}: ModuleSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const sorted = [...problems].sort((a, b) => a.orderIndex - b.orderIndex);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-3 px-1.5 border-r border-border bg-background">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2 mt-4">
          {sorted.map((p) => {
            const isActive = p.id === currentModuleProblemId;
            const statusColor = p.progress?.isSolved
              ? "text-green-500"
              : p.progress && p.progress.attemptCount > 0
                ? "text-yellow-500"
                : "text-muted-foreground";

            return (
              <button
                key={p.id}
                onClick={() =>
                  router.push(
                    `/problems?id=${p.problemId}&moduleProblemId=${currentModuleProblemId}`
                  )
                }
                className={`h-7 w-7 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                } ${statusColor}`}
                title={`${p.problem.number}. ${p.problem.title}`}
              >
                {p.problem.number}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-r border-border bg-background w-64 flex-shrink-0">
      <div className="flex items-center justify-between px-3 h-10 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          Problems
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setCollapsed(true)}
          title="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-1">
          {sorted.map((p) => {
            const isActive = p.id === currentModuleProblemId;
            const status = p.progress?.isSolved
              ? "solved"
              : p.progress && p.progress.attemptCount > 0
                ? "attempted"
                : "not_started";

            const statusIcon = {
              solved: <span className="text-green-500 font-bold text-xs">✓</span>,
              attempted: <span className="text-yellow-500 text-xs">🟡</span>,
              not_started: (
                <span className="text-muted-foreground text-xs">○</span>
              ),
            };

            return (
              <button
                key={p.id}
                onClick={() =>
                  router.push(
                    `/problems?id=${p.problemId}&moduleProblemId=${currentModuleProblemId}`
                  )
                }
                className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent font-medium"
                    : "hover:bg-accent/50 text-muted-foreground"
                }`}
              >
                <div className="flex-shrink-0 w-4 flex justify-center">
                  {statusIcon[status]}
                </div>
                <span className="truncate flex-1">
                  {p.problem.number}. {p.problem.title}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1 py-0 leading-tight ${
                    p.problem.difficulty === "EASY"
                      ? "text-green-600"
                      : p.problem.difficulty === "MEDIUM"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {p.problem.difficulty}
                </Badge>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
