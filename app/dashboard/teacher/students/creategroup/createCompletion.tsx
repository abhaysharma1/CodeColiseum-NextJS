"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserX,
  UserCheck,
  Users,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CreateGroupResponse {
  notFoundMembers: string[];
  notStudents: { email: string; name: string }[];
  alreadyMembers: { email: string; name: string }[];
  addedCount: number;
  successfullyAdded?: { email: string; name: string }[];
}

interface ApiResponse {
  status: number;
  statusText: string;
  data: CreateGroupResponse;
}

interface CreateCompletionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatingGroup: boolean;
  data: ApiResponse | undefined;
}

function CreateCompletion({
  open,
  onOpenChange,
  creatingGroup,
  data,
}: CreateCompletionProps) {


  // Don't show dialog while loading
  if (creatingGroup) {
    return null;
  }

  return (
    <Dialog open={open && !creatingGroup} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {data?.status === 200 ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Group Created Successfully
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Group Creation Failed
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {data?.status === 200
              ? "Your group has been created. Review the member addition results below."
              : "There was an error creating the group."}
          </DialogDescription>
        </DialogHeader>

        {data && (
          <div className="space-y-4">
            {data.data ? (
              <>
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <Alert variant="default" className="border-green-500/50">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-700 dark:text-green-400">
                      Successfully Added
                    </AlertTitle>
                    <AlertDescription className="text-green-600 dark:text-green-500">
                      {data.data.addedCount} member
                      {data.data.addedCount !== 1 ? "s" : ""}
                    </AlertDescription>
                  </Alert>
                  <Alert variant="default" className="border-orange-500/50">
                    <XCircle className="h-4 w-4 text-orange-500" />
                    <AlertTitle className="text-orange-700 dark:text-orange-400">
                      Failed/Skipped
                    </AlertTitle>
                    <AlertDescription className="text-orange-600 dark:text-orange-500">
                      {(data.data.notFoundMembers?.length ?? 0) +
                        (data.data.notStudents?.length ?? 0) +
                        (data.data.alreadyMembers?.length ?? 0)}{" "}
                      member
                      {(data.data.notFoundMembers?.length ?? 0) +
                        (data.data.notStudents?.length ?? 0) +
                        (data.data.alreadyMembers?.length ?? 0) !==
                      1
                        ? "s"
                        : ""}
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Detailed Results */}
                <div className="space-y-2">
                  <Accordion type="multiple" className="rounded-md border">
                    {/* Successfully Added */}
                    {data.data.addedCount > 0 && (
                      <AccordionItem value="success">
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-semibold text-sm">
                              Successfully Added
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-green-500/10 text-green-700 dark:text-green-400"
                            >
                              {data.data.addedCount}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <p className="text-xs text-muted-foreground mb-3">
                            These students were successfully added to the group
                          </p>
                          {data.data.successfullyAdded &&
                          data.data.successfullyAdded.length > 0 ? (
                            <ScrollArea className="max-h-[200px]">
                              <div className="space-y-1 pr-4">
                                {data.data.successfullyAdded.map(
                                  (student, index) => (
                                    <div
                                      key={index}
                                      className="text-sm bg-green-500/5 px-3 py-2 rounded-md flex items-center gap-2 border border-green-500/20"
                                    >
                                      <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                                      <div className="flex flex-col min-w-0">
                                        <span className="font-medium truncate">
                                          {student.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate">
                                          {student.email}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </ScrollArea>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {data.data.addedCount} student
                              {data.data.addedCount !== 1 ? "s" : ""}{" "}
                              successfully added.
                            </p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Not Found Members */}
                    {(data.data.notFoundMembers?.length ?? 0) > 0 && (
                      <AccordionItem value="notfound">
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <UserX className="h-4 w-4 text-orange-500" />
                            <span className="font-semibold text-sm">
                              Users Not Found
                            </span>
                            <Badge variant="secondary">
                              {data.data.notFoundMembers?.length ?? 0}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <p className="text-xs text-muted-foreground mb-3">
                            These email addresses don't have accounts in the
                            system
                          </p>
                          <ScrollArea className="max-h-[200px]">
                            <div className="space-y-1 pr-4">
                              {data.data.notFoundMembers?.map(
                                (email, index) => (
                                  <div
                                    key={index}
                                    className="text-sm bg-muted/50 px-3 py-2 rounded-md flex items-center gap-2"
                                  >
                                    <AlertCircle className="h-3 w-3 text-orange-500 shrink-0" />
                                    <span className="truncate">{email}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Not Students */}
                    {(data.data.notStudents?.length ?? 0) > 0 && (
                      <AccordionItem value="notstudents">
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-orange-500" />
                            <span className="font-semibold text-sm">
                              Not Student Accounts
                            </span>
                            <Badge variant="secondary">
                              {data.data.notStudents?.length ?? 0}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <p className="text-xs text-muted-foreground mb-3">
                            These users exist but are not registered as students
                          </p>
                          <ScrollArea className="max-h-[200px]">
                            <div className="space-y-1 pr-4">
                              {data.data.notStudents?.map((student, index) => (
                                <div
                                  key={index}
                                  className="text-sm bg-muted/50 px-3 py-2 rounded-md flex items-center gap-2"
                                >
                                  <AlertCircle className="h-3 w-3 text-orange-500 shrink-0" />
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-medium truncate">
                                      {student.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">
                                      {student.email}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Already Members */}
                    {(data.data.alreadyMembers?.length ?? 0) > 0 && (
                      <AccordionItem value="already">
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-sm">
                              Already Members
                            </span>
                            <Badge variant="secondary">
                              {data.data.alreadyMembers?.length ?? 0}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <p className="text-xs text-muted-foreground mb-3">
                            These users were already members of the group
                          </p>
                          <ScrollArea className="max-h-[200px]">
                            <div className="space-y-1 pr-4">
                              {data.data.alreadyMembers?.map(
                                (student, index) => (
                                  <div
                                    key={index}
                                    className="text-sm bg-muted/50 px-3 py-2 rounded-md flex items-center gap-2"
                                  >
                                    <AlertCircle className="h-3 w-3 text-blue-500 shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-medium truncate">
                                        {student.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground truncate">
                                        {student.email}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </div>
              </>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {data.statusText ||
                    "Failed to create group. Please try again."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CreateCompletion;
