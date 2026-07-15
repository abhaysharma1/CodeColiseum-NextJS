"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Hash,
  Shuffle,
  GitMerge,
  type LucideIcon,
} from "lucide-react";
import BlurText from "./BlurText";
import HandwrittenAnnotation from "./HandwrittenAnnotation";

/* Autoplay timing — mid-point of the 5-6s range so the section feels
   alive without racing past the diagnosis text before it's readable. */
const AUTOPLAY_MS = 4000;

/* ---------------------------------------------------------
   Real worked examples — swapping between them is the whole
   point: this section should feel like a live diagnostic tool,
   not a single pinned screenshot.
--------------------------------------------------------- */
interface CodeLine {
  text: string;
  flagged?: boolean;
}

interface Example {
  id: string;
  icon: LucideIcon;
  title: string;
  difficulty: string;
  topic: string;
  filename: string;
  code: CodeLine[];
  flagLabel: string;
  issues: string;
  evolution: string;
  tags: string[];
}

const examples: Example[] = [
  {
    id: "two-sum",
    icon: Hash,
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Hashing",
    filename: "two_sum.cpp",
    code: [
      { text: "vector<int> twoSum(vector<int>& nums, int target) {" },
      { text: "  unordered_map<int,int> seen;" },
      { text: "  for (int i = 0; i <= nums.size(); i++) {", flagged: true },
      { text: "    int need = target - nums[i];" },
      { text: "    if (seen.count(need)) return {seen[need], i};" },
      { text: "    seen[nums[i]] = i;" },
      { text: "  }" },
      { text: "}" },
    ],
    flagLabel: "Off-by-one — reads past the array",
    issues:
      "The loop uses <= instead of <, so on the final iteration i equals nums.size() and nums[i] reads out of bounds — passes locally, fails silently on the judge.",
    evolution:
      "Fixed by changing the bound to i < nums.size(). The hashmap logic was correct from the first attempt — purely a boundary mistake.",
    tags: ["Off By One", "Array Bounds"],
  },
  {
    id: "next-permutation",
    icon: Shuffle,
    title: "Next Permutation",
    difficulty: "Medium",
    topic: "Arrays",
    filename: "next_permutation.java",
    code: [
      { text: "void nextPermutation(int[] nums) {" },
      { text: "  int i = nums.length - 2;" },
      { text: "  while (i >= 0 && nums[i] >= nums[i + 1]) i--;" },
      { text: "  if (i >= 0) {" },
      { text: "    int j = nums.length - 1;" },
      { text: "    while (nums[j] <= nums[i]) j--;", flagged: true },
      { text: "    swap(nums, i, j);" },
      { text: "  }" },
      { text: "  reverse(nums, i);" },
      { text: "}" },
    ],
    flagLabel: "Search starts before the pivot",
    issues:
      "The successor search should only scan the suffix after i, but j starts unbounded — on a strictly descending suffix it can compare against the pivot itself.",
    evolution:
      "Fixed by bounding the search to indices greater than i, and starting the reversal at i + 1 so only the suffix gets reversed.",
    tags: ["Logic Error", "Boundary Condition"],
  },
  {
    id: "merge-intervals",
    icon: GitMerge,
    title: "Merge Intervals",
    difficulty: "Medium",
    topic: "Sorting",
    filename: "merge_intervals.py",
    code: [
      { text: "def merge(intervals):" },
      { text: "    intervals.sort()" },
      { text: "    result = []" },
      { text: "    for start, end in intervals:" },
      { text: "        if result and start <= result[-1][1]:" },
      { text: "            result[-1][1] = end", flagged: true },
      { text: "        else:" },
      { text: "            result.append([start, end])" },
      { text: "    return result" },
    ],
    flagLabel: "Overwrites instead of extending",
    issues:
      "When intervals overlap, the code replaces the merged end directly. If the current interval is nested inside a longer one, this shrinks the result instead of keeping it.",
    evolution:
      "Fixed with result[-1][1] = max(result[-1][1], end), so a shorter nested interval no longer shrinks the merged span.",
    tags: ["Logic Error", "Edge Case"],
  },
];

