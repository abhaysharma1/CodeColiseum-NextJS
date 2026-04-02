"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { DescriptionSections } from "./types";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Type, Ruler, ArrowRightToLine, ArrowLeftFromLine } from "lucide-react";

interface DescriptionTabProps {
  sections: DescriptionSections;
  onChangeSections: (sections: DescriptionSections) => void;
}

export function DescriptionTab(props: DescriptionTabProps) {
  const { sections, onChangeSections } = props;
  const { theme } = useTheme();

  const editorTheme = theme === "dark" ? "vs-dark" : "vs-light";

  const combinedMarkdown = useMemo(() => {
    const parts: string[] = [];

    parts.push("## Description\n\n" + (sections.description || ""));
    parts.push("\n\n## Constraints\n\n" + (sections.constraints || ""));
    parts.push("\n\n## Input Format\n\n" + (sections.inputFormat || ""));
    parts.push("\n\n## Output Format\n\n" + (sections.outputFormat || ""));

    return parts.join("");
  }, [sections]);

  const handleChange = (key: keyof DescriptionSections, value: string) => {
    onChangeSections({ ...sections, [key]: value });
  };

  const commonEditorOptions = {
    wordWrap: "on" as const,
    minimap: { enabled: false },
    lineNumbers: "off" as const,
    scrollBeyondLastLine: false,
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    renderLineHighlight: "none" as const,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.5fr_1fr] items-start">
      <div className="flex flex-col gap-6">
        {/* Description Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Type className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-semibold tracking-tight">
              Main Description
            </h3>
          </div>
          <Card className="overflow-hidden border-muted-foreground/20 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all">
            <Editor
              height="250px"
              language="markdown"
              theme={editorTheme}
              value={sections.description}
              onChange={(value) => handleChange("description", value || "")}
              options={commonEditorOptions}
              className="py-3 px-2"
            />
          </Card>
        </section>

        {/* Constraints Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Ruler className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-semibold tracking-tight">
              Constraints
            </h3>
          </div>
          <Card className="overflow-hidden border-muted-foreground/20 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all">
            <Editor
              height="150px"
              language="markdown"
              theme={editorTheme}
              value={sections.constraints}
              onChange={(value) => handleChange("constraints", value || "")}
              options={commonEditorOptions}
              className="py-3 px-2"
            />
          </Card>
        </section>

        {/* Input/Output Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <ArrowRightToLine className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-semibold tracking-tight">
                Input Format
              </h3>
            </div>
            <Card className="overflow-hidden border-muted-foreground/20 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all">
              <Editor
                height="150px"
                language="markdown"
                theme={editorTheme}
                value={sections.inputFormat}
                onChange={(value) => handleChange("inputFormat", value || "")}
                options={commonEditorOptions}
                className="py-3 px-2"
              />
            </Card>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <ArrowLeftFromLine className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-semibold tracking-tight">
                Output Format
              </h3>
            </div>
            <Card className="overflow-hidden border-muted-foreground/20 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all">
              <Editor
                height="150px"
                language="markdown"
                theme={editorTheme}
                value={sections.outputFormat}
                onChange={(value) => handleChange("outputFormat", value || "")}
                options={commonEditorOptions}
                className="py-3 px-2"
              />
            </Card>
          </section>
        </div>
      </div>

      {/* Sticky Preview */}
      <div className="sticky top-24 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <h3 className="text-sm font-semibold tracking-tight">
              Live Preview
            </h3>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Markdown
          </span>
        </div>
        <Card className="overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm border-muted-foreground/20">
          <ScrollArea className="h-[calc(100vh-14rem)] p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-pre:bg-muted/50 prose-pre:text-foreground">
              <MarkdownRenderer>{combinedMarkdown}</MarkdownRenderer>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
