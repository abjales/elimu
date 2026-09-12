'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Smartphone, CheckCircle2 } from 'lucide-react';

export type Plan = 'monthly' | 'annual' | 'lifetime';

type Step = 'form' | 'pending' | 'success' | 'failed';

export function MpesaCheckout({ plan }: { plan: Plan }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<Step>('form');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!session?.user) {
      // Must sign in (or register) before paying so we can attach the Pro plan.
      router.push(`/register?plan=pro`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not start payment');
        setLoading(false);
        return;
      }
      setStep('pending');
      setMessage(
        data.message || 'An M-Pesa prompt was sent to your phone. Enter your PIN to complete payment.'
      );
      void pollStatus(data.paymentId);
    } catch {
      setError('Network error — please try again.');
      setLoading(false);
    }
  }

  async function pollStatus(paymentId: string) {
    // Poll up to ~2.5 minutes for the callback to resolve the payment.
    for (let i = 0; i < 50; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const res = await fetch(`/api/payments/mpesa/status?paymentId=${paymentId}`);
        if (!res.ok) continue;
        const data = await res.json();
        const status = data.payment?.status;
        if (status === 'completed') {
          setStep('success');
          router.refresh();
          return;
        }
        if (status === 'failed' || status === 'canceled') {
          setStep('failed');
          setError('Payment was not completed. You can try again.');
          return;
        }
      } catch {
        // transient — keep polling
      }
    }
    setStep('failed');
    setError('Payment timed out. If you were charged, contact support for a refund.');
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <CheckCircle2 className="h-10 w-10 text-[#1a6b3c]" />
        <p className="font-semibold text-[#111310]">You&apos;re Pro!</p>
        <p className="text-sm text-[#7a7468]">Your subscription is now active.</p>
        <Button
          className="mt-2 w-full rounded-full bg-[#1a6b3c] hover:bg-[#0d3d22] text-white"
          onClick={() => router.push('/dashboard')}
        >
          Go to dashboard
        </Button>
      </div>
    );
  }

  if (step === 'pending') {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#1a6b3c]" />
        <p className="font-semibold text-[#111310]">Waiting for payment…</p>
        <p className="text-sm text-[#7a7468]">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`mpesa-phone-${plan}`} className="text-stone-700">
          M-Pesa phone number
        </Label>
        <div className="relative">
          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a7468]" />
          <Input
            id={`mpesa-phone-${plan}`}
            type="tel"
            inputMode="numeric"
            placeholder="07XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-9 border-border focus:ring-[#1a6b3c]/20 focus:border-[#1a6b3c]"
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#e8b84b] hover:bg-[#d4a43e] text-[#111310]"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending prompt…
          </>
        ) : (
          'Pay with M-Pesa'
        )}
      </Button>
    </form>
  );
}
