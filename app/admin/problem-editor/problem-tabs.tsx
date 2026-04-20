"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DescriptionTab } from "./description-tab";
import { TestCasesTab } from "./test-cases-tab";
import { DriverCodeTab } from "./driver-code-tab";
import { ReferenceSolutionTab } from "./reference-solution-tab";
import { FileText, ListChecks, Code2, TerminalSquare } from "lucide-react";
import {
  DriverCodeByLanguage,
  ProblemEditorState,
  TestCaseGroups,
  ReferenceSolution,
  LanguageId,
} from "./types";

interface ProblemTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  state: ProblemEditorState;
  onChangeSections: (sections: ProblemEditorState["sections"]) => void;
  onChangeTestCases: (testCases: TestCaseGroups) => void;
  onChangeDriverCode: (
    lang: LanguageId,
    section: "header" | "template" | "footer",
    value: string
  ) => void;
  onChangeDriverLanguage: (lang: LanguageId) => void;
  activeDriverLanguage: LanguageId;
  onChangeSolutions: (solutions: ReferenceSolution[]) => void;
}

export function ProblemTabs(props: ProblemTabsProps) {
  const {
    activeTab,
    onTabChange,
    state,
    onChangeSections,
    onChangeTestCases,
    onChangeDriverCode,
    onChangeDriverLanguage,
    activeDriverLanguage,
    onChangeSolutions,
  } = props;

  return (
    <div className="flex flex-col w-full h-full">
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full flex-1 flex flex-col"
      >
        <div className="flex w-full items-center justify-center sm:justify-start overflow-x-auto pb-4 hide-scrollbar">
          <TabsList className="h-12 w-auto bg-muted/50 p-1 rounded-full grid grid-cols-4 gap-1">
            <TabsTrigger
              className="rounded-full px-4 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2"
              value="description"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Description</span>
            </TabsTrigger>
            <TabsTrigger
              className="rounded-full px-4 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2"
              value="test-cases"
            >
              <ListChecks className="h-4 w-4" />
              <span className="hidden sm:inline">Test Cases</span>
            </TabsTrigger>
            <TabsTrigger
              className="rounded-full px-4 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2"
              value="driver-code"
            >
              <Code2 className="h-4 w-4" />
              <span className="hidden sm:inline">Driver Code</span>
            </TabsTrigger>
            <TabsTrigger
              className="rounded-full px-4 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2"
              value="reference-solution"
            >
              <TerminalSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Solutions</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 mt-2">
          <TabsContent
            value="description"
            className="m-0 h-full border-none data-[state=active]:flex data-[state=active]:flex-col"
          >
            <DescriptionTab
              sections={state.sections}
              onChangeSections={onChangeSections}
            />
          </TabsContent>

          <TabsContent
            value="test-cases"
            className="m-0 h-full border-none data-[state=active]:flex data-[state=active]:flex-col"
          >
            <TestCasesTab
              testCases={state.testCases}
              onChangeTestCases={onChangeTestCases}
            />
          </TabsContent>

          <TabsContent
            value="driver-code"
            className="m-0 h-full border-none data-[state=active]:flex data-[state=active]:flex-col"
          >
            <DriverCodeTab
              driverCode={state.driverCode as DriverCodeByLanguage}
              activeLanguage={activeDriverLanguage}
              onChangeLanguage={onChangeDriverLanguage}
              onChangeDriverCode={onChangeDriverCode}
            />
          </TabsContent>

          <TabsContent
            value="reference-solution"
            className="m-0 h-full border-none data-[state=active]:flex data-[state=active]:flex-col"
          >
            <ReferenceSolutionTab
              solutions={state.solutions}
              testCases={state.testCases}
              onChangeSolutions={onChangeSolutions}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
