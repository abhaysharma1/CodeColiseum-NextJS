"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/* ===========================================================
   Constellation network:
   - Nodes drift slowly and continuously.
   - Nearby connections fade in/out smoothly (never a hard snap).
   - Every 8–12s, a small cluster of whichever nodes happen to be
     nearby briefly organizes into a recognizable CS structure
     (binary tree, small graph, flowchart, linked list, or hash
     table buckets), holds for a moment, then dissolves back into
     the ambient drifting network.
=========================================================== */

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  structured: boolean;
}

const DOT_RGB = "234, 88, 12"; // orange-600
const LINE_RGB = "217, 119, 6"; // amber-600
const GLOW_RGB = "234, 88, 12";

const countForWidth = (w: number) => {
  if (w < 480) return 20;
  if (w < 900) return 30;
  return 42;
};

// ---- CS structure templates ---------------------------------
// Offsets in px around a random anchor point; edges reference
// offset indices. Kept small (≈130–180px wide) so each structure
// reads as a local cluster, not a hero-spanning shape.
interface StructureTemplate {
  name: string;
  offsets: { x: number; y: number }[];
  edges: [number, number][];
}

const TEMPLATES: StructureTemplate[] = [
  {
    name: "binary-tree",
    offsets: [
      { x: 0, y: -60 },
      { x: -42, y: -8 },
      { x: 42, y: -8 },
      { x: -64, y: 44 },
      { x: -20, y: 44 },
      { x: 20, y: 44 },
      { x: 64, y: 44 },
    ],
    edges: [
      [0, 1], [0, 2],
      [1, 3], [1, 4],
      [2, 5], [2, 6],
    ],
  },
  {
    name: "small-graph",
    offsets: [
      { x: 0, y: -52 },
      { x: 46, y: -24 },
      { x: 46, y: 26 },
      { x: 0, y: 52 },
      { x: -46, y: 26 },
      { x: -46, y: -24 },
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
      [0, 3], [1, 4],
    ],
  },
  {
    name: "flowchart",
    offsets: [
      { x: 0, y: -72 },
      { x: 0, y: -26 },
      { x: 0, y: 20 },
      { x: -46, y: 66 },
      { x: 46, y: 66 },
      { x: 0, y: 108 },
    ],
    edges: [
      [0, 1], [1, 2],
      [2, 3], [2, 4],
      [3, 5], [4, 5],
    ],
  },
  {
    name: "linked-list",
    offsets: [
      { x: -84, y: 0 },
      { x: -42, y: 0 },
      { x: 0, y: 0 },
      { x: 42, y: 0 },
      { x: 84, y: 0 },
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4],
    ],
  },
  {
    name: "hash-buckets",
    offsets: [
      { x: -72, y: -42 },
      { x: -24, y: -42 },
      { x: -72, y: 0 },
      { x: -24, y: 0 },
      { x: 26, y: 0 },
      { x: -72, y: 42 },
      { x: -24, y: 42 },
      { x: 26, y: 42 },
    ],
    edges: [
      [0, 1],
      [2, 3], [3, 4],
      [5, 6], [6, 7],
    ],
  },
];

// Timing (ms)
const CONVERGE_MS = 1700;
const HOLD_MS = 2300;
const DISPERSE_MS = 1700;
const IDLE_MIN_MS = 8000;
const IDLE_MAX_MS = 12000;
const CONN_FADE_RATE = 0.055; // how fast ambient connections fade in/out

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type StructPhase = "idle" | "converging" | "holding" | "dispersing";

const ConstellationBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let maxDistance = 150;
    let points: Point[] = [];
    let connAlpha: Float32Array[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // active structure state
    let structPhase: StructPhase = "idle";
    let phaseStart = performance.now();
    let nextEventAt = performance.now() + IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS);
    let activeTemplate: StructureTemplate | null = null;
    let activeMembers: number[] = []; // point indices, ordered to match template offsets

    let animationFrame = 0;

    const seedPoints = () => {
      const count = countForWidth(width);
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        homeX: 0,
        homeY: 0,
        structured: false,
      }));
      connAlpha = points.map(() => new Float32Array(points.length));
    };

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maxDistance = Math.max(110, width * 0.075);
      seedPoints();
      structPhase = "idle";
      activeTemplate = null;
      activeMembers = [];
      nextEventAt = performance.now() + IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS);
    };

    // Picks a random safe anchor location, finds the nearest existing
    // nodes to it, and maps them onto a randomly chosen CS structure
    // template so the shape forms out of whatever neighbors are close.
    const beginStructure = () => {
      const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
      const scale = width < 640 ? 0.72 : 1;
      const margin = 130 * scale;
      if (width < margin * 2 + 20 || height < margin * 2 + 20) return;

      const anchorX = margin + Math.random() * (width - margin * 2);
      const anchorY = margin + Math.random() * (height - margin * 2);

      const needed = template.offsets.length;
      const ranked = points
        .map((p, i) => ({
          i,
          d: (p.x - anchorX) ** 2 + (p.y - anchorY) ** 2,
        }))
        .sort((a, b) => a.d - b.d)
        .slice(0, needed)
        .map((r) => r.i);

      if (ranked.length < needed) return;

      ranked.forEach((pointIdx, order) => {
        const offset = template.offsets[order];
        points[pointIdx].homeX = anchorX + offset.x * scale;
        points[pointIdx].homeY = anchorY + offset.y * scale;
        points[pointIdx].structured = true;
      });

      activeTemplate = template;
      activeMembers = ranked;
    };

    const endStructure = () => {
      activeMembers.forEach((idx) => {
        const p = points[idx];
        p.structured = false;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.2 + Math.random() * 0.25;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      });
      activeTemplate = null;
      activeMembers = [];
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      // ambient connections — smoothed alpha, gentle fade in/out
      ctx.save();
      ctx.shadowBlur = 3;
      ctx.shadowColor = `rgba(${GLOW_RGB}, 0.25)`;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const target = dist < maxDistance ? (1 - dist / maxDistance) : 0;
          connAlpha[i][j] += (target - connAlpha[i][j]) * CONN_FADE_RATE;
          const a = connAlpha[i][j];
          if (a > 0.015) {
            ctx.strokeStyle = `rgba(${LINE_RGB}, ${a * 0.42})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // active structure edges — drawn brighter so the shape is legible
      if (activeTemplate && activeMembers.length > 0 && structPhase !== "idle") {
        const structAlpha =
          structPhase === "converging"
            ? easeInOutCubic(Math.min(1, (performance.now() - phaseStart) / CONVERGE_MS))
            : structPhase === "dispersing"
            ? 1 - easeInOutCubic(Math.min(1, (performance.now() - phaseStart) / DISPERSE_MS))
            : 1;

        ctx.save();
        ctx.shadowBlur = 11;
        ctx.shadowColor = `rgba(${GLOW_RGB}, 0.6)`;
        ctx.strokeStyle = `rgba(${LINE_RGB}, ${0.6 * structAlpha})`;
        ctx.lineWidth = 1.4;
        activeTemplate.edges.forEach(([a, b]) => {
          const pa = points[activeMembers[a]];
          const pb = points[activeMembers[b]];
          if (!pa || !pb) return;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        });
        ctx.restore();
      }

      // nodes
      points.forEach((p) => {
        ctx.save();
        ctx.shadowBlur = p.structured ? 10 : 8;
        ctx.shadowColor = `rgba(${GLOW_RGB}, ${p.structured ? 0.75 : 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.structured ? 2.8 : 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${DOT_RGB}, ${p.structured ? 0.95 : 0.8})`;
        ctx.fill();
        ctx.restore();
      });
    };

    const step = (now: number) => {
      // structure state machine
      if (structPhase === "idle" && now >= nextEventAt) {
        beginStructure();
        if (activeTemplate) {
          structPhase = "converging";
          phaseStart = now;
        } else {
          nextEventAt = now + 1500; // retry shortly if canvas too small this frame
        }
      } else if (structPhase === "converging" && now - phaseStart >= CONVERGE_MS) {
        structPhase = "holding";
        phaseStart = now;
      } else if (structPhase === "holding" && now - phaseStart >= HOLD_MS) {
        structPhase = "dispersing";
        phaseStart = now;
      } else if (structPhase === "dispersing" && now - phaseStart >= DISPERSE_MS) {
        endStructure();
        structPhase = "idle";
        nextEventAt = now + IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS);
      }

      // movement
      points.forEach((p) => {
        if (p.structured) {
          if (structPhase === "converging") {
            const t = easeInOutCubic(Math.min(1, (now - phaseStart) / CONVERGE_MS));
            const pull = 0.05 + t * 0.09;
            p.x += (p.homeX - p.x) * pull;
            p.y += (p.homeY - p.y) * pull;
          } else if (structPhase === "holding") {
            p.x += (p.homeX - p.x) * 0.14;
            p.y += (p.homeY - p.y) * 0.14;
          } else {
            // dispersing — ease off the fixed spot using its fresh velocity
            p.x += p.vx;
            p.y += p.vy;
          }
        } else {
          p.x += p.vx;
          p.y += p.vy;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      });

      drawFrame();
      animationFrame = requestAnimationFrame(step);
    };

    resize();

    if (shouldReduceMotion) {
      drawFrame();
    } else {
      animationFrame = requestAnimationFrame(step);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (shouldReduceMotion) drawFrame();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animationFrame);
      ro.disconnect();
    };
  }, [shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default ConstellationBackground;