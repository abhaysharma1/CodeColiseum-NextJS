"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/* ===========================================================
   ParticleSystem
   ---------------------------------------------------------
   Foundation-only, GPU-driven particle field.

   ~1400 particles, split across three depth layers, distributed
   across the full viewport at each layer's depth (no clustering,
   no blobs). Motion is entirely computed in the vertex shader:
   a slow linear drift wrapped seamlessly within each particle's
   own bounds, plus a small per-particle sinusoidal offset for a
   calm "floating dust" feel. Because every particle has its own
   random speed, phase and wrap bounds, the field never appears
   to loop or reset as a whole.

   No mouse interaction, no connecting lines, no shapes — those
   are explicitly out of scope for this phase.
=========================================================== */

const PARTICLE_COUNT = 1400;

// Warm, low-saturation palette matching the existing landing page.
const PALETTE = ["#FFE8C5", "#FFD59E", "#F5C77A", "#E89B4A"];

type LayerConfig = {
  /** Depth position (camera sits at z = 10, looking toward -z). */
  z: number;
  /** Base drift speed for this layer (world units / second). */
  speed: number;
  sizeMin: number;
  sizeMax: number;
  /** Share of the total particle count assigned to this layer. */
  ratio: number;
};

// Background: many, tiny, slow. Foreground: few, larger, faster.
const LAYERS: LayerConfig[] = [
  { z: -6.5, speed: 0.05, sizeMin: 1.0, sizeMax: 1.7, ratio: 0.55 },
  { z: -1.5, speed: 0.09, sizeMin: 1.6, sizeMax: 2.4, ratio: 0.3 },
  { z: 3.0, speed: 0.14, sizeMin: 2.2, sizeMax: 3.4, ratio: 0.15 },
];

// Slightly larger than the visible viewport at each depth so the
// wrap boundary never lines up with the visible edge.
const BOUNDS_PADDING = 1.1;

type GetViewportSize = (z: number) => { width: number; height: number };

interface ParticleData {
  positions: Float32Array;
  velocities: Float32Array;
  colors: Float32Array;
  layers: Float32Array;
  seeds: Float32Array;
  sizes: Float32Array;
  bounds: Float32Array; // [halfWidth, halfHeight] per particle
}

const tmpColor = new THREE.Color();

function buildParticleData(getViewportSize: GetViewportSize): ParticleData {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const layers = new Float32Array(PARTICLE_COUNT);
  const seeds = new Float32Array(PARTICLE_COUNT);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const bounds = new Float32Array(PARTICLE_COUNT * 2);

  let idx = 0;

  LAYERS.forEach((layer, layerIndex) => {
    const isLast = layerIndex === LAYERS.length - 1;
    const count = isLast
      ? PARTICLE_COUNT - idx
      : Math.round(PARTICLE_COUNT * layer.ratio);

    const { width, height } = getViewportSize(layer.z);
    const halfW = (width / 2) * BOUNDS_PADDING;
    const halfH = (height / 2) * BOUNDS_PADDING;

    for (let i = 0; i < count; i++) {
      const p3 = idx * 3;

      // Even, non-clustered spread across this layer's visible bounds.
      positions[p3] = (Math.random() * 2 - 1) * halfW;
      positions[p3 + 1] = (Math.random() * 2 - 1) * halfH;
      positions[p3 + 2] = layer.z;

      const angle = Math.random() * Math.PI * 2;
      const speed = layer.speed * (0.4 + Math.random() * 0.6);
      velocities[p3] = Math.cos(angle) * speed;
      velocities[p3 + 1] = Math.sin(angle) * speed;
      velocities[p3 + 2] = 0;

      tmpColor.set(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      colors[p3] = tmpColor.r;
      colors[p3 + 1] = tmpColor.g;
      colors[p3 + 2] = tmpColor.b;

      layers[idx] = layerIndex;
      seeds[idx] = Math.random();
      sizes[idx] = layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin);

      bounds[idx * 2] = halfW;
      bounds[idx * 2 + 1] = halfH;

      idx++;
    }
  });

  return { positions, velocities, colors, layers, seeds, sizes, bounds };
}

function applyAttributes(geometry: THREE.BufferGeometry, data: ParticleData) {
  geometry.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
  geometry.setAttribute("aVelocity", new THREE.BufferAttribute(data.velocities, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(data.colors, 3));
  geometry.setAttribute("aLayer", new THREE.BufferAttribute(data.layers, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(data.seeds, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(data.sizes, 1));
  geometry.setAttribute("aBounds", new THREE.BufferAttribute(data.bounds, 2));
}

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 aVelocity;
  attribute float aLayer;
  attribute float aSeed;
  attribute float aSize;
  attribute vec2 aBounds;

  uniform float uTime;

  varying vec3 vColor;

  void main() {
    vColor = color;

    vec3 pos = position;

    // Slow linear drift, wrapped seamlessly within this particle's
    // own bounds. Because bounds/speed/phase are unique per particle,
    // wraps are asynchronous across the field and never read as a
    // visible "loop" or reset.
    pos.x = mod(position.x + aVelocity.x * uTime + aBounds.x, aBounds.x * 2.0) - aBounds.x;
    pos.y = mod(position.y + aVelocity.y * uTime + aBounds.y, aBounds.y * 2.0) - aBounds.y;

    // Small layered oscillation on top of the drift for a calm,
    // floating-dust feel. No sudden changes, no bouncing.
    float phase = aSeed * 6.2831853;
    float freq = 0.05 + aSeed * 0.04;
    pos.x += sin(uTime * freq + phase) * (0.05 + aLayer * 0.02);
    pos.y += cos(uTime * freq * 0.85 + phase) * (0.04 + aLayer * 0.015);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Perspective-correct sizing, scaled per-particle and by DPR.
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;

  void main() {
    // Soft circular falloff — a subtle glow, not a hard dot.
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, d);
    alpha *= 0.4; // very low opacity by design

    gl_FragColor = vec4(vColor, alpha);
  }
`;

export default function ParticleSystem() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size } = useThree();
  const resizeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstSize = useRef(true);

  const getViewportSize: GetViewportSize = useMemo(() => {
    return (z: number) => {
      const v = viewport.getCurrentViewport(undefined, [0, 0, z]);
      return { width: v.width, height: v.height };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Built once with the viewport available at mount time.
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    applyAttributes(geo, buildParticleData(getViewportSize));
    return geo;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  // Rebuild the field's attributes on meaningful resize (debounced)
  // so particles keep filling the viewport responsively, without
  // regenerating on every intermediate resize frame.
  useEffect(() => {
    if (isFirstSize.current) {
      isFirstSize.current = false;
      return;
    }
    if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    resizeTimeout.current = setTimeout(() => {
      applyAttributes(geometry, buildParticleData(getViewportSize));
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = 0;
      }
    }, 200);

    return () => {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={{ uTime: { value: 0 } }}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}