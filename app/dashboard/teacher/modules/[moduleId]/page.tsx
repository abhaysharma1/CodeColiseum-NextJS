"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Search,
  FlaskConical,
  BookOpen,
  BarChart3,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import InfiniteScroll from "react-infinite-scroll-component";
import { getBackendURL } from "@/utils/utilities";
import { ProgressCard } from "@/components/labs/progress-card";
import { AssessmentCard } from "@/components/labs/assessment-card";
import { OverviewCards } from "@/components/labs/analytics/overview-cards";
import { ProblemAnalyticsTable } from "@/components/labs/analytics/problem-analytics-table";
import { StudentProgressTable } from "@/components/labs/analytics/student-progress-table";
import { StudentDrawer } from "@/components/labs/analytics/student-drawer";
import {
  useTeacherModule,
  useTeacherModuleProblems,
  useTeacherAssessment,
  useTeacherAssessmentResults,
  useTeacherStudentProgress,
  useTeacherProblemAnalytics,
} from "@/hooks/use-labs";

interface ProblemOption {
  id: string;
  number: number;
  title: string;
  difficulty: string;
}

export default function TeacherModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: mod, loading: modLoading } = useTeacherModule(moduleId);
  const {
    data: problems,
    loading: problemsLoading,
    refetch: refetchProblems,
  } = useTeacherModuleProblems(moduleId);
  const {
    data: assessment,
    loading: assessmentLoading,
    refetch: refetchAssessment,
  } = useTeacherAssessment(moduleId);
  const { data: assessmentResults, loading: resultsLoading } =
    useTeacherAssessmentResults(moduleId);
  const { data: studentProgress, loading: studentLoading } =
    useTeacherStudentProgress(moduleId);
  const { data: problemAnalytics, loading: analyticsLoading } =
    useTeacherProblemAnalytics(moduleId);

  const [addProblemOpen, setAddProblemOpen] = useState(false);
  const [editMode, setEditMode] = useState(searchParams.get("edit") === "true");
  const [attachExamOpen, setAttachExamOpen] = useState(false);
  const [studentDrawerOpen, setStudentDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);

  if (modLoading) {
    return (
      <div className="w-full h-full animate-fade-left animate-once">
        <SiteHeader name="Module" />
        <div className="flex items-center justify-center py-20">
          <Spinner variant="infinite" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name={mod?.title || "Module"} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(`/dashboard/teacher/labs/${mod?.labId}`)
                }
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{mod?.title}</h1>
                  <Badge variant="secondary">Week {mod?.weekNumber}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mod?.description || "Module details"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                <Edit className="h-4 w-4 mr-1" />
                {editMode ? "Done" : "Edit"}
              </Button>
            </div>

            {editMode && mod && (
              <EditModuleCard module={mod} moduleId={moduleId} />
            )}

            <Tabs defaultValue="problems" className="space-y-4">
              <TabsList>
                <TabsTrigger value="problems">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Problems
                </TabsTrigger>
                <TabsTrigger value="assessment">
                  <FlaskConical className="h-4 w-4 mr-1" />
                  Assessment
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="problems" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Module Problems</h2>
                    <p className="text-sm text-muted-foreground">
                      {problems.length} problem
                      {problems.length !== 1 ? "s" : ""} in this module
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddProblemOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Problems
                    </Button>
                  </div>
                </div>

                {problems.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground mb-1">
                        No problems yet
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Add problems from the problem bank
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddProblemOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Problems
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Problem</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {problems.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">
                              {p.problem.number}. {p.problem.title}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  p.problem.difficulty === "EASY"
                                    ? "text-green-600"
                                    : p.problem.difficulty === "MEDIUM"
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }
                              >
                                {p.problem.difficulty}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={async () => {
                                  if (
                                    !confirm(
                                      "Remove this problem from the module?"
                                    )
                                  )
                                    return;
                                  try {
                                    await axios.delete(
                                      `${getBackendURL()}/teacher/module-problems/${p.id}`,
                                      { withCredentials: true }
                                    );
                                    toast.success("Problem removed");
                                    refetchProblems();
                                  } catch (err: any) {
                                    toast.error(
                                      err?.response?.data?.message ||
                                        "Failed to remove"
                                    );
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <AddProblemsDialog
                  open={addProblemOpen}
                  onOpenChange={setAddProblemOpen}
                  moduleId={moduleId}
                  onAdded={refetchProblems}
                  existingIds={problems.map((p) => p.problemId)}
                />
              </TabsContent>

              <TabsContent value="assessment" className="space-y-4">
                <AssessmentTab
                  moduleId={moduleId}
                  assessment={assessment}
                  loading={assessmentLoading}
                  onRefresh={refetchAssessment}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsTab
                  assessmentResults={assessmentResults}
                  resultsLoading={resultsLoading}
                  problemAnalytics={problemAnalytics}
                  analyticsLoading={analyticsLoading}
                  studentProgress={studentProgress}
                  studentLoading={studentLoading}
                  onViewStudent={(studentId) => {
                    const student = studentProgress.find(
                      (s) => s.studentId === studentId
                    );
                    setSelectedStudent(
                      student
                        ? { id: studentId, name: student.studentName }
                        : null
                    );
                    setStudentDrawerOpen(true);
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditModuleCard({
  module,
  moduleId,
}: {
  module: any;
  moduleId: string;
}) {
  const [title, setTitle] = useState(module.title || "");
  const [description, setDescription] = useState(module.description || "");
  const [weekNumber, setWeekNumber] = useState(String(module.weekNumber || ""));
  const [unlockAt, setUnlockAt] = useState(
    module.unlockAt ? new Date(module.unlockAt).toISOString().slice(0, 16) : ""
  );
  const [dueAt, setDueAt] = useState(
    module.dueAt ? new Date(module.dueAt).toISOString().slice(0, 16) : ""
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const body: any = {};
      if (title.trim()) body.title = title.trim();
      if (description.trim()) body.description = description.trim();
      if (weekNumber) body.weekNumber = parseInt(weekNumber);
      if (unlockAt) body.unlockAt = new Date(unlockAt).toISOString();
      if (dueAt) body.dueAt = new Date(dueAt).toISOString();
      else body.dueAt = null;

      await axios.patch(
        `${getBackendURL()}/teacher/modules/${moduleId}`,
        body,
        {
          withCredentials: true,
        }
      );
      toast.success("Module updated");
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Module</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Week Number</Label>
            <Input
              type="number"
              value={weekNumber}
              onChange={(e) => setWeekNumber(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Unlock Date</Label>
            <Input
              type="datetime-local"
              value={unlockAt}
              onChange={(e) => setUnlockAt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}

function AddProblemsDialog({
  open,
  onOpenChange,
  moduleId,
  onAdded,
  existingIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  onAdded: () => void;
  existingIds: string[];
}) {
  const [problems, setProblems] = useState<ProblemOption[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const mapProblems = (data: any[]) =>
    data
      .filter((p: any) => !existingIds.includes(p.id))
      .map((p: any) => ({
        id: p.id,
        number: p.number,
        title: p.title,
        difficulty: p.difficulty,
      }));

  const fetchProblems = useCallback(
    async (reset = false) => {
      try {
        setLoadingProblems(true);
        const res = await axios.get(`${getBackendURL()}/problems/getproblems`, {
          params: {
            take: 10,
            skip: reset ? 0 : (page - 1) * 10,
            searchValue: search || undefined,
          },
          withCredentials: true,
        });
        const data = (res.data as any[]) ?? [];
        setHasMore(data.length >= 10);
        if (reset) {
          setPage(2);
          setProblems(mapProblems(data));
        } else {
          setPage((prev) => prev + 1);
          setProblems((prev) => [...prev, ...mapProblems(data)]);
        }
      } catch {
        if (reset) setProblems([]);
        setHasMore(false);
      } finally {
        setLoadingProblems(false);
      }
    },
    [page, search, existingIds]
  );

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setHasMore(true);
    setProblems([]);
    setSelectedIds([]);
    setSearch("");
    const timer = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      setProblems([]);
      fetchProblems(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchProblems(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    if (!selectedIds.length) return;
    try {
      setAdding(true);
      await axios.post(
        `${getBackendURL()}/teacher/modules/${moduleId}/problems`,
        { problemIds: selectedIds },
        { withCredentials: true }
      );
      toast.success("Problems added to module");
      setSelectedIds([]);
      onAdded();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add problems");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Problems</DialogTitle>
          <DialogDescription>
            Select problems to add to this module
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div
            id="problem-scroll-container"
            className="max-h-80 overflow-y-auto"
          >
            {loadingProblems && problems.length === 0 ? (
              <div className="flex justify-center py-4">
                <Spinner variant="infinite" />
              </div>
            ) : problems.length === 0 && !loadingProblems ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {search ? "No problems match" : "All problems already added"}
              </p>
            ) : (
              <InfiniteScroll
                dataLength={problems.length}
                next={() => fetchProblems(false)}
                hasMore={hasMore}
                loader={
                  <div className="flex justify-center py-4">
                    <Spinner variant="infinite" />
                  </div>
                }
                scrollableTarget="problem-scroll-container"
                height={320}
              >
                <div className="space-y-1">
                  {problems.map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent ${
                        selectedIds.includes(p.id) ? "bg-accent" : ""
                      }`}
                      onClick={() => toggleId(p.id)}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          selectedIds.includes(p.id)
                            ? "bg-primary border-primary"
                            : "border-input"
                        }`}
                      >
                        {selectedIds.includes(p.id) && (
                          <span className="text-primary-foreground text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">
                          {p.number}. {p.title}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          p.difficulty === "EASY"
                            ? "text-green-600"
                            : p.difficulty === "MEDIUM"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {p.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
              </InfiniteScroll>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedIds.length || adding}>
            {adding ? "Adding..." : `Add (${selectedIds.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssessmentTab({
  moduleId,
  assessment,
  loading,
  onRefresh,
}: {
  moduleId: string;
  assessment: any;
  loading: boolean;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [attachOpen, setAttachOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [durationMin, setDurationMin] = useState("60");
  const [creating, setCreating] = useState(false);

  const handleCreateAssessment = async () => {
    try {
      setCreating(true);
      const res = await axios.post(
        `${getBackendURL()}/teacher/modules/${moduleId}/create-assessment`,
        {
          title: examTitle || undefined,
          durationMin: parseInt(durationMin) || 60,
        },
        { withCredentials: true }
      );
      toast.success("Assessment created");
      setCreateOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to create assessment"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveAssessment = async () => {
    if (!confirm("Remove the assessment exam from this module?")) return;
    try {
      await axios.delete(
        `${getBackendURL()}/teacher/modules/${moduleId}/assessment`,
        {
          withCredentials: true,
        }
      );
      toast.success("Assessment removed");
      onRefresh();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to remove assessment"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner variant="infinite" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-1">No assessment set</p>
          <p className="text-xs text-muted-foreground mb-4">
            Create or attach an assessment exam to this module
          </p>
          <div className="flex items-center gap-3">
            <Dialog open={attachOpen} onOpenChange={setAttachOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Attach Existing Exam
                </Button>
              </DialogTrigger>
              <AttachExamDialog
                moduleId={moduleId}
                onAttached={() => {
                  setAttachOpen(false);
                  onRefresh();
                }}
              />
            </Dialog>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Create New Assessment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Assessment</DialogTitle>
                  <DialogDescription>
                    A new exam will be created and linked to this module
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Exam Title</Label>
                    <Input
                      placeholder="e.g. Week 1 Assessment"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Defaults to "{document.title} - Assessment"
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={durationMin}
                      onChange={(e) => setDurationMin(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAssessment} disabled={creating}>
                    {creating ? "Creating..." : "Create & Link"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AssessmentCard
        title={assessment.title}
        startTime={assessment.startTime}
        endTime={assessment.endTime}
        durationMinutes={assessment.durationMinutes}
        status={assessment.status}
        variant="teacher"
        onEnter={() =>
          router.push(`/dashboard/teacher/tests/edit/${assessment.examId}`)
        }
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(`/dashboard/teacher/tests/edit/${assessment.examId}`)
          }
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Open Exam
        </Button>
        <Dialog open={attachOpen} onOpenChange={setAttachOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Replace Exam
            </Button>
          </DialogTrigger>
          <AttachExamDialog
            moduleId={moduleId}
            onAttached={() => {
              setAttachOpen(false);
              onRefresh();
            }}
          />
        </Dialog>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={handleRemoveAssessment}
        >
          Remove Exam
        </Button>
      </div>
    </div>
  );
}

function AttachExamDialog({
  moduleId,
  onAttached,
}: {
  moduleId: string;
  onAttached: () => void;
}) {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${getBackendURL()}/teacher/exam/fetchallexams`,
          {
            params: { take: 50, skip: 0 },
            withCredentials: true,
          }
        );
        setExams((res.data.exams as any[]) ?? []);
      } catch {
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = exams.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAttach = async () => {
    if (!selectedId) return;
    try {
      setAttaching(true);
      await axios.post(
        `${getBackendURL()}/teacher/modules/${moduleId}/assessment`,
        { examId: selectedId },
        { withCredentials: true }
      );
      toast.success("Exam attached to module");
      onAttached();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to attach exam");
    } finally {
      setAttaching(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Attach Existing Exam</DialogTitle>
        <DialogDescription>
          Select an exam to attach to this module
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {loading ? (
            <div className="flex justify-center py-4">
              <Spinner variant="infinite" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No exams found
            </p>
          ) : (
            filtered.map((e: any) => (
              <div
                key={e.id}
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent ${
                  selectedId === e.id ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedId(e.id)}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    selectedId === e.id
                      ? "bg-primary border-primary"
                      : "border-input"
                  }`}
                >
                  {selectedId === e.id && (
                    <span className="text-primary-foreground text-xs">✓</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{e.title}</span>
                  <p className="text-xs text-muted-foreground">
                    {e.isPublished ? "Published" : "Draft"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button onClick={handleAttach} disabled={!selectedId || attaching}>
          {attaching ? "Attaching..." : "Attach"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function AnalyticsTab({
  assessmentResults,
  resultsLoading,
  problemAnalytics,
  analyticsLoading,
  studentProgress,
  studentLoading,
  onViewStudent,
}: {
  assessmentResults: any;
  resultsLoading: boolean;
  problemAnalytics: any[];
  analyticsLoading: boolean;
  studentProgress: any[];
  studentLoading: boolean;
  onViewStudent: (studentId: string) => void;
}) {
  return (
    <>
      <OverviewCards
        totalStudents={assessmentResults?.totalStudents ?? 0}
        started={assessmentResults?.attemptedStudents ?? 0}
        completed={0}
        completionRate={
          assessmentResults?.totalStudents
            ? Math.round(
                ((assessmentResults?.attemptedStudents ?? 0) /
                  assessmentResults.totalStudents) *
                  100
              )
            : 0
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Problem Analytics</CardTitle>
          <CardDescription>
            Per-problem solve rates across all students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProblemAnalyticsTable
            data={problemAnalytics}
            loading={analyticsLoading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Progress</CardTitle>
          <CardDescription>Per-student completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentProgressTable
            data={studentProgress}
            loading={studentLoading}
            onViewStudent={onViewStudent}
          />
        </CardContent>
      </Card>

      <StudentDrawer open={false} onClose={() => {}} studentName="" />
    </>
  );
}
