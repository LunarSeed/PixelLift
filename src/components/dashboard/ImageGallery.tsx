'use client';

import React from 'react';
import { ImageResult } from '@/types';
import { formatDate } from '@/lib/utils';
import { Sparkles, Download, Clock, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

interface ImageGalleryProps {
  images: ImageResult[];
  onSelectImage?: (originalUrl: string, enhancedUrl: string) => void;
}

export function ImageGallery({ images, onSelectImage }: ImageGalleryProps) {
  const { toast } = useToast();

  const handleDownload = async (url: string, id: string) => {
    try {
      toast.info('Downloading past enhanced image...');
      if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `pixellift-${id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `pixellift-${id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }
      toast.success('Download ready!');
    } catch {
      window.open(url, '_blank');
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/30 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mx-auto mb-4 text-zinc-400">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-white mb-1">No Upscaled Images Yet</h4>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Upload your first low-resolution image above to see your enhanced results archived here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Recent Upscale Gallery</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Your previously processed assets stored with full 4x resolution.
          </p>
        </div>
        <Badge variant="brand" className="text-xs">
          {images.length} {images.length === 1 ? 'Asset' : 'Assets'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-zinc-700 transition-all duration-300 shadow-lg hover:-translate-y-1"
          >
            {/* Image Preview Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.enhancedUrl}
                alt="Enhanced result"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Badge Overlay */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-brand-500/30 text-brand-300 text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-brand-400" />
                <span>{img.scaleFactor}x Upscale</span>
              </div>
            </div>

            {/* Card Details Footer */}
            <div className="p-4 flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/90">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(img.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                {onSelectImage && (
                  <button
                    onClick={() => onSelectImage(img.originalUrl, img.enhancedUrl)}
                    className="text-xs text-zinc-400 hover:text-white transition-colors underline-offset-2 hover:underline"
                  >
                    Compare
                  </button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(img.enhancedUrl, img.id)}
                  className="h-8 px-2.5 text-xs text-brand-300 hover:text-white"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
