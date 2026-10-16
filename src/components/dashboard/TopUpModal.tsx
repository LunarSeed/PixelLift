'use client';

import React, { useState } from 'react';
import { Sparkles, CreditCard, ShieldCheck, Zap, PlusCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
}

export function TopUpModal({ isOpen, onClose, userId, onSuccess }: TopUpModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Checkout failed (Status ${res.status})`);
      }

      if (data.url) {
        // Redirect directly to Stripe hosted checkout page
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from Stripe');
      }
    } catch (err: any) {
      console.error('[Checkout Error]:', err);
      toast.error(err?.message || 'Failed to process checkout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Upscaling Credits"
      description="Refill your account balance instantly with zero recurring subscriptions."
    >
      <div className="space-y-6 pt-2">
        {/* Pack Selection Card */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border-2 border-brand-500/60 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Starter Pack</span>
              </div>
              <h4 className="text-xl font-bold text-white">50 Neural Credits</h4>
              <p className="text-xs text-zinc-400 mt-1">Reconstruct up to 50 photos in 4K resolution</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-white">$5.00</span>
              <p className="text-xs text-zinc-400 font-medium">$0.10 / image</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-300">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Real-ESRGAN 4x AI Model
            </span>
            <span className="text-emerald-400 font-medium">Never expires</span>
          </div>
        </div>

        {/* Value Proposition List */}
        <div className="space-y-2 text-xs text-zinc-400 bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/60">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-brand-400" />
            <span>Instant balance credit as soon as payment is confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secured via Stripe with 256-bit SSL encryption</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="w-1/3">
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleCheckout}
            isLoading={isLoading}
            className="w-2/3"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay $5 with Stripe
          </Button>
        </div>
      </div>
    </Modal>
  );
}
