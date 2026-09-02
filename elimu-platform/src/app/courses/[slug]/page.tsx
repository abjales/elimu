import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { courses, courseSections, courseLessons, enrollments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnrollButton } from './enroll-button';
import { GraduationCap, Star, Users, Clock, Play, FileText, BookOpen, ArrowLeft } from 'lucide-react';
import { categoryThumbnail } from '@/lib/imagery';

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;

  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
    with: {
      category: true,
      sections: {
        with: {
          lessons: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const session = await auth();
  let isEnrolled = false;
  if (session?.user) {
    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, (session.user as any).id),
        eq(enrollments.courseId, course.id),
      ),
    });
    isEnrolled = !!enrollment;
  }

  const totalDuration = course.sections.reduce((acc, section) => {
    return acc + section.lessons.reduce((lessonAcc, lesson) => lessonAcc + (lesson.duration || 0), 0);
  }, 0);

  const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);

  return (
    <div className="pb-20 md:pb-0">
      {/* Hero banner */}
      <div className="relative h-56 sm:h-64 md:h-80 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={categoryThumbnail(course.category?.slug, course.slug)}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 container mx-auto px-4 sm:px-6 flex flex-col justify-end pb-6 md:pb-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 md:mb-4 transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            All Courses
          </Link>
          <div className="flex items-center gap-2 mb-2 md:mb-3 flex-wrap">
            {course.category && (
              <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-sm text-[10px] md:text-xs rounded-full">
                {course.category.name}
              </Badge>
            )}
            <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-sm text-[10px] md:text-xs rounded-full">{course.level}</Badge>
            {course.isPro && (
              <Badge className="bg-[#e8b84b] border-0 shadow-md text-[10px] md:text-xs text-[#111310] rounded-full">PRO</Badge>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-1.5 md:mb-2">{course.title}</h1>
          <div className="flex flex-wrap items-center gap-3 md:gap-5 text-xs md:text-sm text-white/80">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-[#e8b84b] text-[#e8b84b]" />
              <span className="font-semibold text-white">{((course.rating ?? 0) / 100).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{course.enrollmentCount?.toLocaleString()} students</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{totalLessons} lessons</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: sticky enroll bar */}
      {!isEnrolled && (
        <div className="md:hidden sticky top-16 z-40 bg-white border-b border-border px-4 py-3">
          <EnrollButton courseId={course.id} courseSlug={slug} isPro={!!course.isPro} isEnrolled={isEnrolled} />
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8 md:space-y-10">
            <div>
              <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 text-[#111310]">About this course</h2>
              <p className="text-[#7a7468] leading-relaxed text-sm md:text-lg">{course.description}</p>
            </div>

            <div>
              <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-[#111310]">Course Content</h2>
              <div className="space-y-3 md:space-y-4">
                {course.sections.map((section) => (
                  <Card key={section.id} className="border border-border rounded-2xl">
                    <CardContent className="p-4 md:p-5">
                      <h3 className="font-bold mb-3 text-[#111310] text-sm md:text-base">{section.title}</h3>
                      <ul className="space-y-1.5 md:space-y-2.5">
                        {section.lessons.map((lesson) => {
                          const lessonContent = (
                            <li key={lesson.id} className="flex items-center gap-2.5 md:gap-3 text-xs md:text-sm py-1">
                              {lesson.type === 'ai-classroom' ? (
                                <div className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-lg bg-[#f0f7f3]">
                                  <GraduationCap className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#1a6b3c]" />
                                </div>
                              ) : lesson.type === 'video' ? (
                                <div className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-lg bg-blue-50">
                                  <Play className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-600" />
                                </div>
                              ) : (
                                <div className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-lg bg-stone-100">
                                  <FileText className="h-3 w-3 md:h-3.5 md:w-3.5 text-stone-500" />
                                </div>
                              )}
                              <span className="flex-1 font-medium text-stone-700">{lesson.title}</span>
                              {lesson.duration && (
                                <span className="text-[#7a7468] text-[10px] md:text-xs">
                                  {lesson.duration}min
                                </span>
                              )}
                            </li>
                          );

                          if (isEnrolled) {
                            return (
                              <Link
                                key={lesson.id}
                                href={`/courses/${slug}/lessons/${lesson.id}`}
                                className="block hover:bg-stone-50 rounded-lg px-3 py-1.5 -mx-3 transition-colors"
                              >
                                {lessonContent}
                              </Link>
                            );
                          }
                          return lessonContent;
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar — desktop only */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24 border border-border shadow-lg rounded-2xl overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={categoryThumbnail(course.category?.slug, course.slug)}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <EnrollButton courseId={course.id} courseSlug={slug} isPro={!!course.isPro} isEnrolled={isEnrolled} />
                  <div className="text-center text-sm text-[#7a7468]">
                    {course.isPro ? (
                      <p>Pro subscription required</p>
                    ) : (
                      <p>Free — no credit card required</p>
                    )}
                  </div>
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h3 className="font-bold text-sm text-[#111310]">This course includes:</h3>
                    <ul className="space-y-2.5 text-sm text-stone-600">
                      <li className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f0f7f3]">
                          <Play className="h-3 w-3 text-[#1a6b3c]" />
                        </div>
                        AI-generated interactive lessons
                      </li>
                      <li className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f0f7f3]">
                          <BookOpen className="h-3 w-3 text-[#1a6b3c]" />
                        </div>
                        Interactive quizzes and exercises
                      </li>
                      <li className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f0f7f3]">
                          <GraduationCap className="h-3 w-3 text-[#1a6b3c]" />
                        </div>
                        Real-time AI teacher discussions
                      </li>
                      <li className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f0f7f3]">
                          <FileText className="h-3 w-3 text-[#1a6b3c]" />
                        </div>
                        Whiteboard diagrams and formulas
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
