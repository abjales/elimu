import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    await db
      .update(users)
      .set({
        plan: 'pro',
        proSince: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true, plan: 'pro' });
  } catch (error) {
    console.error('Upgrade error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
