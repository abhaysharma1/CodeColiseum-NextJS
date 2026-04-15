"use client";

import BlurText from "./BlurText";

const features = [
  {
    icon: "🔥",
    title: "Streaks",
    desc: "Stay consistent with visual reminders and daily goals. Never break the momentum again.",
  },
  {
    icon: "🏆",
    title: "Leaderboards",
    desc: "Compete with friends or the global community. Climb the ranks as you solve harder problems.",
  },
  {
    icon: "🤖",
    title: "AI Evaluation",
    desc: "Solutions are scored on efficiency — brute‑force won't cut it. Get real feedback on complexity.",
  },
  {
    icon: "🎖️",
    title: "Achievements",
    desc: "Unlock badges and XP milestones that showcase your skills on your profile.",
  },
  {
    icon: "👥",
    title: "Social Learning",
    desc: "Connect with peers, share achievements, and learn together in a collaborative environment.",
  },
  {
    icon: "📊",
    title: "Analytics",
    desc: "Deep-dive into your weak spots with rich topic-frequency charts and performance trends.",
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 md:px-8 py-24">
      <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
        <div style={{ fontFamily: "'EB Garamond', serif" }}>
          <BlurText
            text="Gamify your coding journey."
            delay={40}
            animateBy="words"
            direction="bottom"
            className="text-4xl md:text-5xl font-bold text-stone-900"
          />
        </div>
        <p className="text-stone-500">
          We bring the best of gaming mechanics to the world's most popular
          coding platforms.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {features.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="group bg-white p-10 rounded-[2rem] border border-orange-200/60 shadow-[0_2px_16px_rgba(194,101,42,0.05)] hover:shadow-xl hover:border-orange-300/60 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:bg-orange-700 group-hover:scale-110 transition-all duration-300">
              <span className="group-hover:grayscale-0 transition-all">{icon}</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-stone-900">{title}</h3>
            <p className="text-stone-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
