import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  uuid,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['student', 'admin']);
export const userPlanEnum = pgEnum('user_plan', ['free', 'pro']);
export const courseTypeEnum = pgEnum('course_type', ['free', 'masterclass', 'ai-generated', 'manual']);
export const courseLevelEnum = pgEnum('course_level', ['beginner', 'intermediate', 'advanced']);
export const courseStatusEnum = pgEnum('course_status', ['draft', 'published', 'archived']);
export const lessonTypeEnum = pgEnum('lesson_type', ['video', 'document', 'ai-classroom']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'trialing']);
export const classroomStatusEnum = pgEnum('classroom_status', ['generating', 'ready', 'failed']);
export const paymentProviderEnum = pgEnum('payment_provider', ['mpesa', 'stripe']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'canceled']);

// Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: text('password_hash'),
  avatar: text('avatar'),
  role: userRoleEnum('role').default('student').notNull(),
  plan: userPlanEnum('plan').default('free').notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  proSince: timestamp('pro_since'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions (for NextAuth)
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
});

// Accounts (for OAuth)
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at'),
});

// Verification tokens (for email)
export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires: timestamp('expires').notNull(),
});

// Categories
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Courses
export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  shortDescription: varchar('short_description', { length: 500 }),
  thumbnail: text('thumbnail'),
  categoryId: uuid('category_id').references(() => categories.id),
  level: courseLevelEnum('level').default('beginner'),
  type: courseTypeEnum('type').default('free'),
  isPro: boolean('is_pro').default(false),
  estimatedDuration: integer('estimated_duration'), // in minutes
  rating: integer('rating').default(0), // 0-500 (0-5.00 * 100)
  enrollmentCount: integer('enrollment_count').default(0),
  status: courseStatusEnum('status').default('draft'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Course Sections
export const courseSections = pgTable('course_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Course Lessons
export const courseLessons = pgTable('course_lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id').references(() => courseSections.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  type: lessonTypeEnum('type').default('video'),
  contentUrl: text('content_url'),
  openmaicClassroomId: varchar('openmaic_classroom_id', { length: 255 }),
  duration: integer('duration'), // in minutes
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Enrollments
export const enrollments = pgTable('enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  progressPct: integer('progress_pct').default(0),
});

// Lesson Progress
export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lessonId: uuid('lesson_id').references(() => courseLessons.id, { onDelete: 'cascade' }).notNull(),
  completed: boolean('completed').default(false),
  score: integer('score'),
  completedAt: timestamp('completed_at'),
});

// AI Classrooms (Pro tier)
export const aiClassrooms = pgTable('ai_classrooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  prompt: text('prompt'),
  sourceMaterials: jsonb('source_materials'),
  openmaicJobId: varchar('openmaic_job_id', { length: 255 }),
  classroomUrl: text('classroom_url'),
  status: classroomStatusEnum('status').default('generating'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

// Reviews
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Subscriptions
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  stripeSubId: varchar('stripe_sub_id', { length: 255 }).notNull(),
  plan: varchar('plan', { length: 50 }).notNull(), // 'monthly' | 'annual' | 'lifetime'
  status: subscriptionStatusEnum('status').default('active'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payments (M-Pesa / Stripe transactions)
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider: paymentProviderEnum('provider').notNull(),
  plan: varchar('plan', { length: 50 }).notNull(), // 'monthly' | 'annual' | 'lifetime'
  amount: integer('amount').notNull(), // integer amount (KES for M-Pesa, cents for Stripe)
  currency: varchar('currency', { length: 3 }).default('KES').notNull(),
  phone: varchar('phone', { length: 20 }),
  merchantRequestId: varchar('merchant_request_id', { length: 100 }),
  checkoutRequestId: varchar('checkout_request_id', { length: 100 }),
  mpesaReceiptNumber: varchar('mpesa_receipt_number', { length: 100 }),
  status: paymentStatusEnum('status').default('pending').notNull(),
  rawCallback: jsonb('raw_callback'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// === Relations ===

export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  classrooms: many(aiClassrooms),
  reviews: many(reviews),
  subscriptions: many(subscriptions),
  payments: many(payments),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  creator: one(users, {
    fields: [courses.createdBy],
    references: [users.id],
  }),
  sections: many(courseSections),
  enrollments: many(enrollments),
  reviews: many(reviews),
}));

export const courseSectionsRelations = relations(courseSections, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseSections.courseId],
    references: [courses.id],
  }),
  lessons: many(courseLessons),
}));

export const courseLessonsRelations = relations(courseLessons, ({ one }) => ({
  section: one(courseSections, {
    fields: [courseLessons.sectionId],
    references: [courseSections.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const aiClassroomsRelations = relations(aiClassrooms, ({ one }) => ({
  user: one(users, {
    fields: [aiClassrooms.userId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [reviews.courseId],
    references: [courses.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));
