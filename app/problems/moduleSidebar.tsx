"use client";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Circle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProblemData } from "@/hooks/use-module-problems-list";

interface ModuleSidebarProps {
  problems: ProblemData[];
  currentModuleProblemId: string;
  isOpen: boolean;
  onClose: () => void;
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
  not_started: {
    icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-transparent",
  },
};

export function ModuleSidebar({
  problems,
  currentModuleProblemId,
  isOpen,
  onClose,
}: ModuleSidebarProps) {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const sorted = [...problems].sort((a, b) => a.orderIndex - b.orderIndex);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30 bg-black/20 md:hidden"
            onClick={onClose}
          />
          {/* Sidebar panel */}
          <motion.div
            ref={sidebarRef}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute left-0 top-0 z-40 h-full overflow-hidden border-r border-border bg-background shadow-xl"
          >
            <div className="flex w-[260px] flex-col h-full">
              <div className="flex items-center justify-between px-3 h-10 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  Problems
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="h-6 w-6 p-0"
                  onClick={onClose}
                  title="Close sidebar"
                >
                  <X className="h-4 w-4" />
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
                    const cfg = statusConfig[status];
                    const Icon = cfg.icon;

                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          onClick={() => {
                            router.push(
                              `/problems?id=${p.problemId}&moduleProblemId=${currentModuleProblemId}`
                            );
                            onClose();
                          }}
                          className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-all ${
                            isActive
                              ? "bg-accent font-medium"
                              : "hover:bg-accent/50 text-muted-foreground"
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 p-0.5 rounded ${cfg.bg}`}
                          >
                            <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
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
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
