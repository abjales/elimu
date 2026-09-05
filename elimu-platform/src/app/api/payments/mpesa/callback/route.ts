import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { extractCallbackAmount, extractReceiptNumber } from '@/lib/mpesa';

/**
 * Safaricom M-Pesa STK Push callback (server-to-server, no auth header).
 * Safaricom POSTs a JSON body with a `Body.stkCallback` object. We match the
 * `CheckoutRequestID` against a pending payment we recorded, verify the amount,
 * then (idempotently) mark it completed and activate the user's Pro plan.
 *
 * We always return 200 to Safaricom so it does not retry a malformed/spam
 * callback against us; any real failure is handled by our query/status path.
 */

interface StkCallbackBody {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number;
      ResultDesc?: string;
      BusinessShortCode?: string;
      CallbackMetadata?: { Item?: Array<{ Name?: string; Value?: unknown }> };
    };
  };
}

export async function POST(request: Request) {
  let body: StkCallbackBody;
  try {
    body = (await request.json()) as StkCallbackBody;
  } catch {
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  const cb = body.Body?.stkCallback;
  if (!cb) {
    console.error('M-Pesa callback missing Body.stkCallback:', JSON.stringify(body));
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  const checkoutRequestId = cb.CheckoutRequestID;
  if (!checkoutRequestId) {
    console.error('M-Pesa callback missing CheckoutRequestID:', JSON.stringify(body));
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  // Verify BusinessShortCode matches ours when Safaricom includes it.
  const expectedShortcode = process.env.MPESA_SHORTCODE;
  if (expectedShortcode && cb.BusinessShortCode && cb.BusinessShortCode !== expectedShortcode) {
    console.error(
      `M-Pesa callback shortcode mismatch: got ${cb.BusinessShortCode}, expected ${expectedShortcode}`
    );
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Rejected' });
  }

  // Find the pending payment this callback belongs to.
  const payment = await db.query.payments.findFirst({
    where: eq(payments.checkoutRequestId, checkoutRequestId),
  });

  if (!payment) {
    // Could be a callback for a payment we don't know (retry, race, or a
    // duplicate). Log and acknowledge without touching any account.
    console.error('M-Pesa callback for unknown CheckoutRequestID:', checkoutRequestId);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  const success = cb.ResultCode === 0;

  // Idempotency: if already finalized, acknowledge and do nothing.
  if (payment.status === 'completed' || payment.status === 'failed') {
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  // Verify amount matches what we charged (anti tamper / mis-config guard).
  if (success) {
    const cbAmount = extractCallbackAmount(cb);
    if (cbAmount !== null && cbAmount !== payment.amount) {
      console.error(
        `M-Pesa callback amount mismatch for ${checkoutRequestId}: got ${cbAmount}, expected ${payment.amount}`
      );
      await db
        .update(payments)
        .set({ status: 'failed', updatedAt: new Date(), rawCallback: cb })
        .where(eq(payments.id, payment.id));
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
  }

  const receipt = success ? extractReceiptNumber(cb) : null;
  const now = new Date();

  // Finalize the payment and (on success) activate Pro in one transaction.
  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({
        status: success ? 'completed' : 'failed',
        mpesaReceiptNumber: receipt ?? null,
        rawCallback: cb,
        updatedAt: now,
        completedAt: success ? now : null,
      })
      .where(eq(payments.id, payment.id));

    if (success) {
      await tx
        .update(users)
        .set({ plan: 'pro', proSince: now })
        .where(eq(users.id, payment.userId));
    }
  });

  console.log(
    `M-Pesa ${success ? 'completed' : 'failed'} for user ${payment.userId} (receipt ${receipt ?? 'n/a'})`
  );

  // Safaricom expects a JSON acknowledgement.
  return NextResponse.json({
    ResultCode: 0,
    ResultDesc: success ? 'Accepted' : 'Rejected',
  });
}
