"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsChartsProps {
  groupId: string;
  viewType?: "group" | "org";
  isLoading?: boolean;
  data?: {
    scoreDistribution?: Record<string, number>;
    performanceTrend?: Array<{ date: string; avgScore: number; count: number }>;
    completionDistribution?: {
      notStarted: number;
      inProgress: number;
      completed: number;
    };
    timeSpentByProblem?: Array<{
      problemNumber: number;
      problemTitle: string;
      avgTime: number;
    }>;
  };
}

const SCORE_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];
const COMPLETION_COLORS = ["#94a3b8", "#64748b", "#22c55e"];

/**
 * AnalyticsCharts - Dashboard visualization component
 * Displays score distribution, performance trends, completion rates, and time spent
 */
export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  groupId,
  viewType = "group",
  isLoading = false,
  data,
}) => {
  const ChartSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-72 w-full" />
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>No Chart Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Charts will appear once data is available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Score distribution data
  const scoreDistData = data.scoreDistribution
    ? Object.entries(data.scoreDistribution).map(([range, count]) => ({
        range,
        count,
        fill:
          range === "0-20"
            ? SCORE_COLORS[0]
            : range === "20-40"
              ? SCORE_COLORS[1]
              : range === "40-60"
                ? SCORE_COLORS[2]
                : range === "60-80"
                  ? SCORE_COLORS[3]
                  : SCORE_COLORS[4],
      }))
    : [];

  // Completion distribution data
  const completionData = data.completionDistribution
    ? [
        {
          name: "Not Started",
          value: data.completionDistribution.notStarted,
          fill: COMPLETION_COLORS[0],
        },
        {
          name: "In Progress",
          value: data.completionDistribution.inProgress,
          fill: COMPLETION_COLORS[1],
        },
        {
          name: "Completed",
          value: data.completionDistribution.completed,
          fill: COMPLETION_COLORS[2],
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Score Distribution */}
      {scoreDistData.length > 0 && (
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>
              Student scores across range buckets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={scoreDistData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 0, 0]}>
                  {scoreDistData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Performance Trend */}
      {data.performanceTrend && data.performanceTrend.length > 0 && (
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Last 7 days average scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number" ? Math.round(value) + "%" : value
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#3b82f6"
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Avg Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Completion Rate */}
      {completionData.length > 0 && (
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Completion Status</CardTitle>
            <CardDescription>Student progress distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Time Spent by Problem */}
      {data.timeSpentByProblem && data.timeSpentByProblem.length > 0 && (
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Time Investment</CardTitle>
            <CardDescription>Avg time per problem (minutes)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={data.timeSpentByProblem.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="problemTitle"
                  type="category"
                  width={200}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number"
                      ? Math.round(value) + " min"
                      : value
                  }
                />
                <Bar dataKey="avgTime" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsCharts;
