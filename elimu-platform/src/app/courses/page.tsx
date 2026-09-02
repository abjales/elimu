import { db } from '@/lib/db';
import { courses, categories, courseSections, courseLessons, enrollments } from '@/lib/db/schema';
import { eq, desc, and, like, sql } from 'drizzle-orm';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Star, Users, Clock, Search, Filter, X } from 'lucide-react';
import Image from 'next/image';
import { categoryThumbnail } from '@/lib/imagery';
import MobileFilterDrawer from './mobile-filter-drawer';

interface CoursesPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    level?: string;
    page?: string;
  }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 12;
  const offset = (page - 1) * limit;

  const conditions = [eq(courses.status, 'published')];
  if (params.q) {
    conditions.push(like(courses.title, `%${params.q}%`));
  }
  if (params.category) {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, params.category),
    });
    if (category) {
      conditions.push(eq(courses.categoryId, category.id));
    }
  }
  if (params.level) {
    conditions.push(eq(courses.level, params.level as any));
  }

  const courseList = await db.query.courses.findMany({
    where: and(...conditions),
    with: {
      category: true,
    },
    orderBy: [desc(courses.enrollmentCount)],
    limit,
    offset,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(courses)
    .where(and(...conditions));

  const totalPages = Math.ceil(count / limit);

  const categoryList = await db.query.categories.findMany({
    orderBy: [categories.name],
  });

  const activeCategoryName = params.category
    ? categoryList.find(c => c.slug === params.category)?.name
    : null;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1a6b3c] mb-2">COURSES</p>
        <h1 className="text-2xl md:text-4xl font-extrabold mb-2 text-[#111310] font-[family-name:var(--font-playfair)]">Browse Courses</h1>
        <p className="text-[#7a7468] text-sm md:text-base">
          Discover AI-powered courses on {count} topics
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 md:mb-8 space-y-3">
        <form className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a7468]" />
            <input
              type="text"
              name="q"
              defaultValue={params.q}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20 focus:border-[#1a6b3c]"
            />
          </div>
          <Button type="submit" className="bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full">Search</Button>
        </form>

        {/* Mobile: filter button + active filters */}
        <div className="flex items-center gap-2 md:hidden">
          <MobileFilterDrawer
            categories={categoryList.map(c => ({ name: c.name, slug: c.slug }))}
            currentCategory={params.category || ''}
            currentLevel={params.level || ''}
          />
          {activeCategoryName && (
            <Link
              href={`/courses?${new URLSearchParams({
                ...(params.q ? { q: params.q } : {}),
                ...(params.level ? { level: params.level } : {}),
              }).toString()}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#f0f7f3] text-[#1a6b3c] rounded-full text-xs font-medium border border-[#1a6b3c]/20"
            >
              {activeCategoryName}
              <X className="h-3 w-3" />
            </Link>
          )}
          {params.level && (
            <Link
              href={`/courses?${new URLSearchParams({
                ...(params.q ? { q: params.q } : {}),
                ...(params.category ? { category: params.category } : {}),
              }).toString()}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#f0f7f3] text-[#1a6b3c] rounded-full text-xs font-medium border border-[#1a6b3c]/20"
            >
              {params.level}
              <X className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
        {/* Sidebar - Categories (desktop only) */}
        <aside className="hidden lg:block lg:col-span-1">
          <Card className="border border-border rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-[#111310]">Categories</h3>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/courses"
                    className={`text-sm px-2 py-1.5 rounded-full transition-colors block ${
                      !params.category ? 'text-[#1a6b3c] bg-[#f0f7f3] font-medium' : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    All Courses
                  </Link>
                </li>
                {categoryList.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/courses?category=${cat.slug}`}
                      className={`text-sm px-2 py-1.5 rounded-full transition-colors block ${
                        params.category === cat.slug ? 'text-[#1a6b3c] bg-[#f0f7f3] font-medium' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>

        {/* Course Grid */}
        <div className="lg:col-span-3">
          {courseList.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[#111310]">No courses found</h3>
              <p className="text-[#7a7468]">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {courseList.map((course) => (
                  <Link key={course.id} href={`/courses/${course.slug}`}>
                    <div className="h-full rounded-2xl bg-white border border-[rgba(17,19,16,0.10)] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                      <div className="aspect-video bg-stone-100 relative overflow-hidden">
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <Image
                            src={categoryThumbnail(course.category?.slug, course.slug)}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        )}
                        {course.isPro && (
                          <span className="absolute top-2 right-2 bg-[#e8b84b] text-[#111310] text-[10px] font-semibold px-3 py-1 rounded-full">PRO</span>
                        )}
                      </div>
                      <div className="p-3 md:p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Badge variant="secondary" className="text-[10px] bg-stone-100 text-stone-600 rounded-full">
                            {course.level}
                          </Badge>
                          {course.category && (
                            <Badge variant="outline" className="text-[10px] border-border text-[#7a7468] rounded-full">
                              {course.category.name}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-[#111310]">{course.title}</h3>
                        <p className="text-xs text-[#7a7468] mb-2 line-clamp-2">{course.shortDescription}</p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-[#e8b84b] text-[#e8b84b]" />
                            <span className="font-medium text-stone-700">{((course.rating ?? 0) / 100).toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#7a7468]">
                            <Users className="h-3 w-3" />
                            <span>{course.enrollmentCount?.toLocaleString()}</span>
                          </div>
                          {course.estimatedDuration && (
                            <div className="flex items-center gap-1 text-[#7a7468]">
                              <Clock className="h-3 w-3" />
                              <span>{Math.floor(course.estimatedDuration / 60)}h</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      asChild
                      className={p === page ? 'bg-[#1a6b3c] hover:bg-[#0d3d22] text-white rounded-full' : 'border-border text-stone-600 rounded-full'}
                    >
                      <Link
                        href={`/courses?${new URLSearchParams({
                          ...(params.q ? { q: params.q } : {}),
                          ...(params.category ? { category: params.category } : {}),
                          ...(params.level ? { level: params.level } : {}),
                          page: String(p),
                        }).toString()}`}
                      >
                        {p}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
