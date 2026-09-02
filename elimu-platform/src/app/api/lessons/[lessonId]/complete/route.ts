import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { lessonProgress, courseLessons, enrollments, courseSections, courses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId } = await params;
    const userId = (session.user as any).id;

    // Verify lesson exists and user is enrolled in the parent course
    const lesson = await db.query.courseLessons.findFirst({
      where: eq(courseLessons.id, lessonId),
      with: { section: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const section = await db.query.courseSections.findFirst({
      where: eq(courseSections.id, lesson.sectionId),
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, section.courseId),
      ),
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
    }

    // Upsert lesson progress
    const existing = await db.query.lessonProgress.findFirst({
      where: and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId),
      ),
    });

    if (existing) {
      if (existing.completed) {
        return NextResponse.json({ success: true, alreadyCompleted: true });
      }
      await db
        .update(lessonProgress)
        .set({ completed: true, completedAt: new Date() })
        .where(eq(lessonProgress.id, existing.id));
    } else {
      await db.insert(lessonProgress).values({
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      });
    }

    // Update enrollment progress percentage
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, section.courseId),
      with: {
        sections: {
          with: { lessons: true },
        },
      },
    });

    if (course) {
      const totalLessons = course.sections.reduce(
        (acc, s) => acc + s.lessons.length,
        0,
      );
      const completedCount = await db.$count(
        lessonProgress,
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.completed, true),
        ),
      );

      const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      await db
        .update(enrollments)
        .set({
          progressPct: pct,
          completedAt: pct >= 100 ? new Date() : null,
        })
        .where(eq(enrollments.id, enrollment.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark complete error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
