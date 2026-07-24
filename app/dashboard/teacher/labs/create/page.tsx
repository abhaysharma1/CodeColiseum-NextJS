"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Bot, Shield } from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { getBackendURL } from "@/utils/utilities";

export default function CreateLabPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiMaxMessages, setAiMaxMessages] = useState(20);
  const [aiMaxTokens, setAiMaxTokens] = useState(2000);
  const [sebEnabled, setSebEnabled] = useState(false);
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
        {
          title: title.trim(),
          description: description.trim() || undefined,
          aiEnabled,
          aiMaxMessages: aiEnabled ? aiMaxMessages : undefined,
          aiMaxTokens: aiEnabled ? aiMaxTokens : undefined,
          sebEnabled,
        },
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
                        <RadioGroupItem value="enable" id="lab-ai-enable" className="cursor-pointer" />
                        <Label htmlFor="lab-ai-enable" className="cursor-pointer">Enable</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="disable" id="lab-ai-disable" className="cursor-pointer" />
                        <Label htmlFor="lab-ai-disable" className="cursor-pointer">Disable</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      Allow students to use AI Assist chat while solving module problems.
                    </p>
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
                          <Label htmlFor="aiMaxMessages">Max Messages</Label>
                          <Input
                            id="aiMaxMessages"
                            type="number"
                            min={1}
                            max={50}
                            value={aiMaxMessages}
                            onChange={(e) => setAiMaxMessages(Number(e.target.value))}
                            placeholder="e.g. 20"
                          />
                          <p className="text-xs text-muted-foreground">Maximum AI messages per student per problem.</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="aiMaxTokens">Max Tokens</Label>
                          <Input
                            id="aiMaxTokens"
                            type="number"
                            min={50}
                            max={10000}
                            value={aiMaxTokens}
                            onChange={(e) => setAiMaxTokens(Number(e.target.value))}
                            placeholder="e.g. 2000"
                          />
                          <p className="text-xs text-muted-foreground">Maximum total tokens per student per problem.</p>
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
                        <RadioGroupItem value="enable" id="lab-seb-enable" className="cursor-pointer" />
                        <Label htmlFor="lab-seb-enable" className="cursor-pointer">Enable</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="disable" id="lab-seb-disable" className="cursor-pointer" />
                        <Label htmlFor="lab-seb-disable" className="cursor-pointer">Disable</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      Safe Exam Browser provides a secure testing environment by limiting access to other applications and websites during lab work.
                    </p>
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
