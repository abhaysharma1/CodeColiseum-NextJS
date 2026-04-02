"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Archive, Download, Trash2, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onPublish?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onArchive?: () => Promise<void>;
  onExport?: () => Promise<void>;
  onClearSelection: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  onPublish,
  onDelete,
  onArchive,
  onExport,
  onClearSelection,
}: BulkActionsToolbarProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAction = async (
    action: (() => Promise<void>) | undefined,
    actionName: string
  ) => {
    if (!action) return;

    try {
      setLoadingAction(actionName);
      await action();
      toast.success(
        `Successfully ${actionName.toLowerCase()} ${selectedCount} test${selectedCount !== 1 ? "s" : ""}`
      );
      onClearSelection();
    } catch (error) {
      toast.error(
        `Failed to ${actionName.toLowerCase()} tests. Please try again.`
      );
      console.error(error);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border bg-card p-4 mb-4 animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="h-8 px-3 text-sm font-semibold">
            {selectedCount} selected
          </Badge>
          <span className="text-sm text-muted-foreground">
            Bulk actions available for selected tests
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onPublish && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => handleAction(onPublish, "Publish")}
              disabled={loadingAction !== null}
            >
              {loadingAction === "Publish" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Upload className="h-4 w-4" />
              Publish
            </Button>
          )}

          {onArchive && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => handleAction(onArchive, "Archive")}
              disabled={loadingAction !== null}
            >
              {loadingAction === "Archive" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          )}

          {onExport && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => handleAction(onExport, "Export")}
              disabled={loadingAction !== null}
            >
              {loadingAction === "Export" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}

          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              className="gap-2"
              onClick={() => setShowDeleteDialog(true)}
              disabled={loadingAction !== null}
            >
              {loadingAction === "Delete" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="gap-2"
            disabled={loadingAction !== null}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {selectedCount} Test{selectedCount !== 1 ? "s" : ""}?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The selected test
              {selectedCount !== 1 ? "s will" : " will"} be permanently deleted
              from the system.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-500/10 p-3 rounded-md border border-red-500/20 text-sm text-red-700 dark:text-red-400 mb-4">
            ⚠️ This will delete {selectedCount} test
            {selectedCount !== 1 ? "s" : ""} and cannot be recovered.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleAction(onDelete, "Delete");
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
