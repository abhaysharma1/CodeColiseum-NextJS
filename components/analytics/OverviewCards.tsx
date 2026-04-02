import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface OverviewCardsProps {
  groupId: string;
  viewType?: "group" | "org";
  isLoading?: boolean;
  data?: {
    totalStudents: number;
    activeStudents: number;
    avgScore: number;
    completionRate: number;
    overallPassRate: number;
    weakestProblem?: { number: number; title: string };
    hardestProblem?: { number: number; title: string };
    avgAttempts: number;
  };
}

/**
 * OverviewCards - Dashboard summary metrics
 * Displays 7 key performance indicators with visual indicators
 */
export const OverviewCards: React.FC<OverviewCardsProps> = ({
  groupId,
  viewType = "group",
  isLoading = false,
  data,
}) => {
  const CardSkeleton = () => (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-6 w-16" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>No Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No analytics data available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Students",
      value: data.totalStudents,
      description: `in ${viewType}`,
      badge: null,
    },
    {
      title: "Active Students",
      value: data.activeStudents,
      description: "Last 24 hours",
      badge:
        Math.round(
          (data.activeStudents / Math.max(data.totalStudents, 1)) * 100
        ) + "%",
    },
    {
      title: "Avg Score",
      value: data.avgScore.toFixed(1),
      unit: "%",
      description: "Class average",
      badge:
        data.avgScore >= 70
          ? "Good"
          : data.avgScore >= 50
            ? "Fair"
            : "Below Avg",
    },
    {
      title: "Completion Rate",
      value: data.completionRate.toFixed(1),
      unit: "%",
      description: "Exams completed",
      badge: data.completionRate >= 80 ? "On Track" : "Catching Up",
    },
    {
      title: "Pass Rate",
      value: (data.overallPassRate * 100).toFixed(1),
      unit: "%",
      description: "Score ≥ 50",
      badge: data.overallPassRate * 100 >= 75 ? "Strong" : "Improving",
    },
    {
      title: "Weakest Topic",
      value: data.weakestProblem?.title || "N/A",
      description: `Problem #${data.weakestProblem?.number || "-"}`,
      isBadge: true,
    },
    {
      title: "Hardest Problem",
      value: data.hardestProblem?.title || "N/A",
      description: `Problem #${data.hardestProblem?.number || "-"}`,
      isBadge: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <Card key={idx} className="group hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            {card.badge && typeof card.badge === "string" && (
              <Badge
                variant={
                  card.badge === "Good" ||
                  card.badge === "Strong" ||
                  card.badge === "On Track"
                    ? "default"
                    : "secondary"
                }
              >
                {card.badge}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.value}
              {card.unit && <span className="text-lg">{card.unit}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OverviewCards;
