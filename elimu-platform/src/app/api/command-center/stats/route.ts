import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Dynamic import of DB (it may not be available)
    let db: any;
    try {
      db = (await import('@/lib/db')).db;
    } catch {
      // DB not configured - return empty stats
    }

    if (!db) {
      return NextResponse.json({
        courses: 0,
        users: 0,
        classrooms: 0,
        enrollments: 0,
        revenue: 0,
        activeUsers: 0,
        lessonsCompleted: 0,
        avgRating: 0,
        recentActivity: [],
        recentCourses: [],
      });
    }

    const { sql, eq } = await import('drizzle-orm');
    const { courses, users, enrollments, aiClassrooms, courseLessons } = await import('@/lib/db/schema');
    const { desc: descOrder } = await import('drizzle-orm');

    // Fetch counts
    const [courseCount] = await db.select({ count: sql<number>`count(*)` }).from(courses);
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [enrollmentCount] = await db.select({ count: sql<number>`count(*)` }).from(enrollments);
    const [classroomCount] = await db.select({ count: sql<number>`count(*)` }).from(aiClassrooms);
    const [lessonCount] = await db.select({ count: sql<number>`count(*)` }).from(courseLessons);
    const [completedCount] = await db.select({ count: sql<number>`count(*)` }).from(enrollments)
      .where(sql`${enrollments.completedAt} IS NOT NULL`);

    // Active users in last 24h (enrollments with existing user)
    const [activeCount] = await db
      .select({ count: sql<number>`count(DISTINCT ${enrollments.userId})` })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .where(sql`${enrollments.enrolledAt} > NOW() - INTERVAL '24 hours'`);

    // Average rating
    const [ratingResult] = await db.select({ avg: sql<string>`COALESCE(AVG(rating), '0')` }).from(courses);

    // Recent courses
    const recentCourses = await db.query.courses.findMany({
      orderBy: [descOrder(courses.createdAt)],
      limit: 10,
    });

    // Recent enrollments for activity
    const recentEnrollments = await db.query.enrollments.findMany({
      with: { course: { columns: { title: true } } },
      orderBy: [descOrder(enrollments.enrolledAt)],
      limit: 10,
    });

    return NextResponse.json({
      courses: Number(courseCount.count) || 0,
      users: Number(userCount.count) || 0,
      classrooms: Number(classroomCount.count) || 0,
      enrollments: Number(enrollmentCount.count) || 0,
      revenue: 0, // Stripe revenue would need separate query
      activeUsers: Number(activeCount.count) || 0,
      lessonsCompleted: Number(completedCount.count) || Number(lessonCount.count) || 0,
      avgRating: parseFloat(ratingResult?.avg || '0') || 0,
      recentActivity: recentEnrollments.map((e: any) => ({
        id: e.id,
        type: 'enrollment',
        message: `${e.course?.title || 'Unknown course'} — enrolled`,
        time: formatRelativeTime(e.enrolledAt),
        status: 'info',
      })),
      recentCourses: recentCourses.map((c: any) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        status: c.status,
        level: c.level,
        isPro: c.isPro,
        enrollmentCount: c.enrollmentCount || 0,
        rating: c.rating || 0,
        createdAt: c.createdAt,
      })),
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json({
      courses: 0,
      users: 0,
      classrooms: 0,
      enrollments: 0,
      revenue: 0,
      activeUsers: 0,
      lessonsCompleted: 0,
      avgRating: 0,
      recentActivity: [],
      recentCourses: [],
      error: 'Failed to fetch platform stats',
    });
  }
}

function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}