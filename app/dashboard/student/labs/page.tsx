"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { FlaskConical, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { getBackendURL } from "@/utils/utilities";
import { ProgressCard } from "@/components/labs/progress-card";

interface LabData {
  id: string;
  title: string;
  description: string | null;
  modulesCount: number;
  modules: {
    id: string;
    title: string;
    weekNumber: number;
    completionPercentage: number;
    moduleStatus: string;
    dueAt: string | null;
  }[];
}

export default function StudentLabsPage() {
  const router = useRouter();
  const [labs, setLabs] = useState<LabData[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<LabData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  const fetchLabs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${getBackendURL()}/student/my-labs`, {
        withCredentials: true,
      });
      const data = res.data as LabData[];
      setLabs(data);
      setFilteredLabs(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch labs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  useEffect(() => {
    if (!searchValue) {
      setFilteredLabs(labs);
      return;
    }
    const q = searchValue.toLowerCase();
    setFilteredLabs(
      labs.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q))
      )
    );
  }, [searchValue, labs]);

  const overallProgress = labs.length > 0
    ? Math.round(
        labs.reduce((acc, l) => {
          const avg = l.modules.length > 0
            ? l.modules.reduce((s, m) => s + m.completionPercentage, 0) / l.modules.length
            : 0;
          return acc + avg;
        }, 0) / labs.length
      )
    : 0;

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name="My Labs" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Labs</h1>
                <p className="text-muted-foreground">
                  Your assigned lab work and progress
                </p>
              </div>
            </div>

            {labs.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">{overallProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        overallProgress === 100 ? "bg-green-500" : "bg-primary"
                      }`}
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search labs..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredLabs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredLabs.map((lab) => {
                  const currentWeek = lab.modules.find(
                    (m) => m.moduleStatus === "IN_PROGRESS"
                  );
                  const nextDue = lab.modules
                    .filter((m) => m.dueAt)
                    .sort(
                      (a, b) =>
                        new Date(a.dueAt!).getTime() -
                        new Date(b.dueAt!).getTime()
                    )[0];

                  return (
                    <Card
                      key={lab.id}
                      className="hover:shadow-lg transition-all hover:bg-accent/60 cursor-pointer group"
                      onClick={() =>
                        router.push(`/dashboard/student/labs/${lab.id}`)
                      }
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {lab.title}
                            </CardTitle>
                            {lab.description && (
                              <CardDescription className="line-clamp-2">
                                {lab.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <ProgressCard
                          completedProblems={lab.modules.reduce(
                            (s, m) => s + Math.round(m.completionPercentage * m.weekNumber) / 100,
                            0
                          )}
                          totalProblems={lab.modules.length}
                          completionPercentage={
                            lab.modules.length > 0
                              ? Math.round(
                                  lab.modules.reduce(
                                    (s, m) => s + m.completionPercentage,
                                    0
                                  ) / lab.modules.length
                                )
                              : 0
                          }
                          showLabel={false}
                        />
                        <div className="flex items-center justify-between text-sm">
                          {currentWeek && (
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                              Week {currentWeek.weekNumber}
                            </Badge>
                          )}
                          {nextDue && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              Due {new Date(nextDue.dueAt!).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FlaskConical className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  {searchValue
                    ? "No labs match your search"
                    : "No labs assigned yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
