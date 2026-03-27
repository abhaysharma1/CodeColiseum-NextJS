"use client";

import React, { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import {
  RecentActivity,
  ActivityItem,
} from "@/components/dashboard/RecentActivity";
import {
  TopStudentPreview,
  TopStudent,
} from "@/components/dashboard/TopStudentPreview";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Users,
  TrendingUp,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";
import { toast } from "sonner";

interface DashboardStats {
  activeStudents: number;
  totalTests: number;
  averageScore: number;
  completionRate: number;
  testsThisMonth: number;
  activeStudentsTrend?: number;
  averageScoreTrend?: number;
}

interface ChartDataPoint {
  date: string;
  avgScore: number;
  studentCount: number;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const domain = getBackendURL();

      // Fetch all dashboard data in parallel
      const [statsRes, chartRes, activitiesRes, studentsRes] =
        (await Promise.all([
          axios
            .get<DashboardStats>(`${domain}/teacher/exam/stats/summary`, {
              withCredentials: true,
            })
            .catch(() => {
              console.log("Stats endpoint not available, using mock data");
              return null;
            }),
          axios
            .get<ChartDataPoint[]>(`${domain}/teacher/exam/stats/chart-data`, {
              withCredentials: true,
            })
            .catch(() => {
              console.log("Chart endpoint not available");
              return null;
            }),
          axios
            .get<ActivityItem[]>(`${domain}/teacher/exam/recent-activity`, {
              withCredentials: true,
            })
            .catch(() => {
              console.log("Activity endpoint not available");
              return null;
            }),
          axios
            .get<TopStudent[]>(`${domain}/teacher/exam/top-students`, {
              withCredentials: true,
            })
            .catch(() => {
              console.log("Top students endpoint not available");
              return null;
            }),
        ])) as [
          { data: DashboardStats } | null,
          { data: ChartDataPoint[] } | null,
          { data: ActivityItem[] } | null,
          { data: TopStudent[] } | null,
        ];

      // Use real data if available, otherwise use mock data for demo
      if (statsRes?.data) {
        setStats(statsRes.data);
      } else {
        setStats({
          activeStudents: 24,
          totalTests: 12,
          averageScore: 76.5,
          completionRate: 68,
          testsThisMonth: 3,
          activeStudentsTrend: 12,
          averageScoreTrend: 5,
        });
      }

      if (chartRes?.data) {
        setChartData(chartRes.data);
      } else {
        setChartData([
          { date: "Mon", avgScore: 72, studentCount: 20 },
          { date: "Tue", avgScore: 75, studentCount: 22 },
          { date: "Wed", avgScore: 73, studentCount: 21 },
          { date: "Thu", avgScore: 78, studentCount: 23 },
          { date: "Fri", avgScore: 81, studentCount: 24 },
          { date: "Sat", avgScore: 79, studentCount: 20 },
          { date: "Sun", avgScore: 76, studentCount: 18 },
        ]);
      }

      if (activitiesRes?.data) {
        setRecentActivities(activitiesRes.data);
      } else {
        setRecentActivities([
          {
            id: "1",
            type: "exam_created",
            title: "Created new exam: Advanced Math",
            description: "Duration: 60 minutes, 20 questions",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            id: "2",
            type: "student_submission",
            title: "Student submission: John Doe completed exam",
            description: "Score: 85/100",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          },
          {
            id: "3",
            type: "exam_published",
            title: "Published exam: Data Structures",
            description: "Available to 24 students",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            id: "4",
            type: "group_created",
            title: "Created new group: Section A",
            description: "12 students added",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ]);
      }

      if (studentsRes?.data) {
        setTopStudents(studentsRes.data);
      } else {
        setTopStudents([
          {
            id: "1",
            name: "Alice Johnson",
            email: "alice@example.com",
            rank: 1,
            avgScore: 92,
            completionPercentage: 95,
          },
          {
            id: "2",
            name: "Bob Smith",
            email: "bob@example.com",
            rank: 2,
            avgScore: 88,
            completionPercentage: 90,
          },
          {
            id: "3",
            name: "Carol Davis",
            email: "carol@example.com",
            rank: 3,
            avgScore: 85,
            completionPercentage: 88,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const StatCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name={"Dashboard"} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="@container/main flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col gap-4 py-4 px-10 md:gap-6 md:py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground mt-1">
                  Here's an overview of your teaching activities
                </p>
              </div>
              <Button asChild className="gap-2">
                <Link href="/dashboard/teacher/tests">
                  Manage Tests
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <StatCardSkeleton key={i} />
                  ))}
                </>
              ) : stats ? (
                <>
                  <StatCard
                    title="Active Students"
                    value={stats.activeStudents}
                    icon={Users}
                    variant="primary"
                    trend={{
                      value: stats.activeStudentsTrend || 0,
                      isPositive: (stats.activeStudentsTrend || 0) >= 0,
                    }}
                  />
                  <StatCard
                    title="Total Tests"
                    value={stats.totalTests}
                    icon={BookOpen}
                    description={`${stats.testsThisMonth} this month`}
                    variant="success"
                  />
                  <StatCard
                    title="Average Score"
                    value={`${Math.round(stats.averageScore)}%`}
                    icon={TrendingUp}
                    trend={{
                      value: stats.averageScoreTrend || 0,
                      isPositive: (stats.averageScoreTrend || 0) >= 0,
                    }}
                    variant="primary"
                  />
                  <StatCard
                    title="Completion Rate"
                    value={`${Math.round(stats.completionRate)}%`}
                    icon={BarChart3}
                    variant="success"
                  />
                  <StatCard
                    title="Tests This Month"
                    value={stats.testsThisMonth}
                    icon={BookOpen}
                    variant="default"
                  />
                </>
              ) : null}
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DashboardChart
                  title="Average Scores Trend"
                  description="Student performance over the last week"
                  data={chartData}
                  chartType="area"
                  dataKey="avgScore"
                  xAxisKey="date"
                  loading={loading}
                  height={300}
                />
              </div>
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Link href="/dashboard/teacher/tests">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Manage Tests
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Link href="/dashboard/teacher/students">
                        <Users className="h-4 w-4 mr-2" />
                        Manage Groups
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Link href="/dashboard/teacher/analytics">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Activity and Top Students */}
            <div className="grid gap-4 lg:grid-cols-2">
              <RecentActivity
                activities={recentActivities}
                loading={loading}
                emptyMessage="No recent activity yet"
              />
              <TopStudentPreview
                students={topStudents}
                loading={loading}
                onViewAll="/dashboard/teacher/analytics"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
