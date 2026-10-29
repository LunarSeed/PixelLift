import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import sharp from 'sharp';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Helper: Compress uploaded File to a lightweight WebP Base64 Data URL for permanent "Compare" slider
async function fileToCompressedDataUrl(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const compressedBuffer = await sharp(inputBuffer)
      .rotate() // Preserve EXIF orientation
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    return `data:image/webp;base64,${compressedBuffer.toString('base64')}`;
  } catch (err) {
    console.warn('[Enhance API] Could not compress original upload:', err);
    return file.name || 'uploaded_file';
  }
}

// Helper: Fetch 20MB+ Replicate PNG and compress to full-resolution 5K WebP (~800KB-1.5MB)
async function persistReplicateUrl(tempUrl: string): Promise<string> {
  try {
    const res = await fetch(tempUrl);
    if (!res.ok) return tempUrl;

    const arrayBuffer = await res.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // Keep full 4x pixel dimensions (e.g. 3372x5056), convert uncompressed PNG -> crisp WebP
    let webpBuffer = await sharp(rawBuffer)
      .webp({ quality: 88, effort: 4 })
      .toBuffer();

    // Secondary safety pass: if an ultra-dense 8K texture still exceeds 2.8MB, dial quality to 75
    if (webpBuffer.byteLength > 2.8 * 1024 * 1024) {
      webpBuffer = await sharp(rawBuffer)
        .webp({ quality: 75, effort: 4 })
        .toBuffer();
    }

    // Final Vercel 4.5MB JSON payload guardrail
    if (webpBuffer.byteLength > 3.4 * 1024 * 1024) {
      return tempUrl;
    }

    return `data:image/webp;base64,${webpBuffer.toString('base64')}`;
  } catch (err) {
    console.warn('[Enhance API] Sharp compression failed, falling back to URL:', err);
    return tempUrl;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    let image: File | string | null = null;
    let userId = clerkUserId || 'usr_demo_pixellift';
    let scale = 4;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      image = body.image || body.imageUrl || null;
      userId = body.userId || userId;
      scale = Number(body.scale) || 4;
    } else {
      const formData = await req.formData();
      const fileEntry = formData.get('image');
      if (fileEntry instanceof File || (typeof fileEntry === 'object' && fileEntry !== null)) {
        image = fileEntry as File;
      } else if (typeof fileEntry === 'string') {
        image = fileEntry;
      }
      userId = (formData.get('userId') as string) || userId;
      scale = Number(formData.get('scale')) || 4;
    }

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided. Please upload a file in the image field.' },
        { status: 400 }
      );
    }

    // 1. Verify user has at least 1 credit
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: userId.includes('@') ? userId : `${userId}@pixellift.internal` },
        ],
      },
    });

    if (!user || user.credits < 1) {
      return NextResponse.json(
        {
          error: 'Insufficient credits. You need at least 1 credit to upscale an image.',
          credits: user ? user.credits : 0,
        },
        { status: 402 }
      );
    }

    // Compress original upload into permanent WebP Data URL for the Before/After comparison slider
    let permanentOriginalUrl = 'uploaded_file';
    if (image instanceof File) {
      permanentOriginalUrl = await fileToCompressedDataUrl(image);
    } else if (typeof image === 'string') {
      permanentOriginalUrl = image;
    }

    // 2. Run Replicate Real-ESRGAN model
    const output = await replicate.run(
      'nightmareai/real-esrgan:b0bb4c529bb749ac98145e70f42f88d36598e89310beeeba4ee00e14238d1b4d',
      {
        input: {
          image: image,
          scale: scale,
        },
      }
    );

    // Extract temporary Replicate delivery URL
    let replicateUrl = '';
    if (output && typeof (output as { url?: () => URL | string }).url === 'function') {
      const u = (output as { url: () => URL | string }).url();
      replicateUrl = typeof u === 'string' ? u : u.href || u.toString();
    } else if (typeof output === 'string') {
      replicateUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      const item = output[0];
      replicateUrl =
        item && typeof item.url === 'function'
          ? item.url().href || item.url().toString()
          : String(item);
    } else {
      replicateUrl = String(output);
    }

    if (!replicateUrl) {
      throw new Error('Replicate did not return an enhanced image URL');
    }

    // Compress 20MB+ PNG into full-resolution WebP Base64 Data URL (~1MB)
    const permanentEnhancedUrl = await persistReplicateUrl(replicateUrl);

    // 3. Deduct 1 credit & save permanent image record in Neon DB
    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: { decrement: 1 },
        },
      });

      await tx.creditHistory.create({
        data: {
          userId: user.id,
          amount: -1,
          action: 'USAGE',
          description: `Upscaled image (${scale}x enhancement)`,
        },
      });

      await tx.imageResult.create({
        data: {
          userId: user.id,
          originalUrl: permanentOriginalUrl,
          enhancedUrl: permanentEnhancedUrl,
          scaleFactor: scale,
        },
      });

      return u;
    });

    return NextResponse.json({
      success: true,
      enhancedUrl: permanentEnhancedUrl,
      output: permanentEnhancedUrl,
      url: permanentEnhancedUrl,
      creditsRemaining: updatedUser.credits,
      credits: updatedUser.credits,
    });
  } catch (error) {
    console.error('Enhance API error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to enhance image' },
      { status: 500 }
    );
  }
}
