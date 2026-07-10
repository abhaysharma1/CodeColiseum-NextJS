"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import BlurText from "./BlurText";

/* ---------------------------------------------------------
   The one big breath before the footer — most premium landing
   pages have a final, confident moment like this. This page
   went straight from How It Works into the footer before.
--------------------------------------------------------- */
export default function ClosingCTA() {
  return (
    <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-orange-300/15 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        <div style={{ fontFamily: "'EB Garamond', serif" }}>
          <BlurText
            text="Your dream offer starts today."
            delay={40}
            animateBy="words"
            direction="bottom"
            center
            className="text-4xl md:text-6xl font-bold text-stone-900 leading-[1.1] mb-6 tracking-tight"
            wordStyles={{ dream: { className: "italic text-orange-700" }, "offer": { className: "italic text-orange-700" } }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-stone-500 text-lg mb-10"
        >
          Weekly labs, AI feedback and placement prep — all waiting for you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
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
          </Link>
        </motion.div>
      </div>
    </section>
  );
}