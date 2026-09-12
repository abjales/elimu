'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { MpesaCheckout, type Plan } from '@/components/mpesa-checkout';

// Pro prices in KES, displayed client-side. These are public (the advertised
// price) and must match the server-side MPESA_PRO_*_AMOUNT_KSHS values that
// the actual charge is validated against.
const PRO_MONTHLY = process.env.NEXT_PUBLIC_MPESA_PRO_MONTHLY_AMOUNT_KSHS || '2100';
const PRO_ANNUAL = process.env.NEXT_PUBLIC_MPESA_PRO_ANNUAL_AMOUNT_KSHS || '7500';
const PRO_LIFETIME = process.env.NEXT_PUBLIC_MPESA_PRO_LIFETIME_AMOUNT_KSHS || '15000';

function kes(n: string) {
  return `KES ${Number(n).toLocaleString('en-KE')}`;
}

type Tier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta?: string;
  ctaLink?: string;
  plan?: Plan;
  highlighted: boolean;
  badge?: string;
};

const tiers: Tier[] = [
  {
    name: 'Free',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for getting started with AI learning',
    features: [
      'Access to all free courses',
      'AI-generated interactive lessons',
      'Basic quizzes and exercises',
      '3 AI classrooms per month',
      'Community support',
    ],
    cta: 'Get Started Free',
    ctaLink: '/register',
    highlighted: false,
  },
  {
    name: 'Monthly',
    price: kes(PRO_MONTHLY),
    period: '/month',
    description: 'Flexible, pay as you go',
    features: [
      'Everything in Free',
      'All master class courses',
      'Unlimited AI classrooms',
      'Upload documents for custom lessons',
      'Priority AI teacher responses',
      'Certificate of completion',
    ],
    plan: 'monthly',
    highlighted: false,
  },
  {
    name: 'Annual',
    price: kes(PRO_ANNUAL),
    period: '/year',
    description: 'Best value — save over 70% vs monthly',
    features: [
      'Everything in Monthly',
      'Save over KES 17,000 a year',
      'Unlimited AI classrooms',
      'Priority AI teacher responses',
      'Certificate of completion',
      'Cancel anytime',
    ],
    plan: 'annual',
    highlighted: true,
    badge: 'Best Value',
  },
  {
    name: 'Lifetime',
    price: kes(PRO_LIFETIME),
    period: 'one-time',
    description: 'Pay once, own it forever',
    features: [
      'Everything in Annual',
      'One-time payment, never renews',
      'Lifetime access to all courses',
      'All future course releases included',
      'Priority support',
    ],
    plan: 'lifetime',
    highlighted: false,
    badge: 'Forever Access',
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="text-center mb-10 md:mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1a6b3c] mb-3">PRICING</p>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#f0f7f3] px-4 py-1.5 text-sm font-medium text-[#1a6b3c] mb-4">
          <Sparkles className="h-4 w-4" />
          Simple Pricing
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-[#111310] font-[family-name:var(--font-playfair)]">Choose Your Learning Plan</h1>
        <p className="text-base md:text-lg text-[#7a7468] max-w-2xl mx-auto">
          Start free and upgrade when you need more. All paid plans unlock our
          AI-powered interactive classrooms.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6 max-w-6xl mx-auto">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`relative border rounded-2xl flex flex-col ${
              tier.highlighted
                ? 'border-[#e8b84b] shadow-xl shadow-[#e8b84b]/10'
                : 'border-[rgba(17,19,16,0.10)]'
            }`}
          >
            {tier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#e8b84b] text-[#111310] text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                  {tier.badge}
                </span>
              </div>
            )}
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2 text-[#111310]">{tier.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-bold text-[#111310] font-[family-name:var(--font-dm-mono)]">{tier.price}</span>
                  <span className="text-[#7a7468]">{tier.period}</span>
                </div>
                <p className="text-sm text-[#7a7468] mt-2">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${tier.highlighted ? 'text-[#1a6b3c]' : 'text-[#7a7468]'}`} />
                    <span className="text-stone-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.plan ? (
                <MpesaCheckout plan={tier.plan} />
              ) : (
                <Button
                  className="w-full rounded-full bg-[#111310] hover:bg-[#111310]/90 text-white"
                  asChild
                >
                  <Link href={tier.ctaLink!}>{tier.cta}</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16 md:mt-24 max-w-3xl mx-auto">
        <h2 className="text-xl md:text-3xl font-bold text-center mb-8 text-[#111310] font-[family-name:var(--font-playfair)]">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-border pb-6">
            <h3 className="font-semibold mb-2 text-[#111310]">Can I cancel my Pro subscription?</h3>
            <p className="text-[#7a7468] text-sm">
              Yes, you can cancel anytime from your account settings. You&apos;ll continue to have
              access until the end of your billing period.
            </p>
          </div>
          <div className="border-b border-border pb-6">
            <h3 className="font-semibold mb-2 text-[#111310]">What payment methods do you accept?</h3>
            <p className="text-[#7a7468] text-sm">
              We accept payment via M-Pesa (Lipa na M-Pesa) through Safaricom&apos;s secure Daraja
              API.
            </p>
          </div>
          <div className="border-b border-border pb-6">
            <h3 className="font-semibold mb-2 text-[#111310]">Is there a free trial?</h3>
            <p className="text-[#7a7468] text-sm">
              The Free plan gives you permanent access to basic features so you can explore the
              platform before upgrading. There is no separate trial — you can upgrade or cancel
              anytime.
            </p>
          </div>
          <div className="pb-2">
            <h3 className="font-semibold mb-2 text-[#111310]">How do AI classrooms work?</h3>
            <p className="text-[#7a7468] text-sm">
              Describe any topic or upload documents, and our AI teachers create a full
              interactive lesson with slides, quizzes, whiteboard diagrams, and real-time
              discussions. You learn from multiple AI agents who lecture, debate, and answer
              your questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
