"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Copy, Eye, Layers, Code, Clock, User } from "lucide-react";
import type { PublicLab } from "@/hooks/use-marketplace";

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const difficultyColors: Record<string, string> = {
  EASY: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  HARD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface MarketplaceLabCardProps {
  lab: PublicLab;
  onPreview: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function MarketplaceLabCard({ lab, onPreview, onDuplicate }: MarketplaceLabCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="group relative h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-border/50 hover:border-primary/20 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                {lab.title}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="truncate">{lab.creatorName}</span>
              </CardDescription>
            </div>
            {lab.difficulty && (
              <Badge className={`text-xs font-medium px-2 py-0.5 h-5 ${difficultyColors[lab.difficulty] ?? ""}`}>
                {lab.difficulty}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-4 flex-1">
          {lab.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
              {lab.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              <span>{lab.modulesCount} {lab.modulesCount === 1 ? "module" : "modules"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Code className="h-3.5 w-3.5" />
              <span>{lab.problemsCount} {lab.problemsCount === 1 ? "problem" : "problems"}</span>
            </div>
            {lab.programmingLanguage && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{lab.programmingLanguage}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Star className={`h-3.5 w-3.5 ${lab.averageRating > 0 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
              <span className="font-medium">{lab.averageRating > 0 ? lab.averageRating.toFixed(1) : "—"}</span>
              <span className="text-muted-foreground">({lab.ratingCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Copy className="h-3.5 w-3.5" />
              <span>{lab.duplicateCount}</span>
            </div>
          </div>

          {lab.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {lab.tags.slice(0, 4).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs px-1.5 py-0 h-5">
                  {tag.name}
                </Badge>
              ))}
              {lab.tags.length > 4 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                  +{lab.tags.length - 4}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-4 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={() => onPreview(lab.id)}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onDuplicate(lab.id)}
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </Button>
        </CardFooter>

        <div className="absolute top-3 right-3">
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeDate(lab.publishedAt)}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
