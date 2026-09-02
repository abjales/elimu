import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { users, subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Update user as Pro
          await db
            .update(users)
            .set({
              proSince: new Date(),
            })
            .where(eq(users.id, userId));

          // Store subscription
          await db.insert(subscriptions).values({
            userId,
            stripeSubId: subscription.id,
            plan: subscription.items.data[0].price.id === process.env.STRIPE_PRO_ANNUAL_PRICE_ID
              ? 'annual'
              : 'monthly',
            status: 'active',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Update subscription period
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await db
            .update(subscriptions)
            .set({
              status: 'active',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            })
            .where(eq(subscriptions.stripeSubId, subscriptionId));
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Update subscription status
        await db
          .update(subscriptions)
          .set({ status: 'canceled' })
          .where(eq(subscriptions.stripeSubId, subscription.id));

        // Remove Pro status from user
        const sub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripeSubId, subscription.id),
        });

        if (sub) {
          await db
            .update(users)
            .set({ proSince: null })
            .where(eq(users.id, sub.userId));
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Update subscription status
        const status = subscription.status === 'active' ? 'active' :
                       subscription.status === 'past_due' ? 'past_due' : 'canceled';

        await db
          .update(subscriptions)
          .set({
            status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          })
          .where(eq(subscriptions.stripeSubId, subscription.id));
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
