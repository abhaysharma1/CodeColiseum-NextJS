"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import BlurText from "./BlurText";
import HandwrittenAnnotation from "./HandwrittenAnnotation";

export default function AIAnalysisSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const cardY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-32 md:py-24 flex flex-col items-center justify-start overflow-hidden"
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-200/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-6 mb-16">


        <div className="relative">
          {/* Annotation */}
          <div className="absolute -top-4 -right-12 md:-right-32 hidden md:block">
            <HandwrittenAnnotation
              text="powered by intelligence ✦"
              arrow="down-left"
              rotate={4}
              delay={400}
            />
          </div>

          <div style={{ fontFamily: "'EB Garamond', serif" }}>
            <BlurText
              text="AI analysis of all your attempts at your fingertips."
              delay={40}
              animateBy="words"
              direction="bottom"
              center
              className="text-4xl md:text-6xl font-bold text-stone-900 leading-[1.1] mb-6 tracking-tight"
              wordStyles={{
                "AI": { className: "italic text-orange-700" },
                "fingertips": { className: "italic text-orange-600" },
              }}
            />
          </div>
        </div>
      </div>

      {/* Analysis Card */}
      <motion.div
        ref={cardRef}
        style={{ y: cardY }}
        className="relative z-20 w-full max-w-3xl mx-auto px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="rounded-[2rem] border border-orange-200/60 bg-white/70 backdrop-blur-md shadow-2xl shadow-orange-900/8 p-1.5 overflow-hidden ring-1 ring-white/60"
        >
          {/* Inner Card */}
          <div className="rounded-[1.7rem] bg-white border border-orange-100/50 overflow-hidden">
            {/* Problem Header */}
            <div className="px-8 pt-8 pb-6 border-b border-orange-100/60">
              <div className="flex items-start justify-between">
                <div>
                  <h3
                    className="text-2xl font-bold text-stone-900 mb-1"
                    style={{ fontFamily: "'EB Garamond', serif" }}
                  >
                    Next Permutation
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-orange-700">Medium</span>
                    <span className="text-stone-300">·</span>
                    <span className="text-sm text-stone-400">Arrays</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-orange-600 font-bold text-sm">
                    +20
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-stone-400">via Chrome</span>
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-sm text-stone-500">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                    <polyline points="16,18 22,12 16,6" /><polyline points="8,6 2,12 8,18" />
                  </svg>
                  Language: <span className="font-medium text-stone-700">Java</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                  Attempts: <span className="font-medium text-stone-700">4</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Time: <span className="font-medium text-stone-700">13m 43s</span>
                </div>
              </div>
            </div>

            {/* AI Analysis Content */}
            <div className="px-8 py-7 space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-orange-700">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4 className="font-bold text-stone-900 text-lg" style={{ fontFamily: "'EB Garamond', serif" }}>
                  AI Analysis
                </h4>
              </div>

              <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
                <div>
                  <span className="font-bold text-stone-800">1. Key Issues: </span>
                  Attempt 1 had a syntax error (missing variable declaration). Early attempts contained loop logic errors (incrementing instead of decrementing) and array bounds issues. Specifically, the swap-search loop used{" "}
                  <code className="px-1.5 py-0.5 bg-orange-50 border border-orange-200/60 rounded text-orange-800 text-xs font-mono">i++</code>{" "}
                  and the reversal started at the pivot rather than the suffix.
                </div>
                <div>
                  <span className="font-bold text-stone-800">2. Evolution: </span>
                  The code improved by correcting variable scopes, fixing the search direction for the successor element, and adjusting the{" "}
                  <code className="px-1.5 py-0.5 bg-orange-50 border border-orange-200/60 rounded text-orange-800 text-xs font-mono">reverseArr</code>{" "}
                  indices to correctly target only the suffix.
                </div>
              </div>

              {/* Mistake Tags */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  <span className="text-sm font-semibold text-stone-700">Mistake Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Logic Error", "Syntax Error", "Off By One"].map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-50 border border-orange-200/60 text-orange-800 hover:bg-orange-100 transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-xs text-stone-400 mt-6 italic">
          * This is real data generated by our app, not placeholder content.
        </p>
      </motion.div>
    </section>
  );
}
