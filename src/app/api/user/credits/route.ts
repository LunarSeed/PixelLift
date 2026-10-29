import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser, getUserHistoryAndImages, addCredits } from '@/lib/db-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    const { searchParams } = new URL(req.url);

    // Prioritize verified Clerk session ID on the server so users can't spoof another userId
    const activeUserId = clerkUserId || searchParams.get('userId') || 'usr_demo_pixellift';
    const email = searchParams.get('email') || undefined;

    const user = await getOrCreateUser({ id: activeUserId, email });
    const { history, images } = await getUserHistoryAndImages(user.id);

    return NextResponse.json({
      user,
      credits: user.credits,
      history: history || [],
      images: images || [],
    });
  } catch (error) {
    console.error('[API User Credits Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user credits' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    const body = await req.json().catch(() => ({}));
    const activeUserId = clerkUserId || body.userId || 'usr_demo_pixellift';
    const amount = Number(body.amount) || 10;

    const user = await getOrCreateUser({ id: activeUserId });
    const result = await addCredits(user.id, amount, `Manual Test Credit Top-up (+${amount})`);

    return NextResponse.json({
      success: true,
      credits: result.user.credits,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}