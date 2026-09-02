'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

interface MarkCompleteButtonProps {
  lessonId: string;
  isCompleted: boolean;
}

export function MarkCompleteButton({ lessonId, isCompleted }: MarkCompleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);

  const handleMarkComplete = async () => {
    if (completed) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
      });

      if (res.ok) {
        setCompleted(true);
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-[#1a6b3c] font-medium">
        <CheckCircle className="h-4 w-4" />
        Completed
      </span>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleMarkComplete}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="mr-1 h-4 w-4" />
      )}
      Mark Complete
    </Button>
  );
}
