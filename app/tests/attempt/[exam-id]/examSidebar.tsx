"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Circle, BookOpen, PanelLeftClose, PanelLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface ProblemItem {
  order: number;
  problemId: string;
  title?: string;
  difficulty?: string;
  status: "solved" | "attempted" | "not_attempted";
}

interface ExamSidebarProps {
  problems: ProblemItem[];
  currentOrder: number;
  onProblemSelect: (order: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const statusConfig = {
  solved: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  attempted: {
    icon: AlertCircle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  not_attempted: {
    icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-transparent",
  },
};

function ExamSidebar({
  problems,
  currentOrder,
  onProblemSelect,
  isOpen,
  onToggle,
}: ExamSidebarProps) {
  const solvedCount = problems.filter((p) => p.status === "solved").length;
  const totalCount = problems.length;
  const progressPercent = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  return (
    <div
      className={`flex flex-col h-[calc(100vh-7rem)] overflow-y-scroll scroll-smooth m-5 outline-1 outline-offset-8 box-border  shadow-2xl  bg-accent/30 rounded-md border border-border overflow-hidden flex-shrink-0 transition-all duration-200 ${
        isOpen ? "w-60" : "w-10"
      }`}
    >
      {isOpen ? (
        <>
          <div className="flex items-center justify-between px-3 h-10 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Problems
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onToggle}
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="py-1">
              {problems.map((p, idx) => {
                const isActive = p.order === currentOrder;
                const cfg = statusConfig[p.status];
                const Icon = cfg.icon;

                return (
                  <motion.div
                    key={p.order}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.03 }}
                  >
                    <button
                      onClick={() => onProblemSelect(p.order)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-all duration-150 border-l-2 ${
                        isActive
                          ? "bg-accent border-l-primary font-medium"
                          : "border-l-transparent hover:bg-accent/50 hover:border-l-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      <div className={`flex-shrink-0 p-0.5 rounded ${cfg.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      </div>
                      <span className="truncate flex-1">
                        {p.title
                          ? `${p.order}. ${p.title}`
                          : `Problem ${p.order}`}
                      </span>
                      {p.difficulty && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1 py-0 leading-tight flex-shrink-0 ${
                            p.difficulty === "EASY"
                              ? "text-green-600"
                              : p.difficulty === "MEDIUM"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {p.difficulty}
                        </Badge>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-3 flex-shrink-0">
            <div className="text-xs text-muted-foreground mb-2">Progress</div>
            <Progress value={progressPercent} className="h-1.5" />
            <div className="text-xs text-muted-foreground mt-1.5">
              {solvedCount} / {totalCount} Completed
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-2 gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggle}
            title="Expand sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Prob</div>
            <div className="text-lg font-bold text-foreground">{currentOrder}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamSidebar;
