import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, enrollments, courseSections, courseLessons, users } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;
    const userId = (session.user as any).id;

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // PRO check — require Pro plan for pro courses.
    // Bypassed while BYPASS_PRO_PAYWALL=true (testing before Stripe is wired up).
    if (course.isPro && process.env.BYPASS_PRO_PAYWALL !== 'true') {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { plan: true },
      });
      if (user?.plan !== 'pro') {
        return NextResponse.json(
          { error: 'Pro subscription required' },
          { status: 403 },
        );
      }
    }

    // Check for existing enrollment
    const existing = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId),
      ),
    });

    if (existing) {
      return NextResponse.json({ enrollment: existing });
    }

    // Create enrollment and increment count in a transaction
    const [enrollment] = await db.transaction(async (tx) => {
      const [enrl] = await tx
        .insert(enrollments)
        .values({ userId, courseId })
        .returning();

      await tx
        .update(courses)
        .set({
          enrollmentCount: (course.enrollmentCount || 0) + 1,
        })
        .where(eq(courses.id, courseId));

      return [enrl];
    });

    // Find first lesson for redirect
    const firstSection = await db.query.courseSections.findFirst({
      where: eq(courseSections.courseId, courseId),
      orderBy: [asc(courseSections.sortOrder)],
    });
    let firstLessonId: string | null = null;
    if (firstSection) {
      const firstLesson = await db.query.courseLessons.findFirst({
        where: eq(courseLessons.sectionId, firstSection.id),
        orderBy: [asc(courseLessons.sortOrder)],
      });
      firstLessonId = firstLesson?.id ?? null;
    }

    return NextResponse.json({ enrollment, firstLessonId }, { status: 201 });
  } catch (error) {
    console.error('Enroll error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
