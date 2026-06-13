"use client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  FileText,
  FlaskConical,
  Lock,
  CheckCircle2,
  AlertCircle,
  Circle,
  ArrowRight,
} from "lucide-react";

interface ModuleCardProps {
  weekNumber: number;
  title: string;
  unlockAt: string;
  dueAt: string | null;
  problemsCount: number;
  assessmentStatus?: string | null;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  variant?: "teacher" | "student";
  studentStatus?: "LOCKED" | "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";
  completionPercentage?: number;
}

const statusIconMap = {
  LOCKED: Lock,
  COMPLETED: CheckCircle2,
  IN_PROGRESS: AlertCircle,
  NOT_STARTED: Circle,
};

const statusColorMap = {
  LOCKED: "text-muted-foreground",
  COMPLETED: "text-green-500",
  IN_PROGRESS: "text-yellow-500",
  NOT_STARTED: "text-muted-foreground",
};

const statusBgMap = {
  LOCKED: "bg-muted",
  COMPLETED: "bg-green-500/10",
  IN_PROGRESS: "bg-yellow-500/10",
  NOT_STARTED: "bg-transparent",
};

export function ModuleCard({
  weekNumber,
  title,
  unlockAt,
  dueAt,
  problemsCount,
  assessmentStatus,
  onView,
  onEdit,
  onDelete,
  variant = "teacher",
  studentStatus,
  completionPercentage,
}: ModuleCardProps) {
  const isLocked = studentStatus === "LOCKED";

  if (variant === "student") {
    const StatusIcon = statusIconMap[studentStatus || "NOT_STARTED"];
    const statusColor = statusColorMap[studentStatus || "NOT_STARTED"];
    const statusBg = statusBgMap[studentStatus || "NOT_STARTED"];

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        whileHover={isLocked ? undefined : { scale: 1.01, x: 4 }}
        className={`relative pl-10 pb-6 last:pb-0 ${isLocked ? "opacity-60" : ""}`}
      >
        <div className="absolute left-[15px] top-3 bottom-0 w-px bg-border last:hidden" />
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`absolute left-2 top-3 w-7 h-7 rounded-full flex items-center justify-center z-10 ${statusBg} ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
          onClick={isLocked ? undefined : onView}
        >
          <StatusIcon className={`h-4 w-4 ${statusColor}`} />
        </motion.div>
        <div
          className={`ml-2 rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-200 ${
            isLocked ? "" : "hover:shadow-md hover:bg-accent/40 cursor-pointer"
          }`}
          onClick={isLocked ? undefined : onView}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Week {weekNumber}
                </span>
                {studentStatus === "COMPLETED" && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-[10px] h-5">
                    Completed
                  </Badge>
                )}
                {studentStatus === "IN_PROGRESS" && (
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 text-[10px] h-5">
                    In Progress
                  </Badge>
                )}
                {isLocked && (
                  <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                    <Lock className="h-3 w-3" /> Locked
                  </Badge>
                )}
              </div>
              <h4 className={`font-semibold text-sm tracking-tight ${isLocked ? "text-muted-foreground" : ""}`}>
                {title}
              </h4>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{problemsCount} problems</span>
                </div>
                {dueAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Due {new Date(dueAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {!isLocked && completionPercentage !== undefined && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{completionPercentage}% complete</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: completionPercentage === 100
                          ? "linear-gradient(90deg, #22c55e, #16a34a)"
                          : completionPercentage > 50
                          ? "linear-gradient(90deg, var(--primary), var(--primary))"
                          : "linear-gradient(90deg, #eab308, #ca8a04)",
                      }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${completionPercentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="relative pl-8 pb-8 last:pb-0"
    >
      <div className="absolute left-3 top-0 bottom-0 w-px bg-border last:hidden" />
      <div className="absolute -left-1 top-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
        <span className="text-primary-foreground text-xs font-bold">{weekNumber}</span>
      </div>
      <div className="ml-4 rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        <div className="p-4 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold tracking-tight">Week {weekNumber} &mdash; {title}</h4>
                {assessmentStatus && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <FlaskConical className="h-3 w-3" />
                    {assessmentStatus}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Unlock: {new Date(unlockAt).toLocaleDateString()}</span>
                </div>
                {dueAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Due: {new Date(dueAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{problemsCount} problems</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={onView} className="gap-1">
                View <ArrowRight className="h-3 w-3" />
              </Button>
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
