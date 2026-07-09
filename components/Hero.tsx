"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import AlgorithmNetwork from "./AlgorithmNetwork";
import CodeWindow from "./CodeWindow";
import BlurText from "./BlurText";

/* ---------------------------------------------------------
   Floating cards that orbit the code editor
--------------------------------------------------------- */
const floatingCards = [
  {
    title: "Weekly Lab",
    subtitle: "Due Tomorrow",
    icon: "📝",
    className: "-top-5 -left-6 md:-left-10",
    duration: 6,
    delay: 0,
  },
  {
    title: "AI Feedback",
    subtitle: "2 Suggestions Available",
    icon: "🤖",
    className: "top-[36%] -right-6 md:-right-12",
    duration: 7,
    delay: 0.35,
  },
  {
    title: "Class Leaderboard",
    subtitle: "Rank #8",
    icon: "🏆",
    className: "-bottom-6 left-3 md:left-6",
    duration: 6.5,
    delay: 0.7,
  },
  {
    title: "Placement Track",
    subtitle: "120 Problems Completed",
    icon: "💼",
    className: "hidden xl:flex top-[2%] -right-20",
    duration: 7.5,
    delay: 1.05,
  },
];

const FloatingCard = ({
  icon,
  title,
  subtitle,
  className,
  duration,
  delay,
}: {
  icon: string;
  title: string;
  subtitle: string;
  className: string;
  duration: number;
  delay: number;
}) => (
  <motion.div
    className={`absolute z-30 hidden sm:flex items-start gap-2.5 rounded-2xl border border-orange-200/70 bg-white/90 backdrop-blur-md px-3.5 py-2.5 shadow-[0_8px_30px_rgba(194,101,42,0.14)] pointer-events-none select-none max-w-[160px] ${className}`}
    initial={{ opacity: 0, y: 12, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
    transition={{
      opacity: { duration: 0.6, delay: 1.2 + delay },
      scale: { duration: 0.6, delay: 1.2 + delay },
      y: { duration, delay: 1.5 + delay, repeat: Infinity, ease: "easeInOut" },
    }}
  >
    <span className="text-base leading-none mt-0.5">{icon}</span>
    <span className="min-w-0">
      <span className="block text-xs font-bold text-stone-800 leading-tight">{title}</span>
      <span className="block text-[11px] text-stone-500 leading-tight">{subtitle}</span>
    </span>
  </motion.div>
);

const featureChips = [
  "Weekly Labs",
  "Coding Assessments",
  "AI Code Review",
  "Smart Leaderboards",
  "Progress Tracking",
  "Placement Prep",
];

/* ---------------------------------------------------------
   Motion variants — staggered reveal
--------------------------------------------------------- */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden md:h-[calc(100vh-80px)] md:min-h-[620px] md:max-h-[920px] flex items-center">
      {/* Interactive Algorithm Network background */}
      <div className="absolute inset-0 z-0">
        <AlgorithmNetwork />
      </div>

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-8"
      >
        {/* Two-column split kicks in at md (768px) — far more reliable across
            real laptop display scaling than lg (1024px) would be. Below md
            it stacks cleanly and simply flows with the page. */}
        <div className="flex flex-col md:flex-row md:items-center gap-y-10">
          {/* TEXT BLOCK — sits above/left, bleeds under the editor for depth */}
          <div className="md:w-[56%] relative z-30 space-y-4 md:space-y-5 pr-0 md:pr-8 pointer-events-auto">
            {/* Badge */}
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/70 backdrop-blur-sm px-4 py-1.5 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600" />
              </span>
              <Sparkles size={13} className="text-orange-600" />
              <span className="text-xs font-semibold tracking-wide text-orange-800">
                AI-Powered Coding Platform for Colleges
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div variants={item} style={{ fontFamily: "'EB Garamond', serif" }}>
              <BlurText
                text="From First Line to First Offer."
                delay={35}
                animateBy="words"
                direction="bottom"
                className="text-4xl md:text-[2.75rem] lg:text-5xl xl:text-[3.4rem] leading-[1.1] font-bold text-stone-900 tracking-tight"
                wordStyles={{
                  Offer: { className: "text-orange-700 italic" },
                }}
              />
            </motion.div>

            {/* Description */}
            <motion.p
              variants={item}
              className="text-base md:text-[0.95rem] lg:text-lg text-stone-500 max-w-xl leading-relaxed"
            >
              Weekly labs, coding assessments and DSA practice — all reviewed by AI,
              tracked all semester, and built to get you placement-ready.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-wrap gap-3 md:gap-4 pt-1">
              <Link
                href="/problem-list"
                className="group relative bg-orange-700 text-white px-6 md:px-7 py-3 md:py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-700/25 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-700/35 hover:-translate-y-0.5 active:scale-95"
              >
                <span className="relative z-10">Start Solving</span>
                <ArrowRight
                  size={18}
                  className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                />
                <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                href="#features"
                className="border border-stone-300 text-stone-800 bg-white px-6 md:px-7 py-3 md:py-3.5 rounded-xl font-bold transition-all duration-300 hover:bg-orange-50 hover:border-orange-300 hover:-translate-y-0.5"
              >
                Explore Platform
              </Link>
            </motion.div>

            {/* Feature chips — capability overview instead of vanity stats */}
            <motion.div variants={item} className="flex flex-wrap gap-2 pt-2 md:pt-3 max-w-xl">
              {featureChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/70 px-3 py-1 text-xs font-medium text-stone-600"
                >
                  <Check size={12} className="text-orange-600" strokeWidth={3} />
                  {chip}
                </span>
              ))}
            </motion.div>
          </div>

          {/* CODE EDITOR — overlaps the text column for layered depth */}
          <motion.div
            variants={item}
            className="md:w-[46%] md:-ml-8 lg:-ml-12 relative z-20 mt-4 md:mt-0 lg:-rotate-1 pointer-events-auto"
          >
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto md:mx-0 md:ml-auto">
              <CodeWindow />
              {floatingCards.map((c) => (
                <FloatingCard key={c.title} {...c} />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Hero;