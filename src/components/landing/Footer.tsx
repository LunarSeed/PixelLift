import React from 'react';
import Link from 'next/link';
import { Sparkles, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 py-12 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[6px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            </div>
          </div>
          <span className="font-bold text-white text-base">
            Pixel<span className="text-brand-400">Lift</span>
          </span>
          <span className="text-xs text-zinc-400 ml-2">© {new Date().getFullYear()} PixelLift AI. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-zinc-400">
          <Link href="#demo" className="hover:text-zinc-200 transition-colors">
            Demo
          </Link>
          <Link href="#pricing" className="hover:text-zinc-200 transition-colors">
            Pricing
          </Link>
          <Link href="/dashboard" className="hover:text-zinc-200 transition-colors">
            Studio
          </Link>
          <span className="text-zinc-700">|</span>
          <span>Powered by Real-ESRGAN & Stripe</span>
        </div>
      </div>
    </footer>
  );
}
