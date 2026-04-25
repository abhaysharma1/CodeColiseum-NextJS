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

export interface FilterState {
  search: string;
  scoreMin: number;
  scoreMax: number;
  completionStatus: "all" | "completed" | "incomplete";
  weakTopic: string;
  groupId?: string;
}

interface StudentFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  topics?: string[];
  isLoading?: boolean;
  groups?: Array<{ id: string; name: string }>;
  searchDebounceMs?: number;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  onFilterChange,
  topics = [],
  isLoading = false,
  groups = [],
  searchDebounceMs = 350,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    scoreMin: 0,
    scoreMax: 100,
    completionStatus: "all",
    weakTopic: "",
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
    (patch: Partial<FilterState>) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch };

        if (Object.prototype.hasOwnProperty.call(patch, "search")) {
          clearSearchTimer();
          searchDebounceTimer.current = setTimeout(() => {
            onFilterChange(next);
          }, searchDebounceMs);
        } else {
          // If a non-search filter changes, apply immediately and cancel any pending debounced search update.
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
    if (filters.scoreMin !== 0 || filters.scoreMax !== 100) count += 1;
    if (filters.completionStatus !== "all") count += 1;
    if (filters.weakTopic) count += 1;
    if (filters.groupId) count += 1;
    return count;
  }, [filters]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Filters</CardTitle>
          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearSearchTimer();
                const reset: FilterState = {
                  search: "",
                  scoreMin: 0,
                  scoreMax: 100,
                  completionStatus: "all",
                  weakTopic: "",
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

      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <Input
          placeholder="Search name or email"
          value={filters.search}
          onChange={(e) => applyFilterPatch({ search: e.target.value })}
          // Keep search enabled while loading to prevent losing focus during background fetches.
          disabled={false}
        />

        <Input
          type="number"
          min={0}
          max={100}
          placeholder="Min score"
          value={filters.scoreMin}
          onChange={(e) =>
            applyFilterPatch({
              scoreMin: Math.max(0, Number(e.target.value || 0)),
            })
          }
          disabled={isLoading}
        />

        <Input
          type="number"
          min={0}
          max={100}
          placeholder="Max score"
          value={filters.scoreMax}
          onChange={(e) =>
            applyFilterPatch({
              scoreMax: Math.min(100, Number(e.target.value || 100)),
            })
          }
          disabled={isLoading}
        />

        <Select
          value={filters.completionStatus}
          onValueChange={(value: "all" | "completed" | "incomplete") =>
            applyFilterPatch({ completionStatus: value })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Completion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.weakTopic || "all"}
          onValueChange={(value) =>
            applyFilterPatch({ weakTopic: value === "all" ? "" : value })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Weak topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All topics</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic} value={topic}>
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {groups.length > 0 && (
          <div className="md:col-span-2 lg:col-span-5">
            <Select
              value={filters.groupId || "all"}
              onValueChange={(value) =>
                applyFilterPatch({
                  groupId: value === "all" ? undefined : value,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentFilters;
