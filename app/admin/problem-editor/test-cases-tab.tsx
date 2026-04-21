"use client";

import { useRef, useState, ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TestCaseGroups, TestCase } from "./types";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Upload,
  FileJson,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TestCasesTabProps {
  testCases: TestCaseGroups;
  onChangeTestCases: (testCases: TestCaseGroups) => void;
}

export function TestCasesTab(props: TestCasesTabProps) {
  const { testCases, onChangeTestCases } = props;

  const [activeGroup, setActiveGroup] = useState<"public" | "hidden">("public");
  const [activeCaseId, setActiveCaseId] = useState<string | null>(
    testCases.public[0]?.id || null
  );

  const [jsonText, setJsonText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const appendCases = (kind: "public" | "hidden", cases: TestCase[]) => {
    onChangeTestCases({
      ...testCases,
      [kind]: [...testCases[kind], ...cases],
    });
    if (cases.length > 0) {
      setActiveGroup(kind);
      setActiveCaseId(cases[0].id);
    }
  };

  const handleAddCase = () => {
    const next: TestCase = {
      id: crypto.randomUUID(),
      input: "",
      output: "",
    };
    appendCases(activeGroup, [next]);
  };

  const handleDeleteCase = (kind: "public" | "hidden", id: string) => {
    const newCases = testCases[kind].filter((item) => item.id !== id);
    onChangeTestCases({
      ...testCases,
      [kind]: newCases,
    });
    if (activeCaseId === id) {
      setActiveCaseId(newCases[0]?.id || null);
    }
  };

  const handleChangeCase = (
    id: string,
    field: "input" | "output",
    value: string
  ) => {
    onChangeTestCases({
      ...testCases,
      [activeGroup]: testCases[activeGroup].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const parseJson = (raw: string): TestCase[] | null => {
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        toast.error("JSON must be an array of test cases.");
        return null;
      }
      const converted: TestCase[] = [];
      for (const entry of data) {
        if (
          !entry ||
          typeof entry.input !== "string" ||
          typeof entry.output !== "string"
        ) {
          toast.error("Each test case must have string 'input' and 'output'.");
          return null;
        }
        converted.push({
          id: crypto.randomUUID(),
          input: entry.input,
          output: entry.output,
        });
      }
      return converted;
    } catch (error) {
      toast.error("Invalid JSON format.");
      return null;
    }
  };

  const handleJsonUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseJson(text);
    if (parsed) {
      appendCases(activeGroup, parsed);
      toast.success(`Imported ${parsed.length} test cases.`);
      setIsDialogOpen(false);
    }
    event.target.value = "";
  };

  const handleJsonPaste = () => {
    const parsed = parseJson(jsonText);
    if (parsed) {
      appendCases(activeGroup, parsed);
      setJsonText("");
      toast.success(`Imported ${parsed.length} test cases.`);
      setIsDialogOpen(false);
    }
  };

  const activeCases = testCases[activeGroup];
  const activeCaseIndex = activeCases.findIndex((c) => c.id === activeCaseId);
  const activeCase = activeCases[activeCaseIndex];

  // Auto-select first case if switched group and nothing selected
  if (
    activeGroup === "hidden" &&
    activeCases.length > 0 &&
    !activeCases.some((c) => c.id === activeCaseId)
  ) {
    setActiveCaseId(activeCases[0].id);
  } else if (
    activeGroup === "public" &&
    activeCases.length > 0 &&
    !activeCases.some((c) => c.id === activeCaseId)
  ) {
    setActiveCaseId(activeCases[0].id);
  }

  return (
    <Card className="flex w-full overflow-hidden border-muted-foreground/20 h-[600px]">
      {/* Sidebar List */}
      <div className="w-64 shrink-0 border-r border-muted-foreground/20 bg-muted/20 flex flex-col">
        <div className="p-3 border-b border-muted-foreground/20">
          <Tabs
            value={activeGroup}
            onValueChange={(v) => setActiveGroup(v as "public" | "hidden")}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="public" className="text-xs">
                Public
              </TabsTrigger>
              <TabsTrigger value="hidden" className="text-xs">
                Hidden
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {activeCases.map((tc, idx) => (
              <button
                key={tc.id}
                onClick={() => setActiveCaseId(tc.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between group ${
                  activeCaseId === tc.id
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="truncate">Case {idx + 1}</span>
                {tc.input && tc.output && activeCaseId !== tc.id && (
                  <CheckCircle2 className="h-3 w-3 opacity-50" />
                )}
              </button>
            ))}
            {activeCases.length === 0 && (
              <div className="text-xs text-center text-muted-foreground py-6">
                No cases yet
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-muted-foreground/20 space-y-2 bg-background/50">
          <Button
            onClick={handleAddCase}
            variant="secondary"
            className="w-full justify-start text-xs h-8"
          >
            <Plus className="h-3 w-3 mr-2" />
            Add Test Case
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-xs h-8"
              >
                <FileJson className="h-3 w-3 mr-2" />
                Bulk Import JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Import to {activeGroup === "public" ? "Public" : "Hidden"}{" "}
                  Cases
                </DialogTitle>
                <DialogDescription>
                  Format: [{`{"input": "1 2", "output": "3"}`}]
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Textarea
                  placeholder="Paste JSON array here..."
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="font-mono text-xs h-32"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleJsonPaste}
                      disabled={!jsonText.trim()}
                    >
                      Parse Pasted JSON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" /> Upload .json
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={handleJsonUpload}
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Detail Pane */}
      <div className="flex-1 flex flex-col bg-background relative">
        {activeCase ? (
          <>
            <div className="h-14 border-b border-muted-foreground/20 flex items-center justify-between px-6 shrink-0">
              <h3 className="font-semibold">
                {activeGroup === "public" ? "Public" : "Hidden"} Case{" "}
                {activeCaseIndex + 1}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteCase(activeGroup, activeCase.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Case
              </Button>
            </div>
            <div className="flex-1 p-6 grid grid-rows-2 gap-6 min-h-0 overflow-y-auto">
              <div className="flex flex-col space-y-2 h-full">
                <label className="text-sm font-semibold text-muted-foreground">
                  STDIN (Input)
                </label>
                <Textarea
                  value={activeCase.input}
                  onChange={(e) =>
                    handleChangeCase(activeCase.id, "input", e.target.value)
                  }
                  placeholder="Enter inputs exactly as the program should read them..."
                  className="flex-1 font-mono text-sm resize-y focus-visible:ring-1 focus-visible:ring-ring border-muted-foreground/20"
                />
              </div>
              <div className="flex flex-col space-y-2 h-full">
                <label className="text-sm font-semibold text-muted-foreground">
                  Expected STDOUT (Output)
                </label>
                <Textarea
                  value={activeCase.output}
                  onChange={(e) =>
                    handleChangeCase(activeCase.id, "output", e.target.value)
                  }
                  placeholder="Enter the exact expected output..."
                  className="flex-1 font-mono text-sm resize-y focus-visible:ring-1 focus-visible:ring-ring border-muted-foreground/20"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <ListChecks className="h-12 w-12 opacity-20 mb-4" />
            <p>No test case selected</p>
            <Button
              variant="link"
              onClick={handleAddCase}
              className="mt-2 text-primary"
            >
              Create a new test case
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
