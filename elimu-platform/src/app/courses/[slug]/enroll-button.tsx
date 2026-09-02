'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Lock } from 'lucide-react';

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  isPro: boolean;
  isEnrolled: boolean;
}

export function EnrollButton({ courseId, courseSlug, isPro, isEnrolled }: EnrollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isEnrolled) {
    return (
      <Button className="w-full rounded-full" size="lg" variant="secondary" disabled>
        <Check className="mr-2 h-4 w-4" />
        Enrolled
      </Button>
    );
  }

  const handleEnroll = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          router.push('/pricing');
          return;
        }
        setError(data.error || 'Failed to enroll');
        setLoading(false);
        return;
      }

      if (data.firstLessonId) {
        router.push(`/courses/${courseSlug}/lessons/${data.firstLessonId}`);
      } else {
        router.refresh();
      }
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        className={`w-full rounded-full ${
          isPro
            ? 'bg-[#e8b84b] hover:bg-[#d4a43e] text-[#111310]'
            : 'bg-[#1a6b3c] hover:bg-[#0d3d22] text-white'
        }`}
        size="lg"
        onClick={handleEnroll}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : isPro ? (
          <Lock className="mr-2 h-4 w-4" />
        ) : null}
        {loading
          ? 'Enrolling...'
          : isPro
            ? 'Enroll with Pro'
            : 'Enroll for Free'}
      </Button>
      {error && (
        <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
