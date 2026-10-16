'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle, FileCheck, X, Loader2 } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface DropzoneProps {
  onFileSelect: (file: File, base64: string) => void;
  isProcessing: boolean;
  userCredits: number;
  onOpenTopUp: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function Dropzone({ onFileSelect, isProcessing, userCredits, onOpenTopUp }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleValidateAndSet = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error('Invalid file type. Please upload a PNG, JPG, or WEBP image.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File size exceeds 10MB limit (Selected: ${formatBytes(file.size)}).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setSelectedFile(file);
        setPreviewUrl(base64);
        onFileSelect(file, base64);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file.');
      };
      reader.readAsDataURL(file);
    },
    [onFileSelect, toast]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleValidateAndSet(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleValidateAndSet(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
        id="image-dropzone-input"
        disabled={isProcessing}
      />

      {!previewUrl ? (
        <div
          data-testid="dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 ${
            isProcessing
              ? 'border-brand-500/50 bg-brand-950/20 cursor-wait'
              : isDragOver
              ? 'border-brand-400 bg-brand-950/25 scale-[1.01] shadow-xl shadow-brand-500/10 cursor-pointer'
              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70 cursor-pointer'
          }`}
        >
          {isProcessing ? (
            <div data-testid="dropzone-loading" className="py-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mx-auto mb-5 text-brand-400">
                <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Enhancing image with Replicate AI...
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-4">
                Processing neural upscale via Real-ESRGAN. Please wait for the enhanced result...
              </p>
              <div className="w-48 h-1.5 rounded-full bg-zinc-800 overflow-hidden relative mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500 via-indigo-400 to-accent-cyan animate-shimmer" />
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mx-auto mb-5 text-brand-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Drag & drop your low-res image here
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">
                Supports <span className="text-zinc-200 font-medium">PNG, JPG, or WEBP</span> up to 10MB.
                Will be upscaled 4x with Real-ESRGAN.
              </p>

              <Button variant="secondary" size="md" type="button" className="pointer-events-none">
                <ImageIcon className="w-4 h-4 mr-2 text-brand-400" />
                Browse from Device
              </Button>

              {userCredits === 0 && (
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-amber-400 bg-amber-500/10 py-2 px-4 rounded-xl border border-amber-500/20 max-w-sm mx-auto">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>You have 0 credits remaining. Please top up to upscale.</span>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Preview image */}
            <div className="relative w-40 h-40 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Selected preview"
                className={`w-full h-full object-cover transition-opacity ${isProcessing ? 'opacity-40 blur-[1px]' : ''}`}
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
                </div>
              )}
            </div>

            {/* Info and metadata */}
            <div className="flex-1 text-center sm:text-left">
              {isProcessing ? (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing with Replicate AI...
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <FileCheck className="w-4 h-4" /> Ready for AI Processing
                </div>
              )}
              <h4 className="text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
                {selectedFile?.name}
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                {isProcessing
                  ? 'Waiting for Replicate response (Real-ESRGAN neural model)...'
                  : `Size: ${formatBytes(selectedFile?.size || 0)} • Target: 4x Super-Resolution (4K)`}
              </p>

              {isProcessing ? (
                <div className="mt-4 w-full max-w-xs mx-auto sm:mx-0 h-1.5 rounded-full bg-zinc-800 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500 via-indigo-400 to-accent-cyan animate-shimmer" />
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    disabled={isProcessing}
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Choose Different Image
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
