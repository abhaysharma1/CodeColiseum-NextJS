"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import BlurText from "./BlurText";
import HandwrittenAnnotation from "./HandwrittenAnnotation";

/* ---------------------------------------------------------
   A horizontal journey instead of a numbered list — the same
   "flow" language as the Hero background, so this section
   rhymes with the top of the page rather than feeling like a
   separate template.
--------------------------------------------------------- */
const stations = [
  {
    icon: "📝",
    title: "Join & Get Labs",
    desc: "Sign in with your class code — your first weekly lab is already waiting.",
  },
  {
    icon: "🤖",
    title: "Solve & Get AI Feedback",
    desc: "Write your solution and get real feedback on your logic, not just pass or fail.",
  },
  {
    icon: "🏆",
    title: "Assess & Climb the Board",
    desc: "Take timed assessments and watch your class rank update live.",
  },
  {
    icon: "💼",
    title: "Get Placement-Ready",
    desc: "A full semester of progress, tracked and ready to show in interviews.",
  },
];

const liveChips = [
  { icon: "🔥", label: "21-day streak" },
  { icon: "🏅", label: "Rank #8 this week" },
  { icon: "✅", label: "Lab 6 submitted" },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative w-full min-h-screen flex flex-col justify-center bg-orange-50/60 py-20 md:py-16 border-y border-orange-200/40 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8 w-full">
        {/* Heading */}
        <div className="relative text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <div className="absolute -top-14 right-0 md:right-1/4 hidden md:block">
            <HandwrittenAnnotation
              text="it's really this simple!"
              arrow="down"
              rotate={6}
              delay={300}
            />
          </div>
          <div style={{ fontFamily: "'EB Garamond', serif" }}>
            <BlurText
              text="From day one to offer day."
              delay={40}
              animateBy="words"
              direction="bottom"
              center
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight tracking-tight"
              wordStyles={{ "offer": { className: "italic text-orange-700" } }}
            />
          </div>
        </div>

        {/* Journey */}
        <div className="relative flex flex-col md:flex-row items-start justify-between gap-12 md:gap-4 mb-16">
          <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px bg-orange-200" />

          {stations.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="relative z-10 flex-1 flex flex-col items-center text-center gap-3"
            >
              <div className="relative w-16 h-16 rounded-full bg-white border-2 border-orange-300 shadow-lg shadow-orange-900/5 flex items-center justify-center text-2xl">
                {s.icon}
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-orange-400"
                  animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.35, 1] }}
                  transition={{
                    duration: stations.length * 0.9,
                    delay: i * 0.9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <h4 className="text-lg font-bold text-stone-900">{s.title}</h4>
              <p className="text-sm text-stone-500 max-w-[230px] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Live grounding chips + CTA */}
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {liveChips.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-sm"
              >
                <span>{c.icon}</span>
                {c.label}
              </span>
            ))}
          </div>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-orange-700 text-white px-8 py-4 rounded-lg font-bold shadow-xl shadow-orange-700/25 hover:brightness-110 transition-all active:scale-95"
          >
            Get Started Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}