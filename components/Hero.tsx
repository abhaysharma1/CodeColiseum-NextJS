"use client";

import React from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import AlgorithmNetwork from "./AlgorithmNetwork";
import CodeWindow from "./CodeWindow";
import BlurText from "./BlurText";

/* ---------------------------------------------------------
   Floating panels that orbit the code editor
--------------------------------------------------------- */
const floatingCards = [
  {
    title: "Weekly Lab",
    subtitle: "Due Tomorrow",
    icon: "📝",
    className: "-top-14 -left-10 md:-left-16",
    anchor: { x: 2, y: -10 },
    orbitX: 8,
    duration: 6,
    delay: 0,
  },
  {
    title: "AI Feedback",
    subtitle: "2 Suggestions",
    icon: "🤖",
    className: "top-[38%] -right-10 md:-right-16",
    anchor: { x: 104, y: 40 },
    orbitX: -8,
    duration: 7,
    delay: 0.35,
  },
  {
    title: "Leaderboard",
    subtitle: "Rank #8",
    icon: "🏆",
    className: "-bottom-14 left-2 md:left-6",
    anchor: { x: 8, y: 108 },
    orbitX: 6,
    duration: 6.5,
    delay: 0.7,
  },
  {
    title: "Placement Progress",
    subtitle: "120 Problems Solved",
    icon: "💼",
    className: "hidden xl:flex -top-14 -right-24",
    anchor: { x: 106, y: -10 },
    orbitX: -6,
    duration: 7.5,
    delay: 1.05,
  },
];

