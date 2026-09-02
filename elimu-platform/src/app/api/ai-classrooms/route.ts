import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiClassrooms, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const classroomSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  prompt: z.string().min(10, 'Please provide a more detailed description'),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check plan
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { plan: true },
    });

    // Free tier: 3 classrooms per month
    if (user?.plan !== 'pro') {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(aiClassrooms)
        .where(
          sql`${aiClassrooms.userId} = ${userId} AND ${aiClassrooms.createdAt} >= ${monthStart.toISOString()}`
        );

      if (count >= 3) {
        return NextResponse.json(
          { error: 'Free tier limited to 3 AI classrooms per month. Upgrade to Pro for unlimited.' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { title, prompt } = classroomSchema.parse(body);

    const openmaicUrl = process.env.OPENMAIC_INTERNAL_URL || 'http://localhost:3001';

    const response = await fetch(`${openmaicUrl}/api/generate-classroom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirement: prompt,
        title,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenMAIC generation error:', error);
      return NextResponse.json(
        { error: 'Failed to generate classroom' },
        { status: 500 }
      );
    }

    const data = await response.json();

    const [classroom] = await db
      .insert(aiClassrooms)
      .values({
        userId,
        title,
        prompt,
        openmaicJobId: data.jobId,
        status: 'generating',
      })
      .returning();

    return NextResponse.json({
      id: classroom.id,
      jobId: data.jobId,
      status: 'generating',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('AI classroom creation error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classrooms = await db.query.aiClassrooms.findMany({
      where: (aiClassrooms, { eq }) =>
        eq(aiClassrooms.userId, (session.user as any).id),
      orderBy: (aiClassrooms, { desc }) => [desc(aiClassrooms.createdAt)],
    });

    return NextResponse.json({ classrooms });
  } catch (error) {
    console.error('Fetch classrooms error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
