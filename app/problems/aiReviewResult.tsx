import React from "react";
import { aiReviewResult } from "./page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  Database,
  ShieldAlert,
  Code2,
  Lightbulb,
  Star,
  Loader2,
} from "lucide-react";

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-400"
      : score >= 50
        ? "text-yellow-400"
        : "text-red-400";
  const ring =
    score >= 80
      ? "border-green-400"
      : score >= 50
        ? "border-yellow-400"
        : "border-red-400";
  return (
    <div
      className={`flex items-center justify-center w-20 h-20 rounded-full border-4 ${ring} bg-background`}
    >
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-sm text-foreground leading-relaxed">
          {String(value)}
        </span>
      </div>
    </div>
  );
}

function AiReviewResult({
  aiReviewResult,
  performingAiReview,
}: {
  aiReviewResult: aiReviewResult | undefined;
  performingAiReview: boolean;
}) {
  if (!aiReviewResult) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <Code2 className="w-10 h-10 opacity-30" />
        <p className="text-sm">Submit your code to receive an AI review.</p>
      </div>
    );
  }

  if (
    aiReviewResult.status === "PENDING" ||
    aiReviewResult.data?.status === "PENDING" ||
    performingAiReview
  ) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">AI review in progress…</p>
      </div>
    );
  }

  const review = aiReviewResult.data?.data;
  if (!review) return null;

  const offsetScore = review.overall_score * 10;
  const score = offsetScore ?? 0;
  const scoreColor =
    score >= 80 ? "bg-green-400" : score >= 50 ? "bg-yellow-400" : "bg-red-400";

  return (
    <div className="flex flex-col gap-4 p-2">
      {/* Header card */}
      <Card className="border-border/60 bg-card/80 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              AI Code Review
            </CardTitle>
            <Badge
              variant="outline"
              className="text-green-400 border-green-400/40 bg-green-400/10 text-xs"
            >
              Completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <ScoreRing score={score} />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Overall Score</span>
              <span className="font-semibold text-foreground">{score}/100</span>
            </div>
            <Progress value={score} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {score >= 80
                ? "Excellent work! Your solution is well-optimised."
                : score >= 50
                  ? "Good effort. A few improvements can be made."
                  : "Needs improvement. Review the suggestions below."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card className="border-border/60 bg-card/80 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <InfoRow
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Correctness"
            value={String(review.correctness)}
          />
          <Separator />
          <InfoRow
            icon={<Clock className="w-4 h-4" />}
            label="Time Complexity"
            value={String(review.time_complexity)}
          />
          <Separator />
          <InfoRow
            icon={<Database className="w-4 h-4" />}
            label="Space Complexity"
            value={String(review.space_complexity)}
          />
          <Separator />
          <InfoRow
            icon={<Code2 className="w-4 h-4" />}
            label="Code Quality"
            value={String(review.code_quality)}
          />
        </CardContent>
      </Card>

      {/* Edge Cases */}
      {review.edge_cases_missing?.length > 0 && (
        <Card className="border-yellow-400/20 bg-yellow-400/5 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-yellow-400">
              <ShieldAlert className="w-4 h-4" />
              Missing Edge Cases
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {review.edge_cases_missing.map((ec, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                <span className="text-sm text-foreground/90">{String(ec)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Optimization Suggestions */}
      {review.optimization_suggestions?.length > 0 && (
        <Card className="border-blue-400/20 bg-blue-400/5 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-400">
              <Lightbulb className="w-4 h-4" />
              Optimisation Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {review.optimization_suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-blue-400 font-bold text-xs mt-0.5 shrink-0">
                  {i + 1}.
                </span>
                <span className="text-sm text-foreground/90">{String(s)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AiReviewResult;
