"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

type ArrowDirection = "down" | "up" | "down-left" | "down-right" | "up-left" | "up-right";

type HandwrittenAnnotationProps = {
  text: string;
  arrow?: ArrowDirection;
  className?: string;
  /** Extra rotation in degrees for a hand-drawn feel */
  rotate?: number;
  /** Delay before showing (ms) */
  delay?: number;
  /** Color of the text and arrow */
  color?: string;
};

const arrowPaths: Record<ArrowDirection, { path: string; viewBox: string; w: number; h: number }> = {
  down: {
    path: "M20 2 C18 15, 22 30, 20 48 M14 40 L20 50 L26 40",
    viewBox: "0 0 40 55",
    w: 40,
    h: 55,
  },
  up: {
    path: "M20 53 C22 40, 18 25, 20 7 M14 15 L20 5 L26 15",
    viewBox: "0 0 40 55",
    w: 40,
    h: 55,
  },
  "down-left": {
    path: "M55 2 C50 12, 40 22, 20 42 C15 47, 10 50, 5 52 M12 44 L5 52 L15 52",
    viewBox: "0 0 60 55",
    w: 60,
    h: 55,
  },
  "down-right": {
    path: "M5 2 C10 12, 20 22, 40 42 C45 47, 50 50, 55 52 M48 44 L55 52 L45 52",
    viewBox: "0 0 60 55",
    w: 60,
    h: 55,
  },
  "up-left": {
    path: "M55 53 C50 43, 40 33, 20 13 C15 8, 10 5, 5 3 M12 11 L5 3 L15 3",
    viewBox: "0 0 60 55",
    w: 60,
    h: 55,
  },
  "up-right": {
    path: "M5 53 C10 43, 20 33, 40 13 C45 8, 50 5, 55 3 M48 11 L55 3 L45 3",
    viewBox: "0 0 60 55",
    w: 60,
    h: 55,
  },
};

const HandwrittenAnnotation: React.FC<HandwrittenAnnotationProps> = ({
  text,
  arrow = "down",
  className = "",
  rotate = 0,
  delay = 0,
  color = "rgb(194 101 42 / 0.55)",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current as Element);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const arrowData = arrowPaths[arrow];
  const isArrowBelow = arrow.startsWith("down");

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(12px)", scale: 0.9 }}
      animate={
        inView
          ? { opacity: 1, filter: "blur(0px)", scale: 1 }
          : { opacity: 0, filter: "blur(12px)", scale: 0.9 }
      }
      transition={{ duration: 0.8, delay: delay / 1000, ease: "easeOut" }}
      className={`pointer-events-none select-none flex flex-col items-center gap-1 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* Arrow above text if pointing upward */}
      {!isArrowBelow && (
        <svg
          width={arrowData.w}
          height={arrowData.h}
          viewBox={arrowData.viewBox}
          fill="none"
          className="flex-shrink-0"
        >
          <motion.path
            d={arrowData.path}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1, delay: delay / 1000 + 0.3, ease: "easeOut" }}
          />
        </svg>
      )}

      {/* Text */}
      <span
        className="whitespace-nowrap text-xl md:text-2xl"
        style={{
          fontFamily: "var(--font-caveat), 'Caveat', cursive",
          color,
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        {text}
      </span>

      {/* Arrow below text if pointing downward */}
      {isArrowBelow && (
        <svg
          width={arrowData.w}
          height={arrowData.h}
          viewBox={arrowData.viewBox}
          fill="none"
          className="flex-shrink-0"
        >
          <motion.path
            d={arrowData.path}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1, delay: delay / 1000 + 0.3, ease: "easeOut" }}
          />
        </svg>
      )}
    </motion.div>
  );
};

export default HandwrittenAnnotation;
