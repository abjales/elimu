import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserPlan(userId: string): Promise<'free' | 'pro'> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { plan: true },
  });
  return (user?.plan as 'free' | 'pro') || 'free';
}

export function isProUser(plan: string | null): boolean {
  return plan === 'pro';
}

export async function canAccessProCourse(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return plan === 'pro';
}

export async function canCreateClassroom(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getUserPlan(userId);
  if (plan === 'pro') return { allowed: true };

  // Free tier: 3 classrooms per month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { sql } = await import('drizzle-orm');
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.id, userId));

  // We'll check aiClassrooms count directly
  const { aiClassrooms } = await import('@/lib/db/schema');
  const [{ count: classroomCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(aiClassrooms)
    .where(
      sql`${aiClassrooms.userId} = ${userId} AND ${aiClassrooms.createdAt} >= ${monthStart}`
    );

  if (classroomCount >= 3) {
    return { allowed: false, reason: 'Free tier limited to 3 AI classrooms per month. Upgrade to Pro for unlimited.' };
  }

  return { allowed: true };
}
