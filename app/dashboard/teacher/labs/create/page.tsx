"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

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
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { getBackendURL } from "@/utils/utilities";

export default function CreateLabPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Lab name is required");
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post(
        `${getBackendURL()}/teacher/labs`,
        { title: title.trim(), description: description.trim() || undefined },
        { withCredentials: true }
      );
      const lab = res.data as { id: string };
      toast.success("Lab created successfully");
      router.push(`/dashboard/teacher/labs/${lab.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create lab");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name="Create Lab" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create Lab</h1>
                <p className="text-sm text-muted-foreground">
                  Create a new lab with weekly modules
                </p>
              </div>
            </div>

            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Lab Details</CardTitle>
                <CardDescription>
                  Enter the basic information for your lab
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Lab Name</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Data Structures Lab"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the lab and its objectives..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Spinner variant="infinite" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Lab"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
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
