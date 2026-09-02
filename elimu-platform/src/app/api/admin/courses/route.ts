import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, courseSections, courseLessons } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  type: z.enum(['free', 'masterclass', 'ai-generated', 'manual']).default('free'),
  isPro: z.boolean().default(false),
  categoryId: z.string().uuid().optional(),
  thumbnail: z.string().nullable().optional(),
  estimatedDuration: z.number().int().nullable().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseList = await db.query.courses.findMany({
      with: { category: true },
      orderBy: [desc(courses.createdAt)],
    });

    return NextResponse.json({ courses: courseList });
  } catch (error) {
    console.error('Fetch courses error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = courseSchema.parse(body);

    const slug = slugify(data.title);
    const existing = await db.query.courses.findFirst({
      where: eq(courses.slug, slug),
    });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const [course] = await db
      .insert(courses)
      .values({
        title: data.title,
        slug: finalSlug,
        description: data.description || '',
        shortDescription: data.shortDescription || '',
        level: data.level,
        type: data.type,
        isPro: data.isPro,
        categoryId: data.categoryId || null,
        thumbnail: data.thumbnail || null,
        estimatedDuration: data.estimatedDuration || null,
        createdBy: (session.user as any).id,
        status: 'draft',
      })
      .returning();

    // If sections/lessons were provided in the request, create them
    const sections = body.sections;
    if (Array.isArray(sections)) {
      for (let sIdx = 0; sIdx < sections.length; sIdx++) {
        const s = sections[sIdx];
        const [section] = await db
          .insert(courseSections)
          .values({
            courseId: course.id,
            title: s.title,
            sortOrder: sIdx,
          })
          .returning();

        if (Array.isArray(s.lessons)) {
          for (let lIdx = 0; lIdx < s.lessons.length; lIdx++) {
            const l = s.lessons[lIdx];
            await db.insert(courseLessons).values({
              sectionId: section.id,
              title: l.title,
              type: l.type || 'video',
              contentUrl: l.contentUrl || null,
              openmaicClassroomId: l.openmaicClassroomId || null,
              duration: l.duration || null,
              sortOrder: lIdx,
            });
          }
        }
      }
    }

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }
    console.error('Create course error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
