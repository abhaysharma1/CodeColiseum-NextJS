"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/* ===========================================================
   Circuit Pulse Grid v2 — a curated set of PCB-style traces
   (not a full grid mesh) with a dense swarm of bright, fast,
   comet-tailed pulses flowing along them. Traces are built as
   orthogonal poly-lines with right-angle bends and small via
   pads at the joints, mostly flowing left→right / top→bottom
   toward the code window, so the motion reads as directed data
   flow rather than random noise. Density is pulled back behind
   the headline/CTA copy via a soft readability vignette, and
   pushed toward the edges and the code-window side instead.
=========================================================== */

interface Point {
  x: number;
  y: number;
}

interface Trace {
  points: Point[];
  cumLen: number[];
  totalLen: number;
}

interface Pulse {
  traceIndex: number;
  pos: number; // distance travelled along the trace, 0 -> totalLen
  speed: number; // px/sec
  trail: number; // trail length in px
  size: number; // head radius
  hue: "amber" | "orange" | "gold" | "white";
}

const traceCountForWidth = (w: number) => {
  if (w < 480) return 10;
  if (w < 900) return 16;
  return 24;
};

const pulseCountForWidth = (w: number) => {
  if (w < 480) return 30;
  if (w < 900) return 54;
  return 86;
};

const HUES: Pulse["hue"][] = ["amber", "amber", "orange", "orange", "gold", "white"];

