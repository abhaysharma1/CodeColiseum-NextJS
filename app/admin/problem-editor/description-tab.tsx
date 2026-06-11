"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface DescriptionTabProps {
  description: string;
  onChangeDescription: (value: string) => void;
}

export function DescriptionTab(props: DescriptionTabProps) {
  const { description, onChangeDescription } = props;
  const { theme } = useTheme();

  const editorTheme = theme === "dark" ? "vs-dark" : "vs-light";

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
              value={description}
              onChange={(value) => onChangeDescription(value ?? "")}
              options={commonEditorOptions}
              className="py-3 px-2"
            />
          </Card>
        </section>
      </div>

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
                  {description}
                </Markdown>
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
