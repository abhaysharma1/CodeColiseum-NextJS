import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubmissionStatusConfig {
  label: string;
  icon: ReactNode;
  className: string;
}

const configs: Record<string, SubmissionStatusConfig> = {
  ACCEPTED: {
    label: "Accepted",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    className:
      "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
  },
  PARTIAL: {
    label: "Partially Correct",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    className:
      "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  },
  WRONG_ANSWER: {
    label: "Wrong Answer",
    icon: <XCircle className="h-3.5 w-3.5" />,
    className:
      "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  },
  TIME_LIMIT: {
    label: "Time Limit Exceeded",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    className:
      "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  },
  MEMORY_LIMIT: {
    label: "Memory Limit Exceeded",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    className:
      "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  },
  RUNTIME_ERROR: {
    label: "Runtime Error",
    icon: <XCircle className="h-3.5 w-3.5" />,
    className:
      "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  },
  COMPILE_ERROR: {
    label: "Compilation Error",
    icon: <XCircle className="h-3.5 w-3.5" />,
    className:
      "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  },
  INTERNAL_ERROR: {
    label: "Internal Error",
    icon: <XCircle className="h-3.5 w-3.5" />,
    className:
      "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  },
  BAD_SCALING: {
    label: "Scaling Error",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    className:
      "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  },
  PENDING: {
    label: "Pending",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    className:
      "text-muted-foreground bg-muted border-border",
  },
  RUNNING: {
    label: "Running",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    className:
      "text-muted-foreground bg-muted border-border",
  },
};

export function getSubmissionStatusConfig(status: string): SubmissionStatusConfig {
  return (
    configs[status] ?? {
      label: status,
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      className:
        "text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800",
    }
  );
}

export function SubmissionStatusBadge({ status }: { status: string }) {
  const cfg = getSubmissionStatusConfig(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        cfg.className,
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
