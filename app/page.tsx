"use client";

import { useEffect, useState } from "react";
import LandingHeader from "@/components/LandingHeader";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LandingFooter from "@/components/LandingFooter";
import AIAnalysisSection from "@/components/AIAnalysisSection";
import BeyondBasicsSection from "@/components/BeyondBasicsSection";
import ClosingCTA from "@/components/ClosingCTA";

export default function Home() {
  // The bottom vignette is fixed to the viewport, which looks great while
  // scrolling through the page but used to permanently mask the footer's
  // last row once you reached the true bottom of the page (its opaque
  // edge sat right on top of the copyright line). Fading it out as the
  // user nears the bottom keeps the vignette everywhere else and removes
  // it exactly where it was hiding real content.
  const [nearBottom, setNearBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 160;
      setNearBottom(scrolledToBottom);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ backgroundColor: "#faf5ee", color: "#3a302a" }}
    >
      <LandingHeader />
      <main className="pt-20">
        <Hero />
        <AIAnalysisSection />
        <BeyondBasicsSection />
        {/* <FeatureCards /> */}
        <HowItWorks />
        <ClosingCTA />
        <LandingFooter />
      </main>

      <div
        className="pointer-events-none"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "7rem",
          zIndex: 50,
          opacity: nearBottom ? 0 : 1,
          transition: "opacity 0.3s ease-out",
          background:
            "linear-gradient(to bottom, rgba(250,245,238,0) 0%, rgba(250,245,238,0.4) 30%, rgba(250,245,238,0.8) 60%, rgba(250,245,238,1) 100%)",
        }}
      />
    </div>
  );
}