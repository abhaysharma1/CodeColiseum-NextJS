"use client";

import React from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import CodeWindow from "./CodeWindow";
import BlurText from "./BlurText";
import CircuitPulseGrid from "./CircuitPulseGrid";

/* ===========================================================
   Hero background — atmosphere over decoration. Four extremely
   quiet layers: a mesh gradient that barely shifts, a few large
   soft light sources drifting only a couple of pixels, a static
   film-grain texture, and a gentle cursor parallax. Nothing here
   is meant to be consciously noticed — it should just make the
   page feel less flat after a few seconds of looking at it.
=========================================================== */

const MeshGradient = ({ reduceMotion }: { reduceMotion: boolean }) => (
  <motion.div
    className="absolute inset-[-10%]"
    style={{
      backgroundImage: `
        radial-gradient(ellipse 60% 50% at 25% 30%, rgba(255,247,237,0.9), transparent 60%),
        radial-gradient(ellipse 55% 45% at 75% 25%, rgba(254,235,200,0.65), transparent 60%),
        radial-gradient(ellipse 60% 55% at 55% 82%, rgba(253,224,171,0.45), transparent 62%)
      `,
      backgroundSize: "140% 140%",
    }}
    animate={reduceMotion ? undefined : { x: [0, 14, -8, 0], y: [0, -10, 6, 0] }}
    transition={{ duration: 42, repeat: Infinity, ease: "easeInOut" }}
  />
);

// Large, soft, almost-static light sources — like sunlight through
// frosted glass. Movement is only a couple of pixels; the point is
// atmosphere, not a visible moving object.
const ambientLights = [
  { className: "left-[4%] top-[-8%] w-[560px] h-[560px] bg-orange-100/30", blur: 150, duration: 30, delay: 0 },
  { className: "right-[-8%] top-[8%] w-[480px] h-[480px] bg-amber-100/25", blur: 140, duration: 34, delay: 2 },
  { className: "left-[28%] bottom-[-16%] w-[440px] h-[440px] bg-orange-50/45", blur: 130, duration: 37, delay: 4 },
];

const AmbientLights = ({ reduceMotion }: { reduceMotion: boolean }) => (
  <>
    {ambientLights.map((l, i) => (
      <motion.div
        key={i}
        className={`absolute rounded-full ${l.className}`}
        style={{ filter: `blur(${l.blur}px)` }}
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 3, -2, 0], y: [0, -2, 3, 0], opacity: [0.55, 0.8, 0.55] }
        }
        transition={{ duration: l.duration, repeat: Infinity, ease: "easeInOut", delay: l.delay }}
      />
    ))}
  </>
);

// Static film-grain texture — removes the flat digital look. Not
// animated on purpose: a moving grain layer would draw attention
// to itself, and the point here is the opposite.
const NoiseTexture = () => (
  <div
    className="absolute inset-0"
    style={{
      opacity: 0.035,
      mixBlendMode: "multiply",
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    }}
  />
);

const HeroBackground = ({
  parallaxX,
  parallaxY,
  reduceMotion,
}: {
  parallaxX: ReturnType<typeof useSpring>;
  parallaxY: ReturnType<typeof useSpring>;
  reduceMotion: boolean;
}) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div style={{ x: parallaxX, y: parallaxY }} className="absolute inset-0">
      <MeshGradient reduceMotion={reduceMotion} />
      <AmbientLights reduceMotion={reduceMotion} />
    </motion.div>
    <CircuitPulseGrid />
    <NoiseTexture />
  </div>
);

/* ---------------------------------------------------------
   Mouse-shaped scroll indicator
--------------------------------------------------------- */
const ScrollCue = () => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.6, duration: 0.6 }}
    className="hidden md:flex absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-2 pointer-events-none"
  >
    <div className="w-6 h-10 rounded-full border-2 border-orange-300 flex items-start justify-center p-1.5 bg-white/40 backdrop-blur-sm">
      <motion.span
        className="w-1.5 h-1.5 rounded-full bg-orange-600"
        animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
    <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-orange-700/70">
      Scroll
    </span>
  </motion.div>
);

/* ---------------------------------------------------------
   Magnetic wrapper for the primary CTA
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

const Hero = () => {
  const shouldReduceMotion = useReducedMotion();

  // Gentle parallax — only a few pixels, smooth spring easing.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const parallaxX = useSpring(px, { stiffness: 35, damping: 20, mass: 0.6 });
  const parallaxY = useSpring(py, { stiffness: 35, damping: 20, mass: 0.6 });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    px.set(relX * 6); // only a handful of pixels
    py.set(relY * 5);
  };

  return (
    <div
      onMouseMove={handleHeroMouseMove}
      className="relative w-full overflow-hidden md:h-[calc(100vh-80px)] md:min-h-[620px] md:max-h-[920px] flex items-center"
    >
      <HeroBackground
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        reduceMotion={!!shouldReduceMotion}
      />

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
                  className="group relative bg-gradient-to-b from-orange-600 to-orange-700 text-white px-6 md:px-7 py-3 md:py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-700/25 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-700/35 hover:-translate-y-[3px] active:scale-95"
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
                className="border border-stone-300 text-stone-800 bg-white px-6 md:px-7 py-3 md:py-3.5 rounded-xl font-bold shadow-sm transition-all duration-300 hover:bg-orange-50 hover:border-orange-300 hover:shadow-md hover:-translate-y-[3px]"
              >
                Explore Platform
              </Link>
            </motion.div>
          </div>

          {/* CODE EDITOR — CodeWindow now owns its own floating motion,
              ambient glow, layered shadow and glass reflection sweep, so
              it's rendered plainly here rather than wrapped again. */}
          <motion.div
            variants={item}
            className="md:w-[46%] md:-ml-8 lg:-ml-12 relative z-20 mt-4 md:mt-0 lg:-rotate-1 pointer-events-auto"
          >
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto md:mx-0 md:ml-auto">
              <CodeWindow />
            </div>
          </motion.div>
        </div>
      </motion.section>

      <ScrollCue />
    </div>
  );
};

export default Hero;