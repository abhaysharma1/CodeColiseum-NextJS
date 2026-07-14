"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";

/* ===========================================================
   HeroBackground
   ---------------------------------------------------------
   Fullscreen, alpha-transparent R3F canvas that sits behind
   every hero element. Purely presentational — no pointer
   events, no layout impact. This component is intended to be
   loaded with `next/dynamic({ ssr: false })` from Hero.tsx,
   since WebGL/canvas APIs are browser-only.
=========================================================== */

export default function HeroBackground() {
  return (
    <div
      className="absolute inset-0 z-[1] overflow-hidden"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 2]} // capped for Retina without over-spending on perf
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        camera={{ fov: 50, position: [0, 0, 10], near: 0.1, far: 100 }}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 100 } }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}