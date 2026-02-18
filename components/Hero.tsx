import React from "react";
import { Button } from "./ui/button";
import Squares from "./Squares";
import Link from "next/link";
import CodeWindow from "./CodeWindow";

const HEADER_HEIGHT = 80; // adjust to your floating header height

const Hero = () => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        paddingTop: HEADER_HEIGHT + 40,
      }}>
      {/* Squares Background — fixed to viewport */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-black">
        <Squares speed={0.5} direction="diagonal" borderColor="#271E37" />
      </div>

      <div className="max-w-5xl mx-auto text-center px-6">
        {/* Headline */}
        <h1
          className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 transition-all duration-1000 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
          Where{" "}
          <span className=" italic font-serif decoration-white/60 decoration-8">
            Code;
          </span>{" "}
          <span> Meets Competition and </span>
          <span className="font-medium underline decoration-white/60 decoration-8">
            Efficency
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-lg text-zinc-400 max-w-2xl mx-auto mb-10 transition-all duration-1000 delay-200 ${
            show ? "opacity-100" : "opacity-0"
          }`}>
          An AI-powered coding platform that evaluates solutions intelligently —
          rewarding optimal algorithms and rejecting brute-force shortcuts.
        </p>

        {/* Button */}
        <div
          className={`transition-all duration-1000 delay-300 ${
            show ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}>
          <Button
            className="bg-white text-black h-12 px-10 font-semibold hover:scale-105 active:scale-95 transition-all"
            asChild>
            <Link href="/problemlist">Start Practicing</Link>
          </Button>
        </div>

        {/* Code Window */}
        <div
          className={`mt-20 transition-all duration-1000 delay-500 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
          <CodeWindow />
        </div>
      </div>
    </section>
  );
};

export default Hero;
