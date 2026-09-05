# ELIMU Africa — Architecture Report
Generated: 2026-09-06 · Author: abjales (Hermes agent)
Scope: production-completion & hardening inspection (Phase 0 / 0.1)

---

## A. Current architecture

Monorepo at `/home/abjales/projects/elimu` with two independent Next.js apps
plus deployment scripts, managed by PM2 cluster mode behind nginx + Let's Encrypt.

```
elimu/ (git repo, branch main)
├── elimu-platform/   # MAIN app — courses, auth, billing, admin (port 3000)
├── openmaic/         # Forked AI classroom engine (port 3001, embedded via iframe)
├── scripts/          # deploy.sh, nginx configs, setup-server.sh
├── ecosystem.config.js  # PM2 cluster config (both apps)
└── start-openmaic.sh
```

Production URL: `https://elimu.hatronsolutions.com`
- nginx reverse-proxies 443 → `127.0.0.1:3000` (elimu-platform).
- openmaic is served HTTPS on `:9443` (reuses the elimu cert) so the classroom
  iframe isn't blocked by mixed-content; proxies → `127.0.0.1:3001`.

## B. Frontend stack
- Next.js 15 (App Router), React 19, TypeScript 5.7
- Tailwind CSS v4, Framer Motion 12, Radix UI primitives, lucide-react
- `@stripe/stripe-js` (client Stripe loader — currently unused/empty keys)

## C. Backend stack
- Next.js Route Handlers (App Router `src/app/api/**/route.ts`) — no separate backend
- Drizzle ORM over `postgres` (postgres-js) connection pool (max 10)
- zod for input validation, bcryptjs for password hashing

## D. Database schema (PostgreSQL 16, database `elimu`)
13 tables. Key tables/columns:
- `users`: id, email (unique), name, password_hash, avatar, role (student|admin),
  plan (free|pro), stripe_customer_id, pro_since, created_at, updated_at
- `sessions`, `accounts`, `verification_tokens` (NextAuth)
- `categories`, `courses` (is_pro, status, type, level, rating, enrollment_count),
  `course_sections`, `course_lessons` (type video|document|ai-classroom, openmaic_classroom_id)
- `enrollments`, `lesson_progress`
- `ai_classrooms` (Pro AI classrooms; openmaic_job_id, classroom_url, status)
- `reviews`
- `subscriptions` (stripe_sub_id, plan monthly|annual, status, current_period_end)

NOTE: no `drizzle/` migrations directory exists — schema is applied via `drizzle-kit push`.
`scripts/deploy.sh` calls `pnpm db:migrate` which would fail; deployment has relied on
`db:push`. This is a hardening item.

## E. Authentication
NextAuth v5 (`next-auth@5.0.0-beta.25`), JWT session strategy + Drizzle adapter.
- Credentials provider (email+password, bcrypt).
- Google OAuth (conditional — only if `GOOGLE_CLIENT_ID`/`SECRET` set).
- First-created user auto-promoted to `admin` role (via `createUser` event).
- Custom registration route `POST /api/auth/register`.

## F. Course architecture
- Courses have sections → lessons. Lesson types: video, document, ai-classroom.
- Enrollment: `POST /api/courses/[courseId]/enroll` → 401 (no session), 403 (Pro course +
  free user), 200/201 (enrolled). PRO gating is bypassed while `BYPASS_PRO_PAYWALL=true`.
- 5 Pro courses, 14 free courses currently published.

## G. Lesson-generation (AI classroom) architecture
- `POST /api/lessons/[lessonId]/generate-classroom` proxies to openmaic
  `POST /api/generate-classroom`, stores `pending:<jobId>` on the lesson, polls status.
- openmaic webhook `POST /api/ai-classrooms/webhook` (Bearer `OPENMAIC_WEBHOOK_SECRET`)
  updates classroom status/URL.
- Classroom rendered in `components/classroom-player.tsx` iframe → openmaic HTTPS `:9443`.

## H. Subscription architecture
- `users.plan` (free|pro) is the source of truth for gating.
- `subscriptions` table stores Stripe subscription records (currently unused/empty).
- Stripe checkout + webhook routes EXIST but are not live (keys empty).
- Manual upgrade/downgrade routes exist: `POST /api/user/upgrade`, `/api/user/downgrade`.

## I. AI provider(s)
- openmaic resolves LLM via OpenRouter (default model `DEFAULT_MODEL`, free-model rotation),
  plus optional Google Gemini key. See `elimu-openmaic-ops` skill.

## J. Deployment architecture
- PM2 cluster: `elimu-platform` (5 workers, :3000), `openmaic` (2 workers, :3001).
- Logs → `/var/log/elimu/*-error.log` / `*-out.log`.
- nginx sites-enabled: `elimu`, `elimu-openmaic-https.conf` (plus unrelated apps).
- SSL via certbot (certs in `/etc/letsencrypt/live/<domain>/`).

