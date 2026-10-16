import Replicate from 'replicate';

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export function isReplicateConfigured(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_API_TOKEN.trim().length > 5);
}

export interface EnhanceOptions {
  imageUrl: string;
  scale?: number;
  faceEnhance?: boolean;
}

/**
 * Executes Real-ESRGAN AI model via Replicate using the specified model version.
 */
export async function enhanceImageWithRealESRGAN({
  imageUrl,
  scale = 4,
  faceEnhance = true,
}: EnhanceOptions): Promise<{ enhancedUrl: string }> {
  const output = await replicate.run(
    "nightmareai/real-esrgan:b0bb4c529bb749ac98145e70f42f88d36598e89310beeeba4ee00e14238d1b4d",
    {
      input: {
        image: imageUrl,
        scale,
        face_enhance: faceEnhance,
      },
    }
  );

  let outputUrl = '';
  if (typeof output === 'string') {
    outputUrl = output;
  } else if (Array.isArray(output) && output.length > 0) {
    outputUrl = String(output[0]);
  } else if (output && typeof output === 'object' && 'url' in output) {
    outputUrl =
      typeof (output as any).url === 'function'
        ? (output as any).url().toString()
        : String((output as any).url);
  } else {
    outputUrl = String(output);
  }

  if (!outputUrl) {
    throw new Error('Replicate did not return an output URL');
  }

  return { enhancedUrl: outputUrl };
}
