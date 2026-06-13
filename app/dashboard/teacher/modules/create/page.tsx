"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { getBackendURL } from "@/utils/utilities";

export default function CreateModulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const labId = searchParams.get("labId");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
  const [unlockAt, setUnlockAt] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingWeeks, setExistingWeeks] = useState<number[]>([]);

  useEffect(() => {
    if (!labId) return;
    const fetchModules = async () => {
      try {
        const res = await axios.get(
          `${getBackendURL()}/teacher/labs/${labId}/modules`,
          { withCredentials: true }
        );
        const modules = res.data as any[];
        setExistingWeeks(modules.map((m) => m.weekNumber));
      } catch {
        // ignore
      }
    };
    fetchModules();
  }, [labId]);

  if (!labId) {
    return (
      <div className="w-full h-full animate-fade-left animate-once">
        <SiteHeader name="Create Module" />
        <div className="flex flex-1 flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">No lab selected</p>
          <Button variant="outline" className="mt-3" onClick={() => router.push("/dashboard/teacher/labs")}>
            Go to Labs
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Module title is required");
      return;
    }
    const weekNum = parseInt(weekNumber);
    if (!weekNum || weekNum < 1) {
      toast.error("Valid week number is required");
      return;
    }
    if (existingWeeks.includes(weekNum)) {
      toast.error(`Week ${weekNum} already exists in this lab`);
      return;
    }
    if (unlockAt && dueAt && new Date(unlockAt) >= new Date(dueAt)) {
      toast.error("Unlock date must be before due date");
      return;
    }

    try {
      setSubmitting(true);
      const body: any = {
        title: title.trim(),
        weekNumber: weekNum,
        unlockAt: unlockAt ? new Date(unlockAt).toISOString() : new Date().toISOString(),
      };
      if (description.trim()) body.description = description.trim();
      if (dueAt) body.dueAt = new Date(dueAt).toISOString();

      const res = await axios.post(
        `${getBackendURL()}/teacher/labs/${labId}/modules`,
        body,
        { withCredentials: true }
      );
      const mod = res.data as { id: string };
      toast.success("Module created");
      router.push(`/dashboard/teacher/modules/${mod.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create module");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name="Create Module" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create Module</h1>
                <p className="text-sm text-muted-foreground">
                  Add a weekly module to the lab
                </p>
              </div>
            </div>

            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Module Details</CardTitle>
                <CardDescription>
                  Configure the weekly module and its schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Module Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Week 1 - Arrays"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe this week's topics..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weekNumber">Week Number</Label>
                      <Input
                        id="weekNumber"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={weekNumber}
                        onChange={(e) => setWeekNumber(e.target.value)}
                        required
                      />
                      {existingWeeks.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Existing weeks: {existingWeeks.sort((a, b) => a - b).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unlockAt">Unlock Date</Label>
                      <Input
                        id="unlockAt"
                        type="datetime-local"
                        value={unlockAt}
                        onChange={(e) => setUnlockAt(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueAt">Due Date (optional)</Label>
                      <Input
                        id="dueAt"
                        type="datetime-local"
                        value={dueAt}
                        onChange={(e) => setDueAt(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Spinner variant="infinite" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Module"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
