"use client";
import { SiteHeader } from "@/components/site-header";
import { User } from "@/generated/prisma/client";
import { Group } from "@/interfaces/DB Schema";
import axios from "axios";
import { use } from "react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Calendar,
  Hash,
  Mail,
  UserPlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Bot,
  Link2,
  MessageSquare,
  Coins,
  ArrowLeft,
  Trophy,
  BarChart3,
  FileText,
  RotateCcw,
} from "lucide-react";
import { getBackendURL } from "@/utils/utilities";
import { router } from "better-auth/api";
import { useRouter } from "next/navigation";
import { IoAnalytics } from "react-icons/io5";
import Link from "next/link";
import { AnalyticsPagination } from "@/components/analytics/AnalyticsPagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StudentOverallStats {
  id: string;
  groupId: string;
  studentId: string;
  totalScore: number;
  totalExams: number;
  avgScore: number;
  totalAttempts: number;
  updatedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

interface GroupExam {
  id: string;
  title: string;
  isPublished: boolean;
  status: string;
  startDate: string;
  endDate: string;
}

function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [groupData, setGroupData] = useState<Group | undefined>();
  const [groupMembers, setGroupMembers] = useState<User[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [newEmails, setNewEmails] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notFoundStudents, setNotFoundStudents] = useState<string[]>([]);

  const [addingToGroupLoader, setAddingToGroupLoader] = useState(false);
  const [studentStats, setStudentStats] = useState<StudentOverallStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedType, setEditedType] = useState<string>("CLASS");
  const [editedAiEnabled, setEditedAiEnabled] = useState(false);
  const [editedAiMaxMessages, setEditedAiMaxMessages] = useState(20);
  const [editedAiMaxTokens, setEditedAiMaxTokens] = useState(2000);
  const [savingGroup, setSavingGroup] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalMembers, setTotalMembers] = useState(0);
  const [membersLoading, setMembersLoading] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<User | null>(null);

  const [coTeacherEmail, setCoTeacherEmail] = useState("");
  const [addingCoTeacher, setAddingCoTeacher] = useState(false);
  const [assignCoTeacherOpen, setAssignCoTeacherOpen] = useState(false);

  const [groupExams, setGroupExams] = useState<GroupExam[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);

  const router = useRouter();

  const getData = async () => {
    try {
      const res = await axios.get(
        `${getBackendURL()}/teacher/getgroupdetails`,
        {
          params: {
            groupId: id,
          },
          withCredentials: true,
        }
      );
      setGroupData(res.data as Group);
    } catch (error) {
      if (typeof error == "string") {
        toast.error(error);
      }
      console.log(error);
    }
  };

  const getMembers = async (page: number, limit: number, search: string) => {
    try {
      if (!groupData?.id) return;

      setMembersLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/teacher/getgroupmembers`,
        {
          params: {
            groupId: groupData.id,
            page,
            limit,
            search: search || undefined,
          },
          withCredentials: true,
        }
      );

      const data = res.data as
        | User[]
        | {
            data: User[];
            pagination?: {
              page: number;
              limit: number;
              total: number;
              pages: number;
            };
          };

      if (Array.isArray(data)) {
        setGroupMembers(data);
        setTotalMembers(data.length);
      } else {
        setGroupMembers(data.data);
        setTotalMembers(data.pagination?.total ?? data.data.length);
      }
    } catch (error) {
      if (typeof error == "string") {
        toast.error(error);
      }
      console.log(error);
    } finally {
      setLoading(false);
      setMembersLoading(false);
    }
  };

  const getStudentStats = async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get(
        `${getBackendURL()}/teaxcher/student-overall-stats`,
        {
          params: {
            groupId: id,
          },
          withCredentials: true,
        }
      );
      setStudentStats(res.data as StudentOverallStats[]);
    } catch (error) {
      console.log(error);
    } finally {
      setStatsLoading(false);
    }
  };

  const getGroupExams = async () => {
    if (!groupData?.id) return;
    try {
      setExamsLoading(true);
      const res = await axios.get(`${getBackendURL()}/teacher/getgroupexams`, {
        params: {
          groupId: groupData.id,
        },
        withCredentials: true,
      });
      setGroupExams(res.data as GroupExam[]);
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        (typeof error?.message === "string"
          ? error.message
          : "Failed to load group exams");
      toast.error(message);
      console.log(error);
    } finally {
      setExamsLoading(false);
    }
  };

  const addMembersToGroupFunc = async () => {
    if (!groupData?.id) return;
    try {
      setAddingToGroupLoader(true);
      if (!newEmails) {
        toast.error("Enter Some Emails");
        return;
      }

      const res = await axios.post(
        `${getBackendURL()}/teacher/addmembertogroup`,
        {
          newEmails: newEmails,
          groupId: groupData?.id,
        },
        {
          withCredentials: true,
        }
      );

      const result = res.data as string[];

      setNotFoundStudents(result || []);
      setDialogOpen(true);
      setNewEmails("");

      await getMembers(currentPage, pageSize, debouncedSearch);
      await getData();
    } catch (error: any) {
      if (typeof error.message === "string") {
        toast.error(error.message);
      }
      console.log(error);
    } finally {
      setAddingToGroupLoader(false);
    }
  };

  useEffect(() => {
    if (id) {
      getData();
    }
  }, [id]);

  useEffect(() => {
    if (groupData?.id) {
      getStudentStats();
    }
  }, [groupData]);

  useEffect(() => {
    if (groupData?.id) {
      getGroupExams();
    }
  }, [groupData]);

  useEffect(() => {
    if (!groupData?.id) return;
    getMembers(currentPage, pageSize, debouncedSearch);
  }, [groupData?.id, currentPage, pageSize, debouncedSearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(t);
  }, [searchValue]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditClick = () => {
    setEditedName(groupData?.name || "");
    setEditedDescription(groupData?.description || "");
    setEditedType(groupData?.type || "CLASS");
    setEditedAiEnabled(groupData?.aiEnabled || false);
    setEditedAiMaxMessages(groupData?.aiMaxMessages ?? 20);
    setEditedAiMaxTokens(groupData?.aiMaxTokens ?? 2000);
    setShowEditGroup(true);
  };

  const handleSaveEdit = async () => {
    if (!groupData?.id) {
      toast.error("Group not loaded");
      return;
    }

    if (!editedName.trim()) {
      toast.error("Please enter group name");
      return;
    }

    try {
      setSavingGroup(true);

      await axios.post(
        `${getBackendURL()}/teacher/updategroupdetails`,
        {
          groupId: groupData.id,
          name: editedName.trim(),
          description: editedDescription,
          type: editedType,
          aiEnabled: editedAiEnabled,
          aiMaxMessages: editedAiEnabled ? editedAiMaxMessages : undefined,
          aiMaxTokens: editedAiEnabled ? editedAiMaxTokens : undefined,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Group updated successfully");
      await getData();
      setShowEditGroup(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        (typeof error?.message === "string"
          ? error.message
          : "Failed to update group");
      toast.error(message);
      console.log(error);
    } finally {
      setSavingGroup(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!groupData?.id) return;

    try {
      setRemovingMemberId(memberId);

      await axios.post(
        `${getBackendURL()}/teacher/removememberfromgroup`,
        {
          groupId: groupData.id,
          userId: memberId,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Student removed from group");

      // Adjust page if we removed the last member on the current page
      const isLastOnPage = groupMembers && groupMembers.length === 1;
      if (isLastOnPage && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        getMembers(currentPage, pageSize, debouncedSearch);
      }

      // Refresh group details and stats so counts stay in sync
      await getData();
      await getStudentStats();
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        (typeof error?.message === "string"
          ? error.message
          : "Failed to remove student from group");
      toast.error(message);
      console.log(error);
    } finally {
      setRemovingMemberId(null);
      setConfirmRemoveOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleAddCoTeacher = async () => {
    if (!groupData?.id) return;

    if (!coTeacherEmail.trim()) {
      toast.error("Enter a teacher email");
      return;
    }

    try {
      setAddingCoTeacher(true);

      await axios.post(
        `${getBackendURL()}/teacher/addcoteachertogroup`,
        {
          groupId: groupData.id,
          email: coTeacherEmail.trim(),
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Co-teacher added successfully");
      setCoTeacherEmail("");

      await getMembers(currentPage, pageSize, debouncedSearch);
      await getData();
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        (typeof error?.message === "string"
          ? error.message
          : "Failed to add co-teacher");
      toast.error(message);
      console.log(error);
    } finally {
      setAddingCoTeacher(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader name="Group" />

      {/* Hero Section */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-6">
          {loading || !groupData ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3  ">
                  <Button variant={"ghost"} onClick={() => router.back()}>
                    <ArrowLeft />
                  </Button>
                  <h1 className="text-3xl font-semibold">{groupData.name}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEditClick}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setAssignCoTeacherOpen(true)}
                    className="cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4 mr-1" /> Assign Co-teacher
                  </Button>
                  <Link
                    href={`/dashboard/teacher/students/group/${groupData.id}/analytics`}
                  >
                    <Button variant={"outline"}>
                      <IoAnalytics /> Analytics
                    </Button>
                  </Link>
                </div>
              </div>

              {groupData.description && (
                <p className="text-sm text-muted-foreground">
                  {groupData.description}
                </p>
              )}

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {groupData.type[0] + groupData.type.slice(1).toLowerCase()}
                </Badge>
                {groupData.aiEnabled ? (
                  <Badge className="gap-1 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20">
                    <Bot className="h-3 w-3" />
                    AI Enabled
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1 text-muted-foreground"
                  >
                    <Bot className="h-3 w-3" />
                    AI Disabled
                  </Badge>
                )}
                {groupData.joinByLink && (
                  <Badge variant="outline" className="gap-1">
                    <Link2 className="h-3 w-3" />
                    Join by Link
                  </Badge>
                )}
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {totalMembers || groupMembers?.length || 0} Members
                  </span>
                </div>

                {groupData.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(groupData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {groupData.aiEnabled && (
                  <>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>{groupData.aiMaxMessages} MSG limit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      <span>
                        {groupData.aiMaxTokens.toLocaleString()} token limit
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Members Section */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            {/* Add Member Card */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Add New Members
                </CardTitle>
                <CardDescription>
                  Add comma separated emails and add them to the group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter email address..."
                      value={newEmails}
                      onChange={(e) => setNewEmails(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    className="gap-2 cursor-pointer"
                    onClick={addMembersToGroupFunc}
                    disabled={addingToGroupLoader}
                  >
                    <UserPlus className="h-4 w-4" />
                    {addingToGroupLoader ? "Loading..." : "Add Member"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Members List Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Group Members
                </CardTitle>
                <CardDescription>
                  {totalMembers || groupMembers?.length || 0} members in this
                  group
                </CardDescription>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading || membersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : groupMembers && groupMembers.length > 0 ? (
                  <Accordion type="single" collapsible className="space-y-2">
                    {groupMembers.map((member) => {
                      const stats = studentStats.find(
                        (s) => s.studentId === member.id
                      );
                      return (
                        <AccordionItem
                          key={member.id}
                          value={member.id}
                          className="border rounded-lg px-4 data-[state=open]:bg-muted/30 transition-colors"
                        >
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-4 w-full mr-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.image || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                  {getInitials(member.name || "U")}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0 text-left">
                                <p className="font-semibold text-sm truncate">
                                  {member.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {member.email}
                                </p>
                              </div>

                              <div className="hidden md:flex items-center gap-3 shrink-0">
                                {stats && (
                                  <>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <Trophy className="h-3.5 w-3.5" />
                                      <span>
                                        {stats.avgScore.toFixed(0)} avg
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <FileText className="h-3.5 w-3.5" />
                                      <span>{stats.totalExams} exams</span>
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {member.emailVerified && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Verified
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {member.role}
                                </Badge>
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="ml-2 cursor-pointer"
                                  disabled={removingMemberId === member.id}
                                >
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (removingMemberId !== member.id) {
                                        setMemberToRemove(member);
                                        setConfirmRemoveOpen(true);
                                      }
                                    }}
                                  >
                                    {removingMemberId === member.id
                                      ? "Removing..."
                                      : "Remove"}
                                  </span>
                                </Button>
                              </div>
                            </div>
                          </AccordionTrigger>

                          <AccordionContent>
                            {statsLoading ? (
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1 pb-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                  <Skeleton
                                    key={i}
                                    className="h-24 w-full rounded-lg"
                                  />
                                ))}
                              </div>
                            ) : stats ? (
                              <div className="space-y-3 pt-1 pb-2">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                  {/* Total Score */}
                                  <div className="rounded-lg border bg-card p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10">
                                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        Total Score
                                      </span>
                                    </div>
                                    <p className="text-xl font-bold tracking-tight">
                                      {stats.totalScore}
                                    </p>
                                  </div>

                                  {/* Total Exams */}
                                  <div className="rounded-lg border bg-card p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10">
                                        <FileText className="h-3.5 w-3.5 text-blue-500" />
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        Total Exams
                                      </span>
                                    </div>
                                    <p className="text-xl font-bold tracking-tight">
                                      {stats.totalExams}
                                    </p>
                                  </div>

                                  {/* Avg Score */}
                                  <div className="rounded-lg border bg-card p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10">
                                        <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        Avg Score
                                      </span>
                                    </div>
                                    <p className="text-xl font-bold tracking-tight">
                                      {stats.avgScore.toFixed(1)}
                                    </p>
                                  </div>

                                  {/* Total Attempts */}
                                  <div className="rounded-lg border bg-card p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/10">
                                        <RotateCcw className="h-3.5 w-3.5 text-violet-500" />
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        Total Attempts
                                      </span>
                                    </div>
                                    <p className="text-xl font-bold tracking-tight">
                                      {stats.totalAttempts}
                                    </p>
                                  </div>
                                </div>

                                {/* Score bar */}
                                {stats.totalExams > 0 && (
                                  <div className="flex items-center gap-3 px-1">
                                    <span className="text-xs text-muted-foreground shrink-0">
                                      Performance
                                    </span>
                                    <Progress
                                      value={Math.min(
                                        (stats.avgScore /
                                          (stats.totalScore / stats.totalExams >
                                          0
                                            ? stats.totalScore /
                                              stats.totalExams
                                            : 1)) *
                                          100,
                                        100
                                      )}
                                      className="h-1.5 flex-1"
                                    />
                                    <span className="text-xs font-medium shrink-0">
                                      {stats.avgScore.toFixed(0)} avg
                                    </span>
                                  </div>
                                )}

                                <p className="text-[11px] text-muted-foreground px-1">
                                  Last updated:{" "}
                                  {new Date(stats.updatedAt).toLocaleString()}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <p className="text-sm text-muted-foreground">
                                  No stats available for this student yet.
                                </p>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      {searchValue
                        ? "No members match your search"
                        : "No members in this group yet"}
                    </p>
                  </div>
                )}
              </CardContent>
              {totalMembers > 0 && (
                <div className="px-6 pb-6">
                  <AnalyticsPagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={totalMembers}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    isLoading={membersLoading}
                  />
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Group Exams
                </CardTitle>
                <CardDescription>
                  {groupExams.length} exams linked to this group
                </CardDescription>
              </CardHeader>
              <CardContent>
                {examsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-64" />
                        </div>
                        <Skeleton className="h-9 w-28" />
                      </div>
                    ))}
                  </div>
                ) : groupExams.length > 0 ? (
                  <div className="space-y-3">
                    {groupExams.map((exam) => {
                      const isPublished = exam.isPublished;
                      const actionLabel = isPublished ? "View results" : "Edit";
                      const actionHref = isPublished
                        ? `/dashboard/teacher/tests/results/${exam.id}`
                        : `/dashboard/teacher/tests/edit/${exam.id}`;

                      return (
                        <div
                          key={exam.id}
                          className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3"
                        >
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <p className="font-semibold truncate">
                              {exam.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                {new Date(exam.startDate).toLocaleString()} –{" "}
                                {new Date(exam.endDate).toLocaleString()}
                              </span>
                              <Badge variant="outline" className="capitalize">
                                {isPublished ? "Published" : "Draft"}
                              </Badge>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <Link href={actionHref}>
                              <Button
                                className="cursor-pointer"
                                variant="outline"
                              >
                                {actionLabel}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      No exams linked to this group yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Group Dialog */}
      <Dialog open={showEditGroup} onOpenChange={setShowEditGroup}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Group Details
            </DialogTitle>
            <DialogDescription>
              Update the group name, type, and AI settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="editGroupName">Group Name</Label>
              <Input
                id="editGroupName"
                placeholder="Enter group name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="editGroupDescription">Description</Label>
              <Input
                id="editGroupDescription"
                placeholder="Enter group description (optional)"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
              />
            </div>

            {/* Type + AI Assist in a row */}
            <div className="flex gap-6 items-start">
              {/* Group Type */}
              <div className="space-y-2">
                <Label>Group Type</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-24">
                      {editedType[0] + editedType.slice(1).toLowerCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-32">
                    <DropdownMenuItem onClick={() => setEditedType("CLASS")}>
                      Class
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditedType("LAB")}>
                      Lab
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* AI Assist */}
              <div className="space-y-2">
                <Label>AI Assist</Label>
                <RadioGroup
                  value={editedAiEnabled ? "enable" : "disable"}
                  onValueChange={(v) => setEditedAiEnabled(v === "enable")}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="enable"
                      id="edit-ai-enable"
                      className="cursor-pointer"
                    />
                    <Label htmlFor="edit-ai-enable" className="cursor-pointer">
                      Enable
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="disable"
                      id="edit-ai-disable"
                      className="cursor-pointer"
                    />
                    <Label htmlFor="edit-ai-disable" className="cursor-pointer">
                      Disable
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Animated AI Settings Panel */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                editedAiEnabled ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">
                    AI Settings
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Configure limits for AI Assist
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="editAiMaxMessages">Max Messages</Label>
                    <Input
                      id="editAiMaxMessages"
                      type="number"
                      min={1}
                      value={editedAiMaxMessages}
                      onChange={(e) =>
                        setEditedAiMaxMessages(Number(e.target.value))
                      }
                      placeholder="e.g. 20"
                    />
                    <p className="text-xs text-muted-foreground">
                      Max AI messages per student per exam.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editAiMaxTokens">Max Tokens</Label>
                    <Input
                      id="editAiMaxTokens"
                      type="number"
                      min={1}
                      value={editedAiMaxTokens}
                      onChange={(e) =>
                        setEditedAiMaxTokens(Number(e.target.value))
                      }
                      placeholder="e.g. 2000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Max tokens the AI can use per student per exam.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setShowEditGroup(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="cursor-pointer"
              disabled={savingGroup}
            >
              {savingGroup ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {notFoundStudents.length === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Members Added Successfully
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Partially Successful
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {notFoundStudents.length === 0
                ? "All members have been successfully added to the group."
                : "Some members were added, but the following emails could not be found or added:"}
            </DialogDescription>
          </DialogHeader>

          {notFoundStudents.length > 0 && (
            <div className="mt-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium mb-3">Students Not Found:</p>
                <ul className="space-y-2">
                  {notFoundStudents.map((email, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      {email}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog
        open={confirmRemoveOpen}
        onOpenChange={(open) => {
          setConfirmRemoveOpen(open);
          if (!open) {
            setMemberToRemove(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Remove Student from Group
            </DialogTitle>
            <DialogDescription>
              {memberToRemove ? (
                <span>
                  Are you sure you want to remove{" "}
                  <span className="font-semibold">
                    {memberToRemove.name || memberToRemove.email}
                  </span>{" "}
                  from this group? They will lose access to exams and resources
                  tied to this group.
                </span>
              ) : (
                "Are you sure you want to remove this student from the group?"
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setConfirmRemoveOpen(false);
                setMemberToRemove(null);
              }}
              disabled={!!removingMemberId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              disabled={!memberToRemove || !!removingMemberId}
              onClick={() => {
                if (memberToRemove) {
                  void handleRemoveMember(memberToRemove.id);
                }
              }}
            >
              {removingMemberId ? "Removing..." : "Remove"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Co-teacher Dialog */}
      <Dialog
        open={assignCoTeacherOpen}
        onOpenChange={(open) => {
          setAssignCoTeacherOpen(open);
          if (!open) {
            setCoTeacherEmail("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign Co-teacher
            </DialogTitle>
            <DialogDescription>
              Add another organization teacher as a co-teacher for this group.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="coTeacherEmail">Teacher Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="coTeacherEmail"
                  type="email"
                  placeholder="teacher@example.com"
                  value={coTeacherEmail}
                  onChange={(e) => setCoTeacherEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setAssignCoTeacherOpen(false)}
              disabled={addingCoTeacher}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              onClick={handleAddCoTeacher}
              disabled={addingCoTeacher}
            >
              {addingCoTeacher ? "Assigning..." : "Assign Co-teacher"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Page;
