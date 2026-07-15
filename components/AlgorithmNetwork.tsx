"use client";

import React, { useEffect, useRef } from "react";

/**
 * AlgorithmNetwork
 * ------------------------------------------------------------------
 * A calm, ORDERED constellation lattice — not a random graph.
 *
 * Why: a fully-random node graph (v1 of this component) connects any two
 * nearby nodes regardless of direction, which makes lines cross at every
 * angle and reads as visual noise ("messy"). A grid-anchored lattice keeps
 * every connection short and running in one of a few consistent
 * directions, so it reads as intentional and quiet — closer to the calm
 * feel of the original hex grid — while still feeling alive:
 *
 *   • Nodes live on a loose grid (with jitter so it isn't robotic) and
 *     gently OSCILLATE around that anchor point instead of free-roaming,
 *     so the structure never degrades into a tangle over time.
 *   • Connections only run to grid-adjacent neighbours (right / down,
 *     plus a sparse diagonal on the front layer for texture).
 *   • Small glowing packets travel along the lattice edges and make a
 *     node softly glow when they arrive.
 *   • The whole thing brightens gently toward a focal point (roughly
 *     where the code editor sits) instead of needing extra density there.
 *   • Cursor: nearby nodes are softly attracted toward it, and movement
 *     leaves faint expanding ripples.
 * ------------------------------------------------------------------
 */

interface LatticeNode {
  homeX: number;
  homeY: number;
  r: number;
  phaseX: number;
  phaseY: number;
  freqX: number;
  freqY: number;
  ampX: number;
  ampY: number;
}

interface Edge {
  a: number;
  b: number;
}

interface Packet {
  edge: number; // index into the layer's edges array
  t: number;
  speed: number;
  reverse: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

interface Layer {
  nodes: LatticeNode[];
  edges: Edge[];
  glow: number[]; // per-node glow buffer, boosted when a packet arrives
}

interface AlgorithmNetworkProps {
  nodeColor?: string;
  lineColor?: string;
  packetColor?: string;
  backgroundFade?: string;
}

const AlgorithmNetwork: React.FC<AlgorithmNetworkProps> = ({
  nodeColor = "rgba(194, 101, 42, 0.55)",
  lineColor = "rgba(194, 101, 42, 0.16)",
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
    let t = 0; // slow global clock driving the oscillation

    const back: Layer = { nodes: [], edges: [], glow: [] };
    const front: Layer = { nodes: [], edges: [], glow: [] };
    const packets: Packet[] = [];
    const ripples: Ripple[] = [];

    const pointer = { x: -9999, y: -9999 };
    const pointerSmooth = { x: -9999, y: -9999 };
    let lastRippleAt = 0;

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    // Builds one ordered lattice layer: a loose grid of nodes with jitter,
    // connected only to grid-adjacent neighbours so lines stay short and
    // run in a small number of consistent directions.
    const buildLayer = (
      layer: Layer,
      cellSize: number,
      fillProb: number,
      rMin: number,
      rMax: number,
      jitterFrac: number,
      ampRange: [number, number],
      diagonalProb: number
    ) => {
      layer.nodes.length = 0;
      layer.edges.length = 0;

      const cols = Math.ceil(width / cellSize) + 2;
      const rows = Math.ceil(height / cellSize) + 2;
      const indexOf = new Map<string, number>();

      for (let col = -1; col < cols; col++) {
        for (let row = -1; row < rows; row++) {
          if (Math.random() > fillProb) continue;
          const jitterX = rand(-jitterFrac, jitterFrac) * cellSize;
          const jitterY = rand(-jitterFrac, jitterFrac) * cellSize;
          const node: LatticeNode = {
            homeX: col * cellSize + cellSize / 2 + jitterX,
            homeY: row * cellSize + cellSize / 2 + jitterY,
            r: rand(rMin, rMax),
            phaseX: rand(0, Math.PI * 2),
            phaseY: rand(0, Math.PI * 2),
            freqX: rand(0.05, 0.09),
            freqY: rand(0.05, 0.09),
            ampX: rand(ampRange[0], ampRange[1]),
            ampY: rand(ampRange[0], ampRange[1]),
          };
          const idx = layer.nodes.length;
          layer.nodes.push(node);
          indexOf.set(`${col},${row}`, idx);
        }
      }

      for (let col = -1; col < cols; col++) {
        for (let row = -1; row < rows; row++) {
          const here = indexOf.get(`${col},${row}`);
          if (here === undefined) continue;

          const right = indexOf.get(`${col + 1},${row}`);
          if (right !== undefined) layer.edges.push({ a: here, b: right });

          const down = indexOf.get(`${col},${row + 1}`);
          if (down !== undefined) layer.edges.push({ a: here, b: down });

          if (diagonalProb > 0 && Math.random() < diagonalProb) {
            const diag = indexOf.get(`${col + 1},${row + 1}`);
            if (diag !== undefined) layer.edges.push({ a: here, b: diag });
          }
        }
      }

      layer.glow = new Array(layer.nodes.length).fill(0);
    };

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
        // Back layer: finer grid, smaller/fainter nodes, purely orthogonal,
        // barely-there oscillation — recedes into the page.
        buildLayer(back, 92, 0.8, 1.1, 1.9, 0.22, [1.5, 3], 0);
        // Front layer: coarser grid, bigger/bolder nodes, occasional
        // diagonal for texture, carries the travelling packets.
        buildLayer(front, 148, 0.72, 1.8, 3, 0.24, [3, 6], 0.12);
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
    resize(canvas.offsetWidth, canvas.offsetHeight);

    const spawnPacket = () => {
      if (front.edges.length === 0 || packets.length >= 6) return;
      const edge = Math.floor(Math.random() * front.edges.length);
      packets.push({ edge, t: 0, speed: rand(0.008, 0.014), reverse: Math.random() < 0.5 });
    };
    let spawnTimer = 0;

    // Roughly where the code editor sits — the lattice brightens gently
    // toward this point instead of needing literal extra node density.
    const focal = () => ({ x: width * 0.66, y: height * 0.48 });

    const drawLayer = (
      layer: Layer,
      parallaxFactor: number,
      mouseInfluence: number,
      opacityScale: number,
      lineWidth: number,
      withPackets: boolean
    ) => {
      const px = (pointerSmooth.x - width / 2) * parallaxFactor * 0.018;
      const py = (pointerSmooth.y - height / 2) * parallaxFactor * 0.018;
      const f = focal();
      const focalRadius = Math.max(width, height) * 0.55;

      const disp: { x: number; y: number }[] = new Array(layer.nodes.length);
      const boost: number[] = new Array(layer.nodes.length);

      for (let i = 0; i < layer.nodes.length; i++) {
        const n = layer.nodes[i];
        const oscX = Math.sin(t * n.freqX + n.phaseX) * n.ampX;
        const oscY = Math.cos(t * n.freqY + n.phaseY) * n.ampY;
        let baseX = n.homeX + oscX + px;
        let baseY = n.homeY + oscY + py;

        // Gentle attraction toward the cursor
        const dxm = pointerSmooth.x - baseX;
        const dym = pointerSmooth.y - baseY;
        const distm = Math.hypot(dxm, dym);
        const mr = 130;
        let mg = 0;
        if (distm < mr && mouseInfluence > 0) {
          const factor = (1 - distm / mr) * mouseInfluence;
          const safe = distm || 1;
          baseX += (dxm / safe) * factor * 10;
          baseY += (dym / safe) * factor * 10;
          mg = factor;
        }

        // Focal spotlight — brighten toward the editor without extra nodes
        const df = Math.hypot(baseX - f.x, baseY - f.y);
        const focalGlow = Math.max(0, 1 - df / focalRadius) * 0.3;

        disp[i] = { x: baseX, y: baseY };
        boost[i] = Math.min(mg + focalGlow + layer.glow[i], 1);
      }

      // Connections — only along the lattice edges, so nothing crosses at
      // odd angles the way a random graph would.
      ctx.lineWidth = lineWidth;
      for (const e of layer.edges) {
        const A = disp[e.a];
        const B = disp[e.b];
        if (!A || !B) continue;
        const localBoost = Math.max(boost[e.a], boost[e.b]);
        ctx.strokeStyle = lineColor;
        ctx.globalAlpha = Math.min((0.68 + localBoost * 0.4) * opacityScale, 1);
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Nodes
      for (let i = 0; i < layer.nodes.length; i++) {
        const n = layer.nodes[i];
        const p = disp[i];
        const g = boost[i];
        ctx.beginPath();
        ctx.fillStyle = nodeColor;
        ctx.globalAlpha = Math.min((0.55 + g * 0.45) * opacityScale, 1);
        if (g > 0.08) {
          ctx.shadowColor = packetColor;
          ctx.shadowBlur = 9 * g;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.arc(p.x, p.y, n.r * (1 + g * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // decay the packet-arrival glow
        layer.glow[i] *= 0.93;
      }
      ctx.globalAlpha = 1;

      // Travelling data packets
      if (withPackets) {
        for (let k = packets.length - 1; k >= 0; k--) {
          const pk = packets[k];
          const edge = layer.edges[pk.edge];
          if (!edge) {
            packets.splice(k, 1);
            continue;
          }
          const A = disp[pk.reverse ? edge.b : edge.a];
          const B = disp[pk.reverse ? edge.a : edge.b];
          if (!A || !B) continue;
          const x = A.x + (B.x - A.x) * pk.t;
          const y = A.y + (B.y - A.y) * pk.t;

          for (let s = 1; s <= 3; s++) {
            const tt = Math.max(pk.t - s * 0.04, 0);
            const tx = A.x + (B.x - A.x) * tt;
            const ty = A.y + (B.y - A.y) * tt;
            ctx.beginPath();
            ctx.fillStyle = packetColor;
            ctx.globalAlpha = 0.26 - s * 0.07;
            ctx.arc(tx, ty, 2 - s * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.fillStyle = packetColor;
          ctx.globalAlpha = 0.95;
          ctx.shadowColor = packetColor;
          ctx.shadowBlur = 11;
          ctx.arc(x, y, 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;

          pk.t += pk.speed;
          if (pk.t >= 1) {
            const arrivedNode = pk.reverse ? edge.a : edge.b;
            layer.glow[arrivedNode] = 1;
            packets.splice(k, 1);
          }
        }
      }
    };

    const drawRipples = () => {
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        ctx.beginPath();
        ctx.strokeStyle = packetColor;
        ctx.globalAlpha = r.alpha * 0.45;
        ctx.lineWidth = 1;
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        r.radius += 1.4;
        r.alpha -= 0.02;
        if (r.alpha <= 0) ripples.splice(i, 1);
      }
    };

    const render = () => {
      if (!ready || width <= 0 || height <= 0) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const f = focal();
      const warm = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, Math.max(width, height) * 0.6);
      warm.addColorStop(0, "rgba(216, 110, 42, 0.1)");
      warm.addColorStop(1, "rgba(216, 110, 42, 0)");
      ctx.fillStyle = warm;
      ctx.fillRect(0, 0, width, height);

      pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.07;
      pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.07;
      t += 0.016;

      drawLayer(back, 0.35, 0.35, 0.75, 0.85, false);
      drawLayer(front, 0.9, 1, 0.95, 1.05, true);
      drawRipples();

      spawnTimer++;
      if (spawnTimer > 38) {
        spawnTimer = 0;
        spawnPacket();
      }

      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.sqrt(width ** 2 + height ** 2) / 2
      );
      gradient.addColorStop(0, "rgba(250, 245, 238, 0)");
      gradient.addColorStop(0.82, "rgba(250, 245, 238, 0.14)");
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
      if (now - lastRippleAt > 280 && ripples.length < 4) {
        ripples.push({ x: pointer.x, y: pointer.y, radius: 2, alpha: 0.55 });
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