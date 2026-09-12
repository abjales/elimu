import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { payments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import {
  isMpesaConfigured,
  normalizePhone,
  isValidKenyanPhone,
  proAmountForPlan,
  stkPush,
} from '@/lib/mpesa';

const bodySchema = z.object({
  phone: z.string().min(1, 'Phone number required'),
  plan: z.enum(['monthly', 'annual', 'lifetime']),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isMpesaConfigured()) {
      return NextResponse.json(
        { error: 'M-Pesa payments are not configured yet.' },
        { status: 503 }
      );
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { phone, plan } = parsed.data;
    const normalized = normalizePhone(phone);
    if (!isValidKenyanPhone(normalized)) {
      return NextResponse.json(
        { error: 'Enter a valid Kenyan phone number, e.g. 07XXXXXXXX.' },
        { status: 400 }
      );
    }

    const amount = proAmountForPlan(plan);
    const userId = (session.user as any).id;

    // Persist a pending payment record first so the callback can be matched.
    const [payment] = await db
      .insert(payments)
      .values({
        userId,
        provider: 'mpesa',
        plan,
        amount,
        currency: 'KES',
        phone: normalized,
        status: 'pending',
      })
      .returning();

    let result;
    try {
      result = await stkPush({
        phone: normalized,
        amount,
        accountReference: `ELIMU-${plan.toUpperCase()}`,
        transactionDesc: `ELIMU Pro ${plan} subscription`,
      });
    } catch (err) {
      // STK push failed to initiate — mark the payment failed and surface error.
      await db
        .update(payments)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(payments.id, payment.id));
      console.error('STK push error:', err);
      return NextResponse.json(
        { error: 'Could not start M-Pesa payment. Please try again.' },
        { status: 502 }
      );
    }

    // Store the request IDs returned by Daraja for callback matching.
    await db
      .update(payments)
      .set({
        merchantRequestId: result.merchantRequestId || null,
        checkoutRequestId: result.checkoutRequestId || null,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    // ResponseCode "0" = request accepted by Safaricom.
    if (result.responseCode !== '0') {
      return NextResponse.json(
        {
          error: result.responseDescription || result.customerMessage || 'M-Pesa request rejected',
          paymentId: payment.id,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      paymentId: payment.id,
      checkoutRequestId: result.checkoutRequestId,
      message: result.customerMessage || 'Check your phone and enter your M-Pesa PIN.',
    });
  } catch (error) {
    console.error('M-Pesa STK push route error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
