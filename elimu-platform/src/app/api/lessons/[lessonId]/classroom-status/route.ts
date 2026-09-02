import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { courseLessons, courseSections, enrollments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
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
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // If no classroom ID or not pending, return current state
    if (!lesson.openmaicClassroomId) {
      return NextResponse.json({ status: 'none', classroomId: null });
    }

    if (!lesson.openmaicClassroomId.startsWith('pending:')) {
      return NextResponse.json({ status: 'ready', classroomId: lesson.openmaicClassroomId });
    }

    // Extract jobId and poll OpenMAIC
    const jobId = lesson.openmaicClassroomId.replace('pending:', '');
    const openmaicUrl = process.env.OPENMAIC_INTERNAL_URL || 'http://localhost:3001';

    const response = await fetch(`${openmaicUrl}/api/generate-classroom/${jobId}`);
    const data = await response.json();

    const classroomId = data.classroomId || data.result?.classroomId;
    if ((data.status === 'done' || data.status === 'succeeded' || data.done) && classroomId) {
      // Update lesson with the real classroom ID
      await db
        .update(courseLessons)
        .set({ openmaicClassroomId: classroomId })
        .where(eq(courseLessons.id, lessonId));

      return NextResponse.json({ status: 'ready', classroomId });
    }

    if (data.status === 'failed') {
      // Clear the pending state so it can be retried
      await db
        .update(courseLessons)
        .set({ openmaicClassroomId: null })
        .where(eq(courseLessons.id, lessonId));

      return NextResponse.json({
        status: 'failed',
        error: data.error || 'Classroom generation failed',
      });
    }

    // Still generating
    return NextResponse.json({
      status: 'generating',
      progress: data.progress || 0,
      message: data.message || 'Generating...',
      step: data.step,
    });
  } catch (error) {
    console.error('Classroom status error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
