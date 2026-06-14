"use client";

import React, { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExamKPICards } from "@/components/tests/ExamKPICards";
import { ExamSearchFilters } from "@/components/tests/ExamSearchFilters";
import { ExamStatusTabs } from "@/components/tests/ExamStatusTabs";
import { ExamCardGrid } from "@/components/tests/ExamCardGrid";
import { BulkActionsToolbar } from "@/components/tests/BulkActionsToolbar";
import { ExamCardData } from "@/components/tests/ExamCard";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, Copy, Search } from "lucide-react";
import { toast } from "sonner";
import { Exam } from "@/generated/prisma/client";

interface FetchAllResponse {
  exams: ExamCardData[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

interface DashboardStats {
  totalExams: number;
  draftExams: number;
  activeExams: number;
  completedExams: number;
}

export default function TestsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const status = searchParams.get("status") || "ALL";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [creatingExam, setCreatingExam] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateSearch, setDuplicateSearch] = useState("");
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "ALL" && value !== "newest" && value !== "1") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, pathname, router],
  );

  const domain = getBackendURL();

  const {
    data: examsData,
    isLoading: examsLoading,
    refetch: refetchExams,
  } = useQuery<FetchAllResponse>({
    queryKey: ["teacher-exams", { status, search, sort, page }],
    queryFn: async () => {
      const res = await axios.get(`${domain}/teacher/exam/fetchallexams`, {
        params: { status, search, sort, page, limit: 12 },
        withCredentials: true,
      });
      return res.data as FetchAllResponse;
    },
  });

  const { data: dashboardStats, isLoading: statsLoading } =
    useQuery<DashboardStats>({
      queryKey: ["teacher-exam-dashboard"],
      queryFn: async () => {
        const res = await axios.get(`${domain}/teacher/exam/dashboard`, {
          withCredentials: true,
        });
        return res.data as DashboardStats;
      },
    });

  const handleCreateExam = useCallback(async () => {
    try {
      setCreatingExam(true);
      const res = await axios.get(`${domain}/teacher/exam/draftexam`, {
        withCredentials: true,
      });
      const exam = res.data as Exam;
      router.push(`/dashboard/teacher/tests/edit/${exam.id}`);
    } catch {
      toast.error("Failed to create exam");
    } finally {
      setCreatingExam(false);
    }
  }, [domain, router]);

  const handleDuplicateExam = useCallback(async () => {
    try {
      setCreatingExam(true);
      const res = await axios.get(`${domain}/teacher/exam/draftexam`, {
        withCredentials: true,
      });
      const exam = res.data as Exam;
      router.push(`/dashboard/teacher/tests/edit/${exam.id}`);
    } catch {
      toast.error("Failed to create exam");
    } finally {
      setCreatingExam(false);
    }
  }, [domain, router]);

  const handleDuplicateExisting = useCallback(() => {
    setDuplicateOpen(true);
    setDuplicateSearch("");
  }, []);

  const performDuplicate = useCallback(
    async (examId: string) => {
      try {
        setDuplicating(examId);
        const res = await axios.get(`${domain}/teacher/exam/duplicate`, {
          params: { examId },
          withCredentials: true,
        });
        const newExam = res.data as Exam;
        setDuplicateOpen(false);
        setDuplicating(null);
        toast.success("Exam duplicated successfully");
        router.push(`/dashboard/teacher/tests/edit/${newExam.id}`);
      } catch {
        setDuplicating(null);
        toast.error("Failed to duplicate exam");
      }
    },
    [domain, router],
  );

  const { data: allExams } = useQuery<FetchAllResponse>({
    queryKey: ["teacher-exams-duplicate", { search: duplicateSearch }],
    queryFn: async () => {
      const res = await axios.get(`${domain}/teacher/exam/fetchallexams`, {
        params: { search: duplicateSearch, sort: "newest", limit: 50 },
        withCredentials: true,
      });
      return res.data as FetchAllResponse;
    },
    enabled: duplicateOpen,
  });

  const handleSearchChange = useCallback(
    (value: string) => {
      updateParams({ search: value, page: "1" });
    },
    [updateParams],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      updateParams({ sort: value, page: "1" });
    },
    [updateParams],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      updateParams({ status: value, page: "1" });
      setSelectedIds(new Set());
    },
    [updateParams],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateParams({ page: String(newPage) });
      setSelectedIds(new Set());
    },
    [updateParams],
  );

  const handleSelectChange = useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (checked) next.add(id);
        else next.delete(id);
        return next;
      });
    },
    [],
  );

  const handleBulkPublish = async () => {
    const ids = Array.from(selectedIds);
    try {
      await axios.post(
        `${domain}/teacher/exam/publish-bulk`,
        { testIds: ids },
        { withCredentials: true },
      );
      await refetchExams();
      setSelectedIds(new Set());
    } catch {
      throw new Error("Failed to publish");
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      await axios.post(
        `${domain}/teacher/exam/delete-bulk`,
        { testIds: ids },
        { withCredentials: true },
      );
      await refetchExams();
      setSelectedIds(new Set());
    } catch {
      throw new Error("Failed to delete");
    }
  };

  const handleBulkExport = async () => {
    const ids = Array.from(selectedIds);
    try {
      const response = await axios.post(
        `${domain}/teacher/exam/export-csv`,
        { testIds: ids },
        { withCredentials: true, responseType: "blob" },
      );
      const url = window.URL.createObjectURL(response.data as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `tests-export-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      throw new Error("Failed to export");
    }
  };

  const exams = examsData?.exams ?? [];
  const pagination = examsData?.pagination;

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name={"Tests & Exams"} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-4 px-10 md:py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Tests & Exams</h1>
                <p className="text-muted-foreground mt-1">
                  Manage coding assessments, quizzes, and examinations.
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2" disabled={creatingExam}>
                    <Plus className="h-4 w-4" />
                    Create Exam
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCreateExam}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Exam
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicateExisting}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Existing Exam
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* KPI Cards */}
            <ExamKPICards stats={dashboardStats} loading={statsLoading} />

            {/* Search & Filters */}
            <ExamSearchFilters
              search={search}
              sort={sort}
              onSearchChange={handleSearchChange}
              onSortChange={handleSortChange}
            />

            {/* Status Tabs */}
            <ExamStatusTabs
              value={status}
              onValueChange={handleStatusChange}
            />

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <BulkActionsToolbar
                selectedCount={selectedIds.size}
                onPublish={handleBulkPublish}
                onDelete={handleBulkDelete}
                onExport={handleBulkExport}
                onClearSelection={() => setSelectedIds(new Set())}
              />
            )}

            {/* Exam Cards */}
            <ExamCardGrid
              exams={exams}
              loading={examsLoading}
              pagination={pagination}
              selectedIds={selectedIds}
              onSelectChange={handleSelectChange}
              onPageChange={handlePageChange}
              onCreateExam={handleCreateExam}
            />
          </div>
        </div>
      </div>

      {/* Duplicate Exam Dialog */}
      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Duplicate Existing Exam</DialogTitle>
            <DialogDescription>
              Search and select an exam to create a copy.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exams..."
              value={duplicateSearch}
              onChange={(e) => setDuplicateSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {allExams?.exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => performDuplicate(exam.id)}
                disabled={duplicating === exam.id}
                className="w-full text-left px-3 py-2.5 rounded-md hover:bg-accent text-sm transition-colors flex items-center justify-between disabled:opacity-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{exam.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {exam.studentCount} students · {exam.problemCount} problems
                    · {exam.status}
                  </div>
                </div>
                <Copy className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
              </button>
            ))}
            {allExams?.exams.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No exams found
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
