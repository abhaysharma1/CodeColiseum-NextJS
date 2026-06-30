import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ApprovalStatus = "APPROVED" | "PENDING" | "REJECTED";

const statusStyles: Record<ApprovalStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<ApprovalStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function ProblemStatusBadge({
  status,
  className,
}: {
  status: ApprovalStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(statusStyles[status], "font-medium", className)}
    >
      {statusLabels[status]}
    </Badge>
  );
}
