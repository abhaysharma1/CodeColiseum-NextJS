"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authcontext";
import { Menu, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const NAV_LINKS = [
  { href: "/problem-list", label: "Practice" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
];

export default function LandingHeader() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
            className="text-xl md:text-2xl font-extrabold tracking-tight text-orange-900"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            CodeColiseum
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative px-4 py-2 text-sm font-medium tracking-wide text-stone-600 transition-colors duration-200 hover:text-orange-800"
            >
              {link.label}
              <span className="pointer-events-none absolute inset-x-4 -bottom-0.5 h-px scale-x-0 bg-orange-700/70 transition-transform duration-200 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </div>

        {/* CTA / User */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-1.5 rounded-lg bg-orange-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-700/20 transition-all hover:brightness-110 active:scale-95"
            >
              Dashboard
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-stone-600 transition-colors hover:text-orange-800"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-1.5 rounded-lg bg-orange-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-700/20 transition-all hover:brightness-110 active:scale-95"
              >
                Sign Up
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="relative z-50 text-stone-700 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-orange-200/40 bg-[#faf5ee] md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-6">
              {[...NAV_LINKS, { href: "#pricing", label: "Pricing" }].map(
                (link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className="block rounded-md px-2 py-2.5 text-base font-medium text-stone-700 transition-colors hover:bg-orange-100/60 hover:text-orange-800"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              )}

              <div className="my-4 h-px bg-orange-200/60" />

              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-orange-700 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-orange-700/20"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="rounded-lg border border-orange-200 px-6 py-3 text-center text-sm font-medium text-stone-700 transition-colors hover:bg-orange-100/50"
                    onClick={() => setMobileOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg bg-orange-700 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-orange-700/20"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}