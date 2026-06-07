"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FlaskConical, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  isPublished: boolean;
  number: number;
}

const difficultyColor: Record<string, string> = {
  EASY: "bg-green-500/10 text-green-600 border-green-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  HARD: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function RuntimeAnalyzerSelector() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.get<{ problems: Problem[] }>(`${getBackendURL()}/admin/problems`, {
          withCredentials: true,
        });
        setProblems(res.data?.problems ?? []);
      } catch (error: any) {
        toast.error(error?.response?.data?.error ?? "Failed to load problems");
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const filtered = problems.filter(p =>
    `${p.number} ${p.title} ${p.difficulty}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Runtime Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a problem to benchmark solutions against its test cases and generated stress cases.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Problem</CardTitle>
          <CardDescription>Search and select a problem to analyze</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by number, title, or difficulty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading problems...
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {problems.length === 0 ? "No problems found." : "No problems match your search."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-24">Difficulty</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-28"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm text-muted-foreground">{p.number}</TableCell>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={difficultyColor[p.difficulty] ?? ""}>
                        {p.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={p.isPublished
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-muted text-muted-foreground"
                      }>
                        {p.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => router.push(`/admin/problems/${p.id}/runtime-analyzer`)}
                      >
                        <FlaskConical className="h-4 w-4" />
                        Analyze
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
