"use client";
import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import axios from "axios";
import { Exam } from "@/generated/prisma/client";
import { getBackendURL } from "@/utils/utilities";
import { TestFilters, TestFilterState } from "@/components/tests/TestFilters";
import { BulkActionsToolbar } from "@/components/tests/BulkActionsToolbar";
import { toast } from "sonner";

export interface TestData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string | null;
  isPublished: boolean;
  creatorId: string;
  startDate: Date;
  endDate: Date;
  studentCount?: number;
  passingPercentage?: number;
  lastSubmittedDate?: Date;
}

const columns: ColumnDef<TestData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium max-w-xs truncate">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("startDate") as Date;
      const formattedDate = new Date(date);
      return (
        <div className="text-sm">
          {formattedDate.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("endDate") as Date;
      const formattedDate = new Date(date);
      return (
        <div className="text-sm">
          {formattedDate.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "studentCount",
    header: "Students",
    cell: ({ row }) => {
      const count = row.getValue("studentCount") as number | undefined;
      return (
        <Badge variant="secondary" className="font-semibold">
          {count ?? 0} students
        </Badge>
      );
    },
  },
  {
    accessorKey: "passingPercentage",
    header: "Passing %",
    cell: ({ row }) => {
      const percentage = row.getValue("passingPercentage") as
        | number
        | undefined;
      if (!percentage) return <span className="text-muted-foreground">-</span>;
      const isHigh = percentage >= 70;
      return (
        <div
          className={`font-semibold ${
            isHigh
              ? "text-green-600 dark:text-green-400"
              : "text-orange-600 dark:text-orange-400"
          }`}
        >
          {Math.round(percentage)}%
        </div>
      );
    },
  },
  {
    accessorKey: "isPublished",
    header: "Status",
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") as boolean;
      return (
        <Badge
          variant={isPublished ? "default" : "secondary"}
          className={isPublished ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const exam = row.original;
      return (
        <div className="flex space-x-2">
          {exam.isPublished ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/teacher/tests/results/${exam.id}`}>
                See Results
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/teacher/tests/edit/${exam.id}`}>
                Edit
              </Link>
            </Button>
          )}
        </div>
      );
    },
  },
];

export default function TestsPage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState<TestData[]>([]);

  const [loading, setLoading] = React.useState(false);
  const [take, setTake] = React.useState(10);
  const [skip, setSkip] = React.useState(0);
  const [draftingExam, setDraftingExam] = React.useState(false);

  const [filters, setFilters] = React.useState<TestFilterState>({
    search: "",
    status: null,
    dateFrom: null,
    dateTo: null,
  });

  const router = useRouter();

  React.useEffect(() => {
    fetchTests();
  }, [skip, take, filters]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const domain = getBackendURL();
      const params: any = {
        take,
        skip,
        searchvalue: filters.search,
      };

      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom.toISOString();
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo.toISOString();
      }

      const res = await axios.get(`${domain}/teacher/exam/fetchallexams`, {
        params,
        withCredentials: true,
      });
      setData((res.data as TestData[]) ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  const draftExam = async () => {
    try {
      setDraftingExam(true);
      const domain = getBackendURL();
      const res = await axios.get(`${domain}/teacher/exam/draftexam`, {
        withCredentials: true,
      });
      const exam = res.data as Exam;
      router.push(`/dashboard/teacher/tests/edit/${exam.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create exam");
    } finally {
      setDraftingExam(false);
    }
  };

  const handlePublishTests = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);

    try {
      const domain = getBackendURL();
      await axios.post(
        `${domain}/teacher/exam/publish-bulk`,
        { testIds: selectedIds },
        { withCredentials: true }
      );
      await fetchTests();
      table.resetRowSelection();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteTests = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);

    try {
      const domain = getBackendURL();
      await axios.post(
        `${domain}/teacher/exam/delete-bulk`,
        { testIds: selectedIds },
        { withCredentials: true }
      );
      await fetchTests();
      table.resetRowSelection();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleExportTests = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);

    try {
      const domain = getBackendURL();
      const response = await axios.post(
        `${domain}/teacher/exam/export-csv`,
        { testIds: selectedIds },
        {
          withCredentials: true,
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(response.data as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `tests-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name={"Tests & Exams"} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <div className="flex items-center justify-between">
              <Label className="text-3xl font-bold">Tests & Exams</Label>
              <Button
                className="gap-2"
                disabled={draftingExam}
                onClick={draftExam}
              >
                {draftingExam ? "Creating..." : "Create New Test"}
              </Button>
            </div>

            {/* Filters */}
            <TestFilters
              filterState={filters}
              onFilterChange={setFilters}
              onReset={() => setSkip(0)}
            />

            {/* Bulk Actions Toolbar */}
            {selectedCount > 0 && (
              <BulkActionsToolbar
                selectedCount={selectedCount}
                onPublish={async () => await handlePublishTests()}
                onDelete={async () => await handleDeleteTests()}
                onExport={async () => await handleExportTests()}
                onClearSelection={() => table.resetRowSelection()}
              />
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        {loading ? (
                          <div className="w-full flex justify-center">
                            <Spinner variant="infinite" />
                          </div>
                        ) : (
                          "No tests found"
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-sm text-muted-foreground">
                {selectedCount > 0 && (
                  <>
                    {selectedCount} of {table.getFilteredRowModel().rows.length}{" "}
                    row(s) selected ·
                  </>
                )}
                Page {Math.floor(skip / take) + 1} of{" "}
                {Math.ceil(data.length / take) || 1}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSkip((prev) => Math.max(0, prev - take))}
                  disabled={skip === 0 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSkip((prev) => prev + take)}
                  disabled={data.length < take || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