## K. Existing admin capabilities
- `/admin` dashboard, course CRUD (`/api/admin/courses`, `/api/admin/courses/[courseId]`),
  AI generation (`/api/admin/generate`).
- `/command-center` (JARVIS-style ops center) with system stats, logs, actions.
- NOTE: **no user currently has the `admin` role** (all 11 users are `student`/`free`),
  because the "first user = admin" event ran before the role column was exercised, or the
  first account is no longer admin. Hardening item.

## L. Existing problems discovered
1. Stripe billing is scaffolded but NOT live: `STRIPE_*` keys empty.
2. `api/billing/webhook` `checkout.session.completed` sets `proSince` but NOT `plan='pro'`
   → a successful Stripe charge would NOT grant Pro (enrollment reads `users.plan`).
3. Pricing page "Start Pro Trial" links to `/register?plan=pro`, not `/api/billing/checkout`
   — never starts a payment.
4. No `drizzle/` migration history (relies on `db:push`); `deploy.sh` calls `db:migrate`.
5. No admin user exists in production (role=admin count is 0).
6. `BYPASS_PRO_PAYWALL=true` is active in production (Pro courses freely enrollable).
7. No automated DB backups configured.
8. No M-Pesa/Daraja integration (primary requested payment method absent).
9. No test suite in elimu-platform (openmaic has vitest tests; platform has none).
10. middleware security headers are set, but admin/dashboard route protection is a no-op
    stub (relies on server components only).

## M. Recommended implementation approach
- ADD M-Pesa Daraja STK Push as the primary payment path (server-side only, env-driven),
  integrated into the existing `users.plan` gating model — do NOT remove Stripe scaffolding.
- Add a `payments`/`transactions` table (idempotent, audit-able) for M-Pesa requests + callbacks.
- Fix the latent Stripe `plan='pro'` bug + pricing-page CTA (cheap, correct).
- Additive DB migrations via `drizzle-kit generate` + `push` (no destructive drops).
- Introduce a real admin user (explicitly, after confirmation).
- Configure nightly `pg_dump` backup cron.

## N. Files likely to be modified (Feature 1 — M-Pesa)
- `elimu-platform/src/lib/db/schema.ts` — add `payments` table + enum(s)
- `elimu-platform/src/lib/mpesa.ts` — NEW: Daraja auth + STK push + callback verify
- `elimu-platform/src/app/api/payments/mpesa/stk-push/route.ts` — NEW
- `elimu-platform/src/app/api/payments/mpesa/callback/route.ts` — NEW (also confirmation route)
- `elimu-platform/src/app/api/payments/mpesa/status/route.ts` — NEW (query transaction)
- `elimu-platform/src/app/pricing/page.tsx` — M-Pesa phone-number checkout UI
- `elimu-platform/src/app/api/billing/webhook/route.ts` — fix `plan='pro'` bug
- `elimu-platform/.env.example` — document M-Pesa vars
- `elimu-platform/package.json` — no new deps needed (Daraja is plain HTTPS/fetch)

## O. Database migrations required (additive)
- New enum `payment_status` (pending | completed | failed | canceled)
- New enum `payment_provider` (mpesa | stripe) [or text column]
- New table `payments`: id, user_id, provider, provider_ref (e.g. CheckoutRequestID /
  MpesaReceiptNumber), phone, amount, currency, plan (monthly|annual), status,
  raw_callback (jsonb), created_at, updated_at, completed_at.
- (optional) `users` already has `plan`/`pro_since` — no change needed.

## Q. Dependencies / env vars required (Feature 1 — M-Pesa)
No new npm dependencies (use built-in `fetch` + `crypto`). New env vars:
- `MPESA_ENVIRONMENT` (`sandbox` | `production`)
- `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`
- `MPESA_PASSKEY` (STK push passkey / Lipa Na M-Pesa Online)
- `MPESA_SHORTCODE` (business/Till/Paybill number)
- `MPESA_SHORTCODE_TYPE` (`till` | `paybill`) — for callback `BusinessShortCode` validation
- `MPESA_CALLBACK_URL` (must be internet-reachable HTTPS; e.g. the elimu domain)
- `MPESA_PRO_MONTHLY_AMOUNT_KSHS`, `MPESA_PRO_ANNUAL_AMOUNT_KSHS`
- (existing) `NEXT_PUBLIC_APP_URL` for success/cancel URLs

Daraja API endpoints:
- Auth: `POST https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`
  (sandbox: `https://sandbox.safaricom.co.ke/oauth/v1/generate`)
- STK Push: `POST .../mpesa/stkpush/v1/processrequest`
- Query: `POST .../mpesa/stkpushquery/v1/query`

---
END OF REPORT
