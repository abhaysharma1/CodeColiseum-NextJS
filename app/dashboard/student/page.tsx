"use client";
import { Exam, ExamResult, Group } from "@/generated/prisma/client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
import {
  BookOpen,
  Trophy,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  ArrowUpRight,
  BarChart3,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/context/authcontext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";

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

function StatCard({ icon: Icon, label, value, sublabel, trend, color }: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  sublabel: string;
  trend?: { value: string; positive: boolean };
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2, scale: 1.01 }}
    >
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          <div className={`p-2 rounded-lg ${color || "bg-muted"}`}>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight tabular-nums">{value}</div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">{sublabel}</p>
            {trend && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${trend.positive ? "text-green-600" : "text-red-600"}`}>
                <ArrowUpRight className={`h-3 w-3 ${trend.positive ? "" : "rotate-90"}`} />
                {trend.value}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DifficultyBar({ label, solved, total, color }: { label: string; solved: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`text-xs ${color}`}>
            {label}
          </Badge>
          <span className="text-xs text-muted-foreground tabular-nums">{solved} solved</span>
        </div>
        <span className="text-xs font-mono tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color.match(/green/) ? "#22c55e" : color.match(/yellow/) ? "#eab308" : "#ef4444" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function Page() {
  const [dashboardData, setDashboardData] = useState<dashboardData | undefined>();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  const getDashboardDataFunc = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/student/getdashboarddata`,
        { withCredentials: true }
      );
      setDashboardData(res.data as dashboardData);
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
            <p className="text-center text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { groups, exams, prevResults, problemDetails } = dashboardData;
  const successRate = problemDetails.totalNoOfQuestions > 0
    ? Math.round((problemDetails.totalSolvedProblems / problemDetails.totalNoOfQuestions) * 100)
    : 0;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  return (
    <div>
      <SiteHeader name="Dashboard" />
      <div className="container mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {user?.name}
            </h1>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Here&apos;s your coding progress overview.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            icon={CheckCircle2}
            label="Total Problems Solved"
            value={problemDetails.totalSolvedProblems}
            sublabel={`out of ${problemDetails.totalNoOfQuestions} problems`}
            trend={{ value: `${successRate}% rate`, positive: successRate >= 50 }}
            color="bg-green-500/10"
          />
          <StatCard
            icon={TrendingUp}
            label="Success Rate"
            value={`${successRate}%`}
            sublabel="Overall completion rate"
            trend={{ value: successRate >= 50 ? "On track" : "Needs work", positive: successRate >= 50 }}
            color="bg-primary/10"
          />
          <StatCard
            icon={Calendar}
            label="Active Exams"
            value={exams.ongoingExams.length}
            sublabel={`${exams.upcomingExams.length} upcoming`}
            color="bg-yellow-500/10"
          />
          <StatCard
            icon={Users}
            label="Groups Joined"
            value={groups.length}
            sublabel="Active groups"
            color="bg-blue-500/10"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Problem Difficulty Breakdown</CardTitle>
              </div>
              <CardDescription>Your progress across different difficulty levels</CardDescription>
            </div>
            <CardContent className="p-6 space-y-4">
              <DifficultyBar
                label="Easy"
                solved={problemDetails.easyProblemSolved}
                total={problemDetails.totalNoOfQuestions}
                color="text-green-600 bg-green-500/10"
              />
              <DifficultyBar
                label="Medium"
                solved={problemDetails.mediumProblemSolved}
                total={problemDetails.totalNoOfQuestions}
                color="text-yellow-600 bg-yellow-500/10"
              />
              <DifficultyBar
                label="Hard"
                solved={problemDetails.hardProblemSolved}
                total={problemDetails.totalNoOfQuestions}
                color="text-red-600 bg-red-500/10"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="ongoing" className="space-y-4">
            <TabsList>
              <TabsTrigger value="ongoing" className="gap-2">
                <Clock className="h-4 w-4" />
                Ongoing ({exams.ongoingExams.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming ({exams.upcomingExams.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ongoing" className="space-y-4">
              {exams.ongoingExams.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No ongoing exams</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {exams.ongoingExams.map((exam, i) => (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      whileHover={{ y: -2 }}
                    >
                      <Card
                        className="cursor-pointer shadow-sm hover:shadow-md transition-all border-t-2 border-t-green-500 overflow-hidden"
                        onClick={() => router.push(`/tests/start/${exam.id}`)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg tracking-tight">{exam.title}</CardTitle>
                          <CardDescription>
                            {exam.description || "No description available"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 relative">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Duration: {exam.durationMin} minutes</span>
                          </div>
                          <Badge className="bg-green-600 gap-1">
                            <Sparkles className="h-3 w-3" /> Active
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {exams.upcomingExams.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No upcoming exams</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {exams.upcomingExams.map((exam, i) => (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <Card className="shadow-sm border-t-2 border-t-muted hover:shadow-md transition-all">
                        <CardHeader>
                          <CardTitle className="text-lg tracking-tight">{exam.title}</CardTitle>
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
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-lg">Recent Results</CardTitle>
              </div>
              <CardDescription>Your latest exam performances</CardDescription>
            </div>
            <CardContent className="p-0">
              {prevResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Award className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No results yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {prevResults.slice(0, 5).map((result, i) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 hover:bg-accent/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/5">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Exam #{result.examId}</p>
                          <p className="text-xs text-muted-foreground">
                            Completed on {new Date(result.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold tabular-nums text-primary">{result.score}</div>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Your Groups</CardTitle>
              </div>
              <CardDescription>Groups you&apos;re currently part of</CardDescription>
            </div>
            <CardContent className="p-6">
              {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Not part of any group yet</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groups.map((group, i) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      whileHover={{ y: -2 }}
                    >
                      <Card className="shadow-sm hover:shadow-md transition-all cursor-pointer border-t-2 border-t-primary/20">
                        <CardHeader>
                          <CardTitle className="text-base tracking-tight">{group.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {group.description || "No description"}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default Page;
