import { Card, CardContent } from "@/components/ui/card";

interface ProgressCardProps {
  completedProblems: number;
  totalProblems: number;
  completionPercentage: number;
  showLabel?: boolean;
}

export function ProgressCard({
  completedProblems,
  totalProblems,
  completionPercentage,
  showLabel = true,
}: ProgressCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        {showLabel && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedProblems} / {totalProblems} Problems Solved
            </span>
          </div>
        )}
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completionPercentage === 100
                ? "bg-green-500"
                : completionPercentage > 50
                ? "bg-primary"
                : "bg-yellow-500"
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        {showLabel && (
          <p className="text-right text-xs text-muted-foreground mt-1">
            {completionPercentage}% complete
          </p>
        )}
      </CardContent>
    </Card>
  );
}
