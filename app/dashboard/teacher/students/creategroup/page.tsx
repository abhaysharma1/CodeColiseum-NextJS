"use client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { Textarea } from "@/components/ui/textarea";
import { UploadIcon, FileText, X } from "lucide-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import CreateCompletion from "./createCompletion";

interface newgroupdataprops {
  groupName: string;
  description: string;
  emails: string[];
  allowJoinByLink: boolean;
}

interface CreateGroupResponse {
  notFoundMembers: string[];
  notStudents: { email: string; name: string }[];
  alreadyMembers: { email: string; name: string }[];
  addedCount: number;
  successfullyAdded: { email: string; name: string }[];
}
interface ApiResponse {
  status: number;
  statusText: string;
  data: CreateGroupResponse;
}

function CreateGroup() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [fileUploadDisabled, setFileUploadDisabled] = useState(false);
  const [textDisabled, setTextDisabled] = useState(false);

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[] | undefined>();
  const [textEmailField, setTextEmailField] = useState<string | undefined>( // Value from email text field
    undefined
  );

  const [response, setResponse] = useState<ApiResponse>();

  const [newGroupData, setNewGroupData] = useState<newgroupdataprops>({
    groupName: "",
    description: "",
    emails: [] as string[],
    allowJoinByLink: true,
  });

  useEffect(() => {
    if (files) {
      setTextDisabled(true);
    } else {
      setTextDisabled(false);
    }
    if (textEmailField) {
      setFileUploadDisabled(true);
    } else {
      setFileUploadDisabled(false);
    }
  }, [files, textEmailField]);

  useEffect(() => {
    if (textEmailField) {
      // Split by newlines or commas and clean up
      const emails = textEmailField
        .split(/[\n,]/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0);
      setNewGroupData((prev) => ({ ...prev, emails: emails }));
    } else {
      // Clear emails when text field is cleared (unless file is uploaded)
      if (!files) {
        setNewGroupData((prev) => ({ ...prev, emails: [] }));
      }
    }
  }, [textEmailField, files]);

  const checkEmpty = () => {
    if (!newGroupData.groupName) {
      toast.error("Please Enter Group Name");
      return false;
    }
    if (!newGroupData.description) {
      toast.error("Please Enter Group Description");
      return false;
    }
    if (!newGroupData.emails || newGroupData.emails.length === 0) {
      toast.error("Please Provide Emails");
      return false;
    }
    return true;
  };

  const createNewGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkEmpty()) {
      return;
    }
    setLoading(true);
    setDialogOpen(true);
    try {
      const apiResponse = await axios.post(
        "/api/teacher/creategroup",
        newGroupData
      );
        setResponse(apiResponse as ApiResponse);
        toast.success("Group created successfully");
        console.log("Group creation result:", apiResponse.data);
        
        // Reset form after successful creation
        setNewGroupData({
          groupName: "",
          description: "",
          emails: [],
          allowJoinByLink: true,
        });
        setTextEmailField(undefined);
        setFiles(undefined);
      }
    catch (error) {
     console.log(error);
      toast.error("Failed to create group");
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (files: File[]) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setFiles([file]);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;

      // Split by newlines or commas
      const emails = text
        .split(/[\n,]/) // split on newline or comma
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      setNewGroupData((prev) => ({ ...prev, emails: emails }));
    };

    reader.readAsText(file);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    event.preventDefault();
    const { name, value } = event.target;
    setNewGroupData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen">
      <CreateCompletion 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        creatingGroup={loading} 
        data={response} 
      />
      
      <div className="w-full">
        <SiteHeader name={"Create a Group"} />
      </div>
      
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Group Information</CardTitle>
            <CardDescription>
              Create a new student group and add members via email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createNewGroup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="Enter group name"
                  onChange={handleChange}
                  name="groupName"
                  value={newGroupData.groupName}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter group description"
                    name="description"
                    onChange={handleChange}
                    value={newGroupData.description}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Join Settings</Label>
                  <Card className="p-4">
                    <RadioGroup
                      defaultValue="enable"
                      onValueChange={(value) =>
                        setNewGroupData((prev) => ({
                          ...prev,
                          allowJoinByLink: value === "enable",
                        }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enable" id="enable" />
                        <Label htmlFor="enable" className="font-normal cursor-pointer">
                          Allow joining by link/ID
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="disable" id="disable" />
                        <Label htmlFor="disable" className="font-normal cursor-pointer">
                          Invite only
                        </Label>
                      </div>
                    </RadioGroup>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Add Student Emails</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter emails manually or upload a CSV file
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Textarea
                      disabled={textDisabled}
                      placeholder="Enter emails separated by commas or new lines&#10;example@email.com, another@email.com"
                      value={textEmailField || ""}
                      onChange={(event) => setTextEmailField(event.target.value)}
                      rows={6}
                    />
                    {textEmailField && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {newGroupData.emails.length} emails detected
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTextEmailField(undefined);
                            if (!files) {
                              setNewGroupData(prev => ({ ...prev, emails: [] }));
                            }
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>

                  <Dropzone
                    disabled={fileUploadDisabled}
                    className="h-full min-h-[150px]"
                    accept={{
                      "text/csv": [],
                      "application/vnd.ms-excel": [],
                      "text/plain": [],
                    }}
                    maxFiles={1}
                    onDrop={handleDrop}
                  >
                    <DropzoneEmptyState>
                      <div className="flex flex-col items-center justify-center gap-2 py-8">
                        {!files ? (
                          <>
                            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                              <UploadIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-sm">Upload CSV file</p>
                              <p className="text-muted-foreground text-xs mt-1">
                                Drag and drop or click to browse
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                              <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-sm">{files[0].name}</p>
                              <Badge variant="secondary" className="mt-2">
                                {newGroupData.emails.length} emails found
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFiles(undefined);
                                if (!textEmailField) {
                                  setNewGroupData(prev => ({ ...prev, emails: [] }));
                                }
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </>
                        )}
                      </div>
                    </DropzoneEmptyState>
                    <DropzoneContent />
                  </Dropzone>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNewGroupData({
                      groupName: "",
                      description: "",
                      emails: [],
                      allowJoinByLink: true,
                    });
                    setTextEmailField(undefined);
                    setFiles(undefined);
                  }}
                >
                  Reset
                </Button>
                <Button disabled={loading} type="submit">
                  {loading ? "Creating Group..." : "Create Group"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateGroup;
