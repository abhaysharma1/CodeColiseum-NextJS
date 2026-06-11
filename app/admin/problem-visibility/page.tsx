"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { toast } from "sonner";
import InfiniteScroll from "react-infinite-scroll-component";
import { Search } from "lucide-react";

interface Problem {
  id: string;
  number: number;
  title: string;
  isPublished: boolean;
  difficulty: string;
  hidden: boolean;
}

const PAGE_SIZE = 20;

export default function ProblemVisibilityPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const skipRef = useRef(0);

  const fetchProblems = async (reset = false) => {
    setLoading(true);
    try {
      const skip = reset ? 0 : skipRef.current;
      const res = await axios.get<{ problems: Problem[] }>(
        `${getBackendURL()}/admin/problems`,
        {
          params: {
            searchValue: searchValue || undefined,
            take: PAGE_SIZE,
            skip,
          },
          withCredentials: true,
        }
      );
      const data = res.data.problems || [];
      setHasMore(data.length >= PAGE_SIZE);
      skipRef.current = skip + data.length;
      if (reset) {
        setProblems(data);
      } else {
        setProblems((prev) => [...prev, ...data]);
      }
    } catch {
      toast.error("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    skipRef.current = 0;
    setProblems([]);
    setHasMore(true);
    const timer = setTimeout(() => {
      fetchProblems(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const togglePublished = async (problemId: string, current: boolean) => {
    setTogglingId(problemId);
    try {
      await axios.patch(
        `${getBackendURL()}/admin/problems/${problemId}/publish`,
        { isPublished: !current },
        { withCredentials: true }
      );
      setProblems((prev) =>
        prev.map((p) =>
          p.id === problemId ? { ...p, isPublished: !current } : p
        )
      );
      toast.success(!current ? "Problem published" : "Problem set to draft");
    } catch {
      toast.error("Failed to update publish status");
    } finally {
      setTogglingId(null);
    }
  };

  const toggleHidden = async (problemId: string, currentHidden: boolean) => {
    setTogglingId(problemId);
    try {
      await axios.patch(
        `${getBackendURL()}/admin/problems/${problemId}/hidden`,
        { hidden: !currentHidden },
        { withCredentials: true }
      );
      setProblems((prev) =>
        prev.map((p) =>
          p.id === problemId ? { ...p, hidden: !currentHidden } : p
        )
      );
      toast.success(
        !currentHidden
          ? "Problem hidden from public listing"
          : "Problem visible in public listing"
      );
    } catch {
      toast.error("Failed to update visibility");
    } finally {
      setTogglingId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "hard":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle className="text-xl font-semibold">
            Problem Visibility
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            <strong>Published</strong> — controls whether the problem is
            published or in draft state. <strong>Public</strong> — hides the
            problem from the public listing while keeping it accessible for
            exams.
          </p>
          <div className="relative mt-2 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              type="text"
              placeholder="Search problems by title or number..."
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {problems.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="mb-2 h-8 w-8" />
            <p>No problems found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <InfiniteScroll
              dataLength={problems.length}
              next={() => fetchProblems(false)}
              hasMore={hasMore}
              loader={
                <div className="flex justify-center py-4">
                  <Spinner variant="infinite" />
                </div>
              }
              height={600}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-24">Difficulty</TableHead>
                    <TableHead className="w-28 text-center">Published</TableHead>
                    <TableHead className="w-28 text-center">Public</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.map((problem) => (
                    <TableRow key={problem.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {problem.number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {problem.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            getDifficultyColor(problem.difficulty)
                          )}
                        >
                          {problem.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={problem.isPublished}
                            onCheckedChange={() =>
                              togglePublished(problem.id, problem.isPublished)
                            }
                            disabled={togglingId === problem.id}
                          />
                          {togglingId === problem.id && (
                            <Spinner variant="infinite" className="h-4 w-4" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={!problem.hidden}
                            onCheckedChange={() =>
                              toggleHidden(problem.id, problem.hidden)
                            }
                            disabled={togglingId === problem.id}
                          />
                          {togglingId === problem.id && (
                            <Spinner variant="infinite" className="h-4 w-4" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </InfiniteScroll>
          </div>
        )}
        {loading && problems.length > 0 && (
          <div className="flex justify-center py-4">
            <Spinner variant="infinite" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
