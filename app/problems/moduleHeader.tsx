"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, BookOpen } from "lucide-react";

interface ModuleHeaderProps {
  lab: { title: string };
  module: {
    title: string;
    weekNumber: number;
    dueAt: string | null;
  };
  completedProblems: number;
  totalProblems: number;
  completionPercentage: number;
}

export function ModuleHeader({
  lab,
  module,
  completedProblems,
  totalProblems,
  completionPercentage,
}: ModuleHeaderProps) {
  return (
    <Card className="mx-5 mt-3 mb-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {lab.title}
              </span>
            </div>
            <Badge variant="secondary">Week {module.weekNumber}</Badge>
          </div>
          {module.dueAt && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Due {new Date(module.dueAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <div className="mt-2">
          <h2 className="text-lg font-semibold">{module.title}</h2>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-muted-foreground">
              {completedProblems} / {totalProblems} Solved
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completionPercentage === 100
                  ? "bg-green-500"
                  : completionPercentage > 50
                    ? "bg-primary"
                    : "bg-yellow-500"
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
