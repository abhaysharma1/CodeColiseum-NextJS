"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getBackendURL } from "@/utils/utilities";
import axios from "axios";
import { Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { RBAC_ROLE_IDS, RBAC_ROLE_OPTIONS, type RbacRoleId } from "@/lib/rbac-roles";

interface BulkSignupResult {
  email: string;
  result: "created" | "error";
  message?: string;
}

interface BulkSignupResponse {
  success?: boolean;
  error?: boolean;
  results: BulkSignupResult[];
}

const parseText = (raw: string) =>
  raw
    .split(/[\n,;]+/)
    .map((e) => e.trim())
    .filter(Boolean);

const parseCSV = (text: string) =>
  text.split(/\r?\n/).flatMap((line) =>
    line
      .split(",")
      .map((c) => c.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean)
  );

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function BulkSignUp() {
  const [textEmails, setTextEmails] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [roleId, setRoleId] = useState<RbacRoleId>(RBAC_ROLE_IDS.ORG_STUDENT);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<BulkSignupResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Only CSV files are accepted.");
      return;
    }
    setCsvFile(file);
  };

  const collectEmails = async () => {
    const all = [
      ...parseText(textEmails),
      ...(csvFile ? parseCSV(await csvFile.text()) : []),
    ];
    return [...new Set(all)];
  };

  const handleSubmit = async () => {
    setResponse(null);
    const emails = await collectEmails();
    if (!emails.length) {
      toast.error("Provide at least one email.");
      return;
    }
    const bad = emails.filter((e) => !isValidEmail(e));
    if (bad.length) {
      toast.error(
        `Invalid: ${bad.slice(0, 3).join(", ")}${bad.length > 3 ? ` +${bad.length - 3} more` : ""}`
      );
      return;
    }
    if (emails.length > 500) {
      toast.error("Max 500 emails at once.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post<BulkSignupResponse>(
        `${getBackendURL()}/admin/bulkSignup`,
        { emails, roleId },
        { withCredentials: true }
      );
      setResponse(res.data);
      const created =
        res.data.results?.filter((r) => r.result === "created").length ?? 0;
      const failed =
        res.data.results?.filter((r) => r.result === "error").length ?? 0;
      toast.success(`Done — ${created} created, ${failed} failed.`);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      toast.error(e?.response?.data?.message ?? "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  const preview = textEmails.trim() ? parseText(textEmails) : [];
  const validCount = preview.filter(isValidEmail).length;
  const invalidCount = preview.length - validCount;

  const created =
    response?.results?.filter((r) => r.result === "created") ?? [];
  const failed = response?.results?.filter((r) => r.result === "error") ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <div>
        <h1 className="text-xl font-bold">Bulk Sign Up</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Sign up up to 500 users at once via CSV or manual entry.
        </p>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          {/* Role + CSV row */}
          <div className="flex items-start gap-4">
            {/* Role */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <span className="text-xs font-medium text-muted-foreground">
                Role
              </span>
              <Select
                value={roleId}
                onValueChange={(v) => setRoleId(v as RbacRoleId)}
              >
                <SelectTrigger className="w-36 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RBAC_ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CSV drop zone */}
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-xs font-medium text-muted-foreground">
                CSV File
              </span>
              <div
                className={`flex items-center justify-center gap-2 rounded-md border-2 border-dashed px-3 py-2 h-8 text-xs cursor-pointer transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFileChange(e.dataTransfer.files?.[0] ?? null);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {csvFile ? (
                  <>
                    <span className="truncate font-medium">{csvFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCsvFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    Drop CSV or <span className="text-primary">browse</span>
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {/* Manual entry */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Emails — comma, semicolon, or newline separated
              </span>
              {preview.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {preview.length} detected
                  </span>
                  {validCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {validCount} valid
                    </Badge>
                  )}
                  {invalidCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {invalidCount} invalid
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Textarea
              placeholder={
                "alice@example.com\nbob@example.com, carol@example.com"
              }
              value={textEmails}
              onChange={(e) => setTextEmails(e.target.value)}
              rows={5}
              className="font-mono text-xs resize-y"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
            size="sm"
          >
            {loading ? "Signing up users…" : "Bulk Sign Up"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {response && (
        <div className="grid grid-cols-2 gap-4">
          {/* Created */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Created</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {created.length}
                </Badge>
              </div>
              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {created.length === 0 ? (
                  <p className="text-xs text-muted-foreground">None</p>
                ) : (
                  created.map((r, i) => (
                    <p
                      key={i}
                      className="font-mono text-[11px] text-muted-foreground truncate"
                    >
                      {r.email}
                    </p>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Failed */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Failed</span>
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0"
                >
                  {failed.length}
                </Badge>
              </div>
              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {failed.length === 0 ? (
                  <p className="text-xs text-muted-foreground">None</p>
                ) : (
                  failed.map((r, i) => (
                    <div key={i}>
                      <p className="font-mono text-[11px] text-muted-foreground truncate">
                        {r.email}
                      </p>
                      {r.message && (
                        <p className="text-[10px] text-destructive">
                          {r.message}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
