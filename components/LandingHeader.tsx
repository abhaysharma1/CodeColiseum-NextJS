"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authcontext";
import { Menu, X } from "lucide-react";

export default function LandingHeader() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#faf5ee]/95 backdrop-blur-md border-b border-orange-200/50 shadow-sm shadow-orange-900/5"
          : "bg-[#faf5ee]/80 backdrop-blur-sm border-b border-orange-100/30"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-8 py-4 md:py-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className="text-xl md:text-2xl font-bold tracking-tight text-orange-900"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            CodeColiseum
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/problem-list"
            className="text-stone-600 font-medium hover:text-orange-800 transition-colors duration-200 text-sm tracking-wide"
          >
            Practice
          </Link>
          <Link
            href="#features"
            className="text-stone-600 font-medium hover:text-orange-800 transition-colors duration-200 text-sm tracking-wide"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-stone-600 font-medium hover:text-orange-800 transition-colors duration-200 text-sm tracking-wide"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="text-stone-600 font-medium hover:text-orange-800 transition-colors duration-200 text-sm tracking-wide"
          >
            Pricing
          </Link>
        </div>

        {/* CTA / User */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="bg-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-orange-700/20"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-stone-600 font-medium hover:text-orange-800 transition-colors text-sm"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-orange-700/20"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-stone-700"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#faf5ee] border-t border-orange-200/40 px-6 py-6 flex flex-col gap-5">
          <Link href="/problem-list" className="text-stone-700 font-medium" onClick={() => setMobileOpen(false)}>Practice</Link>
          <Link href="#features" className="text-stone-700 font-medium" onClick={() => setMobileOpen(false)}>Features</Link>
          <Link href="#how-it-works" className="text-stone-700 font-medium" onClick={() => setMobileOpen(false)}>How It Works</Link>
          <Link href="#pricing" className="text-stone-700 font-medium" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <div className="h-px bg-orange-200/60" />
          {user ? (
            <Link href="/dashboard" className="bg-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm text-center" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="text-stone-700 font-medium text-center" onClick={() => setMobileOpen(false)}>Log in</Link>
              <Link href="/signup" className="bg-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm text-center" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
