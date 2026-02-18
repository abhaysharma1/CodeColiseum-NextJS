"use client";
import Hero from "@/components/Hero";
import { useTheme } from "next-themes";
import Foooter from "@/components/Footer";
import Header from "@/components/Header";
import { StoryMode } from "@/components/StoryMode";
import FeatureStrip from "@/components/FeatureStrip";

export default function Home() {
  const { theme } = useTheme();

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-white">
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>
      <main className="grow bg-">
        <div className="hero-content">
          <Hero />
        </div>
        <div className="">
          <FeatureStrip />
          <StoryMode />
        </div>
      </main>
      <Foooter />
    </div>
  );
}
