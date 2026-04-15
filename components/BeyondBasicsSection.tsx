"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import BlurText from "./BlurText";
import HandwrittenAnnotation from "./HandwrittenAnnotation";

const features = [
  {
    title: "100% Automated Tracking",
    desc: "Every code run is captured automatically across all platforms. Zero manual input required.",
    span: "col-span-1",
    icon: (
      <svg width="80" height="60" viewBox="0 0 80 60" fill="none" className="mx-auto mt-4">
        {/* Curved tracking lines */}
        <path d="M10 50 C20 20, 35 40, 45 15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" className="text-orange-400" />
        <path d="M18 50 C28 25, 43 45, 53 20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" className="text-orange-300" />
        <path d="M26 50 C36 30, 51 50, 61 25" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" className="text-orange-200" />
        {/* Arrow tips */}
        <circle cx="45" cy="15" r="2.5" fill="currentColor" className="text-orange-500" />
        <circle cx="53" cy="20" r="2" fill="currentColor" className="text-orange-400" />
        <circle cx="61" cy="25" r="1.5" fill="currentColor" className="text-orange-300" />
      </svg>
    ),
  },
  {
    title: "Secure by Default",
    desc: "Enterprise-grade security protects your coding data and progress with industry-standard encryption.",
    span: "col-span-1",
    icon: (
      <svg width="120" height="60" viewBox="0 0 120 60" fill="none" className="mx-auto mt-4">
        {/* Bar chart with vertical bars */}
        {[18, 24, 38, 14, 28, 42, 20, 35, 16, 30].map((h, i) => (
          <rect
            key={i}
            x={10 + i * 10}
            y={55 - h}
            width="6"
            height={h}
            rx="1.5"
            fill={i === 5 ? "#c2652a" : "currentColor"}
            className={i === 5 ? "" : "text-orange-200"}
          />
        ))}
        {/* Highlight line */}
        <line x1="63" y1="8" x2="63" y2="55" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
      </svg>
    ),
  },
  {
    title: "Smart Analytics",
    desc: "Track your progress with detailed performance insights and growth metrics visualized in real-time.",
    span: "col-span-1",
    icon: (
      <svg width="120" height="60" viewBox="0 0 120 60" fill="none" className="mx-auto mt-4">
        {/* Line chart */}
        <polyline
          points="10,45 25,38 40,42 55,25 70,30 85,15 100,20 110,10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-orange-500"
        />
        {/* Dots */}
        {[
          [10, 45], [25, 38], [40, 42], [55, 25], [70, 30], [85, 15], [100, 20], [110, 10]
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2.5" fill="currentColor" className="text-orange-500" />
        ))}
        {/* Stars decoration */}
        <text x="90" y="8" fontSize="8" className="text-orange-400" fill="currentColor">✦</text>
        <text x="105" y="14" fontSize="6" className="text-orange-300" fill="currentColor">✦</text>
      </svg>
    ),
  },
  {
    title: "AI Results",
    desc: "Receive personalized insights on your study habits, mistake analysis, and consistency tracking powered by AI.",
    span: "md:col-span-3",
    icon: (
      <svg width="240" height="70" viewBox="0 0 240 70" fill="none" className="mx-auto mt-6">
        {/* Neural network nodes */}
        {/* Layer 1 */}
        {[15, 35, 55].map((y, i) => (
          <circle key={`l1-${i}`} cx="40" cy={y} r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-300" />
        ))}
        {/* Layer 2 */}
        {[10, 25, 40, 55].map((y, i) => (
          <circle key={`l2-${i}`} cx="90" cy={y} r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-400" />
        ))}
        {/* Layer 3 */}
        {[15, 35, 55].map((y, i) => (
          <circle key={`l3-${i}`} cx="140" cy={y} r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-400" />
        ))}
        {/* Layer 4 */}
        {[25, 45].map((y, i) => (
          <circle key={`l4-${i}`} cx="190" cy={y} r="5" fill="currentColor" className="text-orange-500" />
        ))}
        {/* Connections L1 -> L2 */}
        {[15, 35, 55].map((y1) =>
          [10, 25, 40, 55].map((y2) => (
            <line key={`${y1}-${y2}`} x1="45" y1={y1} x2="85" y2={y2} stroke="currentColor" strokeWidth="0.7" className="text-orange-200" />
          ))
        )}
        {/* Connections L2 -> L3 */}
        {[10, 25, 40, 55].map((y1) =>
          [15, 35, 55].map((y2) => (
            <line key={`${y1}-${y2}-b`} x1="95" y1={y1} x2="135" y2={y2} stroke="currentColor" strokeWidth="0.7" className="text-orange-200" />
          ))
        )}
        {/* Connections L3 -> L4 */}
        {[15, 35, 55].map((y1) =>
          [25, 45].map((y2) => (
            <line key={`${y1}-${y2}-c`} x1="145" y1={y1} x2="185" y2={y2} stroke="currentColor" strokeWidth="0.7" className="text-orange-300" />
          ))
        )}
      </svg>
    ),
  },
  {
    title: "Notion Sync",
    desc: "Export insights and tagged mistakes to your Notion workspace for organized learning and team collaboration.",
    span: "col-span-1 md:col-span-2",
    icon: (
      <svg width="140" height="60" viewBox="0 0 140 60" fill="none" className="mx-auto mt-6">
        {/* Page 1 */}
        <rect x="20" y="8" width="40" height="48" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-300" />
        <line x1="28" y1="18" x2="52" y2="18" stroke="currentColor" strokeWidth="1.5" className="text-orange-200" />
        <line x1="28" y1="25" x2="48" y2="25" stroke="currentColor" strokeWidth="1" className="text-orange-200" />
        <line x1="28" y1="32" x2="50" y2="32" stroke="currentColor" strokeWidth="1" className="text-orange-200" />
        <line x1="28" y1="39" x2="44" y2="39" stroke="currentColor" strokeWidth="1" className="text-orange-200" />
        {/* Arrow */}
        <path d="M65 32 L75 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-orange-400" />
        <path d="M72 28 L76 32 L72 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400" />
        {/* Page 2 (Notion style) */}
        <rect x="80" y="8" width="40" height="48" rx="4" fill="currentColor" className="text-orange-100" stroke="currentColor" strokeWidth="1.5" />
        <rect x="80" y="8" width="40" height="48" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-400" />
        <line x1="88" y1="18" x2="112" y2="18" stroke="currentColor" strokeWidth="1.5" className="text-orange-400" />
        <line x1="88" y1="25" x2="108" y2="25" stroke="currentColor" strokeWidth="1" className="text-orange-300" />
        <line x1="88" y1="32" x2="110" y2="32" stroke="currentColor" strokeWidth="1" className="text-orange-300" />
        <line x1="88" y1="39" x2="104" y2="39" stroke="currentColor" strokeWidth="1" className="text-orange-300" />
      </svg>
    ),
  },
  {
    title: "Compete & Conquer",
    desc: "Earn XP for every solve, unlock 40+ achievements, and see how you stack up on global leaderboards.",
    span: "col-span-1",
    icon: (
      <svg width="120" height="50" viewBox="0 0 120 50" fill="none" className="mx-auto mt-6">
        {/* Stacked bars like a leaderboard */}
        <rect x="10" y="35" width="100" height="8" rx="4" fill="currentColor" className="text-orange-500" />
        <rect x="10" y="22" width="80" height="8" rx="4" fill="currentColor" className="text-orange-400" />
        <rect x="10" y="9" width="55" height="8" rx="4" fill="currentColor" className="text-orange-300" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function BeyondBasicsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative w-full py-28 md:py-40 overflow-hidden border-t border-orange-200/40"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/4 top-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[150px]" />
        <div className="absolute right-1/4 bottom-0 w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8">
        {/* Heading */}
        <div className="text-center mb-20">
          <div className="relative inline-block">
            {/* Annotation */}
            <div className="absolute -top-14 -right-8 md:-right-44 hidden md:block">
              <HandwrittenAnnotation
                text="not your average features "
                arrow="down-left"
                rotate={-5}
                delay={300}
              />
            </div>

            <div style={{ fontFamily: "'EB Garamond', serif" }}>
              <BlurText
                text="Beyond Basics"
                delay={60}
                animateBy="letters"
                direction="bottom"
                center
                className="text-5xl md:text-7xl font-bold text-stone-900 mb-6 tracking-tight"
                wordStyles={{
                  "B": { className: "italic text-orange-700" },
                }}
              />
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg text-stone-500 max-w-2xl mx-auto"
          >
            Features to{" "}
            <span className="font-bold text-stone-900 bg-orange-100/70 px-2 py-0.5 rounded">
              supercharge
            </span>{" "}
            your growth — plus personalized themes to match your style
          </motion.p>
        </div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map(({ title, desc, span, icon }) => (
            <motion.div
              key={title}
              variants={itemVariants}
              className={`${span} group relative bg-white/60 backdrop-blur-sm border border-orange-200/50 rounded-[1.5rem] p-7 pb-4 overflow-hidden hover:border-orange-300/70 hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-400 cursor-default`}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-100/0 group-hover:from-orange-50/40 group-hover:to-orange-100/30 transition-all duration-500 rounded-[1.5rem]" />

              <div className="relative z-10">
                <h3 className="text-lg font-bold text-stone-900 mb-1">{title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed max-w-sm">{desc}</p>

                {/* Icon illustration */}
                <div className="mt-2 flex items-center justify-center min-h-[60px]">
                  {icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
