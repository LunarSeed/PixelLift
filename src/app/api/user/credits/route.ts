import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, getUserHistoryAndImages, addCredits } from '@/lib/db-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'usr_demo_pixellift';

    const user = await getOrCreateUser({ id: userId });
    const { history, images } = await getUserHistoryAndImages(userId);

    return NextResponse.json({
      user,
      credits: user.credits,
      history,
      images,
    });
  } catch (error) {
    console.error('[API User Credits Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user credits' },
      { status: 500 }
    );
  }
}

// Optional dev helper endpoint to add test credits directly from UI
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || 'usr_demo_pixellift';
    const amount = Number(body.amount) || 10;

    await getOrCreateUser({ id: userId });
    const result = await addCredits(userId, amount, `Manual Test Credit Top-up (+${amount})`);

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
