import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, FlaskConical, Lock, Unlock } from "lucide-react";

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
    const statusIcon = {
      LOCKED: <Lock className="h-5 w-5 text-muted-foreground" />,
      COMPLETED: <span className="text-green-500 text-lg">✓</span>,
      IN_PROGRESS: <span className="text-yellow-500 text-lg">🟡</span>,
      NOT_STARTED: <span className="text-muted-foreground text-lg">○</span>,
    };

    return (
      <Card
        className={`transition-all ${
          isLocked
            ? "opacity-60 cursor-not-allowed"
            : "hover:shadow-md hover:bg-accent/40 cursor-pointer"
        }`}
        onClick={isLocked ? undefined : onView}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              {statusIcon[studentStatus || "NOT_STARTED"]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Week {weekNumber}
                </span>
                {studentStatus === "COMPLETED" && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">
                    Completed
                  </Badge>
                )}
                {studentStatus === "IN_PROGRESS" && (
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 text-xs">
                    In Progress
                  </Badge>
                )}
                {isLocked && (
                  <Badge variant="secondary" className="text-xs">
                    Locked
                  </Badge>
                )}
              </div>
              <p className={`font-medium truncate ${isLocked ? "text-muted-foreground" : ""}`}>
                {title}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
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
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{completionPercentage}% complete</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative pl-8 pb-8 border-l-2 border-muted last:pb-0">
      <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <span className="text-primary-foreground text-xs font-bold">
          {weekNumber}
        </span>
      </div>
      <Card className="ml-2">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold">Week {weekNumber} — {title}</h4>
                {assessmentStatus && (
                  <Badge variant="outline" className="text-xs">
                    <FlaskConical className="h-3 w-3 mr-1" />
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
              <Button variant="ghost" size="sm" onClick={onView}>
                View
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
        </CardContent>
      </Card>
    </div>
  );
}
