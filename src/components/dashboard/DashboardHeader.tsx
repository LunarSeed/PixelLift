'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Coins, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

interface DashboardHeaderProps {
  credits: number;
  onOpenTopUp: () => void;
  userEmail?: string;
}

export function DashboardHeader({ credits, onOpenTopUp, userEmail = 'demo@pixellift.ai' }: DashboardHeaderProps) {
  return (
    <header className="w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / Home Link */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Landing Page</span>
          </Link>
          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              </div>
            </div>
            <span className="font-extrabold text-white text-base">
              Pixel<span className="text-brand-400">Lift</span>{' '}
              <span className="text-xs font-normal text-zinc-400">Studio</span>
            </span>
          </Link>
        </div>

        {/* Right: Credit Balance + Top Up Button + Auth Controls */}
        <div className="flex items-center gap-3">
          {/* Credit Counter Pill */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400" />
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-white text-sm">{credits}</span>
              <span className="text-xs text-zinc-400">Credits</span>
            </div>
          </div>

          {/* Top Up Button */}
          <Button
            variant="gradient"
            size="sm"
            onClick={onOpenTopUp}
            className="shadow-md shadow-brand-500/20 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Top Up</span>
          </Button>

          {/* Auth Controls */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
