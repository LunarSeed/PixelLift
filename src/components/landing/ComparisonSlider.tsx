'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, ArrowLeftRight } from 'lucide-react';

interface ComparisonSliderProps {
  originalImage?: string;
  enhancedImage?: string;
  originalLabel?: string;
  enhancedLabel?: string;
  className?: string;
}

export function ComparisonSlider({
  originalImage = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=20',
  enhancedImage = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=100',
  originalLabel = 'Original (Low-Res 480p)',
  enhancedLabel = 'PixelLift AI (4x 4K Ultra-HD)',
  className = '',
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-brand-950/40 cursor-ew-resize group ${className}`}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
      onTouchEnd={() => setIsDragging(false)}
      onTouchMove={handleTouchMove}
    >
      {/* Background (Enhanced / High-Res) */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={enhancedImage}
          alt="Enhanced HD Output"
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* Enhanced Badge */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/85 backdrop-blur-md border border-brand-500/30 text-brand-300 text-xs font-semibold shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>{enhancedLabel}</span>
        </div>
      </div>

      {/* Foreground Clipped (Original / Low-Res) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="relative w-full h-full aspect-[4/3] md:aspect-[16/10]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalImage}
            alt="Original Low-Res Input"
            className="absolute top-0 left-0 w-full h-full object-cover filter blur-[1.5px] contrast-90 pointer-events-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              maxWidth: 'none',
            }}
          />

          {/* Original Badge */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/85 backdrop-blur-md border border-zinc-700 text-zinc-300 text-xs font-medium shadow-lg">
            <span>{originalLabel}</span>
          </div>
        </div>
      </div>

      {/* Draggable Divider Line & Handle */}
      <div
        className="absolute top-0 bottom-0 z-30 w-0.5 bg-gradient-to-b from-brand-400 via-accent-cyan to-brand-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-zinc-900/95 border-2 border-brand-400 text-brand-300 shadow-xl shadow-brand-500/30 flex items-center justify-center transition-transform group-hover:scale-110 active:scale-95">
          <ArrowLeftRight className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Accessible Slider Input for Screen Readers / Keyboard Navigation */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="sr-only"
        aria-label="Comparison slider position"
      />
    </div>
  );
}
