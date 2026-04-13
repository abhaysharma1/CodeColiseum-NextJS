"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function LandingFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="w-full bg-[#faf5ee] border-t border-orange-200/60 pt-20 pb-8 mt-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Main grid */}
        <div className="grid md:grid-cols-3 gap-16 pb-16 border-b border-orange-200/40">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <span
              className="text-2xl font-bold text-orange-900 tracking-tight"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              CodeColiseum
            </span>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
              An AI-powered coding arena where efficiency is rewarded and mediocrity is challenged.
            </p>
            <Link
              href="/signup"
              className="mt-2 inline-flex items-center gap-2 bg-orange-700 text-white px-6 py-3 rounded-full text-sm font-bold hover:brightness-110 transition-all active:scale-95 shadow-md shadow-orange-700/20 w-fit"
            >
              Get Started Free
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-stone-800">Stay in the loop</h3>
            <p className="text-sm text-stone-500">
              Get contest alerts, feature updates, and tips straight to your inbox.
            </p>
            <div className="relative w-full max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-orange-200 bg-white px-5 py-3.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-orange-700 p-2 text-white hover:brightness-110 transition-all active:scale-90"
                aria-label="Subscribe"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-stone-800">Contact</h3>
            <div className="space-y-2 text-sm text-stone-500">
              <p>hello@codecoliseum.in</p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {[
                { label: "Practice Problems", href: "/problem-list" },
                { label: "Login", href: "/login" },
                { label: "Sign Up", href: "/signup" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-stone-500 hover:text-orange-700 underline decoration-orange-200 underline-offset-4 transition-colors w-fit"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-xs text-stone-400">
          <span>© 2026 CodeColiseum. All rights reserved.</span>
          <span>Built with ❤️ by CuteAbhaySharma &amp; Atulya Rounak</span>
        </div>
      </div>
    </footer>
  );
}
