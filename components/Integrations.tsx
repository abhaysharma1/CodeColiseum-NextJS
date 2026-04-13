"use client";

const platforms = ["LeetCode", "GeeksforGeeks", "HackerRank", "Codeforces"];

export default function Integrations() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-12">
      <div className="border-y border-orange-200/50 py-12">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-10">
          Track progress across
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          {platforms.map((p) => (
            <span
              key={p}
              className="text-2xl font-bold text-stone-700"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
