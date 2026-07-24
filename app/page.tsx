import LandingHeader from "@/components/LandingHeader";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LandingFooter from "@/components/LandingFooter";
import AIAnalysisSection from "@/components/AIAnalysisSection";
import BeyondBasicsSection from "@/components/BeyondBasicsSection";
import ClosingCTA from "@/components/ClosingCTA";
import { BottomVignette } from "@/components/BottomVignette";

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
        <HowItWorks />
        <ClosingCTA />
        <LandingFooter />
      </main>

      <BottomVignette />
    </div>
  );
}