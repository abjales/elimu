import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { payments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Poll the status of a pending M-Pesa payment by payment id.
 * The frontend calls this repeatedly after initiating an STK push until the
 * status resolves to `completed` or `failed`/`canceled`.
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId required' }, { status: 400 });
    }

    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, paymentId),
      columns: {
        id: true,
        userId: true,
        plan: true,
        amount: true,
        currency: true,
        status: true,
        mpesaReceiptNumber: true,
        completedAt: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Only the owner (or an admin) may read their own payment.
    const isOwner = payment.userId === (session.user as any).id;
    const isAdmin = (session.user as any).role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('M-Pesa status error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
