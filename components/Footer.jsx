"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-white/10 bg-black/50 pt-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[320px] bg-gradient-to-t from-white/5 via-white/3 to-transparent blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Main grid */}
        <div className="relative grid items-start gap-20 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col items-start gap-6 justify-center">
            <div className="flex items-center gap-3 group">
              <span className="text-3xl font-logoFont tracking-tighter text-white uppercase italic">
                CodeColiseum
              </span>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              CodeColiseum praise words go here.
            </p>

            <button className="mt-4 inline-flex items-center gap-3 rounded-full bg-white px-8 py-3.5 text-lg font-black text-black transition hover:bg-purple-600 hover:text-white active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              Let’s Get Started
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col items-start gap-6">
            <h3 className="text-xl font-semibold text-white">Stay connected</h3>

            <p className="max-w-sm text-sm text-white/60">
              Join our newsletter and stay updated on the latest trends in
              AI-powered learning.
            </p>

            <div className="relative w-full max-w-sm group">
              <input
                type="email"
                placeholder="E-mail"
                className="w-full rounded-2xl border border-white/10 glass-card-dark px-6 py-4 text-sm text-white placeholder-white/30 backdrop-blur transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 group-hover:bg-white/10"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white p-2.5 text-black transition hover:bg-purple-600 hover:text-white active:scale-90">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-2">
              {/* <a
                href="https://x.com/kriyaxlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/10 glass-card-dark px-4 py-2 text-sm text-white/70 transition-all hover:bg-white/10 hover:text-white hover:border-white/20">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
                <span>Follow on X</span>
              </a> */}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-start gap-6">
            <h3 className="text-xl font-semibold text-white">Contact</h3>

            <div className="space-y-3 text-sm text-white/70">
              <p>hello@CodeColiseum.in</p>
            </div>
          </div>
          <div className="hidden md:block absolute inset-y-0 left-1/3 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
          <div className="hidden md:block absolute inset-y-0 left-2/3 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
        </div>

        {/* Visible separator */}
        <div className="my-20 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-6 pb-10 text-xs text-white/50 md:flex-row">
          <span>© 2026 CodeColiseum</span>
          <span>powered by CuteAbhaySharma & Atulya Rounak</span>
        </div>
      </div>
    </footer>
  );
}
