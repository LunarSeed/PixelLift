'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  const updateSlider = useCallback((clientX: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const rect = rectRef.current || containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;

      const x = clientX - rect.left;
      const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      setSliderPosition(percentage);
    });
  }, []);

  const startDragging = (clientX: number) => {
    isDraggingRef.current = true;
    if (containerRef.current) {
      // Cache bounding box once on click/touch start to prevent layout thrashing during drag
      rectRef.current = containerRef.current.getBoundingClientRect();
    }
    updateSlider(clientX);
  };

  const stopDragging = () => {
    isDraggingRef.current = false;
    rectRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-brand-950/40 cursor-ew-resize group contain-paint ${className}`}
      onMouseDown={(e) => startDragging(e.clientX)}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onMouseMove={(e) => {
        if (!isDraggingRef.current) return;
        updateSlider(e.clientX);
      }}
      onTouchStart={(e) => startDragging(e.touches[0].clientX)}
      onTouchEnd={stopDragging}
      onTouchMove={(e) => {
        if (!isDraggingRef.current) return;
        updateSlider(e.touches[0].clientX);
      }}
    >
      {/* Background (Enhanced / High-Res) */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={enhancedImage}
          alt="Enhanced HD Output"
          decoding="async"
          className="w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Enhanced Badge */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/85 backdrop-blur-md border border-brand-500/30 text-brand-300 text-xs font-semibold shadow-lg pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>{enhancedLabel}</span>
        </div>
      </div>

      {/* Foreground Clipped (Original / Low-Res) - GPU Accelerated via clipPath */}
      <div
        className="absolute inset-0 overflow-hidden will-change-[clip-path]"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={originalImage}
          alt="Original Low-Res Input"
          decoding="async"
          className="w-full h-full object-cover filter blur-[1.5px] contrast-90 pointer-events-none select-none transform-gpu"
        />

        {/* Original Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/85 backdrop-blur-md border border-zinc-700 text-zinc-300 text-xs font-medium shadow-lg pointer-events-none">
          <span>{originalLabel}</span>
        </div>
      </div>

      {/* Draggable Divider Line & Handle */}
      <div
        className="absolute top-0 bottom-0 z-30 w-0.5 bg-gradient-to-b from-brand-400 via-accent-cyan to-brand-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] pointer-events-none will-change-[left]"
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

