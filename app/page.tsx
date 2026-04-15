"use client";

import LandingHeader from "@/components/LandingHeader";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LandingFooter from "@/components/LandingFooter";
import AIAnalysisSection from "@/components/AIAnalysisSection";
import BeyondBasicsSection from "@/components/BeyondBasicsSection";

export default function Home() {
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
        <LandingFooter />
      </main>

      {/* Fixed gradient blur at the bottom of the viewport */}
      <div
        className="pointer-events-none"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "7rem",
          zIndex: 50,
          background:
            "linear-gradient(to bottom, rgba(250,245,238,0) 0%, rgba(250,245,238,0.4) 30%, rgba(250,245,238,0.8) 60%, rgba(250,245,238,1) 100%)",
        }}
      />
    </div>
  );
}
