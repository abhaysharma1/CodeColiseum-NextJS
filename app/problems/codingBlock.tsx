"use client";
import React, { useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Button } from "@/components/ui/button";
import { IoMdSettings } from "react-icons/io";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuGroup,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import axios from "axios";
import { getLanguageId } from "@/utils/getLanguageId";
import { supportedLanguages } from "@/utils/languageCatalog";
import { MdFormatAlignLeft } from "react-icons/md";
import { runTestCaseType, submitTestCaseType } from "./interface";

// Static theme imports
import Active4DTheme from "@/utils/themes/Active4D.json";
import AllHallowsEveTheme from "@/utils/themes/All Hallows Eve.json";
import AmyTheme from "@/utils/themes/Amy.json";
import BirdsOfParadiseTheme from "@/utils/themes/Birds of Paradise.json";
import BlackboardTheme from "@/utils/themes/Blackboard.json";
import BrillianceBlackTheme from "@/utils/themes/Brilliance Black.json";
import BrillianceDullTheme from "@/utils/themes/Brilliance Dull.json";
import ChromeDevToolsTheme from "@/utils/themes/Chrome DevTools.json";
import CloudsMidnightTheme from "@/utils/themes/Clouds Midnight.json";
import CloudsTheme from "@/utils/themes/Clouds.json";
import CobaltTheme from "@/utils/themes/Cobalt.json";
import DawnTheme from "@/utils/themes/Dawn.json";
import DraculaTheme from "@/utils/themes/Dracula.json";
import DreamweaverTheme from "@/utils/themes/Dreamweaver.json";
import EiffelTheme from "@/utils/themes/Eiffel.json";
import EspressoLibreTheme from "@/utils/themes/Espresso Libre.json";
import GitHubTheme from "@/utils/themes/GitHub.json";
import IDLETheme from "@/utils/themes/IDLE.json";
import KatzenmilchTheme from "@/utils/themes/Katzenmilch.json";
import KuroirTheme from "@/utils/themes/Kuroir Theme.json";
import LAZYTheme from "@/utils/themes/LAZY.json";
import MagicWBTheme from "@/utils/themes/MagicWB (Amiga).json";
import MerbivoreSoftTheme from "@/utils/themes/Merbivore Soft.json";
import MerbivoreTheme from "@/utils/themes/Merbivore.json";
import MonokaiBrightTheme from "@/utils/themes/Monokai Bright.json";
import MonokaiTheme from "@/utils/themes/Monokai.json";
import NightOwlTheme from "@/utils/themes/Night Owl.json";
import NordTheme from "@/utils/themes/Nord.json";
import OceanicNextTheme from "@/utils/themes/Oceanic Next.json";
import PastelsOnDarkTheme from "@/utils/themes/Pastels on Dark.json";
import SlushAndPoppiesTheme from "@/utils/themes/Slush and Poppies.json";
import SolarizedDarkTheme from "@/utils/themes/Solarized-dark.json";
import SolarizedLightTheme from "@/utils/themes/Solarized-light.json";
import SpaceCadetTheme from "@/utils/themes/SpaceCadet.json";
import SunburstTheme from "@/utils/themes/Sunburst.json";
import TomorrowNightBlueTheme from "@/utils/themes/Tomorrow-Night-Blue.json";
import TomorrowNightBrightTheme from "@/utils/themes/Tomorrow-Night-Bright.json";
import TomorrowNightEightiesTheme from "@/utils/themes/Tomorrow-Night-Eighties.json";
import TomorrowNightTheme from "@/utils/themes/Tomorrow-Night.json";
import TomorrowTheme from "@/utils/themes/Tomorrow.json";
import TwilightTheme from "@/utils/themes/Twilight.json";
import UpstreamSunburstTheme from "@/utils/themes/Upstream Sunburst.json";
import VibrantInkTheme from "@/utils/themes/Vibrant Ink.json";
import { Palette, Sparkles } from "lucide-react";
import { ThemeName, THEMES } from "@/themes";
import { useCustomTheme } from "@/hooks/use-custom-theme";
import { getBackendURL } from "@/utils/utilities";

