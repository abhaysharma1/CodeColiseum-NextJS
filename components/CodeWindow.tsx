"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

type Token = { text: string; cls: string };

/* ---------------------------------------------------------
   Lightweight syntax tokenizer for the "rest" of a code line
--------------------------------------------------------- */
const tokenizeRest = (text: string): Token[] => {
  if (!text) return [];
  if (text.trimStart().startsWith("//")) {
    return [{ text, cls: "text-stone-400 italic" }];
  }

  const regex =
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+\b)|([A-Za-z_]\w*)(?=\()|([{}()<>[\];,.])/g;

  const tokens: Token[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text))) {
    if (m.index > lastIndex) {
      tokens.push({ text: text.slice(lastIndex, m.index), cls: "text-stone-700" });
    }
    if (m[1]) tokens.push({ text: m[1], cls: "text-emerald-600" });
    else if (m[2]) tokens.push({ text: m[2], cls: "text-sky-600" });
    else if (m[3]) tokens.push({ text: m[3], cls: "text-amber-700 font-semibold" });
    else if (m[4]) tokens.push({ text: m[4], cls: "text-stone-400" });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push({ text: text.slice(lastIndex), cls: "text-stone-700" });
  }
  return tokens;
};

/* ---------------------------------------------------------
   The lab solution that gets typed out
--------------------------------------------------------- */
const LAB_CODE: [string, string][] = [
  ["vector<int>", "twoSum(vector<int>& nums, int target) {"],
  ["", "unordered_map<int,int> seen;"],
  ["", "// Weekly Lab 6 · Hashing"],
  ["for", "(int i = 0; i < nums.size(); i++) {"],
  ["", "int need = target - nums[i];"],
  ["if", "(seen.count(need)) return {seen[need], i};"],
  ["", "seen[nums[i]] = i;"],
  ["", "}"],
  ["", "}"],
];

/* ---------------------------------------------------------
   The journey — everything after the code finishes typing
--------------------------------------------------------- */
type StageId =
  | "assigned"
  | "coding"
  | "compiling"
  | "accepted"
  | "ai"
  | "progress"
  | "leaderboard"
  | "completed";

interface Stage {
  id: StageId;
  label: string;
  icon: string;
  duration: number;
}

const STAGES: Stage[] = [
  { id: "assigned", label: "Weekly Lab Assigned", icon: "📝", duration: 900 },
  { id: "coding", label: "Writing Solution…", icon: "💻", duration: 0 }, // driven by typewriter
  { id: "compiling", label: "Compiling…", icon: "⚙️", duration: 1100 },
  { id: "accepted", label: "All Test Cases Passed", icon: "✅", duration: 1300 },
  { id: "ai", label: "AI Reviewing Solution…", icon: "🤖", duration: 1700 },
  { id: "progress", label: "Progress Updated", icon: "📊", duration: 1300 },
  { id: "leaderboard", label: "Leaderboard Updated", icon: "🏆", duration: 1300 },
  { id: "completed", label: "Lab Completed", icon: "🎉", duration: 1900 },
];

const BlinkCursor = () => (
  <motion.span
    className="inline-block w-[2px] h-[1.05em] bg-orange-600 translate-y-[2px] ml-[1px]"
    animate={{ opacity: [1, 1, 0, 0] }}
    transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
  />
);

const CodeLine = ({ index, keyword, rest }: { index: number; keyword: string; rest: string }) => (
  <div className="flex gap-4">
    <span className="text-stone-300 w-5 text-right select-none font-medium">{index + 1}</span>
    <div>
      {keyword && <span className="text-orange-700 font-medium mr-1.5">{keyword}</span>}
      {tokenizeRest(rest).map((t, i) => (
        <span key={i} className={t.cls}>
          {t.text}
        </span>
      ))}
    </div>
  </div>
);

