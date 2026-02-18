"use client";
import getDashboardData from "@/app/actions/student/dashboard/getDashBoardData";
import { Exam, ExamResult, Group } from "@/generated/prisma/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Trophy,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/context/authcontext";
import { useRouter } from "next/navigation";

type dashboardData = {
  groups: Group[];
  exams: { upcomingExams: Exam[]; ongoingExams: Exam[] };
  prevResults: ExamResult[];
  problemDetails: {
    totalSolvedProblems: number;
    easyProblemSolved: number;
    mediumProblemSolved: number;
    hardProblemSolved: number;
    totalNoOfQuestions: number;
  };
};

function Page() {
  const [dashboardData, setDashboardData] = useState<
    dashboardData | undefined
  >();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  const getDashboardDataFunc = async () => {
    try {
      setLoading(true);
      const data = (await getDashboardData()) as dashboardData;
      setDashboardData(data);
      console.log(data);
    } catch (error: any) {
      if (typeof error.message == "string") {
        toast.error(error.message);
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardDataFunc();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No data available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { groups, exams, prevResults, problemDetails } = dashboardData;
  const successRate =
    problemDetails.totalNoOfQuestions > 0
      ? Math.round(
          (problemDetails.totalSolvedProblems /
            problemDetails.totalNoOfQuestions) *
            100,
        )
      : 0;

  return (
    <div>
      <SiteHeader name="Dashboard" />
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Here's your coding progress overview.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Problems Solved
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {problemDetails.totalSolvedProblems}
              </div>
              <p className="text-xs text-muted-foreground">
                out of {problemDetails.totalNoOfQuestions} problems
              </p>
              <Progress value={successRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Overall completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Exams
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exams.ongoingExams.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {exams.upcomingExams.length} upcoming
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Groups Joined
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups.length}</div>
              <p className="text-xs text-muted-foreground">Active groups</p>
            </CardContent>
          </Card>
        </div>

        {/* Problem Difficulty Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Problem Difficulty Breakdown
            </CardTitle>
            <CardDescription>
              Your progress across different difficulty levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  >
                    Easy
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {problemDetails.easyProblemSolved} solved
                  </span>
                </div>
              </div>
              <Progress
                value={
                  (problemDetails.easyProblemSolved /
                    (problemDetails.totalNoOfQuestions || 1)) *
                  100
                }
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                  >
                    Medium
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {problemDetails.mediumProblemSolved} solved
                  </span>
                </div>
              </div>
              <Progress
                value={
                  (problemDetails.mediumProblemSolved /
                    (problemDetails.totalNoOfQuestions || 1)) *
                  100
                }
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  >
                    Hard
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {problemDetails.hardProblemSolved} solved
                  </span>
                </div>
              </div>
              <Progress
                value={
                  (problemDetails.hardProblemSolved /
                    (problemDetails.totalNoOfQuestions || 1)) *
                  100
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Exams Section */}
        <Tabs defaultValue="ongoing" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ongoing" className="gap-2">
              <Clock className="h-4 w-4" />
              Ongoing Exams ({exams.ongoingExams.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Exams ({exams.upcomingExams.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="space-y-4">
            {exams.ongoingExams.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No ongoing exams
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {exams.ongoingExams.map((exam) => (
                  <Card
                    key={exam.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => router.push(`/test/starttest/${exam.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <CardDescription>
                        {exam.description || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Duration: {exam.durationMin} minutes</span>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Active
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {exams.upcomingExams.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No upcoming exams
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {exams.upcomingExams.map((exam) => (
                  <Card
                    key={exam.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <CardDescription>
                        {exam.description || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Duration: {exam.durationMin} minutes</span>
                      </div>
                      <Badge variant="outline">Upcoming</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Results
            </CardTitle>
            <CardDescription>Your latest exam performances</CardDescription>
          </CardHeader>
          <CardContent>
            {prevResults.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No results yet
              </p>
            ) : (
              <div className="space-y-3">
                {prevResults.slice(0, 5).map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Award className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Exam #{result.examId}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed on{" "}
                          {new Date(result.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{result.score}</div>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Groups
            </CardTitle>
            <CardDescription>Groups you're currently part of</CardDescription>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Not part of any group yet
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <Card
                    key={group.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{group.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {group.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Page;
