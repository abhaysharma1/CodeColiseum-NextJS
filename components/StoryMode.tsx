"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Network,
  MessageSquare,
  Zap,
  Users,
  Layout,
  Globe,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  benefits: readonly string[];
}

const FeatureCard = ({
  title,
  description,
  icon: Icon,
  color,
  benefits,
}: FeatureCardProps) => (
  <motion.div
    whileHover={{ y: -10, scale: 1.02 }}
    className="glass-card-dark p-8 group relative overflow-hidden border-white/5 bg-white/[0.02] flex flex-col h-full">
    <div
      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-10 transition-opacity blur-3xl pointer-events-none`}
    />

    <h3 className="text-2xl font-bold tracking-tight mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
      {title}
    </h3>

    <p className="text-gray-400 text-sm leading-relaxed mb-8 group-hover:text-gray-300 transition-colors">
      {description}
    </p>

    <div className="mt-auto">
      <ul className="space-y-4">
        {benefits.map((benefit, idx) => (
          <li
            key={idx}
            className="flex items-center gap-3 text-[10px] tracking-tight text-gray-500 group-hover:text-gray-400 transition-colors">
            <CheckCircle2 size={12} style={{ color }} className="shrink-0" />
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

const PERSPECTIVES = {
  learner: {
    id: "learner",
    title: "For Coders",
    subtitle: "Train Like a Real Competitor",
    description:
      "Practice in an AI-evaluated environment where correctness, complexity, and efficiency all matter.",
    cta: "Start Solving",
    color: "#8b5cf6",
    features: [
      {
        title: "AI Code Evaluation",
        description:
          "Your solutions are graded by AI for correctness and algorithmic efficiency — not just output.",
        icon: Brain,
        color: "#ec4899",
        benefits: ["Correctness + Complexity Checks", "Quality-Aware Scoring"],
      },
      {
        title: "Anti-Brute Detection",
        description:
          "Test cases and runtime profiling ensure brute-force solutions cannot sneak through.",
        icon: Brain,
        color: "#f43f5e",
        benefits: ["Hidden Test Cases", "Performance Guardrails"],
      },
      // {
      //   title: "Adaptive Challenges",
      //   description:
      //     "Problems scale in difficulty and constraints to push optimal algorithm design.",
      //   icon: Zap,
      //   color: "#6366f1",
      //   benefits: ["Constraint-Driven Tasks", "Real Contest Simulation"],
      // },
    ],
  },

  educator: {
    id: "educator",
    title: "For Instructors",
    subtitle: "AI-Verified Assessment Engine",
    description:
      "Run high-integrity coding assessments with automated AI grading and efficiency enforcement.",
    cta: "Create Assessment",
    color: "#10b981",
    features: [
      {
        title: "AI Auto-Grading",
        description:
          "Automatically evaluate submissions for correctness, time complexity, and edge-case coverage.",
        icon: Brain,
        color: "#10b981",
        benefits: ["Zero Manual Checking", "Complexity-Aware Grading"],
      },
      // {
      //   title: "Integrity Controls",
      //   description:
      //     "Built-in anti-brute-force and constraint stress testing protects exam fairness.",
      //   icon: Brain,
      //   color: "#fbbf24",
      //   benefits: ["Efficiency Enforcement", "Cheat-Resistant Tests"],
      // },
      {
        title: "Performance Analytics",
        description:
          "Analyze student algorithm choices, runtimes, and failure patterns in detail.",
        icon: Brain,
        color: "#3b82f6",
        benefits: ["Algorithm Insights", "Cohort Skill Mapping"],
      },
    ],
  },
} as const;

export const StoryMode = () => {
  const [perspective, setPerspective] = useState<"learner" | "educator">(
    "learner",
  );

  return (
    <section className="relative w-full py-0 pb-32 overflow-hidden bg-black/50">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-12 relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] tracking-tight text-gray-500 mb-8">
            <Sparkles size={14} className="text-purple-500" />
            AI Ecosystem
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="text-5xl md:text-8xl font-bold tracking-tight leading-[0.85] text-white mb-10">
            We Judge <span className="text-yellow-400 underline">Code</span>
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-gray-200 to-gray-500">
              Not The <>Output.</>
            </span>
          </motion.h2>

          {/* Perspective Switcher */}
          <div className="flex justify-center mt-12">
            <div className="p-2 rounded-3xl bg-white/5 border border-white/10 flex gap-2 backdrop-blur-3xl overflow-hidden relative">
              {(["learner", "educator"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPerspective(p)}
                  className={`relative px-8 md:px-12 py-5 rounded-2xl text-[10px] font-semibold tracking-tight transition-all duration-500 z-10 ${
                    perspective === p
                      ? "text-black"
                      : "text-gray-400 hover:text-white"
                  }`}>
                  <div className="flex items-center gap-3">
                    {p === "learner" ? (
                      <Brain size={16} />
                    ) : (
                      <Globe size={16} />
                    )}
                    {PERSPECTIVES[p].title}
                  </div>
                </button>
              ))}
              <AnimatePresence>
                <motion.div
                  key={perspective}
                  layoutId="perspective-slider"
                  className="absolute inset-y-2 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  initial={false}
                  style={{
                    width: "calc(50% - 12px)",
                    left: perspective === "learner" ? "8px" : "calc(50% + 4px)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[600px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={perspective}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-4 space-y-12">
                <div className="space-y-6">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-[10px] tracking-tight"
                    style={{ color: PERSPECTIVES[perspective].color }}>
                    {PERSPECTIVES[perspective].subtitle}
                  </motion.div>
                  <h3 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white mb-8">
                    {perspective === "learner"
                      ? "Level Up Your"
                      : "Empower Your"}{" "}
                    <br />
                    <span className="text-gray-800">Infrastructure.</span>
                  </h3>
                  <p className="text-lg text-gray-400 leading-relaxed max-w-sm">
                    {PERSPECTIVES[perspective].description}
                  </p>
                </div>

                <motion.button
                  whileHover={{ gap: "2.5rem", x: 10 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    document
                      .getElementById("problemlist")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group flex items-center gap-8 bg-white text-black px-10 py-7 rounded-[2rem] font-semibold tracking-tight text-[10px] hover:bg-neutral-200 transition-all duration-500 shadow-2xl">
                  {PERSPECTIVES[perspective].cta}
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </div>

              {/* Cards */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {PERSPECTIVES[perspective].features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}>
                    <FeatureCard {...feature} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Trust / Network Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "Accuracy", value: "99.9%" },
            { label: "Security", value: "AES-256" },
            { label: "Latency", value: "<50ms" },
            { label: "Architecture", value: "Edge-AI" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center md:text-left group cursor-default">
              <div className="text-gray-600 text-[10px] tracking-tight mb-3 group-hover:text-gray-400 transition-colors">
                {stat.label}
              </div>
              <div className="text-white text-3xl font-bold tracking-tight group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-500 transition-all">
                {stat.value}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative Side Accents */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-px bg-linear-to-r from-white/10 to-transparent opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-px bg-linear-to-l from-white/10 to-transparent opacity-20 pointer-events-none" />
    </section>
  );
};
