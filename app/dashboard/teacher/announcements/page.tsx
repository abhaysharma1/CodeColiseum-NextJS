"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/authcontext";
import { useSentNotifications } from "@/hooks/useSentNotifications";
import { NotificationType, NotificationPriority } from "@/lib/notifications";
import { getBackendURL } from "@/utils/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";

type Group = {
  id: string;
  name: string;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function TeacherAnnouncementsPage() {
  const { user } = useAuth();

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<NotificationPriority>("NORMAL");
  const [sending, setSending] = useState(false);

  const [page, setPage] = useState(1);
  const {
    sent,
    pagination,
    loading: sentLoading,
    refresh,
  } = useSentNotifications({ page, limit: 10, type: "ANNOUNCEMENT" });

  const allSelected = useMemo(
    () => groups.length > 0 && selectedGroupIds.length === groups.length,
    [groups.length, selectedGroupIds.length]
  );

  useEffect(() => {
    const loadGroups = async () => {
      if (!user?.id) return;
      try {
        setGroupsLoading(true);
        const res = await axios.get<Group[]>(
          `${getBackendURL()}/teacher/getallgroups`,
          {
            withCredentials: true,
          }
        );
        setGroups(res.data || []);
      } catch (err) {
        console.error("Failed to load groups for announcements", err);
      } finally {
        setGroupsLoading(false);
      }
    };

    loadGroups();
  }, [user?.id]);

  const toggleGroup = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedGroupIds([]);
    } else {
      setSelectedGroupIds(groups.map((g) => g.id));
    }
  };

  const canSend =
    title.trim().length > 0 &&
    message.trim().length > 0 &&
    selectedGroupIds.length > 0 &&
    !sending;

  const handleSend = async () => {
    if (!canSend) return;

    try {
      setSending(true);
      await axios.post(
        `${getBackendURL()}/api/notifications`,
        {
          title: title.trim(),
          message: message.trim(),
          type: "ANNOUNCEMENT" as NotificationType,
          priority,
          groupIds: selectedGroupIds,
        },
        {
          withCredentials: true,
        }
      );
      toast.success("Announcement sent");
      setTitle("");
      setMessage("");
      setSelectedGroupIds([]);
      refresh();
    } catch (err) {
      console.error("Failed to send announcement", err);
      toast.error("Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  const totalPages = pagination?.pages ?? 1;

  return (
    <div>
      <SiteHeader name="Announcements" />
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {/* Announcements */}
            </h1>
            <p className="text-sm text-muted-foreground">
              Send custom notifications to multiple groups and review your past
              announcements.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Card className="flex flex-col gap-4 p-4">
            <h2 className="text-sm font-semibold">New announcement</h2>

            <div className="space-y-2">
              <label className="block text-xs font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Exam update, class notice, ..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Write a clear, concise announcement for your students."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium">Priority</label>
              <Tabs
                value={priority}
                onValueChange={(v) => setPriority(v as NotificationPriority)}
              >
                <TabsList>
                  <TabsTrigger value="LOW">Low</TabsTrigger>
                  <TabsTrigger value="NORMAL">Normal</TabsTrigger>
                  <TabsTrigger value="HIGH">High</TabsTrigger>
                  <TabsTrigger value="URGENT">Urgent</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Target groups</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={toggleAll}
                  disabled={groupsLoading || groups.length === 0}
                >
                  {allSelected ? "Clear all" : "Select all"}
                </Button>
              </div>
              <ScrollArea className="h-40 rounded-md border">
                <div className="space-y-1 p-2 text-xs">
                  {groupsLoading && (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-3/4" />
                      ))}
                    </div>
                  )}
                  {!groupsLoading && groups.length === 0 && (
                    <div className="py-4 text-center text-muted-foreground">
                      No groups found.
                    </div>
                  )}
                  {!groupsLoading &&
                    groups.map((g) => {
                      const selected = selectedGroupIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleGroup(g.id)}
                          className={`flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-muted ${
                            selected ? "bg-muted" : ""
                          }`}
                        >
                          <span>{g.name}</span>
                          {selected && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </button>
                      );
                    })}
                </div>
              </ScrollArea>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSend} disabled={!canSend}>
                {sending ? "Sending..." : "Send announcement"}
              </Button>
            </div>
          </Card>

          <Card className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">Previously sent</h2>
                <p className="text-xs text-muted-foreground">
                  Announcements you&apos;ve sent to your groups.
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2 p-4 text-sm">
                {sentLoading && (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    ))}
                  </div>
                )}

                {!sentLoading && sent.length === 0 && (
                  <div className="py-10 text-center text-xs text-muted-foreground">
                    No announcements sent yet.
                  </div>
                )}

                {!sentLoading &&
                  sent.map((n) => (
                    <div
                      key={n.id}
                      className="flex flex-col gap-1 rounded-md border px-3 py-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{n.title}</span>
                          <Badge
                            variant={
                              n.priority === "HIGH" || n.priority === "URGENT"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {n.priority}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {n.message}
                        </p>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          {n.type}
                        </Badge>
                        <span>Sent to {n.recipientsCount} recipients</span>
                        <span>• {formatDate(n.createdAt)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>

            {pagination && totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
                <span>
                  Page {pagination.page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || sentLoading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || sentLoading}
                    onClick={() =>
                      setPage((p) =>
                        totalPages ? Math.min(totalPages, p + 1) : p + 1
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
