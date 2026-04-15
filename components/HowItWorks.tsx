"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BlurText from "./BlurText";
import HandwrittenAnnotation from "./HandwrittenAnnotation";

const steps = [
  {
    n: "1",
    title: "Create an Account",
    desc: "Sign up in seconds — no credit card required. Your journey begins here.",
  },
  {
    n: "2",
    title: "Solve Problems",
    desc: "Pick from hundreds of curated DSA problems. Our AI tracks your progress in real‑time.",
  },
  {
    n: "3",
    title: "Gain Exams",
    desc: "In a Secured Environment and build a profile that proves your skills.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-orange-50/60 py-32 border-y border-orange-200/40"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Steps */}
          <div className="space-y-12">
            <div className="relative">
              {/* Annotation */}
              <div className="absolute -top-14 right-0 md:-right-12 hidden md:block">
                <HandwrittenAnnotation
                  text="it's really this easy!"
                  arrow="down"
                  rotate={6}
                  delay={300}
                />
              </div>

              <div style={{ fontFamily: "'EB Garamond', serif" }}>
                <BlurText
                  text="Elevate your skills in three simple steps."
                  delay={40}
                  animateBy="words"
                  direction="bottom"
                  className="text-4xl md:text-5xl font-bold text-stone-900 leading-tight"
                  wordStyles={{
                    "Elevate": { className: "italic text-orange-700" },
                    "three": { className: "italic text-orange-600" },
                    "simple": { className: "italic text-orange-600" },
                    "steps": { className: "italic text-orange-600" },
                  }}
                />
              </div>
            </div>

            <div className="space-y-10">
              {steps.map(({ n, title, desc }) => (
                <div key={n} className="flex gap-6">
                  <div className="w-10 h-10 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-lg shadow-orange-700/25">
                    {n}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-stone-900">{title}</h4>
                    <p className="text-stone-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-orange-700 text-white px-8 py-4 rounded-lg font-bold shadow-xl shadow-orange-700/25 hover:brightness-110 transition-all active:scale-95"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Visual card */}
          <div className="relative">
            <div className="bg-white rounded-3xl border border-orange-200/60 shadow-2xl p-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-xl">🏅</div>
                <div>
                  <div className="font-bold text-stone-900">Competitive Profile</div>
                  <div className="text-sm text-stone-400">Global Rank #1,204</div>
                </div>
              </div>

              {/* XP bar */}
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                  <span>Level 14 — Specialist</span>
                  <span>3,400 / 5,000 XP</span>
                </div>
                <div className="h-3 bg-orange-100 rounded-full">
                  <div className="h-full w-[68%] bg-orange-700 rounded-full" />
                </div>
              </div>

              {/* Recent activity */}
              <div className="space-y-3">
                {[
                  { label: "Two Sum", diff: "Easy", xp: "+50 XP", c: "text-green-600 bg-green-50" },
                  { label: "LRU Cache", diff: "Hard", xp: "+200 XP", c: "text-red-600 bg-red-50" },
                  { label: "Merge Intervals", diff: "Medium", xp: "+100 XP", c: "text-orange-600 bg-orange-50" },
                ].map(({ label, diff, xp, c }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-orange-50/60 border border-orange-100">
                    <span className="font-medium text-stone-800 text-sm">{label}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c}`}>{diff}</span>
                      <span className="text-xs font-bold text-orange-700">{xp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak badge */}
            <div className="absolute -bottom-5 -right-5 md:-right-8 bg-white rounded-2xl p-4 shadow-xl border border-orange-200/40 flex items-center gap-3 hidden md:flex">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="text-sm font-bold text-stone-900">21-day streak</div>
                <div className="text-xs text-stone-400">Keep it up!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
