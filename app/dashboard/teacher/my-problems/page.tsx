"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ProblemStatusBadge } from "@/components/problem-status-badge";
import { useRouter } from "next/navigation";

interface MyProblem {
  id: string;
  number: number;
  title: string;
  difficulty: string;
  approvalStatus: "APPROVED" | "PENDING" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  tags: { tag: { id: string; name: string } }[];
}

export default function MyProblemsPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<MyProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProblemId, setDeleteProblemId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const skip = page * pageSize;
      const res = await axios.get<{
        problems: MyProblem[];
        pagination: { take: number; skip: number; total: number };
      }>(`${getBackendURL()}/teacher/problems`, {
        params: {
          searchValue: searchValue || undefined,
          approvalStatus: statusFilter !== "ALL" ? statusFilter : undefined,
          take: pageSize,
          skip,
        },
        withCredentials: true,
      });
      setProblems(res.data.problems);
      setTotal(res.data.pagination.total);
    } catch {
      toast.error("Failed to load problems");
    } finally {
      setLoading(false);
    }
  }, [page, searchValue, statusFilter]);

  useEffect(() => {
    setPage(0);
  }, [searchValue, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProblems();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchProblems]);

  const handleDelete = async () => {
    if (!deleteProblemId) return;
    setDeleteLoading(true);
    try {
      await axios.delete(
        `${getBackendURL()}/teacher/problems/${deleteProblemId}`,
        { withCredentials: true }
      );
      toast.success("Problem deleted");
      setDeleteDialogOpen(false);
      setDeleteProblemId(null);
      fetchProblems();
    } catch {
      toast.error("Failed to delete problem");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResubmit = async (problemId: string) => {
    try {
      await axios.post(
        `${getBackendURL()}/teacher/problems/${problemId}/resubmit`,
        {},
        { withCredentials: true }
      );
      toast.success("Problem resubmitted for approval");
      fetchProblems();
    } catch {
      toast.error("Failed to resubmit");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "hard":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full">
        <SiteHeader name="My Problems" />
      </div>

      <div className="flex-1 h-full w-full rounded-b-lg p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search your problems..."
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => router.push("/dashboard/teacher/my-problems/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Problem
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="mb-2 h-8 w-8" />
            <p>No problems found</p>
            <Button
              variant="link"
              onClick={() => router.push("/dashboard/teacher/my-problems/create")}
            >
              Create your first problem
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-24">Difficulty</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="w-32">Last Updated</TableHead>
                    <TableHead className="w-36 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.map((problem) => (
                    <TableRow key={problem.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {problem.number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {problem.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(getDifficultyColor(problem.difficulty))}
                        >
                          {problem.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ProblemStatusBadge status={problem.approvalStatus} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {problem.approvalStatus === "REJECTED"
                          ? problem.rejectionReason || "-"
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(problem.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/teacher/my-problems/${problem.id}/edit`
                              )
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeleteProblemId(problem.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          {problem.approvalStatus === "REJECTED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResubmit(problem.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {total > pageSize && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min((page + 1) * pageSize, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(page + 1) * pageSize >= total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Problem</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this problem? This action cannot be
              undone if the problem is not used in any exams or modules.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
