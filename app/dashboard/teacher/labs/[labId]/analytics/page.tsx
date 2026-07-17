"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Star, Globe, EyeOff, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import {
  useLabAnalytics,
  usePublishLab,
  useUnpublishLab,
} from "@/hooks/use-marketplace";
import { PublishDialog } from "@/components/marketplace/publish-dialog";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { useState } from "react";

export default function LabAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const labId = params.labId as string;

  const { data: analytics, loading } = useLabAnalytics(labId);
  const { publish, loading: publishing } = usePublishLab();
  const { unpublish, loading: unpublishing } = useUnpublishLab();
  const [publishOpen, setPublishOpen] = useState(false);

  const isPublished = analytics?.publishedAt != null;

  const handlePublish = async () => {
    await publish(labId);
    setPublishOpen(false);
    window.location.reload();
  };

  const handleUnpublish = async () => {
    if (confirm("Unpublish this lab? It will no longer be visible in the marketplace.")) {
      await unpublish(labId);
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full animate-fade-left animate-once">
        <SiteHeader name="Analytics" />
        <div className="p-10 space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name="Lab Analytics" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-4 px-10 md:gap-8 md:py-6 max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">
                  Marketplace Analytics
                </h1>
              </div>
              <div className="flex gap-2">
                {isPublished ? (
                  <Button
                    variant="outline"
                    onClick={handleUnpublish}
                    disabled={unpublishing}
                    className="gap-2"
                  >
                    <EyeOff className="h-4 w-4" />
                    {unpublishing ? "Unpublishing..." : "Unpublish"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setPublishOpen(true)}
                    className="gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Publish to Marketplace
                  </Button>
                )}
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2">
              {isPublished ? (
                <Badge className="gap-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Globe className="h-3 w-3" />
                  Published
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1.5">
                  <EyeOff className="h-3 w-3" />
                  Private
                </Badge>
              )}
              {analytics?.publishedAt && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Published {new Date(analytics.publishedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Analytics cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Duplicates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{analytics?.duplicateCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Teachers who duplicated this lab
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Average Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-bold">
                      {analytics ? analytics.averageRating.toFixed(1) : "0.0"}
                    </p>
                    <RatingStars
                      value={analytics?.averageRating ?? 0}
                      readonly
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {analytics?.ratingCount ?? 0} rating{(analytics?.ratingCount ?? 0) !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{analytics?.reviewCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Teachers who left written reviews
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Last Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold tabular-nums">
                    {analytics?.updatedAt
                      ? new Date(analytics.updatedAt).toLocaleDateString()
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics?.publishedAt
                      ? `Published ${new Date(analytics.publishedAt).toLocaleDateString()}`
                      : "Not yet published"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {!isPublished && (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="py-8 text-center">
                  <Globe className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Not Published</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Publish this lab to make it discoverable in the marketplace
                    where other teachers can find, preview, and duplicate it.
                  </p>
                  <Button onClick={() => setPublishOpen(true)} className="gap-2">
                    <Globe className="h-4 w-4" />
                    Publish to Marketplace
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        onConfirm={handlePublish}
        loading={publishing}
      />
    </div>
  );
}
