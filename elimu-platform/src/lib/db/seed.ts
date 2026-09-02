import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { categories, courses } from './schema';
import { eq } from 'drizzle-orm';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://elimu:elimu_secure_2026@localhost:5432/elimu',
});

const db = drizzle(pool);

const seedCategories = [
  { name: 'Web Development', slug: 'web-development', description: 'HTML, CSS, JavaScript, React, Next.js and more', icon: '🌐' },
  { name: 'Data Science', slug: 'data-science', description: 'Python, Machine Learning, AI, and analytics', icon: '📊' },
  { name: 'Mobile Development', slug: 'mobile-development', description: 'iOS, Android, React Native, Flutter', icon: '📱' },
  { name: 'Cloud & DevOps', slug: 'cloud-devops', description: 'AWS, Docker, Kubernetes, CI/CD', icon: '☁️' },
  { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Ethical hacking, network security, forensics', icon: '🔒' },
  { name: 'Blockchain', slug: 'blockchain', description: 'Smart contracts, Web3, crypto development', icon: '⛓️' },
  { name: 'AI & Machine Learning', slug: 'ai-machine-learning', description: 'Neural networks, NLP, computer vision', icon: '🤖' },
  { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'Figma, user research, design systems', icon: '🎨' },
];

const seedCourses = [
  {
    title: 'Complete Web Developer Bootcamp 2026',
    slug: 'complete-web-developer-bootcamp-2026',
    description: 'Master HTML, CSS, JavaScript, React, Node.js, and more. Build 20+ real projects from scratch.',
    shortDescription: 'The most comprehensive web development course online',
    level: 'beginner' as const,
    type: 'free' as const,
    isPro: false,
    estimatedDuration: 4800,
    rating: 485,
    enrollmentCount: 12847,
    status: 'published' as const,
    categorySlug: 'web-development',
  },
  {
    title: 'Python for Data Science & AI',
    slug: 'python-for-data-science-ai',
    description: 'Learn Python from scratch, master NumPy, Pandas, Scikit-learn, TensorFlow. Build real ML models.',
    shortDescription: 'From zero to data scientist in 8 weeks',
    level: 'beginner' as const,
    type: 'free' as const,
    isPro: false,
    estimatedDuration: 3600,
    rating: 492,
    enrollmentCount: 9432,
    status: 'published' as const,
    categorySlug: 'data-science',
  },
  {
    title: 'React & Next.js Masterclass',
    slug: 'react-nextjs-masterclass',
    description: 'Deep dive into React 19, Next.js 15, Server Components, and modern web architecture.',
    shortDescription: 'Build production-ready React applications',
    level: 'intermediate' as const,
    type: 'free' as const,
    isPro: false,
    estimatedDuration: 2400,
    rating: 478,
    enrollmentCount: 6721,
    status: 'published' as const,
    categorySlug: 'web-development',
  },
  {
    title: 'AWS Solutions Architect Pro',
    slug: 'aws-solutions-architect-pro',
    description: 'Master AWS services, design highly available systems, and prepare for the certification.',
    shortDescription: 'Cloud architecture and certification prep',
    level: 'advanced' as const,
    type: 'masterclass' as const,
    isPro: true,
    estimatedDuration: 5400,
    rating: 488,
    enrollmentCount: 3245,
    status: 'published' as const,
    categorySlug: 'cloud-devops',
  },
  {
    title: 'Flutter Mobile App Development',
    slug: 'flutter-mobile-app-development',
    description: 'Build beautiful cross-platform mobile apps with Flutter and Dart.',
    shortDescription: 'One codebase, iOS and Android apps',
    level: 'beginner' as const,
    type: 'free' as const,
    isPro: false,
    estimatedDuration: 3000,
    rating: 471,
    enrollmentCount: 5123,
    status: 'published' as const,
    categorySlug: 'mobile-development',
  },
  {
    title: 'Ethical Hacking Complete Course',
    slug: 'ethical-hacking-complete-course',
    description: 'Learn penetration testing, network security, and ethical hacking techniques.',
    shortDescription: 'Become a certified ethical hacker',
    level: 'intermediate' as const,
    type: 'free' as const,
    isPro: false,
    estimatedDuration: 4200,
    rating: 483,
    enrollmentCount: 4567,
    status: 'published' as const,
    categorySlug: 'cybersecurity',
  },
];

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Insert categories
  for (const cat of seedCategories) {
    const existing = await db.select().from(categories).where(eq(categories.slug, cat.slug));
    if (existing.length === 0) {
      await db.insert(categories).values(cat);
      console.log(`✅ Category: ${cat.name}`);
    } else {
      console.log(`⏭️  Category exists: ${cat.name}`);
    }
  }

  // Get category IDs for courses
  const allCategories = await db.select().from(categories);

  // Insert courses
  for (const course of seedCourses) {
    const existing = await db.select().from(courses).where(eq(courses.slug, course.slug));
    if (existing.length === 0) {
      const category = allCategories.find(c => c.slug === course.categorySlug);
      await db.insert(courses).values({
        title: course.title,
        slug: course.slug,
        description: course.description,
        shortDescription: course.shortDescription,
        level: course.level,
        type: course.type,
        isPro: course.isPro,
        estimatedDuration: course.estimatedDuration,
        rating: course.rating,
        enrollmentCount: course.enrollmentCount,
        status: course.status,
        categoryId: category?.id,
      });
      console.log(`✅ Course: ${course.title}`);
    } else {
      console.log(`⏭️  Course exists: ${course.title}`);
    }
  }

  console.log('\n🎉 Seed complete!');
  await pool.end();
}

seed().catch(console.error);
