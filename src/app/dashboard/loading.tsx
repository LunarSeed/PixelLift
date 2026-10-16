import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center text-zinc-400">
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
        <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
      </div>
      <p className="text-sm font-medium text-zinc-300">Loading PixelLift Studio...</p>
    </div>
  );
}
