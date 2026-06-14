"use client";
import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreHorizontal,
  FlaskConical,
  BookOpen,
  Users,
  GraduationCap,
  Layers,
  Calendar,
  ArrowRight,
  BarChart3,
  SearchX,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/dashboard/StatCard";
import { SiteHeader } from "@/components/site-header";
import { getBackendURL } from "@/utils/utilities";
import type { TeacherLab } from "@/hooks/use-labs";

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function LabCard({
  lab,
  onDelete,
}: {
  lab: TeacherLab;
  onDelete: (lab: TeacherLab) => void;
}) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className="group relative h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-border/50 hover:border-primary/20 cursor-pointer"
        onClick={() => router.push(`/dashboard/teacher/labs/${lab.id}`)}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                {lab.title}
              </CardTitle>
              <CardDescription className="mt-0.5">
                Created {formatRelativeDate(lab.createdAt)}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/teacher/labs/${lab.id}`}>View</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/teacher/labs/${lab.id}?edit=true`}>
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(lab)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="h-4 w-4 shrink-0" />
              <Badge
                variant="secondary"
                className="font-mono text-xs px-1.5 py-0 h-5"
              >
                {lab.modulesCount}
              </Badge>
              <span>{lab.modulesCount === 1 ? "Module" : "Modules"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <span>{(lab.assignedGroupsCount ?? 0) > 0 ? `${lab.assignedGroupsCount} ${lab.assignedGroupsCount === 1 ? "Group" : "Groups"}` : "No Groups"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{formatRelativeDate(lab.createdAt)}</span>
            </div>
          </div>
          {lab.description && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {lab.description}
            </p>
          )}
        </CardContent>

        <CardFooter
          className="border-t pt-4 gap-2 flex-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() =>
              router.push(`/dashboard/teacher/labs/${lab.id}`)
            }
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Open Lab
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() =>
              router.push(`/dashboard/teacher/labs/${lab.id}#assign`)
            }
          >
            <Users className="h-3.5 w-3.5" />
            Groups
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() =>
              router.push(`/dashboard/teacher/labs/${lab.id}?tab=analytics`)
            }
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function LabCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="pb-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
      </CardContent>
      <CardFooter className="border-t pt-4 gap-2">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
      </CardFooter>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="py-16">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FlaskConical className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Labs Yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          Create your first lab to organize modules, assign groups, and track
          student progress.
        </p>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Lab
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptySearchState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <Card className="py-12">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <SearchX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No labs found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          No labs match &ldquo;{query}&rdquo;. Try a different search term.
        </p>
        <Button variant="outline" onClick={onClear}>
          Clear Search
        </Button>
      </CardContent>
    </Card>
  );
}

interface LabsStats {
  totalLabs: number;
  totalModules: number;
  totalGroups: number;
  totalStudents: number;
}

export default function TeacherLabsPage() {
  const router = useRouter();
  const [data, setData] = useState<TeacherLab[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLabs, setTotalLabs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [take] = useState(9);
  const [skip, setSkip] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const [stats, setStats] = useState<LabsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchLabs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${getBackendURL()}/teacher/labs`, {
        params: { take, skip, searchvalue: searchValue },
        withCredentials: true,
      });
      const result = res.data as {
        data: TeacherLab[];
        pagination: { total: number; pages: number };
      };
      setData(result.data ?? []);
      setTotalLabs(result.pagination.total);
      setTotalPages(result.pagination.pages);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch labs");
    } finally {
      setLoading(false);
    }
  }, [take, skip, searchValue]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get(`${getBackendURL()}/teacher/labs/stats`, {
        withCredentials: true,
      });
      setStats(res.data as LabsStats);
    } catch {
      // Stats are supplementary; fail silently
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDelete = async (lab: TeacherLab) => {
    if (
      !confirm(
        "Delete this lab? This will also remove all modules and progress."
      )
    )
      return;
    try {
      await axios.delete(`${getBackendURL()}/teacher/labs/${lab.id}`, {
        withCredentials: true,
      });
      toast.success("Lab deleted");
      fetchLabs();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete lab");
    }
  };

  const currentPage = Math.floor(skip / take) + 1;

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name="Labs" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-4 px-10 h-full md:gap-8 md:py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Labs</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage coding labs, modules, and student groups
                </p>
              </div>
              <Button
                className="gap-2 shrink-0"
                onClick={() => router.push("/dashboard/teacher/labs/create")}
              >
                <Plus className="h-4 w-4" />
                Create Lab
              </Button>
            </div>

            {statsLoading ? (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <StatCard
                  title="Total Labs"
                  value={stats?.totalLabs ?? 0}
                  icon={FlaskConical}
                  variant="primary"
                />
                <StatCard
                  title="Modules"
                  value={stats?.totalModules ?? 0}
                  icon={BookOpen}
                  variant="default"
                />
                <StatCard
                  title="Groups"
                  value={stats?.totalGroups ?? 0}
                  icon={Users}
                  variant="success"
                />
                <StatCard
                  title="Students"
                  value={stats?.totalStudents ?? 0}
                  icon={GraduationCap}
                  variant="warning"
                />
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search labs..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setSkip(0);
                }}
                className="pl-10 h-11 w-full"
              />
              {searchValue && (
                <button
                  onClick={() => {
                    setSearchValue("");
                    setSkip(0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <LabCardSkeleton key={i} />
                ))}
              </div>
            ) : data.length === 0 && searchValue ? (
              <EmptySearchState
                query={searchValue}
                onClear={() => {
                  setSearchValue("");
                  setSkip(0);
                }}
              />
            ) : data.length === 0 ? (
              <EmptyState
                onCreate={() => router.push("/dashboard/teacher/labs/create")}
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data.map((lab) => (
                  <LabCard key={lab.id} lab={lab} onDelete={handleDelete} />
                ))}
              </div>
            )}

            {!loading && data.length > 0 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSkip(Math.max(0, skip - take))}
                  disabled={skip === 0}
                >
                  Previous
                </Button>
                <span className="text-sm tabular-nums text-muted-foreground">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSkip(skip + take)}
                  disabled={skip + take >= totalLabs}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
