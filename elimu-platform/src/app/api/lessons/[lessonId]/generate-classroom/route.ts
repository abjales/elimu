import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { courseLessons, courseSections, enrollments } from '@/lib/db/schema';
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

    const lesson = await db.query.courseLessons.findFirst({
      where: eq(courseLessons.id, lessonId),
      with: { section: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Check enrollment via section → course
    const section = await db.query.courseSections.findFirst({
      where: eq(courseSections.id, lesson.sectionId),
    });
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, (session.user as any).id),
        eq(enrollments.courseId, section.courseId),
      ),
    });
    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
    }

    // If classroom already exists, return it
    if (lesson.openmaicClassroomId) {
      return NextResponse.json({
        classroomId: lesson.openmaicClassroomId,
        status: 'ready',
      });
    }

    // Generate classroom via OpenMAIC
    const openmaicUrl = process.env.OPENMAIC_INTERNAL_URL || 'http://localhost:3001';

    const response = await fetch(`${openmaicUrl}/api/generate-classroom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirement: `Teach a comprehensive lesson on: ${lesson.title}. This is part of a course section titled "${lesson.section.title}". Cover the key concepts, provide examples, and include interactive elements. Keep it focused and educational.`,
        title: lesson.title,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenMAIC generation error:', errText);
      return NextResponse.json(
        { error: 'Failed to start classroom generation' },
        { status: 502 },
      );
    }

    const data = await response.json();

    // Store the jobId on the lesson so we can poll later
    // We store it as a temporary classroomId format: "pending:{jobId}"
    await db
      .update(courseLessons)
      .set({ openmaicClassroomId: `pending:${data.jobId}` })
      .where(eq(courseLessons.id, lessonId));

    return NextResponse.json({
      classroomId: null,
      jobId: data.jobId,
      status: 'generating',
      pollUrl: data.pollUrl,
      pollIntervalMs: data.pollIntervalMs || 5000,
    });
  } catch (error) {
    console.error('Generate classroom error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
