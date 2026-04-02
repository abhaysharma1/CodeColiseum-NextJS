"use client";
import { Group } from "@/generated/prisma/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Link as LinkIcon, Calendar, Bot } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";
import { Button } from "@/components/ui/button";

interface Creator {
  id: string;
  name: string;
  email: string;
  isOnboarded: boolean;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date; // ISO date string
  updatedAt: Date; // ISO date string
}

interface GroupT {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  noOfMembers: number;
  createdAt: Date; // ISO date string
  joinByLink: boolean;
  creator: Creator;
  aiEnabled: boolean;
}

type GroupData = GroupT[];

const options = {
  // keys to search in the objects
  keys: [
    "name", // group name
    "description", // group description
    "creator.name", // nested user name
    "creator.email", // nested user email
  ],
  // how sensitive the search is (0.0 = perfect match, 1.0 = very loose)
  threshold: 0.3,
  // include the search score in the results
  includeScore: true,
};

function Page() {
  const ITEMS_PER_PAGE = 9;

  const [currentPage, setCurrentPage] = useState(1);

  const [groupsData, setGroupsData] = useState<GroupData | undefined>();
  const [shownGroups, setShowngroups] = useState<GroupData | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const [take, setTake] = useState(ITEMS_PER_PAGE);
  const [skip, setSkip] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const router = useRouter();

  const getGroupsFunc = async () => {
    try {
      setIsLoading(true);

      const res = await axios.get(`${getBackendURL()}/student/getgroups`, {
        params: {
          take: take,
          skip: skip,
          searchValue: searchValue,
          groupType: "LAB",
        },
        withCredentials: true,
      });
      setGroupsData(res.data as GroupData);
    } catch (error: any) {
      if (typeof error.message === "string") {
        toast.error(error.message);
      }
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!groupsData) return;
    setCurrentPage(1);
    if (searchValue == "") {
      setShowngroups(groupsData);
      return;
    }
    const fuse = new Fuse(groupsData, options);
    const results = fuse.search(searchValue);
    const filteredResult = results.map((item) => item.item);
    setShowngroups(filteredResult);
  }, [searchValue, groupsData]);

  useEffect(() => {
    getGroupsFunc();
  }, [take, skip, searchValue]);

  useEffect(() => {
    if (groupsData) {
      setShowngroups(groupsData);
    }
  }, [groupsData]);
  const totalPages = Math.ceil((shownGroups?.length || 0) / ITEMS_PER_PAGE);

  const paginatedGroups = shownGroups?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    if (groupsData && groupsData.length === take) {
      setSkip((prevSkip) => prevSkip + take);
    }
  };

  const handlePreviousPage = () => {
    if (skip > 0) {
      setSkip((prevSkip) => Math.max(prevSkip - take, 0));
    }
  };

  return (
    <div>
      <SiteHeader name="Groups" />
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Groups</h1>
          <p className="text-muted-foreground">
            Browse and search through your groups
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search groups by name, description, or creator..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : shownGroups && shownGroups.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedGroups?.map((group) => (
              <Card
                key={group.id}
                className="hover:shadow-lg transition-shadow hover:bg-accent/60 cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/student/group/${group.id}`)
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl">{group.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {group.description || "No description provided"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Creator Info */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={group.creator.image || undefined} />
                      <AvatarFallback>
                        {group.creator.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {group.creator.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {group.creator.email}
                      </p>
                    </div>
                  </div>

                  {/* Group Stats */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{group.noOfMembers} members</span>
                    </div>
                    {group.aiEnabled === true && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Bot />
                        <span>AI Enabled</span>
                      </Badge>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <Search className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {searchValue
                ? "No groups found matching your search"
                : "No groups available"}
            </p>
          </div>
        )}
        {shownGroups && shownGroups.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-4 pt-6">
            <Button
              variant={"outline"}
              className="px-4 py-2 text-sm "
              disabled={skip === 0}
              onClick={handlePreviousPage}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Showing {skip + 1} - {Math.min(skip + take, shownGroups.length)}{" "}
              of {shownGroups.length}
            </span>

            <Button
              variant={"outline"}
              className="px-4 py-2 text-sm"
              disabled={groupsData && groupsData.length < take}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