interface sentCode {
  questionId: string;
  languageId: number;
  code: string;
}

const availableLanguages = supportedLanguages.map((item) => ({
  id: item.runtimeId,
  name: item.label,
  monacoLang: item.monaco,
}));

const themeMap: Record<string, any> = {
  Active4D: Active4DTheme,
  "All Hallows Eve": AllHallowsEveTheme,
  Amy: AmyTheme,
  "Birds of Paradise": BirdsOfParadiseTheme,
  Blackboard: BlackboardTheme,
  "Brilliance Black": BrillianceBlackTheme,
  "Brilliance Dull": BrillianceDullTheme,
  "Chrome DevTools": ChromeDevToolsTheme,
  "Clouds Midnight": CloudsMidnightTheme,
  Clouds: CloudsTheme,
  Cobalt: CobaltTheme,
  Dawn: DawnTheme,
  Dracula: DraculaTheme,
  Dreamweaver: DreamweaverTheme,
  Eiffel: EiffelTheme,
  "Espresso Libre": EspressoLibreTheme,
  GitHub: GitHubTheme,
  IDLE: IDLETheme,
  Katzenmilch: KatzenmilchTheme,
  "Kuroir Theme": KuroirTheme,
  LAZY: LAZYTheme,
  "MagicWB (Amiga)": MagicWBTheme,
  "Merbivore Soft": MerbivoreSoftTheme,
  Merbivore: MerbivoreTheme,
  "Monokai Bright": MonokaiBrightTheme,
  Monokai: MonokaiTheme,
  "Night Owl": NightOwlTheme,
  Nord: NordTheme,
  "Oceanic Next": OceanicNextTheme,
  "Pastels on Dark": PastelsOnDarkTheme,
  "Slush and Poppies": SlushAndPoppiesTheme,
  "Solarized-dark": SolarizedDarkTheme,
  "Solarized-light": SolarizedLightTheme,
  SpaceCadet: SpaceCadetTheme,
  Sunburst: SunburstTheme,
  "Tomorrow-Night-Blue": TomorrowNightBlueTheme,
  "Tomorrow-Night-Bright": TomorrowNightBrightTheme,
  "Tomorrow-Night-Eighties": TomorrowNightEightiesTheme,
  "Tomorrow-Night": TomorrowNightTheme,
  Tomorrow: TomorrowTheme,
  Twilight: TwilightTheme,
  "Upstream Sunburst": UpstreamSunburstTheme,
  "Vibrant Ink": VibrantInkTheme,
};

const availableThemes = Object.keys(themeMap);
const defaultRuntimeLanguageId = 54;
const terminalStatuses = new Set(["ACCEPTED", "BAD_ALGORITHM", "BAD_SCALING"]);

interface CodingBlockProps {
  questionId: string;
  setRunTestCaseResults: (results: runTestCaseType | undefined) => void;
  setSubmitTestCaseResults: (data: submitTestCaseType | undefined) => void;
  setTabPage: (data: string) => void;
  setSubmissionRefetch: (data: boolean) => void;
  setCode: (data: string) => void;
  code: string;
  setLanguage: (data: string) => void;
  language: string;
  startAiReview: () => void;
  performingAiReview: boolean;
}

