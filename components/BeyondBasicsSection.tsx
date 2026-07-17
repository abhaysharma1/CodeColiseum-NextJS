"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import BlurText from "./BlurText";
import HandwrittenAnnotation from "./HandwrittenAnnotation";

/* ---------------------------------------------------------
   One large anchor tile + four smaller ones around it — a
   real asymmetric bento instead of a uniform 3-column repeat.
   Every icon now animates in when scrolled into view instead
   of sitting static, and the grid has a fixed row height so
   the section actually fits in one screen.
--------------------------------------------------------- */

/* Simple requestAnimationFrame count-up, used for the "labs
   reviewed" chip on the anchor tile. */
function useCountUp(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

const AnchorIllustration = ({ active }: { active: boolean }) => (
  <svg width="100%" height="120" viewBox="0 0 320 120" fill="none" className="mt-4">
    <rect x="20" y="10" width="150" height="100" rx="12" fill="white" stroke="currentColor" strokeWidth="1.5" className="text-orange-300" />
    <line x1="34" y1="30" x2="120" y2="30" stroke="currentColor" strokeWidth="2" className="text-orange-300" />
    <line x1="34" y1="42" x2="150" y2="42" stroke="currentColor" strokeWidth="1.5" className="text-orange-200" />
    <line x1="34" y1="54" x2="140" y2="54" stroke="currentColor" strokeWidth="1.5" className="text-orange-200" />
    <line x1="34" y1="66" x2="110" y2="66" stroke="currentColor" strokeWidth="1.5" className="text-orange-200" />

    {/* "Accepted" badge — springs in once the tile scrolls into view */}
    <motion.g
      style={{ transformOrigin: "64px 88px" }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.5 }}
    >
      <rect x="34" y="80" width="60" height="16" rx="8" fill="currentColor" className="text-green-100" />
      <text x="42" y="91" fontSize="9" fontWeight="700" className="fill-green-700">Accepted</text>
    </motion.g>

    <motion.circle
      cx="230"
      cy="55"
      r="40"
      fill="currentColor"
      className="text-orange-100"
      style={{ transformOrigin: "230px 55px" }}
      initial={{ scale: 0 }}
      animate={active ? { scale: 1 } : { scale: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    />
    <circle cx="230" cy="55" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-300" />
    <motion.path
      d="M230 35L237 50L253 52L241 63L244 79L230 71L216 79L219 63L207 52L223 50Z"
      fill="currentColor"
      className="text-orange-600"
      style={{ transformOrigin: "230px 55px" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.45 }}
    />
    <path d="M170 55 L190 55" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" className="text-orange-400" />
  </svg>
);

const AssessmentIcon = ({ active }: { active: boolean }) => (
  <svg width="90" height="60" viewBox="0 0 90 60" fill="none" className="mx-auto mt-4">
    <circle cx="45" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-300" />
    <motion.path
      d="M45 18v12l9 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="text-orange-600"
      style={{ transformOrigin: "45px 30px" }}
      animate={active ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    />
  </svg>
);

const LeaderboardIcon = ({ active }: { active: boolean }) => {
  const bars = [
    { y: 30, w: 84, cls: "text-orange-500" },
    { y: 18, w: 64, cls: "text-orange-400" },
    { y: 6, w: 44, cls: "text-orange-300" },
  ];
  return (
    <svg width="100" height="50" viewBox="0 0 100 50" fill="none" className="mx-auto mt-4">
      {bars.map((bar, i) => (
        <motion.rect
          key={i}
          x="8"
          y={bar.y}
          height="8"
          rx="4"
          fill="currentColor"
          className={bar.cls}
          initial={{ width: 0 }}
          animate={active ? { width: bar.w } : { width: 0 }}
          transition={{ duration: 0.7, delay: 0.15 * i, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
};

const ProgressIcon = ({ active }: { active: boolean }) => (
  <svg width="100" height="55" viewBox="0 0 100 55" fill="none" className="mx-auto mt-4">
    <motion.polyline
      points="6,42 22,32 38,36 54,18 70,24 86,8"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-orange-500"
      initial={{ pathLength: 0 }}
      animate={active ? { pathLength: 1 } : { pathLength: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
    {[[6, 42], [22, 32], [38, 36], [54, 18], [70, 24], [86, 8]].map(([cx, cy], i) => (
      <motion.circle
        key={i}
        cx={cx}
        cy={cy}
        r="2.3"
        fill="currentColor"
        className="text-orange-500"
        initial={{ opacity: 0, scale: 0 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ duration: 0.3, delay: 0.15 + i * 0.12 }}
      />
    ))}
  </svg>
);

/* Placement icon gets a light "glint" sweep on hover (driven by
   the parent tile's `group` class) rather than on scroll. */
const PlacementIcon = () => (
  <div className="relative mx-auto mt-4 w-[90px] h-[60px] overflow-hidden">
    <svg width="90" height="60" viewBox="0 0 90 60" fill="none">
      <rect x="20" y="24" width="50" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400" />
      <path d="M34 24v-6a6 6 0 0 1 6-6h10a6 6 0 0 1 6 6v6" stroke="currentColor" strokeWidth="2" className="text-orange-400" />
      <line x1="20" y1="38" x2="70" y2="38" stroke="currentColor" strokeWidth="1.5" className="text-orange-200" />
    </svg>
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />
  </div>
);

interface Tile {
  title: string;
  desc: string;
  span: string;
  big?: boolean;
  Icon: React.ComponentType<{ active: boolean }>;
}

const tiles: Tile[] = [
  {
    title: "Weekly Labs, AI-Reviewed",
    desc: "Every lab is submitted, run and reviewed automatically — with real feedback on your logic, not just pass or fail.",
    span: "md:col-span-2 md:row-span-2",
    big: true,
    Icon: AnchorIllustration,
  },
  {
    title: "Coding Assessments",
    desc: "Timed, proctorable tests that mirror real placement rounds.",
    span: "md:col-span-1",
    Icon: AssessmentIcon,
  },
  {
    title: "Class Leaderboards",
    desc: "See exactly where you stand against your batch, live.",
    span: "md:col-span-1",
    Icon: LeaderboardIcon,
  },
  {
    title: "Progress Tracking",
    desc: "A running record of every submission across the semester.",
    span: "md:col-span-1",
    Icon: ProgressIcon,
  },
  {
    title: "Placement Prep",
    desc: "Curated tracks that map straight to what interviews test.",
    span: "md:col-span-1",
    Icon: PlacementIcon,
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

function TileCard({ tile, index, isInView }: { tile: Tile; index: number; isInView: boolean }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const count = useCountUp(1240, isInView && !!tile.big);
  const { Icon } = tile;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <motion.div
      variants={itemVariants}
      onMouseMove={handleMouseMove}
      className={`${tile.span} group relative bg-white/60 backdrop-blur-sm border border-orange-200/50 rounded-[1.5rem] p-7 ${
        tile.big ? "flex flex-col justify-between" : "pb-4"
      } overflow-hidden hover:border-orange-300/70 hover:shadow-xl hover:shadow-orange-900/10 transition-all duration-400 cursor-default`}
    >
      {/* Rotating glow sweep — anchor tile only, on hover */}
      {tile.big && (
        <div className="absolute -inset-px rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -inset-[60%]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(216,110,42,0.5) 10%, transparent 24%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Cursor-following spotlight */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(280px circle at ${pos.x}% ${pos.y}%, rgba(216,110,42,0.14), transparent 70%)`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-100/0 group-hover:from-orange-50/40 group-hover:to-orange-100/30 transition-all duration-500 rounded-[1.5rem]" />

      {/* Index label */}
      <span className="absolute top-5 right-6 text-[11px] font-mono font-semibold text-orange-300 z-10">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative z-10">
        <h3
          className={`font-bold text-stone-900 mb-1.5 pr-8 ${tile.big ? "text-2xl md:text-3xl" : "text-lg"}`}
          style={tile.big ? { fontFamily: "'EB Garamond', serif" } : undefined}
        >
          {tile.title}
        </h3>
        <p className={`text-stone-400 leading-relaxed ${tile.big ? "text-base max-w-sm" : "text-sm max-w-sm"}`}>
          {tile.desc}
        </p>

        {tile.big && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-white border border-orange-200 text-xs font-bold text-orange-700"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {count.toLocaleString()}+ labs reviewed
          </motion.div>
        )}

        <div className="relative">
          {/* Soft glow halo behind the icon for depth */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 bg-orange-200/30 rounded-full blur-2xl" />
          </div>
          <div className={`relative flex items-center justify-center ${tile.big ? "" : "min-h-[52px]"}`}>
            <Icon active={isInView} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function BeyondBasicsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative w-full min-h-screen flex flex-col justify-center py-14 md:py-10 overflow-hidden border-t border-orange-200/40"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/4 top-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[150px]" />
        <div className="absolute right-1/4 bottom-0 w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 w-full">
        <div className="text-center mb-9 md:mb-10">
          <div className="relative inline-block">
            <div className="absolute -top-12 -right-8 md:-right-48 hidden md:block">
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
                className="text-5xl md:text-6xl font-bold text-stone-900 mb-4 tracking-tight"
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
            one connected platform, not six different tools.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[172px] gap-4"
        >
          {tiles.map((tile, i) => (
            <TileCard key={tile.title} tile={tile} index={i} isInView={isInView} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}