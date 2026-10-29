'use client';

import React, { useState } from 'react';
import { ImageResult } from '@/types';
import { formatDate } from '@/lib/utils';
import { Sparkles, Download, Clock, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

interface ImageGalleryProps {
  images: ImageResult[];
  onSelectImage?: (originalUrl: string, enhancedUrl: string) => void;
}

export function ImageGallery({ images, onSelectImage }: ImageGalleryProps) {
  const { toast } = useToast();
  const [brokenIds, setBrokenIds] = useState<Record<string, boolean>>({});

  const handleDownload = async (url: string, id: string) => {
    try {
      toast.info('Downloading enhanced image...');
      if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `pixellift-${id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Image link expired');
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
      toast.error('This temporary Replicate link has expired (older than 1 hour).');
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
        {images.map((img) => {
          const isBroken = brokenIds[img.id];
          const isFileNameOnly =
            img.originalUrl &&
            !img.originalUrl.startsWith('http') &&
            !img.originalUrl.startsWith('data:');

          return (
            <div
              key={img.id}
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-zinc-700 transition-all duration-300 shadow-lg hover:-translate-y-1"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                {!isBroken ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={img.enhancedUrl}
                    alt="Enhanced result"
                    onError={() => setBrokenIds((prev) => ({ ...prev, [img.id]: true }))}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-500">
                    <AlertCircle className="w-8 h-8 text-amber-500/70 mb-2" />
                    <p className="text-xs font-semibold text-zinc-300">
                      {isFileNameOnly ? img.originalUrl : 'Replicate Output Expired'}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Replicate CDN links expire after 60 mins
                    </p>
                  </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-brand-500/30 text-brand-300 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-brand-400" />
                  <span>{img.scaleFactor}x Upscale</span>
                </div>
              </div>

              {/* Card Details Footer */}
              <div className="p-4 flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/90">
                <div className="flex flex-col gap-0.5">
                  {isFileNameOnly && (
                    <span className="text-xs font-medium text-zinc-200 truncate max-w-[140px]">
                      {img.originalUrl}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(img.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onSelectImage && !isBroken && !isFileNameOnly && (
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
                    disabled={isBroken}
                    onClick={() => handleDownload(img.enhancedUrl, img.id)}
                    className="h-8 px-2.5 text-xs text-brand-300 hover:text-white disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    {isBroken ? 'Expired' : 'Download'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
