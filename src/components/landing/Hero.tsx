import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="relative pt-16 pb-20 md:pt-28 md:pb-28 overflow-hidden contain-paint">
      {/* Background Glow effects - isolated on GPU compositor */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-brand-600/15 rounded-full blur-[100px] pointer-events-none transform-gpu will-change-transform translate-z-0" 
      />
      <div 
        aria-hidden="true"
        className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-accent-cyan/10 rounded-full blur-[80px] pointer-events-none transform-gpu will-change-transform translate-z-0" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Top Tagline Badge */}
        <div className="inline-flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Badge variant="brand" className="px-3.5 py-1 text-xs sm:text-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Next-Gen Neural Super-Resolution Engine</span>
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Upscale Any Blurry Image to{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-accent-cyan bg-clip-text text-transparent">
            4K Ultra-HD
          </span>{' '}
          in Seconds
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          PixelLift uses state-of-the-art Real-ESRGAN deep neural networks to reconstruct missing pixels,
          sharpen soft facial textures, and remove heavy compression artifacts.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="gradient" size="lg" className="w-full sm:w-auto px-8 gap-3 group">
              <span>Try PixelLift Free (5 Credits)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href="#demo" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 gap-2">
              <ImageIcon className="w-4 h-4 text-brand-400" />
              <span>See Comparison Demo</span>
            </Button>
          </a>
        </div>

        {/* Social Proof / Key Benefits */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-zinc-400 pt-6 border-t border-zinc-800/60 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-400" />
            <span>400% (4x) Pixel Multiplication</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Face Restoration Neural Pass</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent-cyan" />
            <span>Zero Subscription Lock-in</span>
          </div>
        </div>
      </div>
    </section>
  );
}
