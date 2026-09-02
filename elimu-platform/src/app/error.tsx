'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-[#1a6b3c] mb-4 font-[family-name:var(--font-playfair)]">!</p>
        <h1 className="text-2xl font-bold mb-2 text-[#111310]">Something went wrong</h1>
        <p className="text-[#7a7468] mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full">
            Try Again
          </Button>
          <Button variant="outline" asChild className="border-border rounded-full">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
