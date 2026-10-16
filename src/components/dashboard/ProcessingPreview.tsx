'use client';

import React, { useState } from 'react';
import { Download, Sparkles, RefreshCw, CheckCircle2, Info, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComparisonSlider } from '@/components/landing/ComparisonSlider';
import { useToast } from '@/components/ui/toast';

interface ProcessingPreviewProps {
  originalImage: string;
  enhancedImage: string | null;
  isProcessing: boolean;
  isMock?: boolean;
  onReset: () => void;
}

export function ProcessingPreview({
  originalImage,
  enhancedImage,
  isProcessing,
  isMock = false,
  onReset,
}: ProcessingPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!enhancedImage) return;

    try {
      setIsDownloading(true);
      toast.info('Preparing your high-resolution download...');

      // Fetch blob or handle direct data URI
      if (enhancedImage.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = enhancedImage;
        a.download = `pixellift-4x-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const response = await fetch(enhancedImage);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `pixellift-4x-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }

      toast.success('4K Image downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Could not download image directly. Opening in new tab.');
      window.open(enhancedImage, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {isProcessing
                ? 'Neural Upscaling in Progress...'
                : enhancedImage
                ? 'Upscaling Complete'
                : 'Processing Preview'}
            </h3>
            {enhancedImage && !isProcessing && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> 4x Super-Res
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {isProcessing
              ? 'Real-ESRGAN deep neural network is reconstructing high-frequency textures'
              : 'Slide back and forth to inspect pixel clarity and edge sharpness'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {enhancedImage && !isProcessing && (
            <>
              <Button variant="outline" size="sm" onClick={onReset} className="text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                New Upscale
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleDownload}
                isLoading={isDownloading}
                className="text-xs font-semibold shadow-lg shadow-brand-500/20"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                1-Click Download (4K)
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mock notice banner */}
      {isMock && enhancedImage && (
        <div className="mb-6 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center gap-3 text-xs text-indigo-300">
          <Info className="w-4 h-4 shrink-0 text-brand-400" />
          <span>
            <strong>Simulation Mode:</strong> Replicate API token is not yet configured, so PixelLift is running in high-fidelity mock mode. Add <code className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-200">REPLICATE_API_TOKEN</code> in your environment for live model calls.
          </span>
        </div>
      )}

      {/* In-flight processing state */}
      {isProcessing && (
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalImage}
            alt="Processing"
            className="absolute inset-0 w-full h-full object-cover filter blur-lg opacity-30"
          />

          <div className="relative z-10 text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-cyan p-0.5 mx-auto mb-5 shadow-xl shadow-brand-500/30 animate-pulse">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-brand-400 animate-spin" />
              </div>
            </div>

            <h4 className="text-lg font-bold text-white mb-2">
              Hallucinating High-Frequency Details...
            </h4>
            <p className="text-xs text-zinc-400 mb-6">
              Applying Real-ESRGAN generative residual blocks to sharpen facial features, lines, and textures.
            </p>

            {/* Neural progress simulation bar */}
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden relative">
              <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-brand-500 via-indigo-400 to-accent-cyan w-full animate-shimmer rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Finished comparison state */}
      {!isProcessing && enhancedImage && (
        <div className="space-y-4">
          <ComparisonSlider
            originalImage={originalImage}
            enhancedImage={enhancedImage}
            originalLabel="Original Input"
            enhancedLabel="PixelLift 4x Ultra-HD"
          />
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1 pt-1">
            <span className="flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-brand-400" /> Drag the slider to compare textures
            </span>
            <span className="text-zinc-400">Scale factor: 400% (4x)</span>
          </div>
        </div>
      )}
    </div>
  );
}
