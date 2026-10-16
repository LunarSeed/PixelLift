import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia' as any,
      typescript: true,
    })
  : null;

export const CREDIT_PACK_DETAILS = {
  priceCents: 500, // $5.00
  credits: 50,
  name: 'PixelLift Starter Pack (50 Credits)',
  description: '50 High-Resolution AI Image Upscales with Real-ESRGAN (4x Super-Resolution)',
};

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_'));
}
