import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  type: z.enum(['free', 'masterclass', 'ai-generated', 'manual']).optional(),
  isPro: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  estimatedDuration: z.number().int().nullable().optional(),
});

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        category: true,
        sections: {
          with: { lessons: true },
          orderBy: (courseSections, { asc }) => [asc(courseSections.sortOrder)],
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Fetch course error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const existing = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!existing) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const updates: Record<string, any> = { ...data };

    // Regenerate slug if title changed
    if (data.title && data.title !== existing.title) {
      const newSlug = slugify(data.title);
      const slugConflict = await db.query.courses.findFirst({
        where: eq(courses.slug, newSlug),
      });
      updates.slug = slugConflict ? `${newSlug}-${Date.now()}` : newSlug;
    }

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(courses)
      .set(updates)
      .where(eq(courses.id, courseId))
      .returning();

    return NextResponse.json({ course: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }
    console.error('Update course error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;

    const existing = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!existing) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    await db.delete(courses).where(eq(courses.id, courseId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
