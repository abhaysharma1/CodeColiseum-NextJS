"use client";

import LandingHeader from "@/components/LandingHeader";
import Hero from "@/components/Hero";
import Integrations from "@/components/Integrations";
import TransformSection from "@/components/TransformSection";
import FeatureCards from "@/components/FeatureCards";
import HowItWorks from "@/components/HowItWorks";
import LandingFooter from "@/components/LandingFooter";

export default function Home() {
  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "#faf5ee", color: "#3a302a" }}
    >
      <LandingHeader />
      <main className="pt-20">
        <Hero />
        <TransformSection />
        {/* <Integrations /> */}
        <FeatureCards />
        <HowItWorks />
      </main>
      <LandingFooter />
    </div>
  );
}
