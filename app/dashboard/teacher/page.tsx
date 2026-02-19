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
import { Input } from "@/components/ui/input";
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
import Link from "next/link";
import axios from "axios";
import { Exam } from "@/generated/prisma/client";

export interface incomingData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string | null;
  isPublished: boolean;
  creatorId: string;
  startDate: Date;
  endDate: Date;
}

const columns: ColumnDef<incomingData>[] = [

  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <div className="ml-3">
          Title
        </div>
      );
    },
    cell: ({ row }) => (
      <div className=" ml-3 capitalize">{row.getValue("title")}</div>
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
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("startDate") as Date;
      const formattedDate = new Date(date);

      return (
        <div className="">
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
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("endDate") as Date;
      const formattedDate = new Date(date);

      return (
        <div className="text-left font-medium">
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
    accessorKey: "description",
    header: () => <div className="text-left">Description</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium w-[15vw] truncate">
          {row.getValue("description") || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") as boolean;
      return (
        <div className="text-center font-medium">
          {isPublished ? "Published" : "Draft"}
        </div>
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
            <Button variant="outline" className="h-7" asChild>
              <Link href={`/dashboard/teacher/test/seeresults/${exam.id}`}>
                See Results
              </Link>
            </Button>
          ) : (
            <Button variant="outline" className="h-7" asChild>
              <Link href={`teacher/test/edit/${exam.id}`}>Edit</Link>
            </Button>
          )}
        </div>
      );
    },
  },
];

export default function DataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState<incomingData[] >([]);

  const [draftingExam, setDraftingExam] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [take,setTake] = React.useState(8);
  const [skip,setSkip] = React.useState(0);
  const [searchValue,setSearchValue] = React.useState("");

  const router = useRouter();

  React.useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      const allTests = await fetchAllExams();
      setData(allTests ?? []);
      setLoading(false);
    };

    fetchExams();
  }, [skip, take, searchValue]);

  const fetchAllExams = async() => {
    try {
        const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN
        const res = await axios.get(`${domain}/teacher/exam/fetchallexams`, {
          params: {
            take: take,
            skip: skip,
            searchvalue: searchValue
          },
          withCredentials: true
        });
        console.log(res)
        return res.data as incomingData[]
    } catch (error) {
      console.log(error)
    }
  }

  const draftExam = async () => {
    try {
      setDraftingExam(true)
      const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN
      const res = await axios.get(`${domain}/teacher/exam/draftexam`,{withCredentials:true});
      const exam = res.data as Exam
      router.push(`/dashboard/teacher/test/edit/${exam.id}`)
    } catch (error) {
      console.log(error)
    }finally{
      setDraftingExam(false)
    }
  }

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

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name={"Dashboard"} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <Label className="text-3xl">Examinations</Label>
            <div className="flex items-center py-4 justify-between">
              <Input
                placeholder="Search tests..."
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setSkip(0);
                }}
                className="max-w-sm"
              />

              <div className="">
                <Button
                  className="mr-4"
                  variant="default"
                  disabled={draftingExam}
                  onClick={draftExam}
                >
                  {draftingExam ? "Wait..." : "Create Exam"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Columns <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="overflow-hidden rounded-md border">
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
                                  header.getContext(),
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
                              cell.getContext(),
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
                          "No Results"
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-muted-foreground flex-1 text-sm">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
                {" "}· Page {Math.floor(skip / take) + 1}
              </div>
              <div className="space-x-2">
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
