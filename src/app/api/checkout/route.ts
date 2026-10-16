import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Use Clerk's auth() to get the current userId. If unauthorized, return a 401.
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be signed in to purchase credits.' },
        { status: 401 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    if (!process.env.STRIPE_PRICE_ID) {
      return NextResponse.json(
        { error: 'STRIPE_PRICE_ID is not configured on the server.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia' as any,
    });

    let priceId = process.env.STRIPE_PRICE_ID;
    // Gracefully handle if product ID (prod_...) was provided instead of price ID (price_...)
    if (priceId.startsWith('prod_')) {
      const prices = await stripe.prices.list({ product: priceId, active: true, limit: 1 });
      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
      }
    }

    // 2. Call stripe.checkout.sessions.create() with required routing URLs
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
      client_reference_id: userId,
      success_url: 'http://localhost:3000/dashboard',
      cancel_url: 'http://localhost:3000/',
    });

    // 3. Return JSON containing url
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe Checkout Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize Stripe checkout session' },
      { status: 500 }
    );
  }
}
