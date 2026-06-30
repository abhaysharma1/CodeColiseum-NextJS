"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ProblemStatusBadge } from "@/components/problem-status-badge";

interface ModerationProblem {
  id: string;
  number: number;
  title: string;
  difficulty: string;
  approvalStatus: "APPROVED" | "PENDING" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string } | null;
}

interface Pagination {
  take: number;
  skip: number;
  total: number;
}

type TabValue = "PENDING" | "APPROVED" | "REJECTED";

const API_ENDPOINTS: Record<TabValue, string> = {
  PENDING: "/admin/problems/pending",
  APPROVED: "/admin/problems/approved",
  REJECTED: "/admin/problems/rejected",
};

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("PENDING");
  const [problems, setProblems] = useState<ModerationProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState<Pagination>({ take: 20, skip: 0, total: 0 });
  const [page, setPage] = useState(0);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectProblemId, setRejectProblemId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProblems = useCallback(async (tab: TabValue, search: string, pageNum: number) => {
    setLoading(true);
    try {
      const skip = pageNum * pagination.take;
      const res = await axios.get<{ problems: ModerationProblem[]; pagination: Pagination }>(
        `${getBackendURL()}${API_ENDPOINTS[tab]}`,
        {
          params: { searchValue: search || undefined, take: pagination.take, skip },
          withCredentials: true,
        }
      );
      setProblems(res.data.problems);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load problems");
    } finally {
      setLoading(false);
    }
  }, [pagination.take]);

  useEffect(() => {
    setPage(0);
    fetchProblems(activeTab, searchValue, 0);
  }, [activeTab, fetchProblems]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchProblems(activeTab, searchValue, 0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleApprove = async (problemId: string) => {
    setActionLoading(problemId);
    try {
      await axios.post(
        `${getBackendURL()}/admin/problems/${problemId}/approve`,
        {},
        { withCredentials: true }
      );
      toast.success("Problem approved");
      setProblems((prev) =>
        prev.filter((p) => p.id !== problemId)
      );
    } catch {
      toast.error("Failed to approve problem");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectDialog = (problemId: string) => {
    setRejectProblemId(problemId);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectProblemId || !rejectReason.trim()) return;
    setRejectSubmitting(true);
    try {
      await axios.post(
        `${getBackendURL()}/admin/problems/${rejectProblemId}/reject`,
        { reason: rejectReason.trim() },
        { withCredentials: true }
      );
      toast.success("Problem rejected");
      setRejectDialogOpen(false);
      setRejectProblemId(null);
      setRejectReason("");
      setProblems((prev) =>
        prev.filter((p) => p.id !== rejectProblemId)
      );
    } catch {
      toast.error("Failed to reject problem");
    } finally {
      setRejectSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-500/10 text-green-500";
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "hard": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle className="text-xl font-semibold">
            Problem Moderation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review teacher-submitted problems for approval or rejection
          </p>
          <div className="relative mt-2 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by title or number..."
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="mb-4">
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          </TabsList>

          {(["PENDING", "APPROVED", "REJECTED"] as TabValue[]).map((tab) => (
            <TabsContent key={tab} value={tab}>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : problems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="mb-2 h-8 w-8" />
                  <p>No {tab.toLowerCase()} problems</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">#</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead className="w-24">Difficulty</TableHead>
                          <TableHead className="w-28">Created</TableHead>
                          {tab === "REJECTED" && <TableHead>Reason</TableHead>}
                          <TableHead className="w-48 text-right">Actions</TableHead>
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
                              {problem.owner?.name || problem.owner?.email || "Unknown"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={cn(getDifficultyColor(problem.difficulty))}
                              >
                                {problem.difficulty}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(problem.createdAt).toLocaleDateString()}
                            </TableCell>
                            {tab === "REJECTED" && (
                              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                {problem.rejectionReason || "-"}
                              </TableCell>
                            )}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      `/problems?id=${problem.id}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                {tab === "PENDING" && (
                                  <>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleApprove(problem.id)}
                                      disabled={actionLoading === problem.id}
                                    >
                                      <CheckCircle className="mr-1 h-4 w-4" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => openRejectDialog(problem.id)}
                                      disabled={actionLoading === problem.id}
                                    >
                                      <XCircle className="mr-1 h-4 w-4" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {tab === "APPROVED" && (
                                  <ProblemStatusBadge status="APPROVED" />
                                )}
                                {tab === "REJECTED" && (
                                  <ProblemStatusBadge status="REJECTED" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {pagination.total > pagination.take && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {problems.length} of {pagination.total}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 0}
                          onClick={() => {
                            const newPage = page - 1;
                            setPage(newPage);
                            fetchProblems(activeTab, searchValue, newPage);
                          }}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={problems.length < pagination.take}
                          onClick={() => {
                            const newPage = page + 1;
                            setPage(newPage);
                            fetchProblems(activeTab, searchValue, newPage);
                          }}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Problem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Provide a reason for rejection. This will be visible to the teacher.
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectSubmitting}
            >
              {rejectSubmitting ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
