"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Search,
  X,
  Globe,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SiteHeader } from "@/components/site-header";
import { getBackendURL } from "@/utils/utilities";
import { MarketplaceLabCard } from "@/components/marketplace/marketplace-lab-card";
import {
  useMarketplaceLabs,
  useDuplicateLab,
  useTags,
} from "@/hooks/use-marketplace";

function LabCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketplacePage() {
  const router = useRouter();
  const { duplicate, loading: duplicating } = useDuplicateLab();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<string>("newest");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [programmingLanguage, setProgrammingLanguage] = useState<string>("all");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagFilterOpen, setTagFilterOpen] = useState(false);

  const { data: allTags } = useTags();

  const query = {
    search: debouncedSearch || undefined,
    page,
    limit: 12,
    sort: sort as any,
    difficulty: difficulty !== "all" ? difficulty : undefined,
    programmingLanguage: programmingLanguage !== "all" ? programmingLanguage : undefined,
    tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
  };

  const { data, total, pages, loading, refetch } = useMarketplaceLabs(query);

  const handleSearch = useCallback(() => {
    setDebouncedSearch(search);
    setPage(1);
  }, [search]);

  const handleDuplicate = async (labId: string) => {
    const result = await duplicate(labId);
    if (result) {
      router.push(`/dashboard/teacher/labs/${result.id}`);
    }
  };

  const resetFilters = () => {
    setDifficulty("all");
    setProgrammingLanguage("all");
    setSelectedTagIds([]);
    setPage(1);
  };

  const hasFilters = difficulty !== "all" || programmingLanguage !== "all" || selectedTagIds.length > 0;

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name="Marketplace" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-4 px-10 h-full md:gap-8 md:py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  Lab Marketplace
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Discover and duplicate public labs created by other teachers
                </p>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search labs by title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 h-11 w-full"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); setDebouncedSearch(""); setPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button onClick={handleSearch} className="h-11 shrink-0">
                Search
              </Button>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px] h-11">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                  <SelectItem value="most_duplicated">Most Duplicated</SelectItem>
                  <SelectItem value="highest_rated">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              <Sheet open={tagFilterOpen} onOpenChange={setTagFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-11 gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasFilters && (
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0">!</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Narrow down the lab marketplace
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Difficulty</label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any difficulty</SelectItem>
                          <SelectItem value="EASY">Easy</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HARD">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Programming Language</label>
                      <Select value={programmingLanguage} onValueChange={setProgrammingLanguage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any language</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                          <SelectItem value="c">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedTagIds((prev) =>
                                prev.includes(tag.id)
                                  ? prev.filter((id) => id !== tag.id)
                                  : [...prev, tag.id],
                              );
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {hasFilters && (
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={resetFilters}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset Filters
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results */}
            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <LabCardSkeleton key={i} />
                ))}
              </div>
            ) : data.length === 0 ? (
              <Card className="py-16">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No public labs found</h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-6">
                    {hasFilters || debouncedSearch
                      ? "No labs match your current filters. Try adjusting your search."
                      : "There are no public labs yet. Check back later!"}
                  </p>
                  {(hasFilters || debouncedSearch) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetFilters();
                        setSearch("");
                        setDebouncedSearch("");
                      }}
                    >
                      Clear all filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {data.length} of {total} labs
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {data.map((lab) => (
                    <MarketplaceLabCard
                      key={lab.id}
                      lab={lab}
                      onPreview={(id) =>
                        router.push(`/dashboard/teacher/marketplace/${id}/preview`)
                      }
                      onDuplicate={handleDuplicate}
                    />
                  ))}
                </div>

                {pages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      Page {page} of {pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      disabled={page >= pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
