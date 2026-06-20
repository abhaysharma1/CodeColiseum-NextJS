"use client";
import { useState, useEffect } from "react";
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
import type { TeacherModule, GroupOption } from "@/hooks/use-labs";

export default function TeacherLabDetailPage() {
  const { labId } = useParams<{ labId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lab, setLab] = useState<any>(null);
  const [modules, setModules] = useState<TeacherModule[]>([]);
  const [assignedGroups, setAssignedGroups] = useState<{ groupId: string; groupName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(searchParams.get("edit") === "true");

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
                <h1 className="text-2xl font-bold">{lab?.title}</h1>
                <p className="text-sm text-muted-foreground">Lab Details</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
                  <Edit className="h-4 w-4 mr-1" />
                  {editMode ? "View Mode" : "Edit"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push(`/dashboard/teacher/modules/create?labId=${labId}`)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Module
                </Button>
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
                        onEdit={() => router.push(`/dashboard/teacher/modules/${mod.id}?edit=true`)}
                        onDelete={async () => {
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
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <AssignGroupsCard labId={labId} assignedGroups={assignedGroups} onAssigned={() => fetchLab()} />
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

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

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
        const assignedIds = new Set(assignedGroups.map((g) => g.groupId));
        setGroups(allGroups.filter((g) => !assignedIds.has(g.id)));
      } catch {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [open]);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleGroup = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (!selectedIds.length) return;
    try {
      setAssigning(true);
      await axios.post(
        `${getBackendURL()}/teacher/labs/${labId}/assign`,
        { groupIds: selectedIds },
        { withCredentials: true }
      );
      toast.success("Lab assigned to groups");
      setOpen(false);
      setSelectedIds([]);
      onAssigned();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to assign");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Assigned Groups
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignedGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not assigned to any groups</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {assignedGroups.map((g) => (
              <Badge key={g.groupId} variant="secondary">
                {g.groupName}
              </Badge>
            ))}
          </div>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              Assign to Groups
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Lab</DialogTitle>
              <DialogDescription>
                Select groups to assign this lab to
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
                    {search ? "No groups match your search" : "No unassigned groups available"}
                  </p>
                ) : (
                  filteredGroups.map((g) => (
                    <div
                      key={g.id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent ${
                        selectedIds.includes(g.id) ? "bg-accent" : ""
                      }`}
                      onClick={() => toggleGroup(g.id)}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selectedIds.includes(g.id)
                            ? "bg-primary border-primary"
                            : "border-input"
                        }`}
                      >
                        {selectedIds.includes(g.id) && (
                          <span className="text-primary-foreground text-xs">✓</span>
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
              <Button onClick={handleAssign} disabled={!selectedIds.length || assigning}>
                {assigning ? "Assigning..." : `Assign (${selectedIds.length})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
