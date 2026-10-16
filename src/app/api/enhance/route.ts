import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { PrismaClient } from '@prisma/client';

export const maxDuration = 60;

// Prisma client singleton for serverless Neon database connection
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest | Request) {
  try {
    let image: File | string | null = null;
    let userId = 'usr_demo_pixellift';
    let scale = 4;

    const contentType = req.headers.get('content-type') || '';

    // Process FormData request
    if (contentType.includes('application/json')) {
      const body = await req.json();
      image = body.image || body.imageUrl || null;
      userId = body.userId || userId;
      scale = Number(body.scale) || 4;
    } else {
      // Extract the uploaded file from the image field of FormData
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

    // 1. Query Neon database first: verify user has at least 1 credit
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
        { status: 402 } // Payment Required
      );
    }

    // 2. Call Replicate Real-ESRGAN model passing the File directly into input.image
    const output = await replicate.run(
      "nightmareai/real-esrgan:b0bb4c529bb749ac98145e70f42f88d36598e89310beeeba4ee00e14238d1b4d",
      {
        input: {
          image: image,
        },
      }
    );

    // Extract URL using output.url() from Replicate FileOutput
    let enhancedUrl = '';
    if (output && typeof (output as any).url === 'function') {
      enhancedUrl = (output as any).url().href || (output as any).url().toString();
    } else if (typeof output === 'string') {
      enhancedUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      const item = output[0];
      enhancedUrl =
        item && typeof item.url === 'function'
          ? item.url().href || item.url().toString()
          : String(item);
    } else {
      enhancedUrl = String(output);
    }

    if (!enhancedUrl) {
      throw new Error('Replicate did not return an enhanced image URL');
    }

    // 3. Deduct 1 credit from user's database record via Prisma transaction before returning
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

      const originalName =
        image instanceof File
          ? image.name
          : typeof image === 'string' && image.length < 500
          ? image
          : 'uploaded_file';

      await tx.imageResult.create({
        data: {
          userId: user.id,
          originalUrl: originalName,
          enhancedUrl,
          scaleFactor: scale,
        },
      });

      return u;
    });

    return NextResponse.json({
      success: true,
      enhancedUrl,
      output: enhancedUrl,
      url: enhancedUrl,
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
