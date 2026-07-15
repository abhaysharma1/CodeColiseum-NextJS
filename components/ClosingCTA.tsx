"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  GraduationCap,
  Users,
  School,
  Trophy,
} from "lucide-react";
import BlurText from "./BlurText";

/* ---------------------------------------------------------
   Third pass: the ring animation was too slow to register as
   motion at all, and two chips weren't enough to make the side
   margins feel designed rather than empty. This version speeds
   every animation up noticeably, scatters small pulsing
   particles across the whole section (not just near the card),
   adds a third stat chip, and gives the card itself a bit more
   presence with a gradient wash and a looping button sheen.
--------------------------------------------------------- */

const trustPoints = ["Free for students", "No credit card needed", "Set up in 2 minutes"];

const particles = [
  { top: "12%", left: "12%", size: 5, delay: 0 },
  { top: "22%", left: "22%", size: 3, delay: 0.6 },
  { top: "68%", left: "9%", size: 4, delay: 1.1 },
  { top: "80%", left: "20%", size: 3, delay: 0.3 },
  { top: "15%", left: "88%", size: 4, delay: 0.8 },
  { top: "35%", left: "94%", size: 3, delay: 1.4 },
  { top: "75%", left: "90%", size: 5, delay: 0.4 },
  { top: "88%", left: "78%", size: 3, delay: 1.7 },
];

export default function ClosingCTA() {
  return (
    <section className="relative w-full py-8 md:py-10 flex items-center justify-center overflow-hidden">
      {/* Full-width faint dot texture so the margins aren't flat empty cream */}
      <div
        className="absolute inset-0 opacity-[0.3] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(194,65,12,0.3) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          WebkitMaskImage: "radial-gradient(circle at center, black 0%, transparent 85%)",
          maskImage: "radial-gradient(circle at center, black 0%, transparent 85%)",
        }}
      />

      {/* Scattered pulsing particles across the whole section */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-orange-400"
            style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
            animate={{ opacity: [0.15, 0.9, 0.15], scale: [1, 1.5, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Fast-moving ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-[2%] top-[8%] w-[440px] h-[440px] bg-orange-300/30 rounded-full blur-[110px]"
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[2%] bottom-[6%] w-[400px] h-[400px] bg-orange-200/35 rounded-full blur-[100px]"
          animate={{ x: [0, -55, 0], y: [0, 35, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
      </div>

      {/* Stat chip — left */}
      <motion.div
        initial={{ opacity: 0, x: -20, rotate: -8 }}
        whileInView={{ opacity: 1, x: 0, rotate: -6 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="hidden xl:block absolute left-[4%] top-[24%] z-10"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-2.5 bg-white border border-orange-200 rounded-2xl px-4 py-3 shadow-xl shadow-orange-900/10 -rotate-6"
        >
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Users size={16} className="text-orange-700" />
          </div>
          <div className="text-left leading-tight">
            <div className="text-sm font-bold text-stone-900">500+ students</div>
            <div className="text-xs text-stone-400">learning right now</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Stat chip — right */}
      <motion.div
        initial={{ opacity: 0, x: 20, rotate: 8 }}
        whileInView={{ opacity: 1, x: 0, rotate: 6 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="hidden xl:block absolute right-[4%] top-[20%] z-10"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="flex items-center gap-2.5 bg-white border border-orange-200 rounded-2xl px-4 py-3 shadow-xl shadow-orange-900/10 rotate-6"
        >
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <School size={16} className="text-orange-700" />
          </div>
          <div className="text-left leading-tight">
            <div className="text-sm font-bold text-stone-900">40+ classrooms</div>
            <div className="text-xs text-stone-400">live this semester</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Stat chip — third, bottom right, breaks the symmetry a bit */}
      <motion.div
        initial={{ opacity: 0, x: 20, rotate: 4 }}
        whileInView={{ opacity: 1, x: 0, rotate: 3 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="hidden xl:block absolute right-[7%] bottom-[10%] z-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          className="flex items-center gap-2.5 bg-white border border-orange-200 rounded-2xl px-4 py-3 shadow-xl shadow-orange-900/10 rotate-3"
        >
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Trophy size={16} className="text-orange-700" />
          </div>
          <div className="text-left leading-tight">
            <div className="text-sm font-bold text-stone-900">Live leaderboards</div>
            <div className="text-xs text-stone-400">updated every submit</div>
          </div>
        </motion.div>
      </motion.div>

      <div className="relative z-20 max-w-5xl mx-auto px-6 w-full">
        <div className="relative">
          {/* Fast rotating glow ring behind the card */}
          <div className="absolute -inset-4 rounded-[2.5rem] overflow-hidden pointer-events-none opacity-80">
            <motion.div
              className="absolute -inset-[40%]"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, rgba(216,110,42,0.45) 8%, transparent 20%, transparent 50%, rgba(216,110,42,0.35) 58%, transparent 70%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative rounded-[2rem] border border-orange-200/70 bg-gradient-to-b from-orange-50/80 via-white/80 to-white/80 backdrop-blur-sm shadow-2xl shadow-orange-900/10 px-6 py-10 md:px-16 md:py-14 overflow-hidden"
          >
            <div className="relative text-center">
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700 uppercase tracking-wide mb-4"
              >
                <GraduationCap size={14} />
                Built for your class
              </motion.div>

              <div style={{ fontFamily: "'EB Garamond', serif" }}>
                <BlurText
                  text="Your dream offer starts today."
                  delay={40}
                  animateBy="words"
                  direction="bottom"
                  center
                  className="text-4xl md:text-6xl font-bold text-stone-900 leading-[1.1] mb-4 tracking-tight"
                  wordStyles={{
                    dream: { className: "italic text-orange-700" },
                    offer: { className: "italic text-orange-700" },
                  }}
                />
              </div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-stone-500 text-lg mb-8"
              >
                Weekly labs, AI feedback and placement prep — all waiting for you.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
              >
                <Link
                  href="/signup"
                  className="group relative inline-flex items-center gap-2 bg-orange-700 text-white px-9 py-4 rounded-xl font-bold text-lg shadow-xl shadow-orange-700/25 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-700/35 hover:-translate-y-0.5 active:scale-95"
                >
                  <span className="relative z-10">Start Coding</span>
                  <ArrowRight
                    size={20}
                    className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                  />
                  <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Looping sheen — plays on its own, not just on hover */}
                  <motion.span
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                    animate={{ left: ["-40%", "140%"] }}
                    transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
                  />
                </Link>

                <Link
                  href="#how-it-works"
                  className="group inline-flex items-center gap-2 border-2 border-orange-200 text-orange-800 px-8 py-[14px] rounded-xl font-bold text-lg bg-white/60 backdrop-blur-sm transition-all duration-300 hover:border-orange-300 hover:bg-white active:scale-95"
                >
                  <PlayCircle size={20} className="text-orange-600" />
                  See how it works
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
              >
                {trustPoints.map((point) => (
                  <span key={point} className="inline-flex items-center gap-1.5 text-sm text-stone-500">
                    <CheckCircle2 size={15} className="text-orange-600" />
                    {point}
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}