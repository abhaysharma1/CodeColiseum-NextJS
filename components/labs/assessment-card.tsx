import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, Trophy } from "lucide-react";

interface AssessmentCardProps {
  title: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  status: string;
  questionsCount?: number;
  score?: number;
  rank?: number;
  onEnter?: () => void;
  onViewResult?: () => void;
  variant?: "teacher" | "student";
}

export function AssessmentCard({
  title,
  startTime,
  endTime,
  durationMinutes,
  status,
  questionsCount,
  score,
  rank,
  onEnter,
  onViewResult,
  variant = "student",
}: AssessmentCardProps) {
  const statusBadge = {
    UPCOMING: <Badge variant="secondary">Upcoming</Badge>,
    ACTIVE: <Badge className="bg-green-600">Active</Badge>,
    COMPLETED: <Badge>Completed</Badge>,
    NOT_AVAILABLE: <Badge variant="outline">Not Available</Badge>,
  }[status] || <Badge variant="outline">{status}</Badge>;

  const showEnterButton = status === "ACTIVE" || (status === "UPCOMING" && variant === "teacher");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {title}
            </CardTitle>
            <CardDescription>Assessment</CardDescription>
          </div>
          {statusBadge}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {startTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {status === "UPCOMING" ? "Starts" : "Started"}:{" "}
                {new Date(startTime).toLocaleString()}
              </span>
            </div>
          )}
          {durationMinutes && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Duration: {durationMinutes} minutes</span>
            </div>
          )}
          {questionsCount !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{questionsCount} questions</span>
            </div>
          )}
          {score !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">Score: {score}</span>
              {rank !== undefined && (
                <span className="text-muted-foreground">· Rank: #{rank}</span>
              )}
            </div>
          )}
          {(showEnterButton || (status === "COMPLETED" && onViewResult)) && (
            <div className="pt-2">
              {status === "COMPLETED" && onViewResult ? (
                <Button variant="outline" size="sm" onClick={onViewResult}>
                  View Result
                </Button>
              ) : (
                showEnterButton && onEnter && (
                  <Button size="sm" onClick={onEnter}>
                    {status === "UPCOMING" ? "View Details" : "Enter Exam"}
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
