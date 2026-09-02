import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiClassrooms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    // Verify webhook secret
    const webhookSecret = process.env.OPENMAIC_WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${webhookSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { jobId, status, classroomUrl } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    // Update classroom status
    await db
      .update(aiClassrooms)
      .set({
        status: status === 'completed' ? 'ready' : status === 'failed' ? 'failed' : 'generating',
        classroomUrl: classroomUrl || null,
      })
      .where(eq(aiClassrooms.openmaicJobId, jobId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
