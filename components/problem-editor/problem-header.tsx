"use client";

import { Difficulty } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState, KeyboardEvent } from "react";
import { Plus, X, Save, Upload, SendHorizonal } from "lucide-react";

interface ProblemHeaderProps {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  onChangeTitle: (value: string) => void;
  onChangeDifficulty: (value: Difficulty) => void;
  onAddTag: (value: string) => void;
  onRemoveTag: (value: string) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
  isSubmitting: boolean;
  approvalStatus?: string | null;
  rejectionReason?: string | null;
  mode: "create" | "edit";
}

export function ProblemHeader(props: ProblemHeaderProps) {
  const {
    title,
    difficulty,
    tags,
    onChangeTitle,
    onChangeDifficulty,
    onAddTag,
    onRemoveTag,
    onSaveDraft,
    onSubmit,
    submitDisabled = false,
    isSubmitting,
    approvalStatus,
    rejectionReason,
    mode,
  } = props;

  const [tagInput, setTagInput] = useState("");

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const value = tagInput.trim();
      if (value.length > 0 && !tags.includes(value)) {
        onAddTag(value);
      }
      setTagInput("");
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4 px-4 sm:px-6 lg:px-8 border-b">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Input
              value={title}
              onChange={(event) => onChangeTitle(event.target.value)}
              placeholder="Problem Title... (e.g. Two Sum)"
              className="text-xl font-semibold"
            />
            {approvalStatus && (
              <Badge
                variant={
                  approvalStatus === "APPROVED"
                    ? "default"
                    : approvalStatus === "REJECTED"
                      ? "destructive"
                      : "secondary"
                }
                className="shrink-0"
              >
                {approvalStatus}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={difficulty}
              onValueChange={(value) => onChangeDifficulty(value as Difficulty)}
            >
              <SelectTrigger className="h-8 w-auto px-3 text-xs bg-muted/50 border-muted">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY" className="text-green-500 font-medium">
                  Easy
                </SelectItem>
                <SelectItem
                  value="MEDIUM"
                  className="text-yellow-500 font-medium"
                >
                  Medium
                </SelectItem>
                <SelectItem value="HARD" className="text-red-500 font-medium">
                  Hard
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-2 py-0.5 text-xs flex items-center gap-1 bg-secondary/50 hover:bg-secondary/70 transition-colors"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <div className="relative flex items-center min-w-[140px]">
                <Plus className="absolute left-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="h-8 pl-7 text-xs bg-transparent border-dashed focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0 md:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={onSaveDraft}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || submitDisabled}
              onClick={onSubmit}
              className="gap-2"
            >
              <SendHorizonal className="h-4 w-4" />
              {mode === "edit" ? "Resubmit for Approval" : "Submit for Approval"}
            </Button>
          </div>
          {submitDisabled && mode === "create" && (
            <p className="text-xs text-muted-foreground text-right max-w-[200px]">
              Reference solution must pass all test cases before submitting
            </p>
          )}
          {isSubmitting && (
            <p className="text-xs text-muted-foreground animate-pulse text-right">
              Saving...
            </p>
          )}
        </div>
      </div>

      {approvalStatus === "REJECTED" && rejectionReason && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-sm">
          <span className="font-semibold text-red-600 dark:text-red-400">
            Rejection reason:{" "}
          </span>
          <span className="text-red-700 dark:text-red-300">
            {rejectionReason}
          </span>
        </div>
      )}
    </div>
  );
}
