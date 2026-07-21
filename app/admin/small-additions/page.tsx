"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getBackendURL } from "@/utils/utilities";
import axios from "axios";
import { Building2, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface College {
  id: string;
  name: string;
}

export default function SmallAdditionsPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [collegeName, setCollegeName] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadColleges = useCallback(async () => {
    try {
      const res = await axios.get<College[]>(
        `${getBackendURL()}/admin/colleges`,
        { withCredentials: true },
      );
      setColleges(res.data);
    } catch {
      toast.error("Failed to load colleges.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadColleges();
  }, [loadColleges]);

  const handleAddCollege = async () => {
    const name = collegeName.trim();
    if (!name) {
      toast.error("College name is required.");
      return;
    }
    setAdding(true);
    try {
      await axios.post(
        `${getBackendURL()}/admin/colleges`,
        { name },
        { withCredentials: true },
      );
      toast.success(`College "${name}" added.`);
      setCollegeName("");
      loadColleges();
    } catch (err: unknown) {
      const e = err as any;
      toast.error(e?.response?.data?.error ?? "Failed to add college.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <div>
        <h1 className="text-xl font-bold">Small Additions</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Quickly add reference data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Add College
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="Enter college name"
              className="flex-1"
            />
            <Button
              onClick={handleAddCollege}
              disabled={adding || !collegeName.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Existing Colleges</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : colleges.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No colleges added yet.
            </p>
          ) : (
            <div className="space-y-1">
              {colleges.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <span className="text-sm font-medium">{c.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {c.id.slice(0, 8)}...
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