export default function AIAnalysisSection() {
  const [activeId, setActiveId] = useState(examples[0].id);
  const [pendingId, setPendingId] = useState(examples[0].id);
  const [scanning, setScanning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autoplay: cycles cards while the section is in view. Stops permanently
  // the moment the user takes control — it should never fight them back.
  const [autoplay, setAutoplay] = useState(true);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const autoplayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = examples.find((e) => e.id === activeId) ?? examples[0];

  const handleSwitch = (id: string, isManual: boolean) => {
    if (isManual) setAutoplay(false);
    if (id === pendingId) return;
    setPendingId(id);
    setScanning(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveId(id);
      setScanning(false);
    }, 200);
  };

  // Track whether the section is on screen, so autoplay never burns
  // through cards before the user has scrolled to see them.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Drive the rotation itself.
  useEffect(() => {
    if (!autoplay || !inView) return;
    autoplayTimeoutRef.current = setTimeout(() => {
      const currentIndex = examples.findIndex((e) => e.id === pendingId);
      const next = examples[(currentIndex + 1) % examples.length];
      handleSwitch(next.id, false);
    }, AUTOPLAY_MS);
    return () => {
      if (autoplayTimeoutRef.current) clearTimeout(autoplayTimeoutRef.current);
    };
  }, [autoplay, inView, pendingId]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col justify-center py-16 md:py-12 overflow-hidden"
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-orange-200/20 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-9">
          <div className="relative inline-block">
            <div className="absolute -top-4 -right-12 md:-right-36 hidden md:block">
              <HandwrittenAnnotation
                text="powered by intelligence ✦"
                arrow="down-left"
                rotate={4}
                delay={400}
              />
            </div>
            <div style={{ fontFamily: "'EB Garamond', serif" }}>
              <BlurText
                text="Your mistakes, explained instantly."
                delay={40}
                animateBy="words"
                direction="bottom"
                center
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.1] mb-3 tracking-tight"
                wordStyles={{ instantly: { className: "italic text-orange-700" } }}
              />
            </div>
          </div>
          <p className="text-stone-500 text-base md:text-lg">
            Every submission gets a real diagnosis not just pass or fail.
          </p>
        </div>

        {/* Example switcher */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {examples.map((ex) => {
            const isActive = pendingId === ex.id;
            const showProgress = isActive && autoplay && inView;
            return (
              <button
                key={ex.id}
                onClick={() => handleSwitch(ex.id, true)}
                className={`relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all overflow-hidden ${
                  isActive
                    ? "bg-orange-700 text-white border-orange-700 shadow-md shadow-orange-700/25"
                    : "bg-white/70 text-stone-500 border-orange-200 hover:border-orange-300 hover:text-orange-700"
                }`}
              >
                <ex.icon size={14} strokeWidth={2.25} className="shrink-0" />
                {ex.title}
                {showProgress && (
                  <span
                    key={pendingId}
                    className="ai-autoplay-fill absolute left-0 bottom-0 h-[2px] bg-white/80"
                  />
                )}
              </button>
            );
          })}
        </div>
        <style>{`
          .ai-autoplay-fill {
            width: 0%;
            animation: ai-autoplay-progress ${AUTOPLAY_MS}ms linear forwards;
          }
          @keyframes ai-autoplay-progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>

        {/* Split diagnostic view */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid md:grid-cols-2 gap-5 md:gap-0 items-stretch"
            >
              {/* Code panel */}
              <div className="relative rounded-[1.75rem] md:rounded-r-none border border-orange-200/60 bg-white shadow-xl shadow-orange-900/5 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-3 border-b border-orange-100 bg-orange-50/60">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[11px] uppercase tracking-widest text-stone-500 font-mono font-semibold">
                      {active.filename}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-orange-700">{active.difficulty}</span>
                </div>
                <div className="px-6 py-5 font-mono text-[13px] leading-relaxed flex-1">
                  {active.code.map((line, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 -mx-2 px-2 rounded ${
                        line.flagged ? "bg-red-50/80 border-l-2 border-red-400" : ""
                      }`}
                    >
                      <span className="text-stone-300 w-5 text-right select-none">{i + 1}</span>
                      <span className={line.flagged ? "text-red-700" : "text-stone-700"}>
                        {line.text}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-red-500">
                    <AlertTriangle size={13} />
                    {active.flagLabel}
                  </div>
                </div>

                {/* Scan-line sweep — plays while the "AI" is (re)reading the code */}
                <AnimatePresence>
                  {scanning && (
                    <motion.div
                      key="scan"
                      className="absolute inset-x-0 top-0 pointer-events-none"
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: "100%", opacity: [0, 1, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "linear" }}
                    >
                      <div className="h-16 bg-gradient-to-b from-orange-300/0 via-orange-300/35 to-orange-300/0" />
                      <div className="h-px bg-orange-500/70 shadow-[0_0_12px_2px_rgba(216,110,42,0.6)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* AI diagnosis panel */}
              <div className="relative rounded-[1.75rem] md:rounded-l-none border border-orange-200/60 border-t-0 md:border-t md:border-l-0 bg-orange-50/40 shadow-xl shadow-orange-900/5 overflow-hidden flex flex-col">
                <div className="px-6 py-4 flex items-center gap-2.5 border-b border-orange-100">
                  <div className="w-8 h-8 rounded-lg bg-orange-700 flex items-center justify-center">
                    <Sparkles size={15} className="text-white" />
                  </div>
                  <h4
                    className="font-bold text-stone-900 text-lg"
                    style={{ fontFamily: "'EB Garamond', serif" }}
                  >
                    AI Analysis
                  </h4>
                  <span className="ml-auto text-xs text-stone-400">{active.topic}</span>
                </div>

                <div className="px-6 py-5 space-y-4 flex-1">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-stone-800 mb-1.5">
                      <AlertTriangle size={14} className="text-orange-600" />
                      What went wrong
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">{active.issues}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-stone-800 mb-1.5">
                      <TrendingUp size={14} className="text-orange-600" />
                      How it was fixed
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">{active.evolution}</p>
                  </div>
                  <div className="pt-1 flex flex-wrap gap-2">
                    {active.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-orange-200/70 text-orange-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}