import React from "react";

const CodeWindow: React.FC = () => {
  const [lang, setLang] = React.useState<"cpp" | "python" | "java" | "js">("cpp");

  const codeMap = {
    cpp: {
      filename: "Arena_Engine.cpp",
      lines: [
        ["#include", "<iostream>"],
        ["int", "main() {"],
        ["", "// Start the tournament"],
        ["", 'Arena arena = initialize("Coliseum");'],
        ["", "arena.startMatch();"],
        ["return", "0;"],
        ["", "}"],
      ],
    },

    python: {
      filename: "arena_engine.py",
      lines: [
        ["#", "python3"],
        ["def", "main():"],
        ["", "# Start the tournament"],
        ["", 'arena = initialize("Coliseum")'],
        ["", "arena.start_match()"],
        ["return", "0"],
        ["", ""],
      ],
    },

    java: {
      filename: "ArenaEngine.java",
      lines: [
        ["public class", "ArenaEngine {"],
        ["public static void", "main(String[] args) {"],
        ["", "// Start the tournament"],
        ["", 'Arena arena = initialize("Coliseum");'],
        ["", "arena.startMatch();"],
        ["", "}"],
        ["", "}"],
      ],
    },

    js: {
      filename: "arenaEngine.js",
      lines: [
        ["function", "main() {"],
        ["", "// Start the tournament"],
        ["", 'const arena = initialize("Coliseum");'],
        ["", "arena.startMatch();"],
        ["return", "0;"],
        ["", "}"],
        ["", "main();"],
      ],
    },
  };

  const active = codeMap[lang];

  const LangBtn = ({ id, label }: { id: typeof lang; label: string }) => (
    <button
      onClick={() => setLang(id)}
      className={`px-3 py-1 rounded text-xs font-medium transition-all border
      ${
        lang === id
          ? "bg-orange-700 text-white border-orange-700 shadow-sm"
          : "text-stone-500 border-stone-200 bg-white hover:border-orange-300 hover:text-orange-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative mx-auto w-full max-w-lg text-left border border-orange-200/60 rounded-3xl bg-white shadow-[0_4px_32px_rgba(194,101,42,0.1)] overflow-hidden transition-all duration-500 hover:border-orange-300 hover:shadow-[0_8px_40px_rgba(194,101,42,0.15)] flex flex-col h-full pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-orange-200/60 bg-orange-50/70">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>

          <span className="text-[11px] uppercase tracking-widest text-stone-500 font-mono font-semibold">
            {active.filename}
          </span>
        </div>

        {/* Language Switcher */}
        <div className="flex gap-2">
          <LangBtn id="cpp" label="C++" />
          <LangBtn id="python" label="Py" />
          <LangBtn id="java" label="Java" />
          <LangBtn id="js" label="JS" />
        </div>
      </div>

      {/* Code Body */}
      <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto bg-white flex-1">
        {active.lines.map((line, i) => (
          <div key={i} className="flex gap-4">
            <span className="text-stone-300 w-5 text-right select-none font-medium">
              {i + 1}
            </span>

            <div>
              {line[0] && (
                <span className="text-orange-700 font-medium mr-1.5">{line[0]}</span>
              )}
              {line[1].startsWith("//") || line[1].startsWith("#") ? (
                <span className="text-stone-400 italic">{line[1]}</span>
              ) : (
                <span className="text-stone-700">{line[1]}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-300/40 to-transparent"></div>
    </div>
  );
};

export default CodeWindow;
