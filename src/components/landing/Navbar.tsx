'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Menu, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-cyan p-0.5 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Pixel<span className="text-brand-400">Lift</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="#demo" className="hover:text-white transition-colors">
            Demo
          </Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Real-ESRGAN v0.2</span>
          </div>
        </nav>

        {/* CTA & Clerk Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>

          <Link href="/dashboard">
            <Button variant="gradient" size="sm" className="gap-2">
              <span>Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>

          <SignedIn>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          </SignedIn>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 py-6 space-y-4 animate-in slide-in-from-top-4">
          <nav className="flex flex-col gap-4 text-sm font-medium text-zinc-300">
            <Link
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-400 transition-colors"
            >
              Interactive Demo
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-400 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-400 transition-colors"
            >
              Pricing ($5 / 50 Credits)
            </Link>
          </nav>
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <SignedOut>
              <div className="flex gap-2">
                <SignInButton mode="modal">
                  <Button variant="outline" className="flex-1 justify-center">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="outline" className="flex-1 justify-center border-brand-500/50 text-brand-300">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                <Button variant="gradient" className="w-full justify-center">
                  Launch Studio
                </Button>
              </Link>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
