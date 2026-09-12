'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-gradient-to-b from-[#f0f7f3] to-white">
      <Card className="w-full max-w-md border-border shadow-lg rounded-2xl">
        <CardHeader className="text-center pt-8">
          <div className="flex justify-center mb-4">
            <Image src="/logo-icon.svg" alt="Elimu Africa" width={48} height={48} className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl text-[#111310]">Reset your password</CardTitle>
          <CardDescription className="text-[#7a7468]">
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
                If an account exists for {email}, we&apos;ve sent a password reset link. It expires in 1 hour.
              </div>
              <p className="text-sm text-[#7a7468]">
                Didn&apos;t get it?{' '}
                <button onClick={() => setSent(false)} className="text-[#1a6b3c] hover:text-[#0d3d22] font-medium">
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border focus:ring-[#1a6b3c]/20 focus:border-[#1a6b3c]"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center pb-8">
          <p className="text-sm text-[#7a7468]">
            Remembered it?{' '}
            <Link href="/login" className="text-[#1a6b3c] hover:text-[#0d3d22] font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}