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
} from "lucide-react";
import { getBackendURL } from "@/utils/utilities";
import { router } from "better-auth/api";
import { useRouter } from "next/navigation";

function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [groupData, setGroupData] = useState<Group | undefined>();
  const [groupMembers, setGroupMembers] = useState<User[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [newEmails, setNewEmails] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notFoundStudents, setNotFoundStudents] = useState<string[]>([]);

  const [addingToGroupLoader, setAddingToGroupLoader] = useState(false);

  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedType, setEditedType] = useState<string>("CLASS");
  const [editedAiEnabled, setEditedAiEnabled] = useState(false);
  const [editedAiMaxMessages, setEditedAiMaxMessages] = useState(20);
  const [editedAiMaxTokens, setEditedAiMaxTokens] = useState(2000);

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

  const getMembers = async () => {
    try {
      const res = await axios.get(
        `${getBackendURL()}/teacher/getgroupmembers`,
        {
          params: {
            groupId: id,
          },
          withCredentials: true,
        }
      );
      setGroupMembers(res.data as User[]);
    } catch (error) {
      if (typeof error == "string") {
        toast.error(error);
      }
      console.log(error);
    } finally {
      setLoading(false);
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

      await getMembers();
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
      getMembers();
    }
  }, [groupData]);

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

  const handleSaveEdit = () => {
    // Backend integration will be added here
    toast.success("Changes will be saved (backend not implemented yet)");
    setShowEditGroup(false);
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
              <div className="flex items-center gap-3">
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
                  <span>{groupMembers?.length || 0} Members</span>
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
        {/* Add Member Card */}
        <Card className="mb-6 border-dashed">
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
              {groupMembers?.length || 0} members in this group
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
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
              <div className="divide-y">
                {groupMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 py-4 hover:bg-accent/50 transition-colors rounded-lg px-4 -mx-4"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(member.name || "U")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base truncate">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {member.emailVerified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  No members in this group yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
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
            <Button onClick={handleSaveEdit} className="cursor-pointer">
              Save Changes
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
    </div>
  );
}

export default Page;
