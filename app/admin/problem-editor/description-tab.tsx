"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { DescriptionSections } from "./types";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

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

  const [markdown, setMarkdown] = useState(combinedMarkdown);
  const lastEmittedSectionsRef = useRef<DescriptionSections | null>(null);

  useEffect(() => {
    const last = lastEmittedSectionsRef.current;
    if (
      last &&
      sections.description === last.description &&
      sections.constraints === last.constraints &&
      sections.inputFormat === last.inputFormat &&
      sections.outputFormat === last.outputFormat
    ) {
      return;
    }

    setMarkdown(combinedMarkdown);
  }, [combinedMarkdown, sections]);

  const parseMarkdownToSections = (raw: string): DescriptionSections => {
    const text = (raw || "").replace(/\r\n/g, "\n");

    const out: DescriptionSections = {
      description: "",
      constraints: "",
      inputFormat: "",
      outputFormat: "",
    };

    const headingRe =
      /^##\s*(description|constraints|input format|output format)\s*$/gim;
    const headings: Array<{
      key: keyof DescriptionSections;
      headingStart: number;
      contentStart: number;
    }> = [];

    let match: RegExpExecArray | null;
    while ((match = headingRe.exec(text)) !== null) {
      const headingStart = match.index;
      const headingText = (match[1] || "").toLowerCase();
      const key: keyof DescriptionSections =
        headingText === "description"
          ? "description"
          : headingText === "constraints"
            ? "constraints"
            : headingText === "input format"
              ? "inputFormat"
              : "outputFormat";

      const lineBreakIdx = text.indexOf("\n", headingRe.lastIndex);
      const contentStart = lineBreakIdx === -1 ? text.length : lineBreakIdx + 1;

      headings.push({ key, headingStart, contentStart });
    }

    if (headings.length === 0) {
      out.description = text.trim();
      return out;
    }

    headings.sort((a, b) => a.headingStart - b.headingStart);

    const preface = text.slice(0, headings[0].headingStart).trim();
    if (preface) {
      out.description = preface;
    }

    for (let i = 0; i < headings.length; i++) {
      const curr = headings[i];
      const nextHeadingStart =
        i + 1 < headings.length ? headings[i + 1].headingStart : text.length;
      const content = text.slice(curr.contentStart, nextHeadingStart).trim();

      if ((out[curr.key] || "").length > 0) {
        continue;
      }
      out[curr.key] = content;
    }

    return out;
  };

  const handleMarkdownChange = (value?: string) => {
    const next = value ?? "";
    setMarkdown(next);

    const parsed = parseMarkdownToSections(next);
    lastEmittedSectionsRef.current = parsed;
    onChangeSections(parsed);
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
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold tracking-tight">
              Description
            </h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Markdown
            </span>
          </div>
          <Card className="overflow-hidden border-muted-foreground/20 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all">
            <Editor
              height="550px"
              language="markdown"
              theme={editorTheme}
              value={markdown}
              onChange={handleMarkdownChange}
              options={commonEditorOptions}
              className="py-3 px-2"
            />
          </Card>
        </section>
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
              <div className="markdown-wrapper text-foreground mb-6">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {markdown}
                </Markdown>
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
