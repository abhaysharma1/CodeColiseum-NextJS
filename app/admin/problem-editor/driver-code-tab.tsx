"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { DriverCodeByLanguage, LanguageId } from "./types";
import { Code2, Settings2, FileOutput, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DriverCodeTabProps {
  driverCode: DriverCodeByLanguage;
  activeLanguage: LanguageId;
  onChangeLanguage: (lang: LanguageId) => void;
  onChangeDriverCode: (
    lang: LanguageId,
    section: "header" | "template" | "footer",
    value: string
  ) => void;
}

const languageOptions: { value: LanguageId; label: string; monaco: string }[] =
  [
    { value: "cpp", label: "C++", monaco: "cpp" },
    { value: "python", label: "Python", monaco: "python" },
    { value: "java", label: "Java", monaco: "java" },
    { value: "javascript", label: "JavaScript", monaco: "javascript" },
  ];

export function DriverCodeTab(props: DriverCodeTabProps) {
  const { driverCode, activeLanguage, onChangeLanguage, onChangeDriverCode } =
    props;
  const { theme } = useTheme();

  const editorTheme = theme === "dark" ? "vs-dark" : "vs-light";

  const active = driverCode[activeLanguage];
  const monacoLang =
    languageOptions.find((l) => l.value === activeLanguage)?.monaco ?? "cpp";

  const commonEditorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    automaticLayout: true,
    renderLineHighlight: "none" as const,
    hideCursorInOverviewRuler: true,
    padding: { top: 12, bottom: 12 },
  };

  const renderSection = (
    section: "header" | "template" | "footer",
    label: string,
    helper: string,
    Icon: any
  ) => (
    <Card className="overflow-hidden border-muted-foreground/20 shadow-sm flex flex-col focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all">
      <div className="bg-muted/30 px-4 py-3 border-b border-muted-foreground/10 flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-md text-primary mt-0.5">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">{label}</h4>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Info className="h-3 w-3" /> {helper}
          </p>
        </div>
      </div>
      <Editor
        height="220px"
        language={monacoLang}
        theme={editorTheme}
        value={active?.[section] ?? ""}
        onChange={(value) =>
          onChangeDriverCode(activeLanguage, section, value || "")
        }
        options={commonEditorOptions}
        className="w-full"
      />
    </Card>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-8">
      <div className="flex flex-col gap-4 text-center md:text-left">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Environment Setup
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure the execution wrapper students will run inside for each
            language.
          </p>
        </div>

        <Tabs
          value={activeLanguage}
          onValueChange={(v) => onChangeLanguage(v as LanguageId)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 gap-1 bg-muted/50 rounded-xl">
            {languageOptions.map((lang) => (
              <TabsTrigger
                key={lang.value}
                value={lang.value}
                className="rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium transition-all"
              >
                {lang.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-6">
        {renderSection(
          "header",
          "Header Source",
          "Hidden code before student template (e.g. #include <iostream>, import sys)",
          Settings2
        )}

        {renderSection(
          "template",
          "Student Template",
          "Starter code visible to students when they begin (e.g. class Solution { public: ... })",
          Code2
        )}

        {renderSection(
          "footer",
          "Execution Footer",
          "Hidden code after student answer used for parsing stdin and printing stdout.",
          FileOutput
        )}
      </div>
    </div>
  );
}
