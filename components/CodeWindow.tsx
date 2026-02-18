import React from "react";

const CodeWindow: React.FC = () => {
  const [lang, setLang] = React.useState<"cpp" | "python" | "java" | "js">(
    "cpp",
  );

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
          ? "bg-white text-black border-white"
          : "text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200"
      }`}>
      {label}
    </button>
  );

  return (
    <div className="relative mx-auto max-w-3xl text-left border border-gray-800 rounded-lg bg-zinc-950 shadow-2xl overflow-hidden transition-all duration-500 hover:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-zinc-950/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70"></div>
          </div>

          <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono">
            {active.filename}
          </span>
        </div>

        {/* Language Switcher */}
        <div className="flex gap-2">
          <LangBtn id="cpp" label="C++" />
          <LangBtn id="python" label="Python" />
          <LangBtn id="java" label="Java" />
          <LangBtn id="js" label="JS" />
        </div>
      </div>

      {/* Code Body */}
      <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto bg-zinc-950/50">
        {active.lines.map((line, i) => (
          <div key={i} className="flex gap-4">
            <span className="text-zinc-700 w-5 text-right select-none">
              {i + 1}
            </span>

            <div>
              {line[0] && <span className="text-zinc-500 mr-1">{line[0]}</span>}
              <span className="text-zinc-200">{line[1]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>
  );
};

export default CodeWindow;
