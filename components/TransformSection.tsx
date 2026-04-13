"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function TransformSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const cardY = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full pt-32 pb-48 md:pt-48 md:pb-64 flex flex-col items-center justify-start overflow-hidden border-t border-orange-200/40"
    >
      {/* Subtle Background Elements */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <div className="w-[800px] h-[800px] rounded-full border-[1.5px] border-dashed border-orange-300/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="w-[500px] h-[500px] rounded-full border-[1.5px] border-dashed border-orange-300/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="w-px h-[1000px] bg-gradient-to-b from-transparent via-orange-300/30 to-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="h-px w-[1000px] bg-gradient-to-r from-transparent via-orange-300/30 to-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Hand-drawn annotation */}
        <div className="absolute -top-16 left-0 md:left-24 transform -rotate-6 hidden md:block">
          <p className="text-orange-700 font-medium text-lg italic tracking-wide" style={{ fontFamily: "'Caveat', cursive, 'EB Garamond', serif" }}>
            Your code, but smarter!
          </p>
          <svg
            width="45"
            height="45"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-orange-400 absolute top-6 left-1/2 transform translate-x-4 rotate-45"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </div>

        {/* Main Headline */}
        <h2 
          className="text-5xl md:text-7xl font-bold text-stone-900 leading-[1.1] mb-6 tracking-tight"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          Transform Your Coding <br className="hidden md:block" /> Journey
        </h2>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-stone-500 font-light">
          Watch how AI turns your <span className="italic text-orange-700 font-medium">practice into progress</span>
        </p>
      </div>

      {/* Parallax Image Card */}
      <motion.div 
        style={{ y: cardY, opacity: cardOpacity }}
        className="relative z-20 w-full max-w-5xl mx-auto px-6 mt-20"
      >
        <div className="rounded-[2rem] border border-orange-200/60 bg-white/50 backdrop-blur-md shadow-2xl shadow-orange-900/10 p-2 overflow-hidden ring-1 ring-white/50">
          {/* Window Chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white/60 border-b border-orange-200/40 rounded-t-[1.8rem]">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          
          {/* Dashboard Image Container */}
          <div className="relative w-full aspect-[16/9] bg-stone-50 rounded-b-[1.7rem] overflow-hidden border-t border-orange-100/50">
            {/* 
              Ensure you save your dashboard screenshot as 'dashboard-preview.png' in the 'public' folder. 
              The object-cover ensures it fills the window chrome nicely.
            */}
            <img 
              src="/dashboard-preview.png" 
              alt="CodeColiseum Dashboard Platform" 
              className="w-full h-full object-cover object-left-top"
            />
          </div>
        </div>
      </motion.div>

      {/* Right side scroll indicators (decorative) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
        <div className="w-1 h-3 rounded-full bg-orange-600" />
        <div className="w-1 h-3 rounded-full bg-orange-400" />
        <div className="w-1 h-3 rounded-full bg-orange-200" />
        <div className="w-1 h-3 rounded-full bg-stone-300" />
        <div className="w-1 h-3 rounded-full bg-stone-300" />
        <div className="w-1 h-3 rounded-full bg-stone-300" />
      </div>
    </section>
  );
}
