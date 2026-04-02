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
import { useState, KeyboardEvent, FormEvent } from "react";
import { Plus, X, UploadCloud, Save, FolderOpen } from "lucide-react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxSeparator,
} from "@/components/ui/combobox";

interface ProblemHeaderProps {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  onChangeTitle: (value: string) => void;
  onChangeDifficulty: (value: Difficulty) => void;
  onAddTag: (value: string) => void;
  onRemoveTag: (value: string) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSubmitting: boolean;
  availableProblems?: Array<{
    id: string;
    title: string;
    isPublished: boolean;
  }>;
  onSelectProblem?: (id: string) => void;
  currentProblemId?: string;
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
    onPublish,
    isSubmitting,
    availableProblems = [],
    onSelectProblem,
    currentProblemId,
  } = props;

  const [tagInput, setTagInput] = useState("");
  const [searchValue, setSearchValue] = useState("");

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

  const handleSaveDraft = () => {
    onSaveDraft();
  };

  const handlePublish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onPublish();
  };

  const drafts = availableProblems.filter((p) => !p.isPublished);
  const published = availableProblems.filter((p) => p.isPublished);

  return (
    <form
      onSubmit={handlePublish}
      className="flex flex-col gap-4 py-4 px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-[300px]">
              <Combobox
                value={currentProblemId}
                onValueChange={(val) => {
                  if (val) onSelectProblem?.(val);
                }}
              >
                <div className="relative">
                  <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <ComboboxInput
                    placeholder="Search problems..."
                    className="pl-9 h-9"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    showTrigger
                  />
                </div>
                <ComboboxContent align="start" className="w-[400px]">
                  <ComboboxList>
                    <ComboboxItem
                      value="new"
                      className="font-semibold text-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Problem
                    </ComboboxItem>

                    <ComboboxSeparator />

                    {drafts.length > 0 && (
                      <ComboboxGroup >
                        {drafts
                          .filter((p) =>
                            p.title
                              .toLowerCase()
                              .includes(searchValue.toLowerCase())
                          )
                          .map((p) => (
                            <ComboboxItem key={p.id} value={p.id}>
                              <span className="truncate">{p.title}</span>
                            </ComboboxItem>
                          ))}
                      </ComboboxGroup>
                    )}

                    {published.length > 0 && (
                      <ComboboxGroup>
                        {published
                          .filter((p) =>
                            p.title
                              .toLowerCase()
                              .includes(searchValue.toLowerCase())
                          )
                          .map((p) => (
                            <ComboboxItem key={p.id} value={p.id}>
                              <span className="truncate">{p.title}</span>
                            </ComboboxItem>
                          ))}
                      </ComboboxGroup>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {title && (
              <Badge
                variant={
                  availableProblems.find((p) => p.id === currentProblemId)
                    ?.isPublished
                    ? "default"
                    : "secondary"
                }
              >
                {availableProblems.find((p) => p.id === currentProblemId)
                  ?.isPublished
                  ? "Published"
                  : currentProblemId === "new"
                    ? "New"
                    : "Draft"}
              </Badge>
            )}
          </div>

          <div className="relative">
            <Input
              value={title}
              onChange={(event) => onChangeTitle(event.target.value)}
              placeholder="Problem Title... (e.g. Two Sum)"
              // className="text-3xl font-bold border-none bg-transparent shadow-none px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50 transition-colors"
            />
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
              onClick={handleSaveDraft}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-2"
            >
              <UploadCloud className="h-4 w-4" />
              Publish
            </Button>
          </div>
          {isSubmitting && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Saving magic...
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