const pulseColor = (hue: Pulse["hue"], alpha: number) => {
  switch (hue) {
    case "white":
      return `rgba(255, 252, 245, ${alpha})`;
    case "gold":
      return `rgba(251, 191, 36, ${alpha})`; // amber-400
    case "orange":
      return `rgba(234, 88, 12, ${alpha})`; // orange-600
    default:
      return `rgba(217, 119, 6, ${alpha})`; // amber-600
  }
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const CircuitPulseGrid = () => {
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
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let traces: Trace[] = [];
    let tracePath: Path2D | null = null;
    let viaPath: Path2D | null = null;
    let vias: { x: number; y: number; phase: number }[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    // ---- geometry helpers -----------------------------------

    const buildTraceMeta = (points: Point[]): Trace => {
      const cumLen: number[] = [0];
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        cumLen.push(cumLen[i - 1] + Math.hypot(dx, dy));
      }
      return { points, cumLen, totalLen: cumLen[cumLen.length - 1] || 1 };
    };

    // Random orthogonal poly-line: 2-3 segments, biased to flow
    // rightward/downward so the whole field feels like it's
    // draining toward the code window on the right.
    const buildOneTrace = (unit: number): Trace => {
      const startLeftBias = Math.random() < 0.65;
      let cx = startLeftBias
        ? -unit * (0.5 + Math.random())
        : Math.random() * width;
      let cy = Math.random() < 0.5 ? -unit * (0.5 + Math.random()) : Math.random() * height;

      const points: Point[] = [{ x: cx, y: cy }];
      const segments = 2 + Math.floor(Math.random() * 2); // 2-3 bends
      let horizontal = Math.random() < 0.55;

      for (let s = 0; s < segments; s++) {
        const steps = 1 + Math.floor(Math.random() * 4);
        if (horizontal) {
          cx += unit * steps * (Math.random() < 0.85 ? 1 : -1);
        } else {
          cy += unit * steps * (Math.random() < 0.8 ? 1 : -1);
        }
        cx = clamp(cx, -unit, width + unit);
        cy = clamp(cy, -unit, height + unit);
        points.push({ x: cx, y: cy });
        horizontal = !horizontal;
      }

      return buildTraceMeta(points);
    };

    const sampleTrace = (trace: Trace, d: number): Point => {
      const dd = clamp(d, 0, trace.totalLen);
      for (let i = 0; i < trace.cumLen.length - 1; i++) {
        if (dd >= trace.cumLen[i] && dd <= trace.cumLen[i + 1]) {
          const segLen = trace.cumLen[i + 1] - trace.cumLen[i] || 1;
          const t = (dd - trace.cumLen[i]) / segLen;
          const p0 = trace.points[i];
          const p1 = trace.points[i + 1];
          return { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t };
        }
      }
      return trace.points[trace.points.length - 1];
    };

    // Ordered points from distance d0 to d1 (d0 < d1), including any
    // vertices in between, so a trail correctly bends with the trace.
    const pointsBetween = (trace: Trace, d0: number, d1: number): Point[] => {
      const lo = clamp(Math.min(d0, d1), 0, trace.totalLen);
      const hi = clamp(Math.max(d0, d1), 0, trace.totalLen);
      const pts: Point[] = [sampleTrace(trace, lo)];
      trace.cumLen.forEach((cl, i) => {
        if (cl > lo && cl < hi) pts.push(trace.points[i]);
      });
      pts.push(sampleTrace(trace, hi));
      return pts;
    };

    // ---- build ------------------------------------------------

    const makePulse = (traceIndex: number): Pulse => ({
      traceIndex,
      pos: Math.random() * (traces[traceIndex]?.totalLen ?? 1),
      speed: 480 + Math.random() * 620,
      trail: 70 + Math.random() * 130,
      size: 1.7 + Math.random() * 1.9,
      hue: HUES[Math.floor(Math.random() * HUES.length)],
    });

    const buildScene = () => {
      const unit = width < 480 ? 60 : width < 900 ? 78 : 92;
      const traceTarget = traceCountForWidth(width);
      traces = Array.from({ length: traceTarget }, () => buildOneTrace(unit));

      const path = new Path2D();
      const vp = new Path2D();
      vias = [];
      traces.forEach((t) => {
        path.moveTo(t.points[0].x, t.points[0].y);
        for (let i = 1; i < t.points.length; i++) path.lineTo(t.points[i].x, t.points[i].y);
        // via pad at every bend + endpoint
        t.points.forEach((pt, i) => {
          if (i === 0) return;
          vp.moveTo(pt.x + 2.4, pt.y);
          vp.arc(pt.x, pt.y, 2.4, 0, Math.PI * 2);
          vias.push({ x: pt.x, y: pt.y, phase: Math.random() * Math.PI * 2 });
        });
      });
      tracePath = path;
      viaPath = vp;

      const pulseTarget = pulseCountForWidth(width);
      pulses = Array.from({ length: pulseTarget }, () =>
        makePulse(Math.floor(Math.random() * traces.length))
      );
    };

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildScene();
    };

    // ---- draw ---------------------------------------------------

    const drawTraces = () => {
      if (!tracePath) return;
      // soft backlit glow underlay
      ctx.save();
      ctx.shadowBlur = 9;
      ctx.shadowColor = "rgba(234, 140, 60, 0.22)";
      ctx.strokeStyle = "rgba(217, 119, 6, 0.05)";
      ctx.lineWidth = 5;
      ctx.lineJoin = "round";
      ctx.stroke(tracePath);
      ctx.restore();

      // crisp trace line on top
      ctx.strokeStyle = "rgba(178, 108, 54, 0.20)";
      ctx.lineWidth = 1.25;
      ctx.lineJoin = "round";
      ctx.stroke(tracePath);

      if (viaPath) {
        ctx.fillStyle = "rgba(190, 110, 50, 0.28)";
        ctx.fill(viaPath);
      }
    };

    const drawVias = (time: number) => {
      vias.forEach((v) => {
        const flicker = 0.3 + 0.28 * (0.5 + 0.5 * Math.sin(time * 0.0016 + v.phase));
        ctx.beginPath();
        ctx.fillStyle = `rgba(236, 160, 62, ${flicker})`;
        ctx.arc(v.x, v.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawPulse = (p: Pulse) => {
      const trace = traces[p.traceIndex];
      if (!trace) return;
      const edge = Math.min(p.pos, trace.totalLen - p.pos);
      const alpha = Math.min(1, edge / 46);
      if (alpha <= 0.02) return;

      const head = sampleTrace(trace, p.pos);
      const tailPts = pointsBetween(trace, p.pos - p.trail, p.pos);

      // Trail: draw the (possibly bent) polyline from tail to head with
      // a linear gradient across its bounding direction.
      const tail = tailPts[0];
      const grad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
      grad.addColorStop(0, pulseColor(p.hue, 0));
      grad.addColorStop(0.7, pulseColor(p.hue, alpha * 0.5));
      grad.addColorStop(1, pulseColor(p.hue, alpha * 0.95));

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = p.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(tailPts[0].x, tailPts[0].y);
      for (let i = 1; i < tailPts.length; i++) ctx.lineTo(tailPts[i].x, tailPts[i].y);
      ctx.stroke();

      // Shiny hot head with a soft glow halo
      ctx.shadowBlur = 11;
      ctx.shadowColor = pulseColor(p.hue, alpha * 0.95);
      ctx.beginPath();
      ctx.fillStyle = pulseColor("white", alpha);
      ctx.arc(head.x, head.y, p.size * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Soft cream vignette pulled back over the copy zone (roughly the
    // left/center column where the headline + CTAs sit) so the circuit
    // energy concentrates toward the edges and the code window instead
    // of competing with the text — also doubles as a legibility scrim.
    const drawReadabilityVignette = () => {
      const cx = width * 0.3;
      const cy = height * 0.48;
      const r = Math.max(width, height) * 0.5;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(253, 246, 235, 0.58)");
      g.addColorStop(0.55, "rgba(253, 246, 235, 0.32)");
      g.addColorStop(1, "rgba(253, 246, 235, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    };

    const drawStaticFrame = () => {
      ctx.clearRect(0, 0, width, height);
      drawTraces();
      drawVias(0);
      const still = pulses.slice(0, Math.min(16, pulses.length));
      still.forEach((p) => {
        const trace = traces[p.traceIndex];
        if (!trace) return;
        drawPulse({ ...p, pos: trace.totalLen * 0.5 });
      });
      drawReadabilityVignette();
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      elapsed += dt * 1000;

      ctx.clearRect(0, 0, width, height);
      drawTraces();
      drawVias(elapsed);

      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        const trace = traces[p.traceIndex];
        if (!trace) continue;
        p.pos += p.speed * dt;
        if (p.pos > trace.totalLen + p.trail) {
          pulses[i] = makePulse(Math.floor(Math.random() * traces.length));
          continue;
        }
        drawPulse(p);
      }

      drawReadabilityVignette();

      raf = requestAnimationFrame(step);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    if (shouldReduceMotion) {
      drawStaticFrame();
    } else {
      lastTime = performance.now();
      raf = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
};

export default CircuitPulseGrid;