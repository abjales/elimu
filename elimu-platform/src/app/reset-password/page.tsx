'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      router.push('/login?reset=success');
    } catch (err) {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md border-border shadow-lg rounded-2xl">
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-2xl text-[#111310]">Invalid reset link</CardTitle>
          <CardDescription className="text-[#7a7468]">
            This link is missing a reset token. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center pb-8">
          <Link href="/forgot-password" className="text-[#1a6b3c] hover:text-[#0d3d22] font-medium">
            Request a new link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border shadow-lg rounded-2xl">
      <CardHeader className="text-center pt-8">
        <div className="flex justify-center mb-4">
          <Image src="/logo-icon.svg" alt="Elimu Africa" width={48} height={48} className="h-12 w-12" />
        </div>
        <CardTitle className="text-2xl text-[#111310]">Set a new password</CardTitle>
        <CardDescription className="text-[#7a7468]">Choose a new password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-stone-700">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-border focus:ring-[#1a6b3c]/20 focus:border-[#1a6b3c]"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-stone-700">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="border-border focus:ring-[#1a6b3c]/20 focus:border-[#1a6b3c]"
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-gradient-to-b from-[#f0f7f3] to-white">
      <Suspense
        fallback={
          <Card className="w-full max-w-md border-border shadow-lg rounded-2xl p-8 text-center text-[#7a7468]">
            Loading…
          </Card>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}