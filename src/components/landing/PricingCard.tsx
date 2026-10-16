'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

export function PricingCard() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Please sign in or create an account to purchase credits.');
          return;
        }
        throw new Error(data.error || `Checkout failed (Status ${res.status})`);
      }

      if (data.url) {
        // Redirect the user to the Stripe hosted checkout page
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from Stripe');
      }
    } catch (err: any) {
      console.error('[Checkout Error]:', err);
      toast.error(err?.message || 'Unable to connect to Stripe checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    '50 Ultra-HD AI Upscales (Just $0.10 / photo)',
    'Real-ESRGAN v0.2 Deep Neural Processing',
    '4x Super-Resolution (Reconstructs up to 4K / 8K)',
    'Intelligent Face & Portrait Restoration',
    'Interactive Side-by-Side Comparison Studio',
    'Instant Uncompressed 1-Click PNG/JPG Export',
    'Credits Never Expire',
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="brand" className="mb-3">
            <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay-As-You-Go
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Simple, Transparent Micro-Pricing
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            No recurring monthly subscriptions. Buy credits when you need them.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="relative rounded-3xl p-8 sm:p-10 bg-zinc-900/90 border-2 border-brand-500/50 shadow-2xl shadow-brand-500/15 backdrop-blur-xl">
            {/* Top Popular pill */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-brand-500 to-accent-cyan text-white shadow-md shadow-brand-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Starter Pack
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-6 pt-2">
              <div>
                <h3 className="text-2xl font-bold text-white">50 Credits Pack</h3>
                <p className="text-xs text-zinc-400 mt-1">Perfect for creators, designers & photographers</p>
              </div>
              <div className="text-right">
                <span className="text-5xl font-black text-white tracking-tight">$5</span>
                <span className="text-zinc-400 text-sm font-medium ml-1">/ one-time</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 mb-8 flex items-center justify-between text-xs text-zinc-300">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                Cost per upscale:
              </span>
              <span className="font-bold text-brand-300 text-sm">$0.10 / image</span>
            </div>

            {/* Features List */}
            <ul className="space-y-3.5 mb-10 text-sm text-zinc-300">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Direct Stripe Checkout Button */}
            <Button
              variant="gradient"
              size="lg"
              className="w-full text-base py-4 font-bold tracking-wide"
              onClick={handleCheckout}
              isLoading={isLoading}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Get 50 Credits for $5
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              <span>Encrypted 256-bit Stripe Checkout & Webhook Sync</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
