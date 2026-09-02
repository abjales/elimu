import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { courses, courseSections, courseLessons, enrollments, lessonProgress } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkCompleteButton } from './mark-complete-button';
import { ClassroomPlayer } from '@/components/classroom-player';
import { ArrowLeft, ArrowRight, Play, FileText, GraduationCap, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface LessonPageProps {
  params: Promise<{ slug: string; lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
    with: {
      sections: {
        with: {
          lessons: true,
        },
        orderBy: [courseSections.sortOrder],
      },
    },
  });

  if (!course) notFound();

  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, userId),
      eq(enrollments.courseId, course.id),
    ),
  });

  if (!enrollment) {
    redirect(`/courses/${slug}`);
  }

  const lesson = await db.query.courseLessons.findFirst({
    where: eq(courseLessons.id, lessonId),
    with: {
      section: true,
    },
  });

  if (!lesson) notFound();

  const allLessons = course.sections.flatMap((s) =>
    s.lessons.map((l) => ({ ...l, sectionTitle: s.title, sectionId: s.id }))
  );
  allLessons.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const progress = await db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.userId, userId),
      eq(lessonProgress.lessonId, lessonId),
    ),
  });
  const isCompleted = !!progress?.completed;

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="mb-4 md:mb-6">
        <Button variant="ghost" asChild className="mb-2 -ml-2 text-stone-600 hover:text-stone-900">
          <Link href={`/courses/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Link>
        </Button>
        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-stone-400 flex-wrap">
          <Link href={`/courses/${slug}`} className="hover:text-[#1a6b3c] truncate max-w-[120px] md:max-w-none">{course.title}</Link>
          <span>/</span>
          <span className="truncate max-w-[100px] md:max-w-none">{lesson.section.title}</span>
          <span>/</span>
          <span className="text-stone-700 truncate">{lesson.title}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Player area */}
          <Card className="overflow-hidden mb-4 md:mb-6 border border-border rounded-2xl">
            <div className="aspect-video bg-black flex items-center justify-center">
              {lesson.type === 'ai-classroom' ? (
                <ClassroomPlayer
                  lessonId={lessonId}
                  initialClassroomId={lesson.openmaicClassroomId ?? null}
                  lessonTitle={lesson.title}
                />
              ) : lesson.type === 'video' && lesson.contentUrl ? (
                <video
                  src={lesson.contentUrl}
                  controls
                  className="w-full h-full"
                  title={lesson.title}
                />
              ) : lesson.type === 'document' && lesson.contentUrl ? (
                <iframe
                  src={lesson.contentUrl}
                  className="w-full h-full border-0 bg-white"
                  title={lesson.title}
                />
              ) : (
                <div className="text-center text-white/70 p-6 md:p-8">
                  {lesson.type === 'video' && <Play className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 opacity-50" />}
                  {lesson.type === 'document' && <FileText className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 opacity-50" />}
                  <p className="text-base md:text-lg font-medium">{lesson.title}</p>
                  <p className="text-xs md:text-sm mt-2 opacity-70">Content will be available soon.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Lesson info */}
          <div className="flex items-start justify-between gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-2xl font-bold text-stone-900">{lesson.title}</h1>
              <p className="text-stone-500 text-xs md:text-sm mt-1">
                {lesson.section.title}
                {lesson.duration && ` · ${lesson.duration}min`}
              </p>
            </div>
            <MarkCompleteButton lessonId={lessonId} isCompleted={isCompleted} />
          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-between gap-2">
            {prevLesson ? (
              <Button variant="outline" asChild size="sm" className="border-border text-stone-600 hover:bg-stone-50 rounded-full">
                <Link href={`/courses/${slug}/lessons/${prevLesson.id}`}>
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  <span className="hidden sm:inline truncate max-w-[120px]">{prevLesson.title}</span>
                  <span className="sm:hidden">Previous</span>
                </Link>
              </Button>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Button asChild size="sm" className="bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full">
                <Link href={`/courses/${slug}/lessons/${nextLesson.id}`}>
                  <span className="hidden sm:inline truncate max-w-[120px]">{nextLesson.title}</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="secondary" size="sm" className="bg-stone-100 text-stone-700">
                <Link href={`/courses/${slug}`}>
                  Back to Course
                  <CheckCircle className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar — lesson list */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto border border-border rounded-2xl">
            <CardContent className="p-3 md:p-4">
              <h3 className="font-semibold mb-3 text-stone-900 text-sm">Course Content</h3>
              <div className="space-y-3 md:space-y-4">
                {course.sections.map((section) => (
                  <div key={section.id}>
                    <h4 className="text-[10px] md:text-xs font-medium text-stone-400 uppercase mb-1.5 md:mb-2">
                      {section.title}
                    </h4>
                    <ul className="space-y-0.5">
                      {section.lessons.map((l) => {
                        const isActive = l.id === lessonId;
                        return (
                          <li key={l.id}>
                            <Link
                              href={`/courses/${slug}/lessons/${l.id}`}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs md:text-sm transition-colors ${
                                isActive
                                  ? 'bg-[#1a6b3c] text-white font-medium'
                                  : 'hover:bg-stone-50 text-stone-500 hover:text-stone-700'
                              }`}
                            >
                              {l.type === 'ai-classroom' ? (
                                <GraduationCap className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
                              ) : l.type === 'video' ? (
                                <Play className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
                              ) : (
                                <FileText className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
                              )}
                              <span className="truncate">{l.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
