"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { FlaskConical, Search, SlidersHorizontal, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { getBackendURL } from "@/utils/utilities";
import { ProgressCard } from "@/components/labs/progress-card";
import { LabCard } from "@/components/labs/lab-card";

interface ModuleInfo {
  id: string;
  title: string;
  weekNumber: number;
  completionPercentage: number;
  moduleStatus: string;
  dueAt: string | null;
}

interface LabData {
  id: string;
  title: string;
  description: string | null;
  modulesCount: number;
  modules: ModuleInfo[];
}

function LabCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
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

  const getLabStatus = (modules: ModuleInfo[]): "not_started" | "in_progress" | "completed" => {
    if (modules.every((m) => m.moduleStatus === "COMPLETED")) return "completed";
    if (modules.some((m) => m.moduleStatus === "IN_PROGRESS")) return "in_progress";
    return "not_started";
  };

  return (
    <div className="w-full h-full">
      <SiteHeader name="My Labs" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Labs</h1>
                <p className="text-muted-foreground leading-relaxed">
                  Your assigned lab work and progress
                </p>
              </div>
              {labs.length > 0 && (
                <ProgressCard
                  completedProblems={labs.reduce(
                    (s, l) =>
                      s +
                      l.modules.reduce(
                        (ms, m) => ms + Math.round(m.completionPercentage * m.weekNumber) / 100,
                        0
                      ),
                    0
                  )}
                  totalProblems={labs.length}
                  completionPercentage={overallProgress}
                  showLabel={false}
                  size="sm"
                />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative max-w-xl"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search labs..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {filteredLabs.length < labs.length && (
                <Badge variant="secondary" className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] h-5 mr-1">
                  {filteredLabs.length} results
                </Badge>
              )}
            </motion.div>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <LabCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : filteredLabs.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
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
                  const avgPct = lab.modules.length > 0
                    ? Math.round(
                        lab.modules.reduce((s, m) => s + m.completionPercentage, 0) /
                          lab.modules.length
                      )
                    : 0;

                  return (
                    <LabCard
                      key={lab.id}
                      title={lab.title}
                      description={lab.description}
                      modulesCount={lab.modulesCount}
                      createdAt={new Date().toISOString()}
                      completionPercentage={avgPct}
                      status={getLabStatus(lab.modules)}
                      currentWeek={currentWeek?.weekNumber}
                      dueDate={nextDue?.dueAt || undefined}
                      onClick={() =>
                        router.push(`/dashboard/student/labs/${lab.id}`)
                      }
                    />
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <FlaskConical className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                  {searchValue ? "No labs match your search" : "No labs assigned yet"}
                </h3>
                <p className="text-sm text-muted-foreground/70 mb-4">
                  {searchValue
                    ? "Try a different search term"
                    : "Labs will appear here once you're assigned to them"}
                </p>
                {searchValue && (
                  <Button variant="outline" size="sm" onClick={() => setSearchValue("")}>
                    Clear Search
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
