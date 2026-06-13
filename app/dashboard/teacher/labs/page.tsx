"use client";
import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
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
import { ArrowUpDown, MoreHorizontal, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { getBackendURL } from "@/utils/utilities";
import type { TeacherLab } from "@/hooks/use-labs";

function ActionsCell({ lab }: { lab: TeacherLab }) {
  const handleDelete = async () => {
    if (!confirm("Delete this lab? This will also remove all modules and progress.")) return;
    try {
      await axios.delete(`${getBackendURL()}/teacher/labs/${lab.id}`, {
        withCredentials: true,
      });
      toast.success("Lab deleted");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete lab");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/teacher/labs/${lab.id}`}>View</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/teacher/labs/${lab.id}?edit=true`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns: ColumnDef<TeacherLab>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Lab Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium max-w-xs truncate">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "modulesCount",
    header: "Modules",
    cell: ({ row }) => {
      const count = row.getValue("modulesCount") as number;
      return <Badge variant="secondary">{count}</Badge>;
    },
  },
  {
    id: "assignedGroups",
    header: "Assigned Groups",
    cell: () => <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <div className="text-sm">
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell lab={row.original} />,
  },
];

export default function TeacherLabsPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<TeacherLab[]>([]);
  const [loading, setLoading] = useState(true);
  const [take] = useState(10);
  const [skip, setSkip] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const fetchLabs = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${getBackendURL()}/teacher/labs`, {
        params: { take, skip, searchvalue: searchValue },
        withCredentials: true,
      });
      const result = res.data as { data: TeacherLab[]; pagination: { total: number } };
      setData(result.data ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch labs");
    } finally {
      setLoading(false);
    }
  }, [take, skip, searchValue]);

  React.useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

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
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name="Labs" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <div className="flex items-center justify-between">
              <Label className="text-3xl font-bold">Labs</Label>
              <Button className="gap-2" onClick={() => router.push("/dashboard/teacher/labs/create")}>
                <Plus className="h-4 w-4" />
                Create Lab
              </Button>
            </div>

            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search labs..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setSkip(0);
                }}
                className="pl-10"
              />
            </div>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/teacher/labs/${row.original.id}`)
                        }
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
                          "No labs found"
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSkip(Math.max(0, skip - take))}
                disabled={skip === 0 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSkip(skip + take)}
                disabled={data.length < take || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
