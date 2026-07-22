"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  Github,
  Linkedin,
  Mail,
  Heart,
  CheckCircle2,
  Code2,
} from "lucide-react";

const productLinks = [
  { label: "Practice Problems", href: "/problem-list" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
];

const companyLinks = [
  { label: "Contact Us", href: "mailto:hello@codecoliseum.in" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const socialLinks = [
  { icon: Github, href: "https://github.com/", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:hello@codecoliseum.in", label: "Email" },
];

export default function LandingFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative w-full bg-[#faf5ee] pt-14 pb-10 overflow-hidden">
      {/* Soft gradient hairline instead of a flat border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Main grid */}
        <div className="grid md:grid-cols-4 gap-12 md:gap-10 pb-10 border-b border-orange-200/40">
          {/* Brand */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-700 flex items-center justify-center shrink-0">
                <Code2 size={18} className="text-white" />
              </div>
              <span
                className="text-2xl font-bold text-orange-900 tracking-tight"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                CodeColiseum
              </span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
              An AI-powered coding arena where efficiency is rewarded and mediocrity is challenged.
            </p>
            <div className="flex items-center gap-2 mt-1">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-orange-200 bg-white flex items-center justify-center text-orange-700 hover:bg-orange-700 hover:text-white hover:border-orange-700 transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">Product</h3>
            <div className="flex flex-col gap-2.5">
              {productLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-stone-500 hover:text-orange-700 transition-colors w-fit"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">Company</h3>
            <div className="flex flex-col gap-2.5">
              {companyLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-stone-500 hover:text-orange-700 transition-colors w-fit"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">Stay in the loop</h3>
            <p className="text-sm text-stone-500">
              Get contest alerts, feature updates, and tips straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative w-full max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address"
                className="w-full rounded-xl border border-orange-200 bg-white px-5 py-3.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-orange-700 p-2 text-white hover:brightness-110 transition-all active:scale-90"
                aria-label="Subscribe"
              >
                <ArrowRight size={16} />
              </button>
            </form>
            {subscribed && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">
                <CheckCircle2 size={14} />
                Subscribed — welcome aboard!
              </span>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6 text-xs text-stone-500">
          <span>© 2026 CodeColiseum. All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5">
            {"Built with "}<Heart size={12} className="text-orange-600 fill-orange-600" />{" by Abhay Sharma & Atulya Rounak"}
          </span>
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="inline-flex items-center gap-1.5 text-stone-500 hover:text-orange-700 transition-colors"
          >
            Back to top
            <ArrowUp size={13} />
          </button>
        </div>
      </div>
    </footer>
  );
}