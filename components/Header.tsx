"use client";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authcontext";

export default function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (y) => {
      setCompact(y > 40); // threshold
    });
  }, [scrollY]);

  return (
    <motion.header
      animate={{
        paddingTop: compact ? "0.5rem" : "1rem",
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50">
      <motion.div
        animate={{
          paddingTop: compact ? "0.75rem" : "1rem",
          paddingBottom: compact ? "0.75rem" : "1rem",
          borderRadius: compact ? "1rem" : "1.25rem",
          backdropFilter: compact ? "blur(20px)" : "blur(28px)",
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`mx-auto mt-4 max-w-7xl px-6 transition-all duration-300 ${compact ? "glass-card-dark py-3 rounded-2xl" : "bg-transparent py-4 rounded-3xl border-transparent"}`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="font-logoFont">CODECOLISEUM</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex text-white">
            <Link
              href="#product"
              className="text-white/80 hover:text-white transition-colors font-medium">
              Exams
            </Link>
            <Link
              href="/problemlist"
              className="text-white/80 hover:text-white transition-colors font-medium">
              Practice
            </Link>
            <Link
              href="#pricing"
              className="text-white/80 hover:text-white transition-colors font-medium">
              Contests
            </Link>

            <div className="h-5 w-px bg-white/20" />
            <div className="flex items-center gap-3">
              {user ? (
                <Button
                  className="bg-white text-black text-xs font-bold h-8 px-4 rounded-md hover:bg-zinc-200 transition-colors"
                  asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-white/80 hover:text-white transition-colors font-medium">
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-5 py-2.5 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white"
            aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      {/* <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mx-auto mt-3 max-w-7xl rounded-2xl border text-white p-6 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-5 text-center text-white">
              <Link href="#features" onClick={() => setOpen(false)}>
                Product
              </Link>
              <Link href="#pricing" onClick={() => setOpen(false)}>
                Pricing
              </Link>

              <div className="h-px w-full bg-white/15" />

              <Link
                href="#waitlist"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/10 px-4 py-2 text-center text-sm font-medium text-white">
                Log in
              </Link>

              <Link
                href="#waitlist"
                onClick={() => setOpen(false)}
                className="rounded-full bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">
                Sign up
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </motion.header>
  );
}
