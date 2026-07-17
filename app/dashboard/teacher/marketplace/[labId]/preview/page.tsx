"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Star,
  Layers,
  Code,
  Clock,
  User,
  Globe,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { RatingStars } from "@/components/marketplace/rating-stars";
import {
  useMarketplaceLabPreview,
  useDuplicateLab,
  useCheckDuplicated,
  useRateLab,
} from "@/hooks/use-marketplace";

const difficultyColors: Record<string, string> = {
  EASY: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  HARD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function LabPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const labId = params.labId as string;

  const { data: lab, loading } = useMarketplaceLabPreview(labId);
  const { duplicate, loading: duplicating } = useDuplicateLab();
  const { hasDuplicated, duplicateLab: dupLab, loading: checkingDup } = useCheckDuplicated(labId);
  const { rate, loading: rating } = useRateLab();

  const handleDuplicate = async () => {
    const result = await duplicate(labId);
    if (result) {
      router.push(`/dashboard/teacher/labs/${result.id}`);
    }
  };

  const handleRate = async (score: number) => {
    await rate(labId, score);
  };

  if (loading) {
    return (
      <div className="w-full h-full animate-fade-left animate-once">
        <SiteHeader name="Preview" />
        <div className="p-10 space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="w-full h-full animate-fade-left animate-once">
        <SiteHeader name="Preview" />
        <div className="p-10 text-center">
          <p className="text-muted-foreground">Lab not found or not public.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name="Preview" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-4 px-10 md:gap-8 md:py-6 max-w-5xl mx-auto w-full">
            {/* Back button */}
            <Button
              variant="ghost"
              className="w-fit gap-2 -ml-2"
              onClick={() => router.push("/dashboard/teacher/marketplace")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Button>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold tracking-tight">{lab.title}</h1>
                    {lab.difficulty && (
                      <Badge className={`text-xs font-medium px-2 py-0.5 h-5 ${difficultyColors[lab.difficulty]}`}>
                        {lab.difficulty}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      {lab.creator.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="h-4 w-4" />
                      {lab.averageRating > 0 ? `${lab.averageRating.toFixed(1)} (${lab.ratingCount})` : "No ratings"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Copy className="h-4 w-4" />
                      {lab.duplicateCount} {lab.duplicateCount === 1 ? "duplicate" : "duplicates"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {!checkingDup && hasDuplicated && (
                    <Badge variant="secondary" className="gap-1.5 h-9 px-3">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Duplicated
                    </Badge>
                  )}
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={handleDuplicate}
                    disabled={duplicating}
                  >
                    <Copy className="h-4 w-4" />
                    {duplicating ? "Duplicating..." : "Duplicate Lab"}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            {lab.description && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {lab.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-4">
              {lab.subject && (
                <Badge variant="secondary" className="gap-1.5 text-sm py-1.5 px-3">
                  <Globe className="h-3.5 w-3.5" />
                  {lab.subject}
                </Badge>
              )}
              {lab.programmingLanguage && (
                <Badge variant="secondary" className="gap-1.5 text-sm py-1.5 px-3">
                  <Code className="h-3.5 w-3.5" />
                  {lab.programmingLanguage}
                </Badge>
              )}
              {lab.estimatedDuration && (
                <Badge variant="secondary" className="gap-1.5 text-sm py-1.5 px-3">
                  <Clock className="h-3.5 w-3.5" />
                  {lab.estimatedDuration} min
                </Badge>
              )}
              <Badge variant="secondary" className="gap-1.5 text-sm py-1.5 px-3">
                <Layers className="h-3.5 w-3.5" />
                {lab.modulesCount} {lab.modulesCount === 1 ? "module" : "modules"}
              </Badge>
            </div>

            {/* Tags */}
            {lab.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {lab.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Rating Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rate this Lab
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <RatingStars
                    value={lab.averageRating}
                    onChange={handleRate}
                    size="lg"
                  />
                  <span className="text-sm text-muted-foreground">
                    {lab.ratingCount > 0
                      ? `${lab.averageRating.toFixed(1)} avg (${lab.ratingCount} rating${lab.ratingCount === 1 ? "" : "s"})`
                      : "Be the first to rate"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Modules */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Modules ({lab.modulesCount})</h2>
              {lab.modules.map((mod, index) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            Week {mod.weekNumber}: {mod.title}
                          </CardTitle>
                          {mod.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {mod.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">{mod.problemsCount} problems</Badge>
                      </div>
                    </CardHeader>
                    {mod.problems.length > 0 && (
                      <CardContent>
                        <div className="space-y-2">
                          {mod.problems.map((mp) => (
                            <div
                              key={mp.id}
                              className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-mono text-muted-foreground">
                                  #{mp.problem.number}
                                </span>
                                <span className="text-sm font-medium">
                                  {mp.problem.title}
                                </span>
                              </div>
                              <Badge
                                className={`text-xs ${
                                  difficultyColors[mp.problem.difficulty] ?? ""
                                }`}
                              >
                                {mp.problem.difficulty}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
