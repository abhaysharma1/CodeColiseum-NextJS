"use client";

import ParticleSystem from "./ParticleSystem";

/* ===========================================================
   Scene
   ---------------------------------------------------------
   Everything that lives inside the <Canvas>. Deliberately
   minimal for Phase 1: just the particle field. No lights are
   needed since the particle material is unlit (emissive-style
   glow via the fragment shader). Later phases can add
   connection lines, camera interaction, etc. here without
   touching HeroBackground.tsx or ParticleSystem.tsx.
=========================================================== */

export default function Scene() {
  return <ParticleSystem />;
}