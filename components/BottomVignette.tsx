"use client";

import { useEffect, useState } from "react";

export function BottomVignette() {
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
  );
}
