import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-[#1a6b3c] mb-4 font-[family-name:var(--font-playfair)]">404</p>
        <h1 className="text-2xl font-bold mb-2 text-[#111310]">Page not found</h1>
        <p className="text-[#7a7468] mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