function CodingBlock({
  questionId,
  setRunTestCaseResults,
  setSubmitTestCaseResults,
  setTabPage,
  setSubmissionRefetch,
  setCode,
  code,
  setLanguage,
  language,
  startAiReview,
  performingAiReview,
}: CodingBlockProps) {
  const [editorTheme, setEditorTheme] = useState("Sunburst");
  const [editorInFocus, setEditorInFocus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [themeList, setThemeList] = useState<string[]>();
  const [monacoInstance, setMonacoInstance] = useState<any>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const [templateCode, setTemplateCode] = useState<string | undefined>();

  const { theme, setTheme } = useTheme();
  const { selected, setThemeName } = useCustomTheme();

  useEffect(() => {
    setThemeList(availableThemes);
    getTemplateCode();
  }, []);

  useEffect(() => {
    getTemplateCode();
  }, [language]);

  // Auto-save code to localStorage

  useEffect(() => {
    if (code && code !== "//Example Code" && typeof language === "string") {
      const storageKey = `code_${questionId}_${language}`;
      const toBeSaved = JSON.stringify({
        savedCode: code,
        savedLanguage: language,
      });
      localStorage.setItem(storageKey, toBeSaved);
    }
  }, [code, questionId]);

  useEffect(() => {
    const loadTheme = (themeName: string) => {
      if (!monacoInstance || themeName === "vs-dark") {
        return;
      }
      try {
        const themeData = themeMap[themeName];
        if (!themeData) {
          throw new Error(`Theme "${themeName}" not found`);
        }
        const safeThemeName = themeName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
        monacoInstance.editor.defineTheme(safeThemeName, themeData);
        monacoInstance.editor.setTheme(safeThemeName);
      } catch (error) {
        console.error(`Failed to load theme "${themeName}"`, error);
        toast.error(`Failed to load theme "${themeName}"`);
        monacoInstance.editor.setTheme("vs-dark");
        setEditorTheme("vs-dark");
      }
    };

    loadTheme(editorTheme);
  }, [editorTheme, monacoInstance]);

  const handleEditorDidMount: OnMount = async (editor, monaco) => {
    setEditorInstance(editor);
    setMonacoInstance(monaco);

    // Add keyboard shortcut for formatting (Shift+Alt+F)
    editor.addAction({
      id: "format-code",
      label: "Format Document",
      keybindings: [
        monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      ],
      run: function (ed) {
        ed.getAction("editor.action.formatDocument")?.run();
      },
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
  };

  const onRun = async () => {
    setRunning(true);
    if ((code && code?.length < 1) || code == "//Example Code") {
      toast.error("Please Type Something");
      setRunning(false);
      return;
    }

    setTabPage("testcasesrun");
    setRunTestCaseResults(undefined);

    const languageId = getLanguageId(language) ?? defaultRuntimeLanguageId;

    const sentData: sentCode = {
      questionId,
      languageId,
      code,
    };

    try {
      const response = await axios.post(
        `${getBackendURL()}/problems/runcode`,
        sentData,
        { withCredentials: true }
      );
      setRunTestCaseResults(response.data as runTestCaseType);
      console.log(response);
    } catch (error: any) {
      if (typeof error.message == "string") {
        toast.error(error.message);
      }
      console.log(error);
    } finally {
      setRunning(false);
    }
  };

  const onSubmit = async () => {
    if (code.length < 1 || code == "//Example Code") {
      toast.error("Enter Some Code to be Submitted");
      return;
    }

    setSubmitting(true);
    setTabPage("submitcode");
    setSubmitTestCaseResults(undefined);

    try {
      const languageId = getLanguageId(language) ?? defaultRuntimeLanguageId;

      const submitCode: sentCode = {
        questionId,
        languageId,
        code,
      };

      const submitCodeResponse = await axios.post(
        `${getBackendURL()}/problems/submitcode`,
        submitCode,
        { withCredentials: true }
      );

      const queuedResult = submitCodeResponse.data as submitTestCaseType;
      setSubmitTestCaseResults(queuedResult);

      if (!queuedResult?.submissionId) {
        return;
      }

      const maxPolls = 90;
      const pollDelayMs = 1000;

      for (let attempt = 0; attempt < maxPolls; attempt++) {
        const statusResponse = await axios.get(
          `${getBackendURL()}/problems/submission-status/${queuedResult.submissionId}`,
          { withCredentials: true }
        );

        const latest = statusResponse.data as submitTestCaseType;
        setSubmitTestCaseResults(latest);

        if (terminalStatuses.has(latest.status)) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, pollDelayMs));
      }

      setSubmissionRefetch(true);
    } catch (error) {
      console.log(error);
      // toast.error(error as string);
    } finally {
      setSubmitting(false);
    }
  };

  const getTemplateCode = async () => {
    const res = await axios.post(
      `${getBackendURL()}/problems/gettemplatecode`,
      {
        languageId: getLanguageId(language),
        problemId: questionId,
      },
      { withCredentials: true }
    );

    const { template, languageId } = res.data as {
      template: string;
      languageId: number;
    };

    setTemplateCode(template);

    const storageKey = `code_${questionId}_${language}`;
    const savedData = localStorage.getItem(storageKey);
    if (!savedData) {
      setCode(template);
      return;
    }

    const { savedCode, savedLanguage } = JSON.parse(savedData);

    if (savedLanguage === language) {
      setCode(savedCode);
    }
  };

  const resetCode = async () => {
    if (templateCode) {
      setCode(templateCode);
    }
  };

  return (
    <div>
      <div className="w-[calc(60vw-2.5rem)] h-[calc(100vh-6.5rem)] outline-1 m-5 outline-offset-8 rounded-md py-3 px-5 shadow-2xl">
        <div
          className={`rounded-md overflow-hidden border-2 h-full flex flex-col min-h-[300px] ${
            editorInFocus && "border-1 border-foreground/15"
          }`}
          onFocus={() => setEditorInFocus(true)}
          onBlur={() => setEditorInFocus(false)}
        >
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={language}
              defaultValue="//Example Code"
              value={code}
              onChange={(event) => setCode(event ?? "")}
              theme={editorTheme}
              loading={<Spinner variant="ring" />}
              options={{
                formatOnType: true,
                formatOnPaste: true,
                cursorBlinking: "expand",
                codeLens: false,
                padding: { bottom: 10, top: 20 },
                snippetSuggestions: "none",
                smoothScrolling: true,
                wordBasedSuggestions: "off",
                quickSuggestions: false,
                suggestOnTriggerCharacters: false,
                acceptSuggestionOnEnter: "off",
                tabCompletion: "off",
                inlineSuggest: { enabled: false },
                showFoldingControls: "always",
                quickSuggestionsDelay: 0,
                parameterHints: { enabled: false },
                hover: { enabled: false },
                glyphMargin: false,
              }}
              onMount={handleEditorDidMount}
            />
          </div>

          <div className="w-full h-12 flex-shrink-0 bg-background flex justify-between items-center px-3 gap-3">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="h-[70%]" asChild>
                  <Button variant="outline">
                    <IoMdSettings />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                  >
                    Website Theme:{" "}
                    {theme && theme[0].toUpperCase() + theme.slice(1)}
                  </DropdownMenuItem>

                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center gap-1">
                        Theme: {selected}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {Object.entries(THEMES).map(([key, value]) => (
                            <DropdownMenuItem
                              key={key}
                              onClick={() => setThemeName(key as ThemeName)}
                            >
                              {key[0].toUpperCase() + key.slice(1)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <div className="flex justify-between w-full mr-2">
                        <span>Editor Theme</span>
                        <span className="ml-2 text-muted-foreground">
                          {editorTheme}
                        </span>
                      </div>
                    </DropdownMenuSubTrigger>

                    <DropdownMenuSubContent className="max-h-[400px] overflow-y-auto">
                      {themeList?.map((item) => (
                        <DropdownMenuItem
                          key={item}
                          onClick={() => setEditorTheme(item)}
                        >
                          {item
                            .split("-")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8.5">
                    {
                      availableLanguages.find((l) => l.monacoLang === language)
                        ?.name
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availableLanguages.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => setLanguage(item.monacoLang)}
                    >
                      {item.name.charAt(0).toUpperCase() +
                        item.name.slice(1).toLowerCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant={"outline"} className="h-8.5" onClick={resetCode}>
                Clear
              </Button>
            </div>
            <div className="flex gap-3">
              {/* <Button
                onClick={startAiReview}
                variant={"outline"}
                disabled={running || running || performingAiReview}
              >
                <Sparkles />
                Start AI Review
              </Button> */}
              <ButtonGroup className="h-[70%]">
                <Button
                  disabled={submitting || running || performingAiReview}
                  variant="outline"
                  className="h-[100%]"
                  onClick={onRun}
                >
                  {running ? "Running" : "Run"}
                </Button>

                <Button
                  disabled={submitting || running || performingAiReview}
                  variant="default"
                  className="h-[100%]"
                  onClick={onSubmit}
                >
                  {submitting ? "Submitting" : "Submit"}
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodingBlock;
