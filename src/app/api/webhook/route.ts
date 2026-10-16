import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { addCredits } from '@/lib/db-service';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const signature = req.headers.get('stripe-signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret || !signature) {
    console.warn('[Stripe Webhook] Webhook credentials or signature not configured');
    return NextResponse.json(
      { error: 'Webhook secret or signature missing' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
  } catch (err) {
    console.error(`[Stripe Webhook Error] Signature verification failed: ${(err as Error).message}`);
    return NextResponse.json(
      { error: `Webhook Signature verification failed: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  // Handle successful checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id;
    const creditsPurchased = parseInt(session.metadata?.credits || '50', 10);

    if (userId) {
      console.log(`[Stripe Webhook] Fulfilling ${creditsPurchased} credits for user: ${userId}`);
      try {
        await addCredits(
          userId,
          creditsPurchased,
          `Purchased ${creditsPurchased} Credits (Stripe Session: ${session.id})`
        );
      } catch (dbError) {
        console.error('[Stripe Webhook DB Error]:', dbError);
        return NextResponse.json(
          { error: 'Failed to record transaction in database' },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
