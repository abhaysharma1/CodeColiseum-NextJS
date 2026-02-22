"use client";

import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState, useTransition, use } from "react";

import { CalendarIcon, Clock, Save, Send, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AutoCompleteSearchBar from "@/components/fuzzySearchBar";
import { toast } from "sonner";
import ProblemsTestTable from "./problemsTestTable";
import { Exam } from "@/generated/prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getBackendURL } from "@/utils/utilities";

interface Group {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  noOfMembers: number;
  joinByLink: boolean;
  createdAt: Date;
}

export interface ExamProblem {
  id: string;
  order: number;
  examId: string;
  problemId: string;
}

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const merged = new Date(date);
  merged.setHours(hours);
  merged.setMinutes(minutes);
  merged.setSeconds(0);
  merged.setMilliseconds(0);

  return merged;
}

function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = use(params);

  const [groups, setGroups] = useState<Group[] | undefined>();

  const [startDateOpen, setStartDateOpen] = React.useState(false);
  const [endDateOpen, setEndDateOpen] = React.useState(false);

  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = React.useState<string | undefined>(
    undefined
  );

  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = React.useState<string | undefined>(undefined);

  const [examDetails, setExamDetails] = useState<Exam | undefined>();
  const [selectedGroups, setSelectedGroups] = useState<Group[] | undefined>([]);

  const [selectedProblemsId, setSelectedProblemsId] = useState<
    string[] | undefined
  >();

  const [isLoading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [searchedGroup, setSearchedGroup] = useState<Group | undefined>();

  const [savingDraft, startSavingDraftTransition] = useTransition();
  const [publishingTest, startPublishingTestTransition] = useTransition();

  const router = useRouter();

  const changeDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExamDetails((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const deleteGroup = (id: string) => {
    setSelectedGroups((prev) => prev?.filter((grp) => grp.id != id));
  };

  const addGroupToSelected = () => {
    if (!searchedGroup || !searchedGroup.id) {
      toast.error("Please Select a Group to add");
      return;
    }
    const finding = selectedGroups?.find(
      (item) => item.id === searchedGroup.id
    );

    if (finding) {
      toast.error("Group Already Added");
      return;
    }

    setSelectedGroups((prev) =>
      prev ? [...prev, searchedGroup] : [searchedGroup]
    );

    setSearchedGroup(undefined);
  };

  const saveDraftFunc = async () => {
    if (!examDetails || !startDate || !endDate || !startTime || !endTime)
      return;

    if (examDetails.isPublished) {
      toast.error("Published Exam cannot be Edited");
      return;
    }
    if (startDate > endDate) {
      toast.error("Start Date must be < End Date");
      return;
    }

    const combinedStartDateTime = combineDateAndTime(startDate, startTime);
    const combinedEndDateTime = combineDateAndTime(endDate, endTime);

    const updatedExamDetails = {
      ...examDetails,
      startDate: combinedStartDateTime,
      endDate: combinedEndDateTime,
    };

    setExamDetails(updatedExamDetails);

    if (updatedExamDetails && selectedGroups && selectedProblemsId) {
      try {
        const domain = getBackendURL();
        const res = await axios.post(
          `${domain}/teacher/exam/savedraft`,
          {
            updatedExamDetails,
            selectedGroups,
            selectedProblemsId,
          },
          {
            withCredentials: true,
          }
        );

        toast.success("Draft saved");
      } catch (error) {
        toast.error("Couldn't save the draft");
      }
    } else {
      toast.error("Please Select Groups, Problems");
    }
  };

  const publishTestFunc = async () => {
    if (!examDetails || !startDate || !endDate || !startTime || !endTime)
      return;

    if (examDetails.isPublished) {
      toast.error("Published Exam cannot be Edited");
      return;
    }

    if (startDate > endDate) {
      toast.error("Start Date must be < End Date");
      return;
    }

    const combinedStartDateTime = combineDateAndTime(startDate, startTime);
    const combinedEndDateTime = combineDateAndTime(endDate, endTime);

    const updatedExamDetails = {
      ...examDetails,
      startDate: combinedStartDateTime,
      endDate: combinedEndDateTime,
    };

    setExamDetails(updatedExamDetails);

    if (updatedExamDetails && selectedGroups && selectedProblemsId) {
      try {
        const domain = getBackendURL();
        const res = await axios.post(
          `${domain}/teacher/exam/publishexam`,
          {
            updatedExamDetails,
            selectedGroups,
            selectedProblemsId,
          },
          {
            withCredentials: true,
          }
        );
        toast.success("Test Published");
        router.push("/dashboard");
      } catch (error) {
        toast.error("Couldn't publish the test");
      }
    } else {
      toast.error("Please Select Groups, Problems");
    }
  };

  const fetchExam = async (examId: string) => {
    try {
      const domain = getBackendURL();
      const res = await axios.get(`${domain}/teacher/exam/getexam`, {
        params: {
          examId: examId,
        },
        withCredentials: true,
      });
      return res.data as Exam;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    async function getExamDetails() {
      setLoading(true);
      const data = await fetchExam(examId);
      if (!data) return;

      // Convert startDate and endDate to Date objects
      data.startDate = new Date(data.startDate);
      data.endDate = new Date(data.endDate);

      setExamDetails(data);
      setStartDate(data.startDate);
      const startHours = String(data.startDate.getHours()).padStart(2, "0");
      const startMinutes = String(data.startDate.getMinutes()).padStart(2, "0");
      const startSeconds = String(data.startDate.getSeconds()).padStart(2, "0");
      setStartTime(`${startHours}:${startMinutes}:${startSeconds}`);
      setEndDate(data.endDate);
      const endHours = String(data.endDate.getHours()).padStart(2, "0");
      const endMinutes = String(data.endDate.getMinutes()).padStart(2, "0");
      const endSeconds = String(data.endDate.getSeconds()).padStart(2, "0");
      setEndTime(`${endHours}:${endMinutes}:${endSeconds}`);
      setLoading(false);
    }
    async function getGroups() {
      try {
        setLoadingGroups(true);
        const domain = getBackendURL();
        const res = await axios.get(`${domain}/teacher/exam/getallgroups`, {
          params: {
            examId: examId,
          },
          withCredentials: true,
        });
        setGroups(res.data as Group[]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingGroups(false);
      }
    }
    getExamDetails();
    getGroups();
  }, []);

  useEffect(() => {
    async function fetchSelectedGroups() {
      if (examDetails && examDetails.id) {
        const domain = getBackendURL();
        const res = await axios.get(`${domain}/teacher/exam/getallexamgroups`, {
          params: {
            examId: examId,
          },
          withCredentials: true,
        });
        setSelectedGroups(res.data as Group[]);
      }
    }

    async function fetchSelectedProblems() {
      if (examDetails && examDetails.id) {
        try {
          const domain = getBackendURL();
          const res = await axios.get(
            `${domain}/teacher/exam/getallexamproblem`,
            {
              params: {
                examId: examId,
              },
              withCredentials: true,
            }
          );

          const data = res.data as ExamProblem[];

          if (data.length > 0) {
            const onlyIds = data.map((item: any) => item.problemId);
            setSelectedProblemsId(onlyIds);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    fetchSelectedProblems();
    fetchSelectedGroups();
  }, [examDetails]);

  return (
    <div className="container ">
      <SiteHeader name="Edit Test" />
      {isLoading || loadingGroups ? (
        <div className="flex items-center justify-center ">
          <Spinner variant="infinite" />
        </div>
      ) : (
        <div className="px-4 py-8 max-w-7xl overflow-y-scroll">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Details</CardTitle>
                <CardDescription>
                  Configure the basic information for your test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title</Label>
                  <Input
                    id="title"
                    value={examDetails?.title || ""}
                    name="title"
                    onChange={changeDetails}
                    placeholder="Enter test title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={examDetails?.description || ""}
                    name="description"
                    onChange={(e) =>
                      setExamDetails((prev) =>
                        prev ? { ...prev, description: e.target.value } : prev
                      )
                    }
                    placeholder="Provide a description for this test"
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Safe Exam Browser (SEB)</Label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sebEnabled"
                        checked={examDetails?.sebEnabled === true}
                        onChange={() =>
                          setExamDetails((prev) =>
                            prev ? { ...prev, sebEnabled: true } : prev
                          )
                        }
                        className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Enable SEB</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sebEnabled"
                        checked={examDetails?.sebEnabled === false}
                        onChange={() =>
                          setExamDetails((prev) =>
                            prev ? { ...prev, sebEnabled: false } : prev
                          )
                        }
                        className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Disable SEB</span>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Safe Exam Browser provides a secure testing environment by
                    limiting access to other applications and websites during
                    the exam.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule & Duration</CardTitle>
                <CardDescription>
                  Set the test timing and duration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
                  <div className="space-y-3">
                    <Label>Start Date & Time</Label>
                    <div className="flex gap-2">
                      <Popover
                        open={startDateOpen}
                        onOpenChange={setStartDateOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 justify-start font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate
                              ? startDate.toLocaleDateString()
                              : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              setStartDate(date);
                              setStartDateOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="time"
                        step="1"
                        value={startTime ?? "10:30:00"}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>End Date & Time</Label>
                    <div className="flex gap-2">
                      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 justify-start font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate
                              ? endDate.toLocaleDateString()
                              : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              setEndDate(date);
                              setEndDateOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="time"
                        step="1"
                        value={endTime ?? "10:30:00"}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <div className="pt-[44px]">
                      <Input
                        id="duration"
                        type="text"
                        placeholder="e.g. 120"
                        value={examDetails?.durationMin || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d+$/.test(value)) {
                            setExamDetails((prev) =>
                              prev
                                ? { ...prev, durationMin: parseInt(value) || 0 }
                                : prev
                            );
                          }
                        }}
                        onKeyPress={(e) => {
                          if (!/\d/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Problems Selection</CardTitle>
                <CardDescription>Choose problems for this test</CardDescription>
              </CardHeader>
              <CardContent>
                <ProblemsTestTable
                  selectedProblemsId={selectedProblemsId}
                  setSelectedProblemsId={setSelectedProblemsId}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Allowed Groups
                </CardTitle>
                <CardDescription>
                  Select which groups can access this test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  {groups ? (
                    <div className="flex-1">
                      <AutoCompleteSearchBar
                        groups={groups}
                        setSearchedGroup={setSearchedGroup}
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="h-10 animate-pulse bg-muted rounded-md" />
                    </div>
                  )}
                  <Button
                    variant="secondary"
                    onClick={addGroupToSelected}
                    disabled={!searchedGroup}
                  >
                    Add Group
                  </Button>
                </div>

                {selectedGroups && selectedGroups.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                      {selectedGroups.map((group) => (
                        <Card key={group.id} className="border-muted">
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">
                                  {group.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {group.noOfMembers} members
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteGroup(group.id)}
                              className="text-destructive hover:text-destructive flex-shrink-0 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button
                variant="outline"
                size="lg"
                disabled={savingDraft || examDetails?.isPublished}
                onClick={() =>
                  startSavingDraftTransition(() => saveDraftFunc())
                }
                className="w-full sm:w-auto"
              >
                {savingDraft ? (
                  <>
                    <Spinner variant="infinite" className="mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </>
                )}
              </Button>
              <Button
                size="lg"
                disabled={publishingTest || examDetails?.isPublished}
                onClick={() =>
                  startPublishingTestTransition(() => publishTestFunc())
                }
                className="w-full sm:w-auto"
              >
                {publishingTest ? (
                  <>
                    <Spinner variant="infinite" className="mr-2 h-4 w-4" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publish Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
