'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Dropzone } from '@/components/dashboard/Dropzone';
import { ProcessingPreview } from '@/components/dashboard/ProcessingPreview';
import { ImageGallery } from '@/components/dashboard/ImageGallery';
import { TopUpModal } from '@/components/dashboard/TopUpModal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ImageResult } from '@/types';
import { Sparkles, Loader2 } from 'lucide-react';

const DEMO_USER_ID = 'usr_demo_pixellift';

function DashboardContent() {
  const [credits, setCredits] = useState<number>(5);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // Active processing workflow state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMockResult, setIsMockResult] = useState(false);

  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Load user balance and recent image gallery
  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch(`/api/user/credits?userId=${DEMO_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits ?? 5);
        if (data.images) {
          setImages(data.images);
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Handle URL payment redirect callbacks
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      toast.success('Payment confirmed! +50 credits added to your account.');
      fetchUserData();
    } else if (payment === 'cancelled') {
      toast.info('Checkout was cancelled. No charges were made.');
    }
  }, [searchParams, toast, fetchUserData]);

  // Core enhance function: sends FormData with image file (or JSON for URL) to /api/enhance
  const enhanceImage = async (fileOrUrl: File | string) => {
    if (!fileOrUrl) {
      toast.error('Please upload an image first.');
      return;
    }

    if (credits < 1) {
      toast.error('Insufficient credits! Please top up to proceed.');
      setIsTopUpOpen(true);
      return;
    }

    try {
      setIsProcessing(true);
      let res: Response;

      if (fileOrUrl instanceof File) {
        const formData = new FormData();
        formData.append('image', fileOrUrl);
        formData.append('userId', DEMO_USER_ID);
        formData.append('scale', '4');

        res = await fetch('/api/enhance', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: fileOrUrl,
            imageUrl: fileOrUrl,
            userId: DEMO_USER_ID,
            scale: 4,
          }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          toast.error(data.error || 'Insufficient credits. Please top up your balance.');
          setIsTopUpOpen(true);
          return;
        }
        throw new Error(data.error || 'Failed to enhance image');
      }

      const resultUrl = data.enhancedUrl || data.output || data.url;
      if (!resultUrl) {
        throw new Error('No enhanced image URL returned by the endpoint');
      }

      setEnhancedImageUrl(resultUrl);
      setIsMockResult(Boolean(data.isMock));
      if (typeof data.creditsRemaining === 'number') {
        setCredits(data.creditsRemaining);
      }

      toast.success('Image upscaled to 4x resolution successfully!');
      fetchUserData();
    } catch (err) {
      console.error('[API Enhance Error]:', err);
      toast.error((err as Error).message || 'Upscaling failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag-and-drop file upload handler: triggers upload and enhance
  const handleFileSelect = async (file: File, base64: string) => {
    setSelectedFile(file);
    setOriginalImageUrl(base64);
    setEnhancedImageUrl(null);
    await enhanceImage(file);
  };

  const handleEnhance = () => {
    if (selectedFile) {
      enhanceImage(selectedFile);
    } else if (originalImageUrl) {
      enhanceImage(originalImageUrl);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setOriginalImageUrl(null);
    setEnhancedImageUrl(null);
    setIsProcessing(false);
  };

  const handleSelectFromGallery = (orig: string, enh: string) => {
    setOriginalImageUrl(orig);
    setEnhancedImageUrl(enh);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col pb-20">
      <DashboardHeader
        credits={credits}
        onOpenTopUp={() => setIsTopUpOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-8 space-y-12">
        {/* Top welcome & action banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Upscaling Studio</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Drag and drop an image to upscale to 4K resolution using Replicate Real-ESRGAN in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTopUpOpen(true)}
              className="text-xs"
            >
              Buy Credits ($5 / 50)
            </Button>
          </div>
        </div>

        {/* Upload Zone & Enhance Controls */}
        <section className="space-y-6">
          {!enhancedImageUrl ? (
            <div className="space-y-6">
              <Dropzone
                onFileSelect={handleFileSelect}
                isProcessing={isProcessing}
                userCredits={credits}
                onOpenTopUp={() => setIsTopUpOpen(true)}
              />

              {originalImageUrl && !isProcessing && !enhancedImageUrl && (
                <div className="flex items-center justify-end gap-3">
                  <Button variant="secondary" onClick={handleReset}>
                    Cancel
                  </Button>
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={handleEnhance}
                    isLoading={isProcessing}
                    className="shadow-xl shadow-brand-500/25 px-8"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upscale 4x (Uses 1 Credit)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <ProcessingPreview
              originalImage={originalImageUrl!}
              enhancedImage={enhancedImageUrl}
              isProcessing={isProcessing}
              isMock={isMockResult}
              onReset={handleReset}
            />
          )}

          {/* Secondary preview during active processing */}
          {isProcessing && originalImageUrl && !enhancedImageUrl && (
            <ProcessingPreview
              originalImage={originalImageUrl}
              enhancedImage={null}
              isProcessing={true}
              isMock={isMockResult}
              onReset={handleReset}
            />
          )}
        </section>

        {/* Gallery of Past Upscaled Results */}
        <section className="pt-8 border-t border-zinc-900">
          <ImageGallery
            images={images}
            onSelectImage={handleSelectFromGallery}
          />
        </section>
      </main>

      {/* Top Up Credit Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        userId={DEMO_USER_ID}
        onSuccess={fetchUserData}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400 mb-3" />
          <p className="text-sm">Loading PixelLift Studio...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
