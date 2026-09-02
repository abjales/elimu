'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';

type JobStatus = 'idle' | 'submitting' | 'polling' | 'ready' | 'failed';

export default function NewClassroomPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<JobStatus>('idle');
  const [jobId, setJobId] = useState('');
  const [progress, setProgress] = useState('');

  const pollJob = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/ai-classrooms');
      const data = await res.json();
      const classroom = data.classrooms?.find((c: any) => c.openmaicJobId === id);
      if (classroom?.status === 'ready') {
        setStatus('ready');
        if (classroom.classroomUrl) {
          window.open(classroom.classroomUrl, '_blank');
        }
        return;
      }
      if (classroom?.status === 'failed') {
        setStatus('failed');
        setError('Classroom generation failed. Please try again.');
        return;
      }
      setProgress('Still generating your classroom...');
      setTimeout(() => pollJob(id), 3000);
    } catch {
      setTimeout(() => pollJob(id), 5000);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (title.trim().length < 1) {
      setError('Title is required');
      return;
    }
    if (prompt.trim().length < 10) {
      setError('Please provide a more detailed description (at least 10 characters)');
      return;
    }

    setStatus('submitting');

    try {
      const res = await fetch('/api/ai-classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          router.push('/pricing');
          return;
        }
        setError(data.error || 'Failed to create classroom');
        setStatus('idle');
        return;
      }

      setJobId(data.jobId);
      setStatus('polling');
      setProgress('AI teachers are building your classroom...');
      pollJob(data.jobId);
    } catch {
      setError('Something went wrong');
      setStatus('idle');
    }
  };

  if (status === 'ready') {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-2xl">
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-6 md:p-8 text-center">
            <CheckCircle className="h-14 w-14 text-[#1a6b3c] mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-[#111310]">Classroom Ready!</h2>
            <p className="text-[#7a7468] mb-6 text-sm md:text-base">
              Your AI classroom has been generated and opened in a new tab.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full">
                <Link href="/dashboard/ai-classrooms">View All Classrooms</Link>
              </Button>
              <Button variant="outline" className="border-border rounded-full" onClick={() => { setStatus('idle'); setTitle(''); setPrompt(''); }}>
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-2xl">
      <div className="mb-6 md:mb-8">
        <Button variant="ghost" asChild className="mb-3 md:mb-4 text-stone-600 hover:text-stone-900">
          <Link href="/dashboard/ai-classrooms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classrooms
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-[#111310]">Create AI Classroom</h1>
        <p className="text-[#7a7468] mt-2 text-sm md:text-base">
          Describe a topic and our AI teachers will build a full interactive classroom.
        </p>
      </div>

      <Card className="border border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#111310]">
            <Sparkles className="h-5 w-5 text-[#1a6b3c]" />
            Classroom Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="text-stone-700">Classroom Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Machine Learning"
                disabled={status !== 'idle'}
                className="border-border focus:ring-[#1a6b3c]/20 focus:border-[#1a6b3c]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-stone-700">What do you want to learn?</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Teach me the fundamentals of machine learning including supervised vs unsupervised learning, neural networks, and practical Python examples."
                rows={5}
                disabled={status !== 'idle'}
                className="border-border focus:ring-[#1a6b3c]/20 focus:border-[#1a6b3c]"
                required
              />
              <p className="text-xs text-[#7a7468]">
                Be specific about what you want to learn. The AI will create slides, quizzes,
                whiteboard diagrams, and interactive discussions based on your description.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full"
              disabled={status !== 'idle'}
            >
              {status === 'submitting' || status === 'polling' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {progress || 'Creating...'}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Classroom
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
