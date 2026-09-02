import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { enrollments, courses, aiClassrooms } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, BookOpen, Sparkles, ArrowRight, Clock } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userEnrollments = await db.query.enrollments.findMany({
    where: eq(enrollments.userId, (session.user as any).id),
    with: {
      course: true,
    },
    orderBy: [desc(enrollments.enrolledAt)],
    limit: 10,
  });

  const userClassrooms = await db.query.aiClassrooms.findMany({
    where: eq(aiClassrooms.userId, (session.user as any).id),
    orderBy: [desc(aiClassrooms.createdAt)],
    limit: 5,
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#111310]">
          Welcome back, {session.user.name || 'Learner'}!
        </h1>
        <p className="text-[#7a7468] text-sm md:text-base">
          Continue your learning journey where you left off.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#f0f7f3]">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-[#1a6b3c]" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold text-[#111310] font-[family-name:var(--font-dm-mono)]">{userEnrollments.length}</p>
                <p className="text-[10px] md:text-sm text-[#7a7468]">Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#f0f7f3]">
                <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-[#1a6b3c]" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold text-[#111310] font-[family-name:var(--font-dm-mono)]">
                  {userEnrollments.filter((e) => e.completedAt).length}
                </p>
                <p className="text-[10px] md:text-sm text-[#7a7468]">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-[#f0f7f3]">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-[#1a6b3c]" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold text-[#111310] font-[family-name:var(--font-dm-mono)]">{userClassrooms.length}</p>
                <p className="text-[10px] md:text-sm text-[#7a7468]">AI Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Continue Learning */}
        <div>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-base md:text-xl font-semibold text-[#111310]">Continue Learning</h2>
            <Button variant="ghost" size="sm" asChild className="text-[#1a6b3c] hover:text-[#0d3d22]">
              <Link href="/courses">
                Browse More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {userEnrollments.length === 0 ? (
            <Card className="border border-border rounded-2xl">
              <CardContent className="p-6 md:p-8 text-center">
                <GraduationCap className="h-10 w-10 md:h-12 md:w-12 text-stone-300 mx-auto mb-3 md:mb-4" />
                <h3 className="font-semibold mb-2 text-[#111310]">No courses yet</h3>
                <p className="text-xs md:text-sm text-[#7a7468] mb-4">
                  Start your learning journey by browsing our courses.
                </p>
                <Button asChild className="bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full">
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userEnrollments.slice(0, 5).map((enrollment) => (
                <Link key={enrollment.id} href={`/courses/${enrollment.course.slug}`}>
                  <Card className="border border-border rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex gap-3 md:gap-4">
                        <div className="h-14 w-14 md:h-16 md:w-16 rounded-xl bg-[#f0f7f3] flex items-center justify-center shrink-0">
                          <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-[#1a6b3c]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate text-sm md:text-base text-[#111310]">{enrollment.course.title}</h3>
                          <p className="text-xs md:text-sm text-[#7a7468] mb-1.5 md:mb-2">
                            {enrollment.course.level}
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress value={enrollment.progressPct || 0} className="h-1.5 md:h-2 flex-1" />
                            <span className="text-[10px] md:text-xs text-[#7a7468]">
                              {enrollment.progressPct || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* AI Classrooms */}
        <div>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-base md:text-xl font-semibold text-[#111310]">AI Classrooms</h2>
            {userClassrooms.length > 0 && (
              <Button variant="ghost" size="sm" asChild className="text-[#1a6b3c] hover:text-[#0d3d22]">
                <Link href="/dashboard/ai-classrooms">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          {userClassrooms.length === 0 ? (
            <Card className="border border-border rounded-2xl">
              <CardContent className="p-6 md:p-8 text-center">
                <Sparkles className="h-10 w-10 md:h-12 md:w-12 text-stone-300 mx-auto mb-3 md:mb-4" />
                <h3 className="font-semibold mb-2 text-[#111310]">No AI classrooms yet</h3>
                <p className="text-xs md:text-sm text-[#7a7468] mb-4">
                  Create your first AI-powered classroom from any topic.
                </p>
                <Button asChild className="bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full">
                  <Link href="/dashboard/ai-classrooms/new">
                    Create Classroom
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userClassrooms.map((classroom) => (
                <Card key={classroom.id} className="border border-border rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-sm md:text-base text-[#111310]">{classroom.title}</h3>
                        <p className="text-xs md:text-sm text-[#7a7468] line-clamp-2 mt-1">
                          {classroom.prompt}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] md:text-xs text-[#7a7468]">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(classroom.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            classroom.status === 'ready'
                              ? 'bg-[#f0f7f3] text-[#1a6b3c]'
                              : classroom.status === 'generating'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {classroom.status}
                          </span>
                        </div>
                      </div>
                      {classroom.status === 'ready' && classroom.classroomUrl && (
                        <Button size="sm" asChild className="bg-[#1a6b3c] hover:bg-[#0d3d22] text-white shrink-0 rounded-full">
                          <Link href={classroom.classroomUrl}>
                            Open
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
