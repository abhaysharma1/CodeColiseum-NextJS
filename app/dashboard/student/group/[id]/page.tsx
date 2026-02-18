"use client";
import { getCreatorData } from "@/app/actions/student/groups/getCreatorData";
import { getGroupData } from "@/app/actions/student/groups/getGroupData";
import { getGroupExams } from "@/app/actions/student/groups/getGroupExams";
import { SiteHeader } from "@/components/site-header";
import { Exam, Group, User } from "@/generated/prisma/client";
import Error from "next/error";
import React, { useEffect, useState, use } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [groupData, setGroupData] = useState<Group | undefined>();
  const [groupExams, setGroupExams] = useState<Exam[] | undefined>();
  const [creatorData, setCreatorData] = useState<User | undefined>();
  const [loadingGroupData, setLoadingGroupData] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const router = useRouter();

  const getGroupDataFunc = async () => {
    try {
      setLoadingGroupData(true);
      const data = await getGroupData(id);
      setGroupData(data);
    } catch (error: any) {
      if (typeof error.message == "string") {
        toast.error(error.message);
      }
      console.log(error);
    } finally {
      setLoadingGroupData(false);
    }
  };

  const getGroupExamsFunc = async () => {
    if (!groupData) {
      return;
    }
    try {
      const data = await getGroupExams(groupData.id);
      setGroupExams(data);
    } catch (error: any) {
      if (typeof error.message == "string") {
        toast.error(error.message);
      }
      console.log(error);
    }
  };

  const getCreatorDataFunc = async () => {
    if (!groupData) {
      return;
    }
    try {
      const data = await getCreatorData(groupData.id);
      setCreatorData(data);
    } catch (error: any) {
      if (typeof error.message == "string") {
        toast.error(error.message);
      }
      console.log(error);
    }
  };

  useEffect(() => {
    getGroupExamsFunc();
    getCreatorDataFunc();
  }, [groupData]);

  useEffect(() => {
    getGroupDataFunc();
  }, []);

  // Pagination logic
  const totalPages = groupExams ? Math.ceil(groupExams.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExams = groupExams ? groupExams.slice(startIndex, endIndex) : [];

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Reset to page 1 when exams change
  useEffect(() => {
    setCurrentPage(1);
  }, [groupExams]);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader
        name={loadingGroupData ? "Loading..." : `${groupData?.name}`}
      />

      <div className="container mx-auto px-4 py-8 space-y-6 overflow-y-scroll">
        {/* Group Header Section */}
        {loadingGroupData ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </CardHeader>
          </Card>
        ) : (
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl font-bold mb-2">
                    {groupData?.name || "Group"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {groupData?.description || "No description available"}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      Group Code:{" "}
                      <span className="font-mono font-semibold">
                        {groupData?.id}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Creator Info */}
                {creatorData && (
                  <Card className="w-fit h-fit">
                    <CardContent className="">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={creatorData.image || ""}
                            alt={creatorData.name || "Creator"}
                          />
                          <AvatarFallback>
                            {creatorData.name?.charAt(0).toUpperCase() || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Created by
                          </p>
                          <p className="font-semibold">
                            {creatorData.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Exams Table Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Exams</CardTitle>
                <CardDescription>
                  {groupExams?.length || 0} exam
                  {groupExams?.length !== 1 ? "s" : ""} available in this group
                  {totalPages > 0 && (
                    <span className="ml-2">
                      • Page {currentPage} of {totalPages}
                    </span>
                  )}
                </CardDescription>
              </div>
              {groupExams && groupExams.length > itemsPerPage && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!groupExams ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : groupExams.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No exams available in this group yet</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Exam Name</TableHead>
                      <TableHead className="font-semibold">
                        Description
                      </TableHead>
                      <TableHead className="font-semibold">
                        Time Allowed
                      </TableHead>
                      <TableHead className="font-semibold">
                        Start Date
                      </TableHead>
                      <TableHead className="font-semibold">End Date</TableHead>
                      <TableHead className="font-semibold text-center">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentExams.map((exam) => {
                      const now = new Date();
                      const startDate = exam.startDate
                        ? new Date(exam.startDate)
                        : null;
                      const endDate = exam.endDate
                        ? new Date(exam.endDate)
                        : null;

                      let status = "Scheduled";
                      let statusVariant:
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline" = "secondary";

                      if (startDate && endDate) {
                        if (now < startDate) {
                          status = "Upcoming";
                          statusVariant = "outline";
                        } else if (now >= startDate && now <= endDate) {
                          status = "Active";
                          statusVariant = "default";
                        } else {
                          status = "Completed";
                          statusVariant = "secondary";
                        }
                      }

                      return (
                        <TableRow key={exam.id} className="hover:bg-muted/50 ">
                          <TableCell className="font-medium">
                            {exam.title}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {exam.description || "No description"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {exam.durationMin
                                  ? `${exam.durationMin} min`
                                  : "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <div className="text-sm">
                                <div>{formatDate(exam.startDate)}</div>
                                <div className="text-muted-foreground text-xs">
                                  {formatTime(exam.startDate)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <div className="text-sm">
                                <div>{formatDate(exam.endDate)}</div>
                                <div className="text-muted-foreground text-xs">
                                  {formatTime(exam.endDate)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={statusVariant}>{status}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {endDate && endDate < now ? (
                              <Button
                                variant={"outline"}
                                className="h-7 "
                                onClick={() =>
                                  router.push(
                                    `/dashboard/student/seeresults/${exam.id}`,
                                  )
                                }
                              >
                                See Result
                              </Button>
                            ) : startDate && startDate < now ? (
                              <Button
                                variant={"default"}
                                className="h-7"
                                onClick={() => {
                                  router.push(`/test/starttest/${exam.id}`);
                                }}
                              >
                                Start Exam
                              </Button>
                            ) : (
                              "Hmmm"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination Controls - Bottom */}
            {groupExams && groupExams.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, groupExams.length)} of{" "}
                  {groupExams.length} exams
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8"
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Page;
