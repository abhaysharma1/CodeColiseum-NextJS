"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Layers,
  Users,
  Calendar,
  FlaskConical,
  X,
  Search,
  Edit,
  Trash2,
  Bot,
  Shield,
  UserPlus,
  UserMinus,
  Globe,
  BarChart3,
  Copy,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Label } from "@/components/ui/label";
import { getBackendURL } from "@/utils/utilities";
import { ModuleCard } from "@/components/labs/module-card";
import { useAuth } from "@/context/authcontext";
import { useSearchTeachers } from "@/hooks/use-labs";
import type { TeacherModule, GroupOption, LabTeacherEntry } from "@/hooks/use-labs";

export default function TeacherLabDetailPage() {
  const { labId } = useParams<{ labId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  const [lab, setLab] = useState<any>(null);
  const [modules, setModules] = useState<TeacherModule[]>([]);
  const [assignedGroups, setAssignedGroups] = useState<{ groupId: string; groupName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(searchParams.get("edit") === "true");
  const isCreator = lab?.creatorId === currentUser?.id;

  const fetchLab = async () => {
    try {
      setLoading(true);
      const [labRes, modulesRes, groupsRes] = await Promise.all([
        axios.get(`${getBackendURL()}/teacher/labs/${labId}`, { withCredentials: true }),
        axios.get(`${getBackendURL()}/teacher/labs/${labId}/modules`, { withCredentials: true }),
        axios.get(`${getBackendURL()}/teacher/labs/${labId}/assign`, { withCredentials: true }).catch(() => ({ data: [] })),
      ]);
      setLab(labRes.data);
      setModules(modulesRes.data as TeacherModule[]);
      setAssignedGroups((groupsRes.data as any) ?? []);
    } catch (error: any) {
      toast.error("Failed to load lab");
      router.push("/dashboard/teacher/labs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLab();
  }, [labId]);

  if (loading) {
    return (
      <div className="w-full h-full animate-fade-left animate-once">
        <SiteHeader name="Lab" />
        <div className="flex items-center justify-center py-20">
          <Spinner variant="infinite" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name={lab?.title || "Lab"} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/teacher/labs")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{lab?.title}</h1>
                  {lab?.visibility === "PUBLIC" && (
                    <Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <Globe className="h-3 w-3" />
                      Public
                    </Badge>
                  )}
                  {lab?.originalLabId && (
                    <Badge variant="secondary" className="gap-1">
                      <Copy className="h-3 w-3" />
                      Duplicated
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Lab Details</p>
              </div>
              <div className="flex items-center gap-2">
                {isCreator && lab?.visibility === "PUBLIC" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/teacher/labs/${labId}/analytics`)}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                )}
                {isCreator && lab?.visibility !== "PUBLIC" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/teacher/labs/${labId}/analytics`)}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Marketplace
                  </Button>
                )}
                {isCreator && (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
                    <Edit className="h-4 w-4 mr-1" />
                    {editMode ? "View Mode" : "Edit"}
                  </Button>
                )}
                {isCreator && (
                  <Button
                    size="sm"
                    onClick={() => router.push(`/dashboard/teacher/modules/create?labId=${labId}`)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Module
                  </Button>
                )}
              </div>
            </div>

            {editMode ? (
              <EditLabCard lab={lab} labId={labId} onUpdated={(updated: any) => setLab(updated)} />
            ) : (
              <OverviewCard lab={lab} />
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Modules
                  </h2>
                </div>
                {modules.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Layers className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No modules yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() =>
                          router.push(`/dashboard/teacher/modules/create?labId=${labId}`)
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create First Module
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-0">
                    {modules.map((mod) => (
                      <ModuleCard
                        key={mod.id}
                        weekNumber={mod.weekNumber}
                        title={mod.title}
                        unlockAt={mod.unlockAt}
                        dueAt={mod.dueAt}
                        problemsCount={mod.problemsCount}
                        assessmentStatus={mod.assessmentExamId ? "Assessment Set" : null}
                        onView={() => router.push(`/dashboard/teacher/modules/${mod.id}`)}
                        onEdit={isCreator ? () => router.push(`/dashboard/teacher/modules/${mod.id}?edit=true`) : undefined}
                        onDelete={isCreator ? async () => {
                          if (!confirm("Delete this module?")) return;
                          try {
                            await axios.delete(`${getBackendURL()}/teacher/modules/${mod.id}`, {
                              withCredentials: true,
                            });
                            toast.success("Module deleted");
                            fetchLab();
                          } catch (err: any) {
                            toast.error(err?.response?.data?.message || "Failed to delete");
                          }
                        } : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <ManageTeachersCard labId={labId} isCreator={isCreator} onUpdated={() => fetchLab()} />
                {isCreator && <AssignGroupsCard labId={labId} assignedGroups={assignedGroups} onAssigned={() => fetchLab()} />}
                {!isCreator && assignedGroups.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Assigned Group
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border p-2">
                        <p className="text-sm font-medium truncate">{assignedGroups[0].groupName}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ lab }: { lab: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm">{lab?.description || "No description"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Modules</p>
            <p className="text-2xl font-bold">{lab?.modulesCount || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">AI Assist</p>
            <Badge variant={lab?.aiEnabled ? "default" : "outline"}>
              <Bot className="h-3 w-3 mr-1" />
              {lab?.aiEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="text-sm">
              {lab?.createdAt
                ? new Date(lab.createdAt).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Safe Exam Browser</p>
            <Badge variant={lab?.sebEnabled ? "default" : "outline"}>
              <Shield className="h-3 w-3 mr-1" />
              {lab?.sebEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EditLabCard({
  lab,
  labId,
  onUpdated,
}: {
  lab: any;
  labId: string;
  onUpdated: (lab: any) => void;
}) {
  const [title, setTitle] = useState(lab?.title || "");
  const [description, setDescription] = useState(lab?.description || "");
  const [aiEnabled, setAiEnabled] = useState(lab?.aiEnabled ?? false);
  const [aiMaxMessages, setAiMaxMessages] = useState(lab?.aiMaxMessages ?? 20);
  const [aiMaxTokens, setAiMaxTokens] = useState(lab?.aiMaxTokens ?? 2000);
  const [sebEnabled, setSebEnabled] = useState(lab?.sebEnabled ?? false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    try {
      setSaving(true);
      const res = await axios.patch(
        `${getBackendURL()}/teacher/labs/${labId}`,
        {
          title: title.trim(),
          description: description.trim(),
          aiEnabled,
          aiMaxMessages: aiEnabled ? aiMaxMessages : undefined,
          aiMaxTokens: aiEnabled ? aiMaxTokens : undefined,
          sebEnabled,
        },
        { withCredentials: true }
      );
      onUpdated(res.data);
      toast.success("Lab updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Lab</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Lab Name</Label>
          <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-desc">Description</Label>
          <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Bot className="h-4 w-4" /> AI Assist
          </Label>
          <RadioGroup
            value={aiEnabled ? "enable" : "disable"}
            onValueChange={(v) => setAiEnabled(v === "enable")}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="enable" id="edit-ai-enable" className="cursor-pointer" />
              <Label htmlFor="edit-ai-enable" className="cursor-pointer">Enable</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="disable" id="edit-ai-disable" className="cursor-pointer" />
              <Label htmlFor="edit-ai-disable" className="cursor-pointer">Disable</Label>
            </div>
          </RadioGroup>
        </div>

        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          aiEnabled ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">AI Settings</span>
              <span className="text-xs text-muted-foreground">Configure limits for AI Assist</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-ai-messages">Max Messages</Label>
                <Input
                  id="edit-ai-messages"
                  type="number"
                  min={1}
                  max={50}
                  value={aiMaxMessages}
                  onChange={(e) => setAiMaxMessages(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Max AI messages per student per problem.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ai-tokens">Max Tokens</Label>
                <Input
                  id="edit-ai-tokens"
                  type="number"
                  min={50}
                  max={10000}
                  value={aiMaxTokens}
                  onChange={(e) => setAiMaxTokens(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Max total tokens per student per problem.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Safe Exam Browser
          </Label>
          <RadioGroup
            value={sebEnabled ? "enable" : "disable"}
            onValueChange={(v) => setSebEnabled(v === "enable")}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="enable" id="edit-seb-enable" className="cursor-pointer" />
              <Label htmlFor="edit-seb-enable" className="cursor-pointer">Enable</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="disable" id="edit-seb-disable" className="cursor-pointer" />
              <Label htmlFor="edit-seb-disable" className="cursor-pointer">Disable</Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            Safe Exam Browser provides a secure testing environment by limiting access to other applications and websites during lab work.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ManageTeachersCard({
  labId,
  isCreator,
  onUpdated,
}: {
  labId: string;
  isCreator: boolean;
  onUpdated: () => void;
}) {
  const [teachers, setTeachers] = useState<LabTeacherEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { results, search, loading: searchLoading } = useSearchTeachers();
  const [adding, setAdding] = useState(false);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/teacher/labs/${labId}/teachers`,
        { withCredentials: true }
      );
      setTeachers(res.data as LabTeacherEntry[]);
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (searchQuery.length >= 2) search(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, open, search]);

  const handleAdd = async (teacherId: string) => {
    try {
      setAdding(true);
      await axios.post(
        `${getBackendURL()}/teacher/labs/${labId}/teachers`,
        { userId: teacherId },
        { withCredentials: true }
      );
      toast.success("Teacher added to lab");
      setSearchQuery("");
      setOpen(false);
      fetchTeachers();
      onUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add teacher");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (teacherUserId: string) => {
    if (!confirm("Remove this teacher from the lab?")) return;
    try {
      await axios.delete(
        `${getBackendURL()}/teacher/labs/${labId}/teachers/${teacherUserId}`,
        { withCredentials: true }
      );
      toast.success("Teacher removed");
      fetchTeachers();
      onUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove teacher");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Lab Teachers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-2">
            <Spinner variant="infinite" />
          </div>
        ) : teachers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No additional teachers</p>
        ) : (
          <div className="space-y-2">
            {teachers.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.user.email}</p>
                </div>
                {isCreator && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-destructive"
                    onClick={() => handleRemove(t.userId)}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        {isCreator && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Teacher to Lab</DialogTitle>
                <DialogDescription>
                  Search for a teacher by name or email
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search teachers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {searchLoading ? (
                    <div className="flex justify-center py-4">
                      <Spinner variant="infinite" />
                    </div>
                  ) : searchQuery.length < 2 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Type at least 2 characters to search
                    </p>
                  ) : results.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No teachers found
                    </p>
                  ) : (
                    results.map((t) => {
                      const alreadyAdded = teachers.some((lt) => lt.userId === t.id);
                      return (
                        <div
                          key={t.id}
                          className={`flex items-center justify-between gap-3 p-2 rounded-md ${
                            alreadyAdded ? "opacity-50" : "cursor-pointer hover:bg-accent"
                          }`}
                          onClick={() => !alreadyAdded && !adding && handleAdd(t.id)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{t.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{t.email}</p>
                          </div>
                          {alreadyAdded ? (
                            <Badge variant="outline" className="shrink-0 text-xs">Added</Badge>
                          ) : (
                            <Button variant="ghost" size="sm" className="shrink-0" disabled={adding}>
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

function AssignGroupsCard({
  labId,
  assignedGroups,
  onAssigned,
}: {
  labId: string;
  assignedGroups: { groupId: string; groupName: string }[];
  onAssigned: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [unassigning, setUnassigning] = useState(false);
  const assignedGroup = assignedGroups[0] ?? null;

  useEffect(() => {
    if (!open) return;
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${getBackendURL()}/teacher/exam/getallgroups`, {
          withCredentials: true,
        });
        const allGroups = ((res.data as any[]) ?? []).map((g: any) => ({
          id: g.id,
          name: g.name,
        }));
        const assignedId = assignedGroup?.groupId;
        setGroups(allGroups.filter((g) => g.id !== assignedId));
        setSelectedId(null);
      } catch {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [open, assignedGroup?.groupId]);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedId) return;
    try {
      setAssigning(true);
      await axios.post(
        `${getBackendURL()}/teacher/labs/${labId}/assign`,
        { groupId: selectedId },
        { withCredentials: true }
      );
      toast.success("Lab assigned to group");
      setOpen(false);
      setSelectedId(null);
      onAssigned();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to assign");
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    try {
      setUnassigning(true);
      await axios.delete(
        `${getBackendURL()}/teacher/labs/${labId}/assign`,
        { withCredentials: true }
      );
      toast.success("Lab unassigned");
      onAssigned();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to unassign");
    } finally {
      setUnassigning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Assigned Group
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignedGroup ? (
          <div className="flex items-center justify-between gap-2 rounded-md border p-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{assignedGroup.groupName}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-destructive"
              onClick={handleUnassign}
              disabled={unassigning}
            >
              <UserMinus className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Not assigned to any group</p>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              {assignedGroup ? "Change Group" : "Assign to Group"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Lab</DialogTitle>
              <DialogDescription>
                Select a group to assign this lab to
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
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
                ) : filteredGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {search ? "No groups match your search" : "No groups available"}
                  </p>
                ) : (
                  filteredGroups.map((g) => (
                    <div
                      key={g.id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent ${
                        selectedId === g.id ? "bg-accent" : ""
                      }`}
                      onClick={() => setSelectedId(g.id)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedId === g.id
                            ? "bg-primary border-primary"
                            : "border-input"
                        }`}
                      >
                        {selectedId === g.id && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm">{g.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={!selectedId || assigning}>
                {assigning ? "Assigning..." : "Assign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
