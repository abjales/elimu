'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Archive,
  Loader2,
  GraduationCap,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string | null;
  level: string;
  type: string;
  isPro: boolean;
  status: string;
  estimatedDuration: number | null;
  enrollmentCount: number;
  createdAt: string;
  category: { id: string; name: string } | null;
  sections: {
    id: string;
    title: string;
    lessons: { id: string; title: string; type: string }[];
  }[];
}

export default function AdminCourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    shortDescription: '',
    level: 'beginner',
    type: 'free',
    isPro: false,
    thumbnail: '',
    estimatedDuration: '',
  });

  useEffect(() => {
    fetch(`/api/admin/courses/${courseId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.course) {
          setCourse(data.course);
          setForm({
            title: data.course.title || '',
            description: data.course.description || '',
            shortDescription: data.course.shortDescription || '',
            level: data.course.level || 'beginner',
            type: data.course.type || 'free',
            isPro: data.course.isPro || false,
            thumbnail: data.course.thumbnail || '',
            estimatedDuration: data.course.estimatedDuration?.toString() || '',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          estimatedDuration: form.estimatedDuration
            ? parseInt(form.estimatedDuration)
            : null,
          thumbnail: form.thumbnail || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save');
        setSaving(false);
        return;
      }

      setSuccess('Course saved');
      setSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Something went wrong');
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update status');
        setSaving(false);
        return;
      }

      setCourse((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setSuccess(`Course ${newStatus === 'published' ? 'published' : newStatus === 'archived' ? 'archived' : 'set to draft'}`);
      setSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Something went wrong');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course? This cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        setError('Failed to delete course');
        setDeleting(false);
        return;
      }

      router.push('/admin/courses');
      router.refresh();
    } catch {
      setError('Something went wrong');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-2">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-destructive">Course not found.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">Edit Course</h1>
              <Badge
                variant={
                  course.status === 'published'
                    ? 'default'
                    : course.status === 'archived'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {course.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {course.enrollmentCount} enrollments · Created{' '}
              {new Date(course.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {course.status !== 'published' && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('published')}
                disabled={saving}
              >
                <Eye className="mr-1 h-4 w-4" />
                Publish
              </Button>
            )}
            {course.status === 'published' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleStatusChange('draft')}
                disabled={saving}
              >
                <EyeOff className="mr-1 h-4 w-4" />
                Unpublish
              </Button>
            )}
            {course.status !== 'archived' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('archived')}
                disabled={saving}
              >
                <Archive className="mr-1 h-4 w-4" />
                Archive
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md mb-6">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm({ ...form, shortDescription: e.target.value })
                  }
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <select
                    id="level"
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="free">Free</option>
                    <option value="masterclass">Masterclass (Pro)</option>
                    <option value="ai-generated">AI-Generated</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={form.thumbnail}
                    onChange={(e) =>
                      setForm({ ...form, thumbnail: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Duration (minutes)</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    min="0"
                    value={form.estimatedDuration}
                    onChange={(e) =>
                      setForm({ ...form, estimatedDuration: e.target.value })
                    }
                    placeholder="e.g., 360"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPro"
                  checked={form.isPro}
                  onChange={(e) => setForm({ ...form, isPro: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPro">Require Pro subscription</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mb-4">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <GraduationCap className="h-12 w-12 text-primary/40" />
                )}
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer">
                  View Public Page
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Sections */}
          {course.sections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Content ({course.sections.length} sections)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.sections.map((section) => (
                    <li key={section.id} className="text-sm">
                      <span className="font-medium">{section.title}</span>
                      <span className="text-muted-foreground ml-1">
                        ({section.lessons.length} lessons)
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Deleting this course will permanently remove all sections, lessons,
                and enrollment data.
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Course
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