const FloatingCard = ({
  icon,
  title,
  subtitle,
  className,
  orbitX,
  duration,
  delay,
}: {
  icon: string;
  title: string;
  subtitle: string;
  className: string;
  orbitX: number;
  duration: number;
  delay: number;
}) => (
  <motion.div
    className={`absolute z-30 hidden sm:flex items-start gap-2.5 rounded-2xl border border-orange-200/70 bg-white/90 backdrop-blur-md px-3.5 py-2.5 shadow-[0_8px_30px_rgba(194,101,42,0.14)] pointer-events-none select-none max-w-[160px] ${className}`}
    initial={{ opacity: 0, y: 12, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1, x: [0, orbitX, 0], y: [0, -10, 0] }}
    transition={{
      opacity: { duration: 0.6, delay: 1.2 + delay },
      scale: { duration: 0.6, delay: 1.2 + delay },
      x: { duration: duration * 1.2, delay: 1.5 + delay, repeat: Infinity, ease: "easeInOut" },
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

/* ---------------------------------------------------------
   Subtle SVG threads linking each panel to the editor —
   drawn once, faded in, so the orbit reads as one system.
--------------------------------------------------------- */
const PanelConnectors = () => (
  <svg
    className="absolute inset-0 w-full h-full z-10 pointer-events-none hidden sm:block"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    {floatingCards.map((c) => {
      const midX = (c.anchor.x + 50) / 2 + (c.anchor.x < 50 ? -7 : 7);
      const midY = (c.anchor.y + 50) / 2 + (c.anchor.y < 50 ? -5 : 5);
      return (
        <motion.path
          key={c.title}
          d={`M ${c.anchor.x} ${c.anchor.y} Q ${midX} ${midY} 50 50`}
          fill="none"
          stroke="rgba(194,101,42,0.35)"
          strokeWidth="0.25"
          strokeDasharray="1.5 2"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 0.6, pathLength: 1 }}
          transition={{ duration: 1.4, delay: 1.4, ease: "easeOut" }}
        />
      );
    })}
  </svg>
);

const workflowSteps = [
  { icon: "📝", label: "Weekly Lab" },
  { icon: "💻", label: "Coding Assessment" },
  { icon: "🤖", label: "AI Review" },
  { icon: "📊", label: "Progress Tracking" },
  { icon: "🏆", label: "Leaderboard" },
  { icon: "💼", label: "Placement Ready" },
];

/* ---------------------------------------------------------
   Workflow strip — the whole student journey in one glance.
   Wraps onto a second line rather than scrolling, so nothing
   is ever hidden off-screen. A small dot inside each chip
   lights up in sequence, giving the same "travelling through
   the workflow" feel without depending on a single fixed-width
   row (which broke down once labels didn't fit one line).
--------------------------------------------------------- */
const WorkflowStrip = () => {
  const cycle = workflowSteps.length * 0.85;
  return (
    <div className="flex flex-wrap items-center gap-1.5 w-full max-w-xl pt-1">
      {workflowSteps.map((s, i) => (
        <span
          key={s.label}
          className="relative inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/80 backdrop-blur-sm pl-1.5 pr-2.5 py-1 text-[11px] font-medium text-stone-600 whitespace-nowrap"
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"
            animate={{ opacity: [0.25, 1, 0.25], boxShadow: ["0 0 0 rgba(216,110,42,0)", "0 0 8px 2px rgba(216,110,42,0.6)", "0 0 0 rgba(216,110,42,0)"] }}
            transition={{ duration: cycle, delay: i * 0.85, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="leading-none">{s.icon}</span>
          {s.label}
        </span>
      ))}
    </div>
  );
};

/* ---------------------------------------------------------
   Magnetic wrapper — nudges its child gently toward the
   cursor, used on the primary CTA
--------------------------------------------------------- */
const Magnetic = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};

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

            {/* Heading — two staggered lines */}
            <motion.div variants={item} style={{ fontFamily: "'EB Garamond', serif" }}>
              <BlurText
                text="From Weekly Labs"
                delay={35}
                animateBy="words"
                direction="bottom"
                className="text-4xl md:text-[2.75rem] lg:text-5xl xl:text-[3.4rem] leading-[1.1] font-bold text-stone-900 tracking-tight"
              />
              <BlurText
                text="to Dream Offers."
                delay={35}
                animateBy="words"
                direction="bottom"
                className="text-4xl md:text-[2.75rem] lg:text-5xl xl:text-[3.4rem] leading-[1.1] font-bold text-stone-900 tracking-tight"
                wordStyles={{
                  Dream: { className: "text-orange-700" },
                  "Offers.": { className: "text-orange-700" },
                }}
              />
            </motion.div>

            {/* Description */}
            <motion.p
              variants={item}
              className="text-base md:text-[0.95rem] lg:text-lg text-stone-500 max-w-[600px] leading-relaxed"
            >
              Complete weekly labs, coding assessments and DSA practice with AI-powered
              feedback, progress tracking and leaderboards all in one platform built for
              college students.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-wrap gap-3 md:gap-4 pt-1">
              <Magnetic>
                <Link
                  href="/problem-list"
                  className="group relative bg-gradient-to-b from-orange-600 to-orange-700 text-white px-6 md:px-7 py-3 md:py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-700/25 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-700/35 hover:-translate-y-0.5 active:scale-95"
                >
                  <span className="relative z-10">Start Coding</span>
                  <ArrowRight
                    size={18}
                    className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                  />
                  {/* shine sweep */}
                  <span className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] -translate-x-[150%] group-hover:translate-x-[350%] transition-transform duration-700 ease-out pointer-events-none" />
                  <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </Magnetic>
              <Link
                href="#features"
                className="border border-stone-300 text-stone-800 bg-white px-6 md:px-7 py-3 md:py-3.5 rounded-xl font-bold transition-all duration-300 hover:bg-orange-50 hover:border-orange-300 hover:-translate-y-0.5"
              >
                Explore Platform
              </Link>
            </motion.div>

            {/* Workflow strip — the entire student journey in one glance */}
            <motion.div variants={item}>
              <WorkflowStrip />
            </motion.div>
          </div>

          {/* CODE EDITOR — overlaps the text column for layered depth */}
          <motion.div
            variants={item}
            className="md:w-[46%] md:-ml-8 lg:-ml-12 relative z-20 mt-4 md:mt-0 lg:-rotate-1 pointer-events-auto"
          >
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto md:mx-0 md:ml-auto">
              <PanelConnectors />
              <div className="relative z-20">
                <CodeWindow />
              </div>
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