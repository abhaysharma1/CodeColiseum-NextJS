"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Calendar, Filter, X } from "lucide-react";
import { format } from "date-fns";

export interface TestFilterState {
  search: string;
  status: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
}

interface TestFiltersProps {
  filterState: TestFilterState;
  onFilterChange: (filters: TestFilterState) => void;
  onReset?: () => void;
}

export function TestFilters({
  filterState,
  onFilterChange,
  onReset,
}: TestFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    filterState.search ||
    filterState.status ||
    filterState.dateFrom ||
    filterState.dateTo;

  const handleClearAll = () => {
    onFilterChange({
      search: "",
      status: null,
      dateFrom: null,
      dateTo: null,
    });
    onReset?.();
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search tests by name or description..."
          value={filterState.search}
          onChange={(e) =>
            onFilterChange({ ...filterState, search: e.target.value })
          }
          className="flex-1"
        />
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <div className="space-y-4">
              <div className="font-semibold">Filter Tests</div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-sm">
                  Status
                </Label>
                <Select
                  value={filterState.status || ""}
                  onValueChange={(value) =>
                    onFilterChange({
                      ...filterState,
                      status: value || null,
                    })
                  }
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-sm">Date Range</Label>
                <div className="grid gap-2">
                  <div className="text-xs text-muted-foreground">From</div>
                  <Input
                    type="date"
                    value={
                      filterState.dateFrom
                        ? format(filterState.dateFrom, "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) =>
                      onFilterChange({
                        ...filterState,
                        dateFrom: e.target.value
                          ? new Date(e.target.value)
                          : null,
                      })
                    }
                  />
                  <div className="text-xs text-muted-foreground">To</div>
                  <Input
                    type="date"
                    value={
                      filterState.dateTo
                        ? format(filterState.dateTo, "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) =>
                      onFilterChange({
                        ...filterState,
                        dateTo: e.target.value
                          ? new Date(e.target.value)
                          : null,
                      })
                    }
                    disabled={!filterState.dateFrom}
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleClearAll}
                >
                  <X className="h-4 w-4" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filterState.status && (
            <div className="bg-secondary px-3 py-1 rounded text-sm flex items-center gap-2">
              Status: <span className="font-medium">{filterState.status}</span>
              <button
                onClick={() => onFilterChange({ ...filterState, status: null })}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </div>
          )}
          {filterState.dateFrom && (
            <div className="bg-secondary px-3 py-1 rounded text-sm flex items-center gap-2">
              From:{" "}
              <span className="font-medium">
                {format(filterState.dateFrom, "MMM dd")}
              </span>
              <button
                onClick={() =>
                  onFilterChange({ ...filterState, dateFrom: null })
                }
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </div>
          )}
          {filterState.dateTo && (
            <div className="bg-secondary px-3 py-1 rounded text-sm flex items-center gap-2">
              To:{" "}
              <span className="font-medium">
                {format(filterState.dateTo, "MMM dd")}
              </span>
              <button
                onClick={() => onFilterChange({ ...filterState, dateTo: null })}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