const StageFooter = ({ stage }: { stage: Stage }) => {
  const content = () => {
    switch (stage.id) {
      case "progress":
        return (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-stone-700">Week 6 Progress</p>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                initial={{ width: "68%" }}
                animate={{ width: "92%" }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      case "leaderboard":
        return (
          <div className="flex-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">Class Leaderboard</span>
            <span className="text-xs font-bold text-emerald-600">
              Rank #14 → #8 <span aria-hidden>↑</span>
            </span>
          </div>
        );
      case "ai":
        return (
          <p className="text-xs text-stone-600 leading-relaxed">
            <span className="font-semibold text-stone-700">AI note — </span>
            Clean O(n) hashmap approach. Consider the empty-array edge case.
          </p>
        );
      case "accepted":
        return <p className="text-xs font-semibold text-emerald-700">12 / 12 test cases passed</p>;
      case "completed":
        return <p className="text-xs font-semibold text-orange-800">Lab 6 marked complete — great work!</p>;
      default:
        return <p className="text-xs font-medium text-stone-500">{stage.label}</p>;
    }
  };

  return (
    <div className="flex items-center gap-2.5 px-4 py-3 border-t border-orange-100 bg-orange-50/50">
      <span className="text-sm leading-none shrink-0">{stage.icon}</span>
      {content()}
    </div>
  );
};

const CodeWindow: React.FC = () => {
  const [typedCount, setTypedCount] = useState(0);
  const [currentTyped, setCurrentTyped] = useState("");
  const [stageIndex, setStageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [cycle, setCycle] = useState(0);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stage = STAGES[stageIndex];
  const isCoding = stage.id === "coding";
  const codeVisible = stageIndex >= 1; // shown from 'coding' onward

  /* ---------------- Journey scheduler ---------------- */
  useEffect(() => {
    setTypedCount(0);
    setCurrentTyped("");
    setStageIndex(0);

    const schedule = (fn: () => void, delay: number) => {
      timeoutRef.current = setTimeout(fn, delay);
    };

    const typeChar = (lineIndex: number, charIndex: number) => {
      if (lineIndex >= LAB_CODE.length) {
        setStageIndex(2); // move on to "compiling"
        return;
      }
      const [kw, rest] = LAB_CODE[lineIndex];
      const text = kw ? `${kw} ${rest}` : rest;

      if (charIndex <= text.length) {
        setCurrentTyped(text.slice(0, charIndex));
        const char = text[charIndex - 1];
        const delay = char === " " ? 16 : 18 + Math.random() * 30;
        schedule(() => typeChar(lineIndex, charIndex + 1), delay);
      } else {
        setTypedCount(lineIndex + 1);
        setCurrentTyped("");
        schedule(() => typeChar(lineIndex + 1, 0), 160);
      }
    };

    // Stage 0: "Weekly Lab Assigned"
    schedule(() => {
      setStageIndex(1); // "coding"
      schedule(() => typeChar(0, 0), 300);
    }, STAGES[0].duration);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [cycle]);

  // Drive stages 2..7 sequentially once compiling begins
  useEffect(() => {
    if (stageIndex < 2) return;
    const current = STAGES[stageIndex];
    if (stageIndex >= STAGES.length - 1) {
      // "completed" — pause, then restart the whole journey
      timeoutRef.current = setTimeout(() => setCycle((c) => c + 1), current.duration);
      return;
    }
    timeoutRef.current = setTimeout(() => setStageIndex((i) => i + 1), current.duration);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [stageIndex]);

  /* ---------------- Hover tilt ---------------- */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), { stiffness: 180, damping: 22 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), { stiffness: 180, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  };

  const isTyping = isCoding && typedCount < LAB_CODE.length;

  return (
    <motion.div
      className="relative w-full max-w-lg mx-auto"
      style={{ perspective: 1400 }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Soft ambient wash — gently seats the editor into the background
          network instead of punching a hole in it with a hard glow */}
      <motion.div
        className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-orange-200/40 via-orange-100/20 to-transparent blur-2xl -z-10"
        animate={{ opacity: hovered ? 0.9 : 0.6 }}
        transition={{ duration: 0.5 }}
      />

      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative text-left border border-orange-200/60 rounded-3xl bg-white overflow-hidden flex flex-col pointer-events-auto"
        animate={{
          boxShadow: hovered
            ? "0 30px 70px -15px rgba(194,101,42,0.38), inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 1px rgba(194,101,42,0.06)"
            : "0 22px 50px -18px rgba(194,101,42,0.22), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Subtle inner glow along the top edge — premium sheen, no uneven lighting */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-orange-100/50 to-transparent" />
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-orange-200/60 bg-orange-50/70">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-[11px] uppercase tracking-widest text-stone-500 font-mono font-semibold truncate">
              two_sum.cpp
            </span>
          </div>

          {/* Journey stepper */}
          <div className="flex items-center gap-1.5 shrink-0">
            {STAGES.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i < stageIndex
                    ? "w-3 bg-orange-500"
                    : i === stageIndex
                    ? "w-5 bg-orange-600"
                    : "w-1.5 bg-stone-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Live stage label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.id + cycle}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="px-5 py-2 text-[11px] font-semibold text-orange-700 bg-orange-50/40 flex items-center gap-1.5"
          >
            <span>{stage.icon}</span>
            {stage.label}
          </motion.div>
        </AnimatePresence>

        {/* Code Body */}
        <div className="relative p-6 font-mono text-sm leading-relaxed overflow-x-auto bg-white flex-1 min-h-[230px]">
          {codeVisible && (
            <div className="space-y-0.5">
              {LAB_CODE.slice(0, typedCount).map((line, i) => (
                <CodeLine key={i} index={i} keyword={line[0]} rest={line[1]} />
              ))}

              {isTyping && (
                <div className="flex gap-4">
                  <span className="text-stone-300 w-5 text-right select-none font-medium">
                    {typedCount + 1}
                  </span>
                  <div className="text-stone-700 whitespace-pre">
                    {currentTyped}
                    <BlinkCursor />
                  </div>
                </div>
              )}

              {!isTyping && stageIndex >= 2 && (
                <div className="flex gap-4">
                  <span className="text-stone-300 w-5 text-right select-none font-medium">
                    {LAB_CODE.length + 1}
                  </span>
                  <BlinkCursor />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Journey footer — compiling / accepted / AI / progress / leaderboard / completed */}
        <AnimatePresence mode="wait">
          {stageIndex >= 2 && (
            <motion.div
              key={stage.id + cycle}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <StageFooter stage={stage} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-300/40 to-transparent" />
      </motion.div>
    </motion.div>
  );
};

export default CodeWindow;