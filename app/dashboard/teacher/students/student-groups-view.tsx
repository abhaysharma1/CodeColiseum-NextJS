"use client";

import React, { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Users,
  Layers,
  Bot,
  FileText,
  Beaker,
  Plus,
  RefreshCw,
  Search,
  ChevronDown,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface StudentGroupCard {
  id: string;
  name: string;
  description: string | null;
  type: string;
  aiEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  studentCount: number;
  assignedExamCount: number;
  assignedLabCount: number;
}

interface StudentGroupsStats {
  totalGroups: number;
  totalStudents: number;
  aiEnabledGroups: number;
  activeAssignedExams: number;
  activeAssignedLabs: number;
}

interface StudentGroupsResponse {
  groups: StudentGroupCard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function StatCard({ title, value, icon: Icon, loading }: { title: string; value: number; icon: React.ElementType; loading: boolean }) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
        )}
      </CardContent>
    </Card>
  );
}

function GroupCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth}mo ago`;
}

export default function StudentGroupsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const domain = getBackendURL();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "ALL";
  const aiEnabled = searchParams.get("aiEnabled") || "";
  const sort = searchParams.get("sort") || "newest";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "ALL" && value !== "newest" && value !== "1" && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  const { data: groupsData, isLoading: groupsLoading, isError: groupsError, refetch: refetchGroups } = useQuery<StudentGroupsResponse>({
    queryKey: ["teacher-student-groups", { page, search, type, aiEnabled, sort }],
    queryFn: async () => {
      const res = await axios.get(`${domain}/teacher/student-groups`, {
        params: { page, limit: 12, search: search || undefined, type, aiEnabled: aiEnabled || undefined, sort },
        withCredentials: true,
      });
      return res.data as StudentGroupsResponse;
    },
  });

  const { data: statsData, isLoading: statsLoading } = useQuery<StudentGroupsStats>({
    queryKey: ["teacher-student-groups-stats"],
    queryFn: async () => {
      const res = await axios.get(`${domain}/teacher/student-groups/stats`, {
        withCredentials: true,
      });
      return res.data as StudentGroupsStats;
    },
  });

  const [searchInput, setSearchInput] = React.useState(search);

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput, page: "1" });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, search, updateParams]);

  const handleRefresh = useCallback(() => {
    refetchGroups();
    toast.success("Groups refreshed");
  }, [refetchGroups]);

  const groups = groupsData?.groups ?? [];
  const pagination = groupsData?.pagination;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Groups</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize students for exams, labs, and assessments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={groupsLoading}>
            <RefreshCw className={cn("h-4 w-4", groupsLoading && "animate-spin")} />
          </Button>
          <Button asChild>
            <Link href="/dashboard/teacher/students/create-group">
              <Plus className="h-4 w-4 mr-1" /> Create Group
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Groups" value={statsData?.totalGroups ?? 0} icon={Layers} loading={statsLoading} />
        <StatCard title="Total Students" value={statsData?.totalStudents ?? 0} icon={Users} loading={statsLoading} />
        <StatCard title="AI Enabled" value={statsData?.aiEnabledGroups ?? 0} icon={Bot} loading={statsLoading} />
        <StatCard title="Active Exams" value={statsData?.activeAssignedExams ?? 0} icon={FileText} loading={statsLoading} />
        <StatCard title="Active Labs" value={statsData?.activeAssignedLabs ?? 0} icon={Beaker} loading={statsLoading} />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {type === "ALL" ? "All Types" : type[0] + type.slice(1).toLowerCase()}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => updateParams({ type: "ALL", page: "1" })}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParams({ type: "CLASS", page: "1" })}>Class</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParams({ type: "BATCH", page: "1" })}>Batch</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParams({ type: "SECTION", page: "1" })}>Section</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParams({ type: "CUSTOM", page: "1" })}>Custom</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {aiEnabled === "true" ? "AI Enabled" : aiEnabled === "false" ? "AI Disabled" : "AI Status"}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => updateParams({ aiEnabled: "", page: "1" })}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParams({ aiEnabled: "true", page: "1" })}>AI Enabled</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParams({ aiEnabled: "false", page: "1" })}>AI Disabled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {sort === "newest" ? "Newest" : sort === "oldest" ? "Oldest" : sort === "mostStudents" ? "Most Students" : sort === "leastStudents" ? "Least Students" : "Alphabetical"}
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => updateParams({ sort: "newest", page: "1" })}>Newest</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParams({ sort: "oldest", page: "1" })}>Oldest</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParams({ sort: "mostStudents", page: "1" })}>Most Students</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParams({ sort: "leastStudents", page: "1" })}>Least Students</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateParams({ sort: "alphabetical", page: "1" })}>Alphabetical</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Error State */}
      {groupsError && (
        <Card className="border-destructive/50">
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-3">Failed to load groups.</p>
            <Button variant="outline" onClick={() => refetchGroups()}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {groupsLoading && !groupsError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <GroupCardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty State */}
      {!groupsLoading && !groupsError && groups.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              {search || type !== "ALL" || aiEnabled ? "No groups match your filters" : "No groups found"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || type !== "ALL" || aiEnabled
                ? "Try adjusting your search or filters."
                : "Create your first group to get started."}
            </p>
            {search || type !== "ALL" || aiEnabled ? (
              <Button variant="outline" onClick={() => {
                const params = new URLSearchParams();
                router.push(pathname);
              }}>
                Clear Filters
              </Button>
            ) : (
              <Button asChild>
                <Link href="/dashboard/teacher/students/create-group">
                  <Plus className="h-4 w-4 mr-1" /> Create Your First Group
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Group Cards Grid */}
      {!groupsLoading && !groupsError && groups.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold leading-tight truncate">
                    {group.name}
                  </CardTitle>
                  {group.description && (
                    <CardDescription className="text-sm line-clamp-2">
                      {group.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {group.studentCount}
                    </span>
                    <Badge variant="outline" className="capitalize text-xs">
                      {group.type[0] + group.type.slice(1).toLowerCase()}
                    </Badge>
                    <Badge
                      variant={group.aiEnabled ? "default" : "outline"}
                      className={cn(
                        "text-xs gap-1",
                        group.aiEnabled && "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20",
                      )}
                    >
                      <Bot className="h-3 w-3" />
                      {group.aiEnabled ? "AI On" : "AI Off"}
                    </Badge>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(group.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span>Updated {timeAgo(group.updatedAt)}</span>
                  </div>

                  {/* Assignment summary */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      Exams: <span className="font-medium text-foreground">{group.assignedExamCount}</span>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Beaker className="h-3.5 w-3.5" />
                      Labs: <span className="font-medium text-foreground">{group.assignedLabCount}</span>
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t">
                    <Button variant="default" size="sm" asChild className="flex-1">
                      <Link href={`/dashboard/teacher/students/group/${group.id}`}>
                        Manage
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/dashboard/teacher/tests?groupId=${group.id}`}>
                        Assign Exam
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/dashboard/teacher/labs?groupId=${group.id}`}>
                        Assign Lab
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 12) + 1}–{Math.min(page * 12, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateParams({ page: String(page - 1) })}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-muted-foreground px-1">...</span>
                      )}
                      <Button
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateParams({ page: String(p) })}
                        className="min-w-9"
                      >
                        {p}
                      </Button>
                    </React.Fragment>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateParams({ page: String(page + 1) })}
                  disabled={page >= pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
