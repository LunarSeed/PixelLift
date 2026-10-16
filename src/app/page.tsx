import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { ComparisonSlider } from '@/components/landing/ComparisonSlider';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { PricingCard } from '@/components/landing/PricingCard';
import { Footer } from '@/components/landing/Footer';
import { Sparkles, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Interactive Comparison Demo Section */}
        <section id="demo" className="py-20 relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-cyan/10 text-cyan-400 text-xs font-semibold border border-accent-cyan/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Comparison Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Drag the Slider to Witness Neural Clarity
            </h2>
            <p className="mt-3 text-zinc-400 text-sm sm:text-base">
              Original low-resolution portrait (480p) vs. PixelLift 4x Real-ESRGAN enhanced output (4K).
              Notice the restored eyelash fidelity, skin pores, and crystal clear lighting.
            </p>
          </div>

          <div className="relative mx-auto max-w-4xl shadow-2xl rounded-2xl p-2 bg-gradient-to-b from-brand-500/20 via-zinc-800/40 to-transparent">
            <ComparisonSlider
              originalImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=20"
              enhancedImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=100"
              originalLabel="Original (Low-Res 480p Blurry)"
              enhancedLabel="PixelLift (4x Real-ESRGAN 4K)"
            />
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="gradient" size="md">
                <span>Enhance Your Own Image Now</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* 3-Step How It Works Section */}
        <HowItWorks />

        {/* Featured Pricing Section */}
        <PricingCard />

        {/* Call-to-action bottom banner */}
        <section className="py-20 border-t border-zinc-900 bg-gradient-to-b from-zinc-950 to-brand-950/20 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Ready to Breathe New Life into Your Low-Res Photos?
            </h3>
            <p className="text-zinc-400 text-base mb-8 max-w-xl mx-auto">
              Get started in under 30 seconds. Includes 5 complimentary starter credits to test the neural engine.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button variant="gradient" size="lg" className="px-8 shadow-xl shadow-brand-500/25">
                  Launch Studio Free
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="secondary" size="lg" className="px-8">
                  Get 50 Credits for $5
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
