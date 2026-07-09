"use client";

import React, { useEffect, useRef } from "react";

/**
 * AlgorithmNetwork
 * ------------------------------------------------------------------
 * A calm, living graph of connected nodes that stands in for the old
 * hexagonal grid. Small glowing packets travel along the edges to
 * suggest "data flow" / algorithms running, nodes drift slowly, and
 * everything eases gently toward the cursor for a soft parallax feel.
 * Two depth layers (back / front) give it real depth without needing
 * more than a single <canvas>.
 * ------------------------------------------------------------------
 */

interface Point {
  x: number;
  y: number;
}

interface NetworkNode extends Point {
  vx: number;
  vy: number;
  r: number;
}

interface Packet {
  a: number; // index of source node (within its layer)
  b: number; // index of target node
  t: number; // 0..1 progress along the edge
  speed: number;
}

interface Ripple extends Point {
  radius: number;
  alpha: number;
}

interface AlgorithmNetworkProps {
  nodeColor?: string;
  lineColor?: string;
  packetColor?: string;
  backgroundFade?: string;
}

const AlgorithmNetwork: React.FC<AlgorithmNetworkProps> = ({
  nodeColor = "rgba(194, 101, 42, 0.65)",
  lineColor = "rgba(194, 101, 42, 0.2)",
  packetColor = "rgba(216, 110, 42, 0.95)",
  backgroundFade = "#faf5ee",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let ready = false;

    // Two depth layers: back (faint, slow, many small nodes) and
    // front (fewer, bigger, brighter, more mouse-reactive).
    const back: NetworkNode[] = [];
    const front: NetworkNode[] = [];
    const packets: Packet[] = [];
    const ripples: Ripple[] = [];

    const pointer = { x: -9999, y: -9999 };
    const pointerSmooth = { x: -9999, y: -9999 };
    let lastRippleAt = 0;

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const buildLayer = (target: NetworkNode[], count: number, rMin: number, rMax: number, vMax: number) => {
      target.length = 0;
      for (let i = 0; i < count; i++) {
        target.push({
          x: rand(0, width),
          y: rand(0, height),
          vx: rand(-vMax, vMax),
          vy: rand(-vMax, vMax),
          r: rand(rMin, rMax),
        });
      }
    };

    // Re-measures the box the canvas is actually laid out in and rebuilds
    // the graph to fill it. Guarded against 0×0 reads that happen before
    // fonts/layout have settled (common right after mount).
    const resize = (cssWidth: number, cssHeight: number) => {
      if (cssWidth <= 0 || cssHeight <= 0) return;

      const changed = Math.abs(cssWidth - width) > 1 || Math.abs(cssHeight - height) > 1;
      width = cssWidth;
      height = cssHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!ready || changed) {
        const area = width * height;
        const backCount = Math.max(34, Math.min(90, Math.round(area / 15000)));
        const frontCount = Math.max(18, Math.min(46, Math.round(area / 26000)));

        buildLayer(back, backCount, 1.3, 2.4, 0.06);
        buildLayer(front, frontCount, 2, 3.4, 0.095);
        packets.length = 0;
        ready = true;
      }
    };

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const box = entry.contentBoxSize?.[0];
      const w = box ? box.inlineSize : entry.contentRect.width;
      const h = box ? box.blockSize : entry.contentRect.height;
      resize(w, h);
    });
    ro.observe(canvas);
    // Fallback in case ResizeObserver hasn't fired yet on first paint
    resize(canvas.offsetWidth, canvas.offsetHeight);

    const spawnPacket = () => {
      if (front.length < 2 || packets.length >= 7) return;
      const a = Math.floor(Math.random() * front.length);
      // find a plausible neighbour within connect distance
      let b = -1;
      let bestDist = Infinity;
      const candidates: number[] = [];
      for (let i = 0; i < front.length; i++) {
        if (i === a) continue;
        const dx = front[i].x - front[a].x;
        const dy = front[i].y - front[a].y;
        const d = Math.hypot(dx, dy);
        if (d < 190) candidates.push(i);
        if (d < bestDist) {
          bestDist = d;
          b = i;
        }
      }
      const target = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : b;
      if (target === -1) return;
      packets.push({ a, b: target, t: 0, speed: rand(0.006, 0.012) });
    };

    let spawnTimer = 0;

    const drawLayer = (
      nodes: NetworkNode[],
      connectDist: number,
      parallaxFactor: number,
      mouseInfluence: number,
      opacityScale: number,
      lineWidth: number,
      withPackets: boolean
    ) => {
      const px = (pointerSmooth.x - width / 2) * parallaxFactor * 0.02;
      const py = (pointerSmooth.y - height / 2) * parallaxFactor * 0.02;

      // Pre-compute display positions (with drift + subtle mouse repulsion)
      const disp: Point[] = new Array(nodes.length);
      const glow: number[] = new Array(nodes.length);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let dx = n.x - pointerSmooth.x;
        let dy = n.y - pointerSmooth.y;
        const dist = Math.hypot(dx, dy);
        const radius = 140;
        let ox = 0;
        let oy = 0;
        let g = 0;
        if (dist < radius && mouseInfluence > 0) {
          const factor = (1 - dist / radius) * mouseInfluence;
          const safeDist = dist || 1;
          ox = (dx / safeDist) * factor * 14;
          oy = (dy / safeDist) * factor * 14;
          g = factor;
        }
        disp[i] = { x: n.x + ox + px, y: n.y + oy + py };
        glow[i] = g;
      }

      // Connections
      ctx.lineWidth = lineWidth;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = disp[i].x - disp[j].x;
          const dy = disp[i].y - disp[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < connectDist) {
            const alpha = (1 - dist / connectDist) * opacityScale * (1 + Math.max(glow[i], glow[j]) * 0.8);
            ctx.strokeStyle = lineColor;
            ctx.globalAlpha = Math.min(alpha, 1);
            ctx.beginPath();
            ctx.moveTo(disp[i].x, disp[i].y);
            ctx.lineTo(disp[j].x, disp[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const p = disp[i];
        const g = glow[i];
        ctx.beginPath();
        ctx.fillStyle = nodeColor;
        ctx.globalAlpha = Math.min(0.35 + g * 0.65, 1) * opacityScale;
        if (g > 0.05) {
          ctx.shadowColor = packetColor;
          ctx.shadowBlur = 10 * g;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.arc(p.x, p.y, n.r * (1 + g * 0.7), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      // Data packets travelling along edges of this layer
      if (withPackets) {
        for (let k = packets.length - 1; k >= 0; k--) {
          const pk = packets[k];
          if (pk.a >= nodes.length || pk.b >= nodes.length) {
            packets.splice(k, 1);
            continue;
          }
          const A = disp[pk.a];
          const B = disp[pk.b];
          if (!A || !B) continue;
          const x = A.x + (B.x - A.x) * pk.t;
          const y = A.y + (B.y - A.y) * pk.t;

          // faint trailing tail
          for (let s = 1; s <= 3; s++) {
            const tt = Math.max(pk.t - s * 0.035, 0);
            const tx = A.x + (B.x - A.x) * tt;
            const ty = A.y + (B.y - A.y) * tt;
            ctx.beginPath();
            ctx.fillStyle = packetColor;
            ctx.globalAlpha = 0.28 - s * 0.08;
            ctx.arc(tx, ty, 2.1 - s * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.fillStyle = packetColor;
          ctx.globalAlpha = 0.95;
          ctx.shadowColor = packetColor;
          ctx.shadowBlur = 12;
          ctx.arc(x, y, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;

          pk.t += pk.speed;
          if (pk.t >= 1) packets.splice(k, 1);
        }
      }
    };

    const drawRipples = () => {
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        ctx.beginPath();
        ctx.strokeStyle = packetColor;
        ctx.globalAlpha = r.alpha * 0.5;
        ctx.lineWidth = 1;
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        r.radius += 1.6;
        r.alpha -= 0.018;
        if (r.alpha <= 0) ripples.splice(i, 1);
      }
    };

    const step = (nodes: NetworkNode[]) => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20 || n.x > width + 20) n.vx *= -1;
        if (n.y < -20 || n.y > height + 20) n.vy *= -1;
      }
    };

    const render = () => {
      if (!ready || width <= 0 || height <= 0) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Warm ambient wash — gives the network real atmosphere instead of
      // sitting flat on the page, biased toward the upper-right where the
      // editor typically sits.
      const warm = ctx.createRadialGradient(
        width * 0.72,
        height * 0.3,
        0,
        width * 0.72,
        height * 0.3,
        Math.max(width, height) * 0.65
      );
      warm.addColorStop(0, "rgba(216, 110, 42, 0.12)");
      warm.addColorStop(1, "rgba(216, 110, 42, 0)");
      ctx.fillStyle = warm;
      ctx.fillRect(0, 0, width, height);

      // Smooth pointer easing
      pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.08;
      pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.08;

      step(back);
      step(front);

      drawLayer(back, 170, 0.4, 0.4, 0.7, 0.9, false);
      drawLayer(front, 220, 1, 1, 1, 1.1, true);
      drawRipples();

      spawnTimer++;
      if (spawnTimer > 35) {
        spawnTimer = 0;
        spawnPacket();
      }

      // Vignette so the graph blends into the cream page background
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.sqrt(width ** 2 + height ** 2) / 2
      );
      gradient.addColorStop(0, "rgba(250, 245, 238, 0)");
      gradient.addColorStop(0.7, "rgba(250, 245, 238, 0.22)");
      gradient.addColorStop(1, backgroundFade);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      requestRef.current = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;

      const now = performance.now();
      if (now - lastRippleAt > 260 && ripples.length < 5) {
        ripples.push({ x: pointer.x, y: pointer.y, radius: 2, alpha: 0.6 });
        lastRippleAt = now;
      }
    };

    const handleMouseLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    requestRef.current = requestAnimationFrame(render);

    return () => {
      ro.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [nodeColor, lineColor, packetColor, backgroundFade]);


  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default AlgorithmNetwork;