"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, X, ExternalLink, Check, ChevronsUpDown } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getBackendURL } from "@/utils/utilities";
import { ProblemDescriptionPanel } from "@/components/labs/problem-description-panel";

interface ProblemTag {
  tag: { name: string };
}

interface ProblemOption {
  id: string;
  number: number;
  title: string;
  difficulty: string;
  tags: ProblemTag[];
  createdAt: string;
}

interface AddProblemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  onAdded: () => void;
  existingIds: string[];
}

const DIFFICULTIES = ["All", "EASY", "MEDIUM", "HARD"] as const;
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "difficulty", label: "Difficulty" },
] as const;

const ProblemRow = React.memo(function ProblemRow({
  problem,
  isSelected,
  onToggle,
  onMouseEnter,
  onMouseLeave,
}: {
  problem: ProblemOption;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors rounded-md ${
        isSelected ? "bg-accent/60" : "hover:bg-accent/30"
      }`}
      style={{ height: 56, minHeight: 56 }}
      onClick={() => onToggle(problem.id)}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(problem.id);
        }
      }}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(problem.id)}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Select ${problem.title}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {problem.number}. {problem.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {problem.tags?.slice(0, 3).map((t) => (
            <span
              key={t.tag.name}
              className="text-[11px] text-muted-foreground"
            >
              {t.tag.name}
            </span>
          ))}
          {problem.tags && problem.tags.length > 3 && (
            <span className="text-[11px] text-muted-foreground">
              +{problem.tags.length - 3}
            </span>
          )}
        </div>
      </div>
      <Badge
        variant="outline"
        className={`text-[11px] px-1.5 py-0 leading-tight font-medium ${
          problem.difficulty === "EASY"
            ? "text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
            : problem.difficulty === "MEDIUM"
              ? "text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800"
              : "text-red-600 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800"
        }`}
      >
        {problem.difficulty}
      </Badge>
      <a
        href={`/problems?id=${problem.id}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        aria-label={`View ${problem.title} in new tab`}
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
});

function AddProblemsDialog({
  open,
  onOpenChange,
  moduleId,
  onAdded,
  existingIds,
}: AddProblemsDialogProps) {
  const [problems, setProblems] = useState<ProblemOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [hoveredProblemId, setHoveredProblemId] = useState<string | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);
  const hoverOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredProblems = useMemo(() => {
    let result = problems;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.tag.name.toLowerCase().includes(q))
      );
    }

    if (difficulty !== "All") {
      result = result.filter((p) => p.difficulty === difficulty);
    }

    if (selectedTags.length > 0) {
      result = result.filter((p) =>
        selectedTags.every((tag) => p.tags?.some((t) => t.tag.name === tag))
      );
    }

    switch (sortBy) {
      case "newest":
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        result = [...result].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "alphabetical":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "difficulty": {
        const order = { EASY: 0, MEDIUM: 1, HARD: 2 };
        result = [...result].sort(
          (a, b) =>
            order[a.difficulty as keyof typeof order] -
            order[b.difficulty as keyof typeof order]
        );
        break;
      }
    }

    return result;
  }, [problems, debouncedSearch, difficulty, selectedTags, sortBy]);

  const rowVirtualizer = useVirtualizer({
    count: filteredProblems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${getBackendURL()}/problems/getproblems`, {
        params: {
          take: 200,
          skip: 0,
          withDescription: false,
        },
        withCredentials: true,
      });
      const data = (res.data as any[]) ?? [];
      setProblems(
        data
          .filter((p: any) => !existingIds.includes(p.id))
          .map((p: any) => ({
            id: p.id,
            number: p.number,
            title: p.title,
            difficulty: p.difficulty,
            tags: p.tags ?? [],
            createdAt: p.createdAt ?? new Date().toISOString(),
          }))
      );
    } catch {
      setProblems([]);
    } finally {
      setLoading(false);
    }
  }, [existingIds]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await axios.get(`${getBackendURL()}/problems/gettags`, {
        withCredentials: true,
      });
      setTags((res.data as { id: string; name: string }[]) ?? []);
    } catch {
      setTags([]);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setDebouncedSearch("");
    setDifficulty("All");
    setSelectedTags([]);
    setSortBy("newest");
    setSelectedIds(new Set());
    setTagSearch("");
    setHoveredProblemId(null);
    setLoading(true);
    fetchProblems();
    fetchTags();
  }, [open, fetchProblems, fetchTags]);

  useEffect(() => {
    return () => {
      if (hoverOpenTimeoutRef.current) clearTimeout(hoverOpenTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, open]);

  const toggleId = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleRowMouseEnter = useCallback(
    (problemId: string) => {
      if (hoverOpenTimeoutRef.current) {
        clearTimeout(hoverOpenTimeoutRef.current);
      }
      hoverOpenTimeoutRef.current = setTimeout(() => {
        setHoveredProblemId(problemId);
      }, 600);
    },
    [],
  );

  const handleRowMouseLeave = useCallback(() => {
    if (hoverOpenTimeoutRef.current) {
      clearTimeout(hoverOpenTimeoutRef.current);
      hoverOpenTimeoutRef.current = null;
    }
  }, []);

  const handleAdd = async () => {
    if (selectedIds.size === 0) return;
    try {
      setAdding(true);
      await axios.post(
        `${getBackendURL()}/teacher/modules/${moduleId}/problems`,
        { problemIds: Array.from(selectedIds) },
        { withCredentials: true }
      );
      toast.success("Problems added to module");
      setSelectedIds(new Set());
      onAdded();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add problems");
    } finally {
      setAdding(false);
    }
  };

  const filteredTags = useMemo(() => {
    if (!tagSearch) return tags;
    return tags.filter((t) =>
      t.name.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [tags, tagSearch]);

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

    return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[1200px] sm:h-[95vh] flex flex-col p-0 gap-0"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <DialogHeader className="p-0">
            <DialogTitle>Add Problems</DialogTitle>
            <DialogDescription>
              Select problems to add to this module
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Selected: {selectedIds.size}
            </span>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, ID or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              aria-label="Search problems"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap ">
            <ToggleGroup
              type="single"
              value={difficulty}
              onValueChange={(v) => v && setDifficulty(v)}
              variant="outline"
              size="sm"
            >
              {DIFFICULTIES.map((d) => (
                <ToggleGroupItem
                  className="w-fit px-5"
                  key={d}
                  value={d}
                  aria-label={"Filter by " + d}
                >
                  {d === "All" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  aria-label="Filter by tags"
                >
                  Tags
                  {selectedTags.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                      {selectedTags.length}
                    </span>
                  )}
                  <ChevronsUpDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-2">
                  <Input
                    placeholder="Search tags..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="h-8 text-sm"
                    aria-label="Search tags"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredTags.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No tags found
                      </p>
                    ) : (
                      filteredTags.map((tag) => {
                        const isActive = selectedTags.includes(tag.name);
                        return (
                          <div
                            key={tag.id}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer text-sm transition-colors ${
                              isActive
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent/50"
                            }`}
                            onClick={() => toggleTag(tag.name)}
                            role="option"
                            aria-selected={isActive}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                isActive
                                  ? "bg-primary border-primary"
                                  : "border-input"
                              }`}
                            >
                              {isActive && (
                                <Check className="h-2.5 w-2.5 text-primary-foreground" />
                              )}
                            </div>
                            <span className="capitalize">{tag.name}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-[130px]" aria-label="Sort by">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 text-xs cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0 px-6 gap-4">
          <ProblemDescriptionPanel problemId={hoveredProblemId} />
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Available Problems ({filteredProblems.length})
              </span>
            </div>
            <div
              ref={parentRef}
              className="flex-1 overflow-auto border rounded-md"
              role="listbox"
              aria-label="Available problems"
              aria-multiselectable="true"
            >
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredProblems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {search || difficulty !== "All" || selectedTags.length > 0
                    ? "No problems match your filters"
                    : "All problems already added"}
                </p>
              ) : (
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                    const problem = filteredProblems[virtualItem.index];
                    if (!problem) return null;
                    return (
                      <div
                        key={problem.id}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <ProblemRow
                          problem={problem}
                          isSelected={selectedIds.has(problem.id)}
                          onToggle={toggleId}
                          onMouseEnter={() =>
                            handleRowMouseEnter(problem.id)
                          }
                          onMouseLeave={handleRowMouseLeave}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-[30%] flex-shrink-0">
            <div className="sticky top-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Selected Problems ({selectedIds.size})
                </span>
              </div>
              <div className="border rounded-md p-3 min-h-[120px]">
                {selectedIds.size === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No problems selected
                  </p>
                ) : (
                  <div className="space-y-1">
                    {Array.from(selectedIds).map((id) => {
                      const problem = problems.find((p) => p.id === id);
                      if (!problem) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2 py-1.5 px-1 rounded-sm hover:bg-accent/50 transition-colors group"
                        >
                          <span className="flex-1 text-sm truncate">
                            {problem.number}. {problem.title}
                          </span>
                          <button
                            onClick={() => toggleId(id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
                            aria-label={"Remove " + problem.title}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-3">
          <Separator className="mb-3" />
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={selectedIds.size === 0 || adding}
            >
              {adding ? "Adding..." : `Add (${selectedIds.size})`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { AddProblemsDialog };
