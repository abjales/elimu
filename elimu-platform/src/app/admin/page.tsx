import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { courses, users, enrollments, aiClassrooms } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users, BookOpen, Sparkles, Plus, Settings } from 'lucide-react';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/');
  }

  // Fetch stats
  const [courseCount] = await db.select({ count: sql<number>`count(*)` }).from(courses);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [enrollmentCount] = await db.select({ count: sql<number>`count(*)` }).from(enrollments);
  const [classroomCount] = await db.select({ count: sql<number>`count(*)` }).from(aiClassrooms);

  // Fetch recent courses
  const recentCourses = await db.query.courses.findMany({
    orderBy: [desc(courses.createdAt)],
    limit: 10,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your courses and users</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courseCount.count}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userCount.count}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrollmentCount.count}</p>
                <p className="text-sm text-muted-foreground">Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classroomCount.count}</p>
                <p className="text-sm text-muted-foreground">AI Classrooms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Courses</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/courses">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No courses yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first course to get started.
              </p>
              <Button asChild>
                <Link href="/admin/courses/new">Create Course</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-primary/60" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                          {course.status}
                        </Badge>
                        <Badge variant="outline">{course.level}</Badge>
                        {course.isPro && <Badge className="bg-[#e8b84b] text-[#111310]">PRO</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {course.enrollmentCount} enrollments
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
