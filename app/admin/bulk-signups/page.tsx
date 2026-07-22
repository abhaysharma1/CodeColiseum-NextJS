"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBackendURL } from "@/utils/utilities";
import axios from "axios";
import {
  ChevronDown,
  ChevronRight,
  CloudUpload,
  Download,
  GraduationCap,
  Mail,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface College {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
}

interface SignupResult {
  email: string;
  name: string;
  password: string;
  result: "created" | "error";
  message?: string;
}

interface BulkResponse {
  success: boolean;
  results: SignupResult[];
  passwordsCsv: string;
}

// ── Student ──

const STUDENT_HEADERS = ["Name", "Email", "Roll Number", "Branch", "Semester", "Batch"];

function downloadStudentTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    STUDENT_HEADERS,
    ["John Doe", "john@example.com", "CS2024001", "Computer Science", "3", "2024-2028"],
  ]);
  ws["!cols"] = STUDENT_HEADERS.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  XLSX.writeFile(wb, "bulk_student_template.xlsx");
}

interface StudentRow {
  Name: string;
  Email: string;
  "Roll Number": string;
  Branch: string;
  Semester: string;
  Batch: string;
}

async function parseStudentFile(
  file: File,
): Promise<{ rows: StudentRow[]; errors: string[] }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(
    wb.Sheets[wb.SheetNames[0]],
  );
  const rows: StudentRow[] = [];
  const errors: string[] = [];

  for (let i = 0; i < raw.length; i++) {
    const r = raw[i];
    const name = String(r.Name ?? "").trim();
    const email = String(r.Email ?? "").trim();
    const roll = String(r["Roll Number"] ?? "").trim();
    if (!name || !email || !roll) {
      errors.push(`Row ${i + 2}: missing Name, Email, or Roll Number`);
      continue;
    }
    rows.push({
      Name: name,
      Email: email,
      "Roll Number": roll,
      Branch: String(r.Branch ?? "").trim(),
      Semester: String(r.Semester ?? "").trim(),
      Batch: String(r.Batch ?? "").trim(),
    });
  }
  return { rows, errors };
}

// ── Teacher ──

const TEACHER_HEADERS = ["Name", "Email", "Employee ID", "Department"];

function downloadTeacherTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    TEACHER_HEADERS,
    ["Jane Smith", "jane@college.edu", "EMP001", "Computer Science"],
  ]);
  ws["!cols"] = TEACHER_HEADERS.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Teachers");
  XLSX.writeFile(wb, "bulk_teacher_template.xlsx");
}

interface TeacherRow {
  Name: string;
  Email: string;
  "Employee ID": string;
  Department: string;
}

async function parseTeacherFile(
  file: File,
): Promise<{ rows: TeacherRow[]; errors: string[] }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(
    wb.Sheets[wb.SheetNames[0]],
  );
  const rows: TeacherRow[] = [];
  const errors: string[] = [];

  for (let i = 0; i < raw.length; i++) {
    const r = raw[i];
    const name = String(r.Name ?? "").trim();
    const email = String(r.Email ?? "").trim();
    if (!name || !email) {
      errors.push(`Row ${i + 2}: missing Name or Email`);
      continue;
    }
    rows.push({
      Name: name,
      Email: email,
      "Employee ID": String(r["Employee ID"] ?? "").trim(),
      Department: String(r.Department ?? "").trim(),
    });
  }
  return { rows, errors };
}

// ── Send Credentials ──

interface CredentialsRow {
  Email: string;
  Password: string;
}

async function parseCredentialsFile(
  file: File,
): Promise<{ rows: CredentialsRow[]; errors: string[] }> {
  const text = await file.text();
  const lines = text.trim().split("\n");
  const rows: CredentialsRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(",");
    const email = (parts[0] ?? "").trim().toLowerCase();
    const password = (parts[1] ?? "").trim();
    if (!email || !password) {
      errors.push(`Row ${i + 1}: missing Email or Password`);
      continue;
    }
    rows.push({ Email: email, Password: password });
  }
  return { rows, errors };
}

