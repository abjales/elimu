import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { courses, categories } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowLeft, Settings, GraduationCap } from 'lucide-react';

export default async function AdminCoursesPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/');
  }

  const courseList = await db.query.courses.findMany({
    with: { category: true },
    orderBy: [desc(courses.createdAt)],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Courses</h1>
            <p className="text-muted-foreground mt-1">
              {courseList.length} course{courseList.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/courses/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
        </CardHeader>
        <CardContent>
          {courseList.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No courses yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first course to get started.
              </p>
              <Button asChild>
                <Link href="/admin/courses/new">Create Course</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {courseList.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-6 w-6 text-primary/60" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="font-semibold truncate hover:text-primary transition-colors"
                      >
                        {course.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                          {course.status}
                        </Badge>
                        <Badge variant="outline">{course.level}</Badge>
                        <Badge variant="outline">{course.type}</Badge>
                        {course.isPro && <Badge className="bg-[#e8b84b] text-[#111310]">PRO</Badge>}
                        {course.category && (
                          <Badge variant="outline">{course.category.name}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-muted-foreground">
                      {course.enrollmentCount || 0} enrolled
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
