"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import BlurText from "./BlurText";
import HandwrittenAnnotation from "./HandwrittenAnnotation";

/* ---------------------------------------------------------
   One large anchor tile + four smaller ones around it — a
   real asymmetric bento instead of a uniform 3-column repeat,
   and every tile now describes something CodeColiseum
   actually does.
--------------------------------------------------------- */

const AnchorIllustration = () => (
  <svg width="100%" height="120" viewBox="0 0 320 120" fill="none" className="mt-4">
    <rect x="20" y="10" width="150" height="100" rx="12" fill="white" stroke="currentColor" strokeWidth="1.5" className="text-orange-300" />
    <line x1="34" y1="30" x2="120" y2="30" stroke="currentColor" strokeWidth="2" className="text-orange-300" />
    <line x1="34" y1="42" x2="150" y2="42" stroke="currentColor" strokeWidth="1.5" className="text-orange-200" />
    <line x1="34" y1="54" x2="140" y2="54" stroke="currentColor" strokeWidth="1.5" className="text-orange-200" />
    <line x1="34" y1="66" x2="110" y2="66" stroke="currentColor" strokeWidth="1.5" className="text-orange-200" />
    <rect x="34" y="80" width="60" height="16" rx="8" fill="currentColor" className="text-green-100" />
    <text x="42" y="91" fontSize="9" fontWeight="700" className="fill-green-700">Accepted</text>

    <circle cx="230" cy="55" r="40" fill="currentColor" className="text-orange-100" />
    <circle cx="230" cy="55" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-300" />
    <path
      d="M230 35L237 50L253 52L241 63L244 79L230 71L216 79L219 63L207 52L223 50Z"
      fill="currentColor"
      className="text-orange-600"
    />
    <path d="M170 55 L190 55" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" className="text-orange-400" />
  </svg>
);

const AssessmentIcon = () => (
  <svg width="90" height="60" viewBox="0 0 90 60" fill="none" className="mx-auto mt-4">
    <circle cx="45" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-300" />
    <path d="M45 18v12l9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-orange-600" />
  </svg>
);

const LeaderboardIcon = () => (
  <svg width="100" height="50" viewBox="0 0 100 50" fill="none" className="mx-auto mt-4">
    <rect x="8" y="30" width="84" height="8" rx="4" fill="currentColor" className="text-orange-500" />
    <rect x="8" y="18" width="64" height="8" rx="4" fill="currentColor" className="text-orange-400" />
    <rect x="8" y="6" width="44" height="8" rx="4" fill="currentColor" className="text-orange-300" />
  </svg>
);

const ProgressIcon = () => (
  <svg width="100" height="55" viewBox="0 0 100 55" fill="none" className="mx-auto mt-4">
    <polyline
      points="6,42 22,32 38,36 54,18 70,24 86,8"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-orange-500"
    />
    {[[6, 42], [22, 32], [38, 36], [54, 18], [70, 24], [86, 8]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="2.3" fill="currentColor" className="text-orange-500" />
    ))}
  </svg>
);

const PlacementIcon = () => (
  <svg width="90" height="60" viewBox="0 0 90 60" fill="none" className="mx-auto mt-4">
    <rect x="20" y="24" width="50" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400" />
    <path d="M34 24v-6a6 6 0 0 1 6-6h10a6 6 0 0 1 6 6v6" stroke="currentColor" strokeWidth="2" className="text-orange-400" />
    <line x1="20" y1="38" x2="70" y2="38" stroke="currentColor" strokeWidth="1.5" className="text-orange-200" />
  </svg>
);

const tiles = [
  {
    title: "Weekly Labs, AI-Reviewed",
    desc: "Every lab is submitted, run and reviewed automatically — with real feedback on your logic, not just pass or fail.",
    span: "md:col-span-2 md:row-span-2",
    big: true,
    icon: <AnchorIllustration />,
  },
  {
    title: "Coding Assessments",
    desc: "Timed, proctorable tests that mirror real placement rounds.",
    span: "md:col-span-1",
    icon: <AssessmentIcon />,
  },
  {
    title: "Class Leaderboards",
    desc: "See exactly where you stand against your batch, live.",
    span: "md:col-span-1",
    icon: <LeaderboardIcon />,
  },
  {
    title: "Progress Tracking",
    desc: "A running record of every submission across the semester.",
    span: "md:col-span-1",
    icon: <ProgressIcon />,
  },
  {
    title: "Placement Prep",
    desc: "Curated tracks that map straight to what interviews test.",
    span: "md:col-span-1",
    icon: <PlacementIcon />,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function BeyondBasicsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative w-full min-h-screen flex flex-col justify-center py-20 md:py-16 overflow-hidden border-t border-orange-200/40"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/4 top-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[150px]" />
        <div className="absolute right-1/4 bottom-0 w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 w-full">
        <div className="text-center mb-14 md:mb-16">
          <div className="relative inline-block">
            <div className="absolute -top-14 -right-8 md:-right-48 hidden md:block">
              <HandwrittenAnnotation
                text="one platform, every step"
                arrow="down-left"
                rotate={-5}
                delay={300}
              />
            </div>
            <div style={{ fontFamily: "'EB Garamond', serif" }}>
              <BlurText
                text="Built Around You"
                delay={60}
                animateBy="letters"
                direction="bottom"
                center
                className="text-5xl md:text-7xl font-bold text-stone-900 mb-6 tracking-tight"
                wordStyles={{ Built: { className: "italic text-orange-700" } }}
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
            From your first weekly lab to your{" "}
            <span className="font-bold text-stone-900 bg-orange-100/70 px-2 py-0.5 rounded">
              placement offer
            </span>{" "}
            — one connected platform, not six different tools.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4"
        >
          {tiles.map(({ title, desc, span, icon, big }) => (
            <motion.div
              key={title}
              variants={itemVariants}
              className={`${span} group relative bg-white/60 backdrop-blur-sm border border-orange-200/50 rounded-[1.5rem] p-7 ${
                big ? "flex flex-col justify-between" : "pb-4"
              } overflow-hidden hover:border-orange-300/70 hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-400 cursor-default`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-100/0 group-hover:from-orange-50/40 group-hover:to-orange-100/30 transition-all duration-500 rounded-[1.5rem]" />

              <div className="relative z-10">
                <h3
                  className={`font-bold text-stone-900 mb-1.5 ${big ? "text-2xl md:text-3xl" : "text-lg"}`}
                  style={big ? { fontFamily: "'EB Garamond', serif" } : undefined}
                >
                  {title}
                </h3>
                <p className={`text-stone-400 leading-relaxed ${big ? "text-base max-w-sm" : "text-sm max-w-sm"}`}>
                  {desc}
                </p>
                <div className={`flex items-center justify-center ${big ? "" : "min-h-[60px]"}`}>{icon}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}