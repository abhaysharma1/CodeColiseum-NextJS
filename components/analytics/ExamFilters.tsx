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

export interface ExamFilterState {
  search: string;
  status:
    | "all"
    | "scheduled"
    | "active"
    | "completed"
    | "ai_processing"
    | "finished";
  sortBy: "endDate" | "startDate" | "title" | "durationMin";
  sortOrder: "asc" | "desc";
  dateFrom: string;
  dateTo: string;
}

interface ExamFiltersProps {
  onFilterChange: (filters: ExamFilterState) => void;
  isLoading?: boolean;
  searchDebounceMs?: number;
}

export const ExamFilters: React.FC<ExamFiltersProps> = ({
  onFilterChange,
  isLoading = false,
  searchDebounceMs = 350,
}) => {
  const [filters, setFilters] = useState<ExamFilterState>({
    search: "",
    status: "all",
    sortBy: "endDate",
    sortOrder: "desc",
    dateFrom: "",
    dateTo: "",
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
    (patch: Partial<ExamFilterState>) => {
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
    if (filters.status !== "all") count += 1;
    if (filters.dateFrom) count += 1;
    if (filters.dateTo) count += 1;
    if (filters.sortBy !== "endDate") count += 1;
    if (filters.sortOrder !== "desc") count += 1;
    return count;
  }, [filters]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Exam Filters</CardTitle>
          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearSearchTimer();
                const reset: ExamFilterState = {
                  search: "",
                  status: "all",
                  sortBy: "endDate",
                  sortOrder: "desc",
                  dateFrom: "",
                  dateTo: "",
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

      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search exam title"
          value={filters.search}
          onChange={(e) => applyFilterPatch({ search: e.target.value })}
          disabled={false}
        />

        <Select
          value={filters.status}
          onValueChange={(value: ExamFilterState["status"]) =>
            applyFilterPatch({ status: value })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="ai_processing">AI processing</SelectItem>
            <SelectItem value="finished">Finished</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => applyFilterPatch({ dateFrom: e.target.value })}
          disabled={isLoading}
        />

        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => applyFilterPatch({ dateTo: e.target.value })}
          disabled={isLoading}
        />

        <Select
          value={filters.sortBy}
          onValueChange={(value: ExamFilterState["sortBy"]) =>
            applyFilterPatch({ sortBy: value })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="endDate">End date</SelectItem>
            <SelectItem value="startDate">Start date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="durationMin">Duration</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortOrder}
          onValueChange={(value: ExamFilterState["sortOrder"]) =>
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

export default ExamFilters;
