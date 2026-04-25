"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export interface ProblemFilterState {
  search: string;
  difficultyTier: "all" | "easy" | "medium" | "hard";
  sortBy:
    | "attemptedCount"
    | "successRate"
    | "failureRate"
    | "avgTime"
    | "acceptedCount"
    | "totalAttempts"
    | "avgRuntime";
  sortOrder: "asc" | "desc";
}

interface ProblemFiltersProps {
  onFilterChange: (filters: ProblemFilterState) => void;
  isLoading?: boolean;
  searchDebounceMs?: number;
}

export const ProblemFilters: React.FC<ProblemFiltersProps> = ({
  onFilterChange,
  isLoading = false,
  searchDebounceMs = 350,
}) => {
  const [filters, setFilters] = useState<ProblemFilterState>({
    search: "",
    difficultyTier: "all",
    sortBy: "attemptedCount",
    sortOrder: "desc",
  });

  const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const clearSearchTimer = useCallback(() => {
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
      searchDebounceTimer.current = null;
    }
  }, []);

  const applyFilterPatch = useCallback(
    (patch: Partial<ProblemFilterState>) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch };

        if (Object.prototype.hasOwnProperty.call(patch, "search")) {
          clearSearchTimer();
          searchDebounceTimer.current = setTimeout(() => {
            onFilterChange(next);
          }, searchDebounceMs);
        } else {
          clearSearchTimer();
          onFilterChange(next);
        }

        return next;
      });
    },
    [clearSearchTimer, onFilterChange, searchDebounceMs]
  );

  useEffect(() => {
    return () => {
      clearSearchTimer();
    };
  }, [clearSearchTimer]);

  const activeFilters = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count += 1;
    if (filters.difficultyTier !== "all") count += 1;
    if (filters.sortBy !== "attemptedCount") count += 1;
    if (filters.sortOrder !== "desc") count += 1;
    return count;
  }, [filters]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Problem Filters</CardTitle>
          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearSearchTimer();
                const reset: ProblemFilterState = {
                  search: "",
                  difficultyTier: "all",
                  sortBy: "attemptedCount",
                  sortOrder: "desc",
                };
                setFilters(reset);
                onFilterChange(reset);
              }}
              className="h-7 px-2"
            >
              <X className="w-3 h-3 mr-1" />
              Clear ({activeFilters})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          placeholder="Search problem title"
          value={filters.search}
          onChange={(e) => applyFilterPatch({ search: e.target.value })}
          disabled={false}
        />

        <Select
          value={filters.difficultyTier}
          onValueChange={(value: ProblemFilterState["difficultyTier"]) =>
            applyFilterPatch({ difficultyTier: value })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={(value: ProblemFilterState["sortBy"]) =>
            applyFilterPatch({ sortBy: value })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="attemptedCount">Attempted</SelectItem>
            <SelectItem value="successRate">Success rate</SelectItem>
            <SelectItem value="failureRate">Failure rate</SelectItem>
            <SelectItem value="avgTime">Avg time</SelectItem>
            <SelectItem value="acceptedCount">Accepted</SelectItem>
            <SelectItem value="totalAttempts">Total attempts</SelectItem>
            <SelectItem value="avgRuntime">Avg runtime</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortOrder}
          onValueChange={(value: ProblemFilterState["sortOrder"]) =>
            applyFilterPatch({ sortOrder: value })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Desc</SelectItem>
            <SelectItem value="asc">Asc</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default ProblemFilters;
