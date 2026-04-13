"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import ShapeGrid from "./ShapeGrid";
import CodeWindow from "./CodeWindow";

const Hero = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full overflow-hidden min-h-[calc(100vh-80px)] flex items-center justify-center">
      {/* Background ShapeGrid */}
      <div className="absolute inset-0 z-0">
        <ShapeGrid 
          speed={0.5}
          squareSize={60}
          direction="diagonal"
          borderColor="rgba(194, 101, 42, 0.15)"
          hoverFillColor="rgba(194, 101, 42, 0.08)"
          shape="hexagon"
          hoverTrailAmount={20}
        />
      </div>
      
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center pointer-events-none">
        {/* Left — text */}
        <div
          className={`space-y-8 pointer-events-auto transition-all duration-1000 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h1
          className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] font-bold text-stone-900"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          Where{" "}
          <span className="italic text-orange-700">Code;</span>{" "}
          Meets <span className="text-orange-700">Competition</span>
        </h1>

        {/* <p className="text-xl text-stone-500 max-w-lg leading-relaxed">
          An AI-powered platform that evaluates solutions intelligently —
          rewarding optimal algorithms, with Streaks, Leaderboards, and
          Achievements.
        </p> */}

        <div className="flex flex-wrap gap-4">
          <Link
            href="/problem-list"
            className="bg-orange-700 text-white px-8 py-4 rounded-lg font-bold flex items-center gap-2 shadow-xl shadow-orange-700/25 hover:brightness-110 transition-all active:scale-95"
          >
            Start Practicing
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#features"
            className="border border-stone-300 text-stone-800 bg-white px-8 py-4 rounded-lg font-bold hover:bg-orange-50 hover:border-orange-300 transition-colors"
          >
            Explore Features
          </Link>
        </div>
      </div>

      {/* Right — Code Window */}
      <div
        className={`relative w-full flex justify-end pointer-events-auto transition-all duration-1000 delay-300 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <CodeWindow />
        
        {/* Decoration glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      </div>
      </section>
    </div>
  );
};

export default Hero;
