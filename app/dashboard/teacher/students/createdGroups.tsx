"use client";
import * as React from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, ArrowUpDown, Bot, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import axios from "axios";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { TbReload } from "react-icons/tb";
import Link from "next/link";
import { getBackendURL } from "@/utils/utilities";
import { Group } from "@/generated/prisma/client";

export const columns: ColumnDef<Group>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 font-semibold"
      >
        Group Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc: string = row.getValue("description");
      return (
        <div className="text-muted-foreground text-sm truncate max-w-[200px]">
          {desc || <span className="italic">No description</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type: string = row.getValue("type");
      return (
        <Badge variant="outline">{type[0] + type.slice(1).toLowerCase()}</Badge>
      );
    },
  },
  {
    accessorKey: "noOfMembers",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 font-semibold text-center"
      >
        <Users className="mr-1 h-4 w-4" />
        Students
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {row.getValue("noOfMembers")}
      </div>
    ),
  },
  {
    accessorKey: "aiEnabled",
    header: () => (
      <div className="flex items-center gap-1">
        <Bot className="h-4 w-4" />
        AI
      </div>
    ),
    cell: ({ row }) => {
      const enabled: boolean = row.getValue("aiEnabled");
      return (
        <Badge variant={enabled ? "default" : "outline"}>
          {enabled ? "Enabled" : "Disabled"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 font-semibold"
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-muted-foreground text-sm whitespace-nowrap">
          {date.toLocaleDateString(undefined, {
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
    cell: ({ row }) => (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/dashboard/teacher/students/editgroup/${row.original.id}`}>
          View Details
        </Link>
      </Button>
    ),
  },
];

function CreatedGroups() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [data, setData] = React.useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = React.useState(false);

  const [groupType, setGroupType] = React.useState("ALL");

  const take = 8;
  const [inputValue, setInputValue] = React.useState("");
  const [params, setParams] = React.useState({ skip: 0, search: "" });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  const fetchGroups = React.useCallback(
    async (currentSkip: number, currentSearch: string, groupType: string) => {
      setLoadingGroups(true);
      try {
        const response = await axios.get(
          `${getBackendURL()}/teacher/getallgroups`,
          {
            params: {
              take,
              skip: currentSkip,
              searchValue: currentSearch,
              groupType: groupType,
            },
            withCredentials: true,
          }
        );
        setData(response.data as Group[]);
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast.error("Failed to fetch groups");
      } finally {
        setLoadingGroups(false);
      }
    },
    [take]
  );

  // Single fetch effect — fires whenever skip or search changes atomically
  React.useEffect(() => {
    fetchGroups(params.skip, params.search, groupType);
  }, [params, fetchGroups, groupType]);

  // Debounce search input — resets skip to 0 atomically with the new search value
  React.useEffect(() => {
    const t = setTimeout(() => {
      setParams({ skip: 0, search: inputValue });
    }, 400);
    return () => clearTimeout(t);
  }, [inputValue]);

  const handlePrev = () =>
    setParams((prev) => ({ ...prev, skip: Math.max(0, prev.skip - take) }));

  const handleNext = () =>
    setParams((prev) => ({ ...prev, skip: prev.skip + take }));

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between w-full">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Created Groups
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage and view all your student groups.
          </p>
        </div>
        <Button variant="default" asChild>
          <Link href="/dashboard/teacher/students/creategroup">
            + Create Group
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by group name..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"}>
              {groupType[0] + groupType.slice(1).toLowerCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setGroupType("All")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGroupType("CLASS")}>
              Class
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGroupType("LAB")}>
              Lab
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchGroups(params.skip, params.search, groupType)}
          disabled={loadingGroups}
        >
          <TbReload className={loadingGroups ? "animate-spin" : ""} />
        </Button>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loadingGroups ? (
        <div className="flex min-h-[20vh] w-full items-center justify-center rounded-md border">
          <Spinner variant="ellipsis" />
        </div>
      ) : (
        <div className="animate-fade-down animate-once animate-ease-in-out overflow-hidden rounded-md border w-full">
          <Table className="w-full">
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="animate-fade-down animate-once animate-ease-in-out"
                      >
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
                    className="h-24 text-center text-muted-foreground"
                  >
                    No groups created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.length > 0
            ? `Showing ${params.skip + 1}–${params.skip + data.length}`
            : "No groups found"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {Math.floor(params.skip / take) + 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={params.skip === 0 || loadingGroups}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={data.length < take || loadingGroups}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreatedGroups;
