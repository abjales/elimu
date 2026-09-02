import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { aiClassrooms } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Sparkles, Clock, ExternalLink, XCircle } from 'lucide-react';

export default async function ClassroomsListPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const classrooms = await db.query.aiClassrooms.findMany({
    where: eq(aiClassrooms.userId, (session.user as any).id),
    orderBy: [desc(aiClassrooms.createdAt)],
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-4xl">
      <div className="mb-6 md:mb-8">
        <Button variant="ghost" asChild className="mb-3 md:mb-4 text-stone-600 hover:text-stone-900">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111310]">AI Classrooms</h1>
            <p className="text-[#7a7468] mt-1 text-sm md:text-base">
              Create interactive AI-powered learning experiences on any topic.
            </p>
          </div>
          <Button asChild className="bg-[#1a6b3c] hover:bg-[#0d3d22] text-white shrink-0 rounded-full">
            <Link href="/dashboard/ai-classrooms/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Link>
          </Button>
        </div>
      </div>

      {classrooms.length === 0 ? (
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-8 md:p-12 text-center">
            <Sparkles className="h-10 w-10 md:h-12 md:w-12 text-stone-300 mx-auto mb-3 md:mb-4" />
            <h3 className="font-semibold text-base md:text-lg mb-2 text-[#111310]">No classrooms yet</h3>
            <p className="text-[#7a7468] mb-5 md:mb-6 max-w-md mx-auto text-sm md:text-base">
              Describe any topic and our AI teachers will create a full interactive
              classroom with slides, quizzes, whiteboard diagrams, and discussions.
            </p>
            <Button asChild size="lg" className="bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full">
              <Link href="/dashboard/ai-classrooms/new">
                <Sparkles className="mr-2 h-4 w-4" />
                Create Your First Classroom
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {classrooms.map((classroom) => (
            <Card key={classroom.id} className="border border-border rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm md:text-base truncate text-[#111310]">{classroom.title}</h3>
                    <p className="text-xs md:text-sm text-[#7a7468] line-clamp-2 mt-1">
                      {classroom.prompt}
                    </p>
                    <div className="flex items-center gap-2 md:gap-3 mt-2 text-[10px] md:text-xs text-[#7a7468]">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(classroom.createdAt).toLocaleDateString()}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium ${
                          classroom.status === 'ready'
                            ? 'bg-[#f0f7f3] text-[#1a6b3c]'
                            : classroom.status === 'generating'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {classroom.status === 'ready'
                          ? 'Ready'
                          : classroom.status === 'generating'
                            ? 'Generating...'
                            : 'Failed'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {classroom.status === 'ready' && classroom.classroomUrl && (
                      <Button size="sm" asChild className="bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full">
                        <a href={classroom.classroomUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1 h-3.5 w-3.5" />
                          Open
                        </a>
                      </Button>
                    )}
                    {classroom.status === 'generating' && (
                      <span className="text-xs text-[#7a7468]">Processing...</span>
                    )}
                    {classroom.status === 'failed' && (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Failed
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