// ── Shared header / table cell renderers ──

const headerClass = "text-xs";
const cellClass = "text-xs";
const badgeClass = "text-[10px] px-1.5 py-0";

// ── Component ──

export default function BulkSignupsPage() {
  // Shared data
  const [colleges, setColleges] = useState<College[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  const loadColleges = useCallback(async () => {
    try {
      const res = await axios.get<College[]>(
        `${getBackendURL()}/admin/colleges`,
        { withCredentials: true },
      );
      setColleges(res.data);
    } catch {
      toast.error("Failed to load colleges.");
    }
  }, []);

  const loadGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const res = await axios.get<Group[]>(
        `${getBackendURL()}/teacher/getallgroups`,
        { withCredentials: true },
      );
      setGroups(res.data);
    } catch {
      toast.error("Failed to load groups.");
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadColleges();
  }, [loadColleges]);

  const handleUploadS3 = async (
    csvContent: string,
    filename: string,
    setLoading: (v: boolean) => void,
    setKey: (v: string) => void,
  ) => {
    setLoading(true);
    try {
      await axios.post(
        `${getBackendURL()}/admin/bulk-signup/upload-csv`,
        { csvContent, filename },
        { withCredentials: true },
      );
      toast.success("Uploaded to S3 successfully.");
      setKey(filename);
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Upload to S3 failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Student state ──
  const [stdColl, setStdColl] = useState(true);
  const [stdFile, setStdFile] = useState<File | null>(null);
  const [stdRows, setStdRows] = useState<StudentRow[]>([]);
  const [stdErrs, setStdErrs] = useState<string[]>([]);
  const [stdCollegeId, setStdCollegeId] = useState("");
  const [stdGrpName, setStdGrpName] = useState("none");
  const [stdLoading, setStdLoading] = useState(false);
  const [stdRes, setStdRes] = useState<BulkResponse | null>(null);
  const stdCollAnchor = useComboboxAnchor();
  const stdGrpAnchor = useComboboxAnchor();

  const onStdDrop = useCallback(async (a: File[]) => {
    const f = a[0];
    if (!f) return;
    if (!/\.(xlsx|xls|csv)$/i.test(f.name)) {
      toast.error("Only .xlsx, .xls, or .csv files are accepted.");
      return;
    }
    setStdFile(f);
    setStdRes(null);
    const { rows, errors } = await parseStudentFile(f);
    setStdRows(rows);
    setStdErrs(errors);
    if (errors.length) toast.error(`${errors.length} row(s) will be skipped.`);
  }, []);

  const stdDrop = useDropzone({
    onDrop: onStdDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleStdSubmit = async () => {
    if (!stdFile) return void toast.error("Select an Excel file first.");
    if (!stdCollegeId) return void toast.error("Select a college.");
    if (!stdRows.length) return void toast.error("No valid rows.");
    setStdLoading(true);
    setStdRes(null);
    try {
      const gid =
        stdGrpName !== "none"
          ? groups.find((g) => g.name === stdGrpName)?.id
          : undefined;
      const fd = new FormData();
      fd.append("file", stdFile);
      fd.append("collegeId", stdCollegeId);
      if (gid) fd.append("groupId", gid);
      const r = await axios.post<BulkResponse>(
        `${getBackendURL()}/admin/bulk-student-signup`,
        fd,
        { withCredentials: true },
      );
      setStdRes(r.data);
      toast.success(
        `${r.data.results.filter((x) => x.result === "created").length} created, ${r.data.results.filter((x) => x.result === "error").length} failed.`,
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Request failed.");
    } finally {
      setStdLoading(false);
    }
  };

  const resetStd = () => {
    setStdFile(null);
    setStdRows([]);
    setStdErrs([]);
    setStdGrpName("none");
    setStdRes(null);
  };

  const dlStdPw: false | (() => void) = stdRes?.passwordsCsv
    ? () => {
        const b = new Blob([stdRes.passwordsCsv!], { type: "text/csv" });
        const u = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = u;
        a.download = "student_passwords.csv";
        a.click();
        URL.revokeObjectURL(u);
      }
    : false;

  const stdCreated = stdRes?.results?.filter((r) => r.result === "created") ?? [];
  const stdFailed = stdRes?.results?.filter((r) => r.result === "error") ?? [];

  const [stdUpDialogOpen, setStdUpDialogOpen] = useState(false);
  const [stdUpFilename, setStdUpFilename] = useState("student_passwords");
  const [stdUpLoading, setStdUpLoading] = useState(false);
  const [stdUpKey, setStdUpKey] = useState("");

  // ── Teacher state ──
  const [tchColl, setTchColl] = useState(false);
  const [tchFile, setTchFile] = useState<File | null>(null);
  const [tchRows, setTchRows] = useState<TeacherRow[]>([]);
  const [tchErrs, setTchErrs] = useState<string[]>([]);
  const [tchCollegeId, setTchCollegeId] = useState("");
  const [tchGrpName, setTchGrpName] = useState("none");
  const [tchLoading, setTchLoading] = useState(false);
  const [tchRes, setTchRes] = useState<BulkResponse | null>(null);
  const tchCollAnchor = useComboboxAnchor();
  const tchGrpAnchor = useComboboxAnchor();

  const onTchDrop = useCallback(async (a: File[]) => {
    const f = a[0];
    if (!f) return;
    if (!/\.(xlsx|xls|csv)$/i.test(f.name)) {
      toast.error("Only .xlsx, .xls, or .csv files are accepted.");
      return;
    }
    setTchFile(f);
    setTchRes(null);
    const { rows, errors } = await parseTeacherFile(f);
    setTchRows(rows);
    setTchErrs(errors);
    if (errors.length) toast.error(`${errors.length} row(s) will be skipped.`);
  }, []);

  const tchDrop = useDropzone({
    onDrop: onTchDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleTchSubmit = async () => {
    if (!tchFile) return void toast.error("Select an Excel file first.");
    if (!tchCollegeId) return void toast.error("Select a college.");
    if (!tchRows.length) return void toast.error("No valid rows.");
    setTchLoading(true);
    setTchRes(null);
    try {
      const gid =
        tchGrpName !== "none"
          ? groups.find((g) => g.name === tchGrpName)?.id
          : undefined;
      const fd = new FormData();
      fd.append("file", tchFile);
      fd.append("collegeId", tchCollegeId);
      if (gid) fd.append("groupId", gid);
      const r = await axios.post<BulkResponse>(
        `${getBackendURL()}/admin/bulk-teacher-signup`,
        fd,
        { withCredentials: true },
      );
      setTchRes(r.data);
      toast.success(
        `${r.data.results.filter((x) => x.result === "created").length} created, ${r.data.results.filter((x) => x.result === "error").length} failed.`,
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Request failed.");
    } finally {
      setTchLoading(false);
    }
  };

  const resetTch = () => {
    setTchFile(null);
    setTchRows([]);
    setTchErrs([]);
    setTchGrpName("none");
    setTchRes(null);
  };

  const dlTchPw: false | (() => void) = tchRes?.passwordsCsv
    ? () => {
        const b = new Blob([tchRes.passwordsCsv!], { type: "text/csv" });
        const u = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = u;
        a.download = "teacher_passwords.csv";
        a.click();
        URL.revokeObjectURL(u);
      }
    : false;

  const tchCreated = tchRes?.results?.filter((r) => r.result === "created") ?? [];
  const tchFailed = tchRes?.results?.filter((r) => r.result === "error") ?? [];

  const [tchUpDialogOpen, setTchUpDialogOpen] = useState(false);
  const [tchUpFilename, setTchUpFilename] = useState("teacher_passwords");
  const [tchUpLoading, setTchUpLoading] = useState(false);
  const [tchUpKey, setTchUpKey] = useState("");

  // ── Send Credentials state ──
  const [credColl, setCredColl] = useState(false);
  const [credFile, setCredFile] = useState<File | null>(null);
  const [credRows, setCredRows] = useState<CredentialsRow[]>([]);
  const [credErrs, setCredErrs] = useState<string[]>([]);
  const [credLoading, setCredLoading] = useState(false);
  interface CredResponse {
    success: boolean;
    results: Array<{ email: string; name: string; result: "sent" | "error"; message?: string }>;
    summary: { sent: number; failed: number; total: number };
  }
  const [credRes, setCredRes] = useState<CredResponse | null>(null);

  const onCredDrop = useCallback(async (a: File[]) => {
    const f = a[0];
    if (!f) return;
    if (!/\.csv$/i.test(f.name)) {
      toast.error("Only .csv files are accepted.");
      return;
    }
    setCredFile(f);
    setCredRes(null);
    const { rows, errors } = await parseCredentialsFile(f);
    setCredRows(rows);
    setCredErrs(errors);
    if (errors.length) toast.error(`${errors.length} row(s) will be skipped.`);
  }, []);

  const credDrop = useDropzone({
    onDrop: onCredDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    multiple: false,
  });

  const handleCredSubmit = async () => {
    if (!credFile) return void toast.error("Select a CSV file first.");
    if (!credRows.length) return void toast.error("No valid rows.");
    setCredLoading(true);
    setCredRes(null);
    try {
      const fd = new FormData();
      fd.append("file", credFile);
      const r = await axios.post<CredResponse>(
        `${getBackendURL()}/admin/send-credentials-email`,
        fd,
        { withCredentials: true },
      );
      setCredRes(r.data);
      toast.success(
        `${r.data.summary.sent} sent, ${r.data.summary.failed} failed.`,
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Request failed.");
    } finally {
      setCredLoading(false);
    }
  };

  const resetCred = () => {
    setCredFile(null);
    setCredRows([]);
    setCredErrs([]);
    setCredRes(null);
  };

  const credSent = credRes?.results?.filter((r) => r.result === "sent") ?? [];
  const credFailed = credRes?.results?.filter((r) => r.result === "error") ?? [];

  // ── Shared combobox renderers ──

  const collegeCombobox = (
    value: string,
    onChange: (v: string) => void,
    anchor: React.RefObject<HTMLDivElement | null>,
  ) => (
    <Combobox
      value={value}
      onValueChange={(v) => onChange(v ?? "")}
      onOpenChange={(open) => {
        if (open && colleges.length === 0) loadColleges();
      }}
    >
      <ComboboxInput
        placeholder="Select college"
        showTrigger
        showClear
        className="w-52 h-8 text-sm"
      />
      <ComboboxContent anchor={anchor.current}>
        <ComboboxList>
          {colleges.map((c) => (
            <ComboboxItem key={c.id} value={c.id}>
              {c.name}
            </ComboboxItem>
          ))}
          <ComboboxEmpty>No colleges found</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );

  const groupCombobox = (
    value: string,
    onChange: (v: string) => void,
    anchor: React.RefObject<HTMLDivElement | null>,
  ) => (
    <Combobox
      value={value}
      onValueChange={(v) => {
        onChange(v ?? "none");
        if (v && v !== "none" && groups.length === 0) loadGroups();
      }}
    >
      <ComboboxInput
        placeholder="No group"
        showTrigger
        showClear
        className="w-52 h-8 text-sm"
      />
      <ComboboxContent anchor={anchor.current}>
        <ComboboxList>
          <ComboboxItem value="none">None</ComboboxItem>
          {groups.map((g) => (
            <ComboboxItem key={g.id} value={g.name}>
              {g.name}
            </ComboboxItem>
          ))}
          <ComboboxEmpty>No groups found</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );

  const dropZone = (
    rootProps: ReturnType<typeof useDropzone>["getRootProps"],
    inputProps: ReturnType<typeof useDropzone>["getInputProps"],
    isDragActive: boolean,
    fileName: string | null,
    onRemove: () => void,
  ) => (
    <div
      {...rootProps()}
      className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-xs cursor-pointer transition-colors ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
    >
      <input {...inputProps()} />
      <Upload className="h-5 w-5 text-muted-foreground" />
      {fileName ? (
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{fileName}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <p className="text-muted-foreground">
          Drop Excel file here, or <span className="text-primary">browse</span>
        </p>
      )}
    </div>
  );

  const parseErrorsBlock = (errors: string[]) =>
    errors.length > 0 && (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
        <p className="text-xs font-semibold text-destructive mb-1">
          {errors.length} row(s) will be skipped:
        </p>
        <ul className="list-disc list-inside space-y-0.5">
          {errors.slice(0, 5).map((e, i) => (
            <li key={i} className="text-xs text-destructive/80">
              {e}
            </li>
          ))}
          {errors.length > 5 && (
            <li className="text-xs text-muted-foreground">
              +{errors.length - 5} more
            </li>
          )}
        </ul>
      </div>
    );

  const resultsBlock = (
    created: SignupResult[],
    failed: SignupResult[],
    dlPasswords: (() => void) | false,
  ) =>
    (created.length > 0 || failed.length > 0) && (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">Created</span>
              <Badge variant="secondary" className={badgeClass}>
                {created.length}
              </Badge>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-0.5">
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
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Failed</span>
                <Badge variant="destructive" className={badgeClass}>
                  {failed.length}
                </Badge>
              </div>
              {created.length > 0 && dlPasswords && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={dlPasswords}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Passwords CSV
                </Button>
              )}
            </div>
            <div className="max-h-40 overflow-y-auto space-y-0.5">
              {failed.length === 0 ? (
                <p className="text-xs text-muted-foreground">None</p>
              ) : (
                failed.map((r, i) => (
                  <div key={i}>
                    <p className="font-mono text-[11px] text-muted-foreground truncate">
                      {r.email}
                    </p>
                    {r.message && (
                      <p className="text-[10px] text-destructive">{r.message}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <div>
        <h1 className="text-xl font-bold">Bulk Signup</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Upload Excel files to bulk-create student or teacher accounts.
        </p>
      </div>

      {/* ── Students ── */}
      <Collapsible open={stdColl} onOpenChange={setStdColl}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Students
                {stdColl ? (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground shrink-0">
                    College:
                  </span>
                  <div ref={stdCollAnchor}>
                    {collegeCombobox(stdCollegeId, setStdCollegeId, stdCollAnchor)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground shrink-0">
                    Group (optional):
                  </span>
                  <div ref={stdGrpAnchor}>
                    {groupCombobox(stdGrpName, setStdGrpName, stdGrpAnchor)}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={downloadStudentTemplate}>
                  <Download className="h-4 w-4 mr-1" />
                  Template
                </Button>
              </div>

              {dropZone(stdDrop.getRootProps, stdDrop.getInputProps, stdDrop.isDragActive, stdFile?.name ?? null, resetStd)}

              {parseErrorsBlock(stdErrs)}

              {stdRows.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Preview — {stdRows.length} student(s)
                  </span>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10 text-xs">#</TableHead>
                          <TableHead className={headerClass}>Name</TableHead>
                          <TableHead className={headerClass}>Email</TableHead>
                          <TableHead className={headerClass}>Roll Number</TableHead>
                          <TableHead className={headerClass}>Branch</TableHead>
                          <TableHead className={headerClass}>Semester</TableHead>
                          <TableHead className={headerClass}>Batch</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stdRows.slice(0, 50).map((r, i) => (
                          <TableRow key={i}>
                            <TableCell className={cellClass + " text-muted-foreground"}>{i + 1}</TableCell>
                            <TableCell className={cellClass + " font-medium"}>{r.Name}</TableCell>
                            <TableCell className={cellClass}>{r.Email}</TableCell>
                            <TableCell className={cellClass}>{r["Roll Number"]}</TableCell>
                            <TableCell className={cellClass}>{r.Branch || "—"}</TableCell>
                            <TableCell className={cellClass}>{r.Semester || "—"}</TableCell>
                            <TableCell className={cellClass}>{r.Batch || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {stdRows.length > 50 && (
                    <p className="text-xs text-muted-foreground">Showing first 50 of {stdRows.length} rows.</p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleStdSubmit}
                  disabled={stdLoading || stdRows.length === 0}
                  className="flex-1"
                  size="sm"
                >
                  {stdLoading
                    ? "Creating accounts..."
                    : `Sign Up ${stdRows.length} Student${stdRows.length !== 1 ? "s" : ""}`}
                </Button>
                {stdRes && (
                  <Button variant="outline" size="sm" onClick={resetStd}>
                    Upload Another File
                  </Button>
                )}
              </div>

              {resultsBlock(stdCreated, stdFailed, dlStdPw)}

              {stdRes?.passwordsCsv && (
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setStdUpFilename("student_passwords");
                      setStdUpDialogOpen(true);
                    }}
                    disabled={!!stdUpKey}
                  >
                    <CloudUpload className="h-3 w-3 mr-1" />
                    {stdUpKey ? "Uploaded to S3" : "Upload to S3"}
                  </Button>
                </div>
              )}

              <Dialog open={stdUpDialogOpen} onOpenChange={setStdUpDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Passwords to S3</DialogTitle>
                    <DialogDescription>
                      Choose a file name for the passwords CSV.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="std-up-filename">File name</Label>
                    <Input
                      id="std-up-filename"
                      value={stdUpFilename}
                      onChange={(e) => setStdUpFilename(e.target.value)}
                      placeholder="student_passwords"
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </DialogClose>
                    <Button
                      size="sm"
                      disabled={stdUpLoading || !stdUpFilename.trim()}
                      onClick={() => {
                        handleUploadS3(
                          stdRes!.passwordsCsv,
                          stdUpFilename.trim() || "student_passwords",
                          setStdUpLoading,
                          setStdUpKey,
                        );
                        setStdUpDialogOpen(false);
                      }}
                    >
                      {stdUpLoading ? "Uploading..." : "Upload"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── Teachers ── */}
      <Collapsible open={tchColl} onOpenChange={setTchColl}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Teachers
                {tchColl ? (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground shrink-0">
                    College:
                  </span>
                  <div ref={tchCollAnchor}>
                    {collegeCombobox(tchCollegeId, setTchCollegeId, tchCollAnchor)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground shrink-0">
                    Group (optional):
                  </span>
                  <div ref={tchGrpAnchor}>
                    {groupCombobox(tchGrpName, setTchGrpName, tchGrpAnchor)}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={downloadTeacherTemplate}>
                  <Download className="h-4 w-4 mr-1" />
                  Template
                </Button>
              </div>

              {dropZone(tchDrop.getRootProps, tchDrop.getInputProps, tchDrop.isDragActive, tchFile?.name ?? null, resetTch)}

              {parseErrorsBlock(tchErrs)}

              {tchRows.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Preview — {tchRows.length} teacher(s)
                  </span>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10 text-xs">#</TableHead>
                          <TableHead className={headerClass}>Name</TableHead>
                          <TableHead className={headerClass}>Email</TableHead>
                          <TableHead className={headerClass}>Employee ID</TableHead>
                          <TableHead className={headerClass}>Department</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tchRows.slice(0, 50).map((r, i) => (
                          <TableRow key={i}>
                            <TableCell className={cellClass + " text-muted-foreground"}>{i + 1}</TableCell>
                            <TableCell className={cellClass + " font-medium"}>{r.Name}</TableCell>
                            <TableCell className={cellClass}>{r.Email}</TableCell>
                            <TableCell className={cellClass}>{r["Employee ID"] || "—"}</TableCell>
                            <TableCell className={cellClass}>{r.Department || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {tchRows.length > 50 && (
                    <p className="text-xs text-muted-foreground">Showing first 50 of {tchRows.length} rows.</p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleTchSubmit}
                  disabled={tchLoading || tchRows.length === 0}
                  className="flex-1"
                  size="sm"
                >
                  {tchLoading
                    ? "Creating accounts..."
                    : `Sign Up ${tchRows.length} Teacher${tchRows.length !== 1 ? "s" : ""}`}
                </Button>
                {tchRes && (
                  <Button variant="outline" size="sm" onClick={resetTch}>
                    Upload Another File
                  </Button>
                )}
              </div>

              {resultsBlock(tchCreated, tchFailed, dlTchPw)}

              {tchRes?.passwordsCsv && (
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setTchUpFilename("teacher_passwords");
                      setTchUpDialogOpen(true);
                    }}
                    disabled={!!tchUpKey}
                  >
                    <CloudUpload className="h-3 w-3 mr-1" />
                    {tchUpKey ? "Uploaded to S3" : "Upload to S3"}
                  </Button>
                </div>
              )}

              <Dialog open={tchUpDialogOpen} onOpenChange={setTchUpDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Passwords to S3</DialogTitle>
                    <DialogDescription>
                      Choose a file name for the passwords CSV.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="tch-up-filename">File name</Label>
                    <Input
                      id="tch-up-filename"
                      value={tchUpFilename}
                      onChange={(e) => setTchUpFilename(e.target.value)}
                      placeholder="teacher_passwords"
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </DialogClose>
                    <Button
                      size="sm"
                      disabled={tchUpLoading || !tchUpFilename.trim()}
                      onClick={() => {
                        handleUploadS3(
                          tchRes!.passwordsCsv,
                          tchUpFilename.trim() || "teacher_passwords",
                          setTchUpLoading,
                          setTchUpKey,
                        );
                        setTchUpDialogOpen(false);
                      }}
                    >
                      {tchUpLoading ? "Uploading..." : "Upload"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── Send Credentials ── */}
      <Collapsible open={credColl} onOpenChange={setCredColl}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Send Credentials
                {credColl ? (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Upload a CSV file with columns <strong>Email,Password</strong> to send
                each user a personalized email with their login credentials.
              </p>

              {dropZone(credDrop.getRootProps, credDrop.getInputProps, credDrop.isDragActive, credFile?.name ?? null, resetCred)}

              {parseErrorsBlock(credErrs)}

              {credRows.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Preview — {credRows.length} user(s)
                  </span>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10 text-xs">#</TableHead>
                          <TableHead className={headerClass}>Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {credRows.slice(0, 50).map((r, i) => (
                          <TableRow key={i}>
                            <TableCell className={cellClass + " text-muted-foreground"}>{i + 1}</TableCell>
                            <TableCell className={cellClass + " font-medium"}>{r.Email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {credRows.length > 50 && (
                    <p className="text-xs text-muted-foreground">Showing first 50 of {credRows.length} rows.</p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleCredSubmit}
                  disabled={credLoading || credRows.length === 0}
                  className="flex-1"
                  size="sm"
                >
                  {credLoading
                    ? "Sending emails..."
                    : `Send Emails to ${credRows.length} User${credRows.length !== 1 ? "s" : ""}`}
                </Button>
                {credRes && (
                  <Button variant="outline" size="sm" onClick={resetCred}>
                    Upload Another File
                  </Button>
                )}
              </div>

              {credRes && (credSent.length > 0 || credFailed.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">Sent</span>
                        <Badge variant="secondary" className={badgeClass}>
                          {credSent.length}
                        </Badge>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-0.5">
                        {credSent.length === 0 ? (
                          <p className="text-xs text-muted-foreground">None</p>
                        ) : (
                          credSent.map((r, i) => (
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
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">Failed</span>
                        <Badge variant="destructive" className={badgeClass}>
                          {credFailed.length}
                        </Badge>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-0.5">
                        {credFailed.length === 0 ? (
                          <p className="text-xs text-muted-foreground">None</p>
                        ) : (
                          credFailed.map((r, i) => (
                            <div key={i}>
                              <p className="font-mono text-[11px] text-muted-foreground truncate">
                                {r.email}
                              </p>
                              {r.message && (
                                <p className="text-[10px] text-destructive">{r.message}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
