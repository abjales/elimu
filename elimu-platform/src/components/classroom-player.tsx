'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap, Loader2, RefreshCw } from 'lucide-react';

interface ClassroomPlayerProps {
  lessonId: string;
  initialClassroomId: string | null;
  lessonTitle: string;
}

export function ClassroomPlayer({
  lessonId,
  initialClassroomId,
  lessonTitle,
}: ClassroomPlayerProps) {
  const [classroomId, setClassroomId] = useState<string | null>(
    initialClassroomId?.startsWith('pending:') ? null : initialClassroomId,
  );
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'failed'>(
    initialClassroomId?.startsWith('pending:') ? 'generating' : initialClassroomId ? 'ready' : 'idle',
  );
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/classroom-status`);
      const data = await res.json();

      if (data.status === 'ready') {
        setClassroomId(data.classroomId);
        setStatus('ready');
        if (pollRef.current) clearInterval(pollRef.current);
      } else if (data.status === 'failed') {
        setStatus('failed');
        setError(data.error || 'Generation failed');
        if (pollRef.current) clearInterval(pollRef.current);
      } else if (data.status === 'generating') {
        setProgress(data.progress || 0);
        setMessage(data.message || 'Generating...');
      }
    } catch {
      // Keep polling on network errors
    }
  }, [lessonId]);

  const startGeneration = async () => {
    setStatus('generating');
    setError('');
    setProgress(0);
    setMessage('Starting classroom generation...');

    try {
      const res = await fetch(`/api/lessons/${lessonId}/generate-classroom`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('failed');
        setError(data.error || 'Failed to start generation');
        return;
      }

      if (data.status === 'ready') {
        setClassroomId(data.classroomId);
        setStatus('ready');
        return;
      }

      const interval = data.pollIntervalMs || 5000;
      pollRef.current = setInterval(pollStatus, interval);
      pollStatus();
    } catch {
      setStatus('failed');
      setError('Network error');
    }
  };

  useEffect(() => {
    if (initialClassroomId?.startsWith('pending:') && status === 'generating') {
      pollRef.current = setInterval(pollStatus, 5000);
      pollStatus();
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [initialClassroomId, status, pollStatus]);

  if (status === 'ready' && classroomId) {
    const openmaicUrl = process.env.NEXT_PUBLIC_OPENMAIC_URL || 'http://localhost:3001';
    return (
      <div className="w-full h-full">
        <iframe
          src={`${openmaicUrl}/classroom/${classroomId}`}
          className="w-full h-full border-0"
          allow="microphone; camera; fullscreen"
          title={lessonTitle}
        />
      </div>
    );
  }

  if (status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white p-6 md:p-8">
        <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin text-[#e8b84b] mb-4 md:mb-6" />
        <p className="text-lg md:text-xl font-semibold mb-2">Generating AI Classroom</p>
        <p className="text-white/60 mb-4 text-center max-w-md text-sm md:text-base">{message}</p>
        {progress > 0 && (
          <div className="w-48 md:w-64 bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#e8b84b] h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <p className="text-white/40 text-xs md:text-sm mt-3">This may take 30-60 seconds...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white p-6 md:p-8">
        <GraduationCap className="h-12 w-12 md:h-16 md:w-16 text-red-400 mb-3 md:mb-4" />
        <p className="text-lg md:text-xl font-semibold mb-2">Generation Failed</p>
        <p className="text-white/60 mb-4 text-sm md:text-base">{error}</p>
        <Button onClick={startGeneration} variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-white p-6 md:p-8">
      <GraduationCap className="h-14 w-14 md:h-20 md:w-20 text-white/30 mb-4 md:mb-6" />
      <p className="text-lg md:text-xl font-semibold mb-2">{lessonTitle}</p>
      <p className="text-white/60 mb-4 md:mb-6 text-center max-w-md text-sm md:text-base">
        This lesson includes an interactive AI classroom. Click below to generate it.
      </p>
      <Button onClick={startGeneration} size="lg" className="bg-[#e8b84b] hover:bg-[#d4a43e] text-[#111310] shadow-lg rounded-full">
        <GraduationCap className="mr-2 h-4 w-4 md:h-5 md:w-5" />
        Generate AI Classroom
      </Button>
    </div>
  );
}
