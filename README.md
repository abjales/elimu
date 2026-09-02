# ELIMU Africa — AI-Powered Learning Platform

> An online learning platform that combines a Udemy-style course marketplace with **OpenMAIC's multi-agent interactive AI classrooms**. Admins create free courses (AI-generated or manually uploaded); Pro subscribers unlock master classes and the ability to spin up private AI classrooms from a plain-text prompt — complete with AI teachers, classmates, slides, quizzes, whiteboards, and project-based learning.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Routes & Pages](#routes--pages)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [JARVIS Command Center](#jarvis-command-center)
- [Getting Started (Local)](#getting-started-local)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [OpenMAIC Fork](#openmaic-fork)
- [License & Credits](#license--credits)

---

## Features

### Course Marketplace
- **Catalog** with categories, levels (beginner/intermediate/advanced), and search/browse.
- Course types: **free**, **masterclass** (Pro), **ai-generated** (AI-authored), and **manual** (admin-uploaded).
- Sections, lessons (video, document, or embedded AI-classroom), ratings, reviews, and enrollment tracking with progress.

### AI-Generated Classrooms (OpenMAIC)
- Describe any topic in plain text and AI teachers build a full interactive lesson.
- **Multi-agent learning**: AI teachers *and* AI classmates lecture, discuss, and interact.
- Interactive content: slides, quizzes, whiteboard diagrams, and project-based learning (PBL v1 + v2).
- Per-stage **model routing** — pin different LLMs to different generation stages (outlines, scene content, actions, quizzes, chat).

### Pro Tier
- Stripe subscription checkout (monthly + annual), billing portal, and webhook-driven sync.
- Pro-only master classes and private AI classroom creation from prompts + uploaded source materials.

### Admin & Ops
- Admin course management (browse, create, edit, AI-generate).
- **JARVIS command center** — an immersive, holographic ops dashboard (see below).

---

## Architecture

```
                         ┌────────────────────────────┐
    Browser / Client     │        Nginx (TLS)         │
 ───────────────────────▶│  rate-limit · cache · gzip │
                         └──────┬──────────────┬──────┘
                                │ :3000        │ :3001
                    ┌───────────▼────┐   ┌─────▼──────────────┐
                    │  ELIMU Platform │   │    OpenMAIC         │
                    │  Next.js 15 App │◀──│  AI Classroom Engine│
                    │  (5 × PM2)      │   │  (2 × PM2 cluster)  │
                    └───┬──────┬──────┘   └───┬───────────────┘
                        │      │              │  (LLM / TTS / ASR /
                ┌───────▼──┐ ┌─▼─────────┐    │   image / video providers)
                │PostgreSQL│ │  Redis 7  │    │
                │   16     │ │  (cache)  │    │
                └──────────┘ └───────────┘    │
                                              ▼
                                    DeepSeek · OpenAI · Anthropic ·
                                    OpenRouter · MiniMax · Ollama · ...
```

- **ELIMU Platform** (port `3000`) — the marketplace, auth, billing, admin, and command center.
- **OpenMAIC** (port `3001`) — the forked AI classroom engine that renders interactive multi-agent lessons. ELIMU talks to it over `OPENMAIC_INTERNAL_URL` (HTTP, internal) and exposes it to the browser via `NEXT_PUBLIC_OPENMAIC_URL`.

---

## Tech Stack

| Layer          | Technology |
|----------------|------------|
| Frontend       | Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion, Lucide icons, Radix UI |
| Backend        | Next.js API Routes / Route Handlers |
| Database       | PostgreSQL 16 + Drizzle ORM |
| Cache          | Redis 7 |
| Auth           | NextAuth.js v5 (Credentials + Google OAuth) |
| Payments       | Stripe (checkout, portal, webhooks) |
| AI Engine      | OpenMAIC (forked, white-labeled) — multi-agent classrooms |
| AI Providers   | DeepSeek, OpenAI, Anthropic, OpenRouter, Google, MiniMax, Qwen, KIMI, GLM, SiliconFlow, Doubao, Grok/xAI, Tencent, Xiaomi MiMo, Ollama (local), Lemonade (local) |
| Media (OpenMAIC)| TTS (OpenAI/Azure/GLM/Qwen/MiniMax/ElevenLabs/Lemonade), ASR, image gen (OpenAI/Seedream/Qwen/MiniMax/Grok/Lemonade), video gen (Seedance/Kling/Veo/Sora/MiniMax/Grok/HappyHorse) |
| Process Mgr    | PM2 (cluster mode) |
| Reverse Proxy  | Nginx |
| Package Mgr    | pnpm (workspaces) |
| Testing        | Vitest, Playwright (e2e) |

---

## Project Structure

```
elimu/
├── elimu-platform/            # Main ELIMU application (port 3000)
│   ├── src/app/               # Next.js App Router pages + API routes
│   │   ├── admin/             # Admin dashboard + course management
│   │   ├── command-center/    # JARVIS ops center
│   │   ├── courses/           # Catalog, detail, lessons
│   │   ├── dashboard/         # Learner dashboard + AI classrooms
│   │   ├── pricing/           # Pro subscription
│   │   ├── login|register/    # Auth pages
│   │   └── api/               # Route handlers (see API section)
│   ├── src/components/        # React components (admin, auth, courses, dashboard, layout, ui)
│   ├── src/lib/               # auth, db (Drizzle schema + seeds), hooks, utils
│   ├── src/scripts/           # Helper scripts
│   ├── src/types/             # Shared TS types
│   ├── drizzle.config.ts      # Drizzle ORM config
│   ├── .env.example           # Env var template
│   └── package.json
│
├── openmaic/                  # Forked OpenMAIC AI classroom engine (port 3001)
│   ├── app/                   # App Router + API routes (classroom gen, PBL v2, TTS…)
│   ├── components/            # Scene renderers, edit tools, PBL workspace, stage
│   ├── lib/                   # Server (generation, model rotation, routing), i18n, store
│   ├── packages/              # @openmaic/* workspace packages
│   ├── data/                  # Generated classroom data (gitignored at runtime)
│   ├── tests/                 # Vitest suites + e2e
│   ├── .env.example           # Extensive provider configuration reference
│   └── README.md              # Upstream OpenMAIC docs
│
├── scripts/
│   ├── setup-server.sh                # VPS provisioning (Node, pnpm, PM2, Postgres, Redis, Nginx, Certbot)
│   ├── deploy.sh                      # Pull → install → build → migrate → PM2 restart
│   ├── nginx-config.conf              # ELIMU nginx site config
│   └── nginx-app.hatronsolutions.com.conf  # OpenMAIC classroom nginx site config
├── start-openmaic.sh         # Dev launcher for OpenMAIC (:3001)
├── ecosystem.config.js       # PM2 cluster config (platform ×5, openmaic ×2)
├── .gitignore
└── README.md
```

---

## Routes & Pages

### Public
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/courses` | Course catalog (search/browse/category/filter) |
| `/courses/[slug]` | Course detail |
| `/courses/[slug]/lessons/[lessonId]` | Individual lesson + embedded classroom |
| `/courses/category/[category]` | Category-filtered catalog |
| `/pricing` | Pro subscription plans |
| `/login`, `/register` | Auth |

### Authenticated
| Route | Description |
|-------|-------------|
| `/dashboard` | Learner dashboard (enrollments, progress) |
| `/dashboard/ai-classrooms` | List of user's AI classrooms |
| `/dashboard/ai-classrooms/new` | Create classroom from a prompt (Pro) |

### Admin / Ops
| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard |
| `/admin/courses` | Manage courses |
| `/admin/courses/new` | Create course (AI-generate or manual) |
| `/admin/courses/[courseId]` | Edit course |
| `/command-center` | JARVIS-style immersive ops center |

---

## API Routes

### ELIMU Platform (`elimu-platform/src/app/api/`)
| Path | Purpose |
|------|---------|
| `/api/auth/[...nextauth]` | NextAuth session handling |
| `/api/auth/register` | Email/password registration |
| `/api/courses`, `/api/courses/[slug|courseId]` | Course catalog + detail |
| `/api/courses/[courseId]/enroll` | Enrollment |
| `/api/lessons/[lessonId]` | Lesson detail |
| `/api/lessons/[lessonId]/complete` | Mark lesson complete |
| `/api/lessons/[lessonId]/generate-classroom` | Trigger AI classroom generation |
| `/api/lessons/[lessonId]/classroom-status` | Poll classroom generation status |
| `/api/ai-classrooms` / `[id]` / `webhook` | Pro AI classroom CRUD + OpenMAIC webhook |
| `/api/admin/courses` / `[id]` / `generate` | Admin course management + AI generation |
| `/api/billing/checkout` `portal` `webhook` | Stripe checkout, portal, webhook sync |
| `/api/user` / `upgrade` / `downgrade` | User profile + plan changes |
| `/api/command-center/*` | `stats`, `system`, `logs`, `action` (JARVIS ops) |

### OpenMAIC (`openmaic/app/api/`)
| Path | Purpose |
|------|---------|
| `/api/generate-classroom/[jobId]` | Classroom generation job status |
| `/api/generate/scene-outlines-stream` | Streaming scene-outline generation |
| `/api/generate/tts` `voice` `video` | TTS, voice, video generation |
| `/api/pbl/chat` | PBL v1 chat |
| `/api/pbl/v2/*` | PBL v2 (`open-task`, `simulator`, `instructor`, `task/update`, `evaluate`) |
| `/api/classroom-media/[classroomId]/[...path]` | Generated classroom media serving |
| `/api/provider/probe-models` | Model capability probing |

---

## Database Schema

Defined in `elimu-platform/src/lib/db/schema.ts` (Drizzle ORM, PostgreSQL):

| Table | Description |
|-------|-------------|
| `users` | Learners & admins (email, password hash, role, plan, Stripe customer) |
| `sessions`, `accounts`, `verification_tokens` | NextAuth v5 stores |
| `categories` | Course categories |
| `courses` | Course metadata (title, slug, level, type, `is_pro`, rating, enrollment count) |
| `course_sections` | Course sections (ordered) |
| `course_lessons` | Lessons (`video`/`document`/`ai-classroom`) with `openmaic_classroom_id` |
| `enrollments` | User ↔ course enrollment + progress % |
| `lesson_progress` | Per-lesson completion + score |
| `ai_classrooms` | Pro AI classrooms (prompt, source materials, OpenMAIC job id, status, expiry) |
| `reviews` | Course ratings + comments |
| `subscriptions` | Stripe subscriptions (`monthly`/`annual`, status) |

**Enums**: `user_role` (student/admin), `user_plan` (free/pro), `course_type` (free/masterclass/ai-generated/manual), `course_level`, `course_status`, `lesson_type`, `subscription_status`, `classroom_status` (generating/ready/failed).

Seed data lives in `elimu-platform/src/lib/db/seed.ts` and `seed-detailed.ts`.

---

## JARVIS Command Center

Located at `/command-center` — a full-screen, immersive Iron-Man-style ops dashboard:

- **Holographic aesthetic** — cyan/blue glow, radar scanner, particle effects (no navbar/footer).
- **Live system monitoring** — CPU, memory, disk, network, process list.
- **Platform analytics** — courses, users, enrollments, revenue, active users.
- **Real-time activity feed** — sourced from PM2 logs and the database.
- **Service status** — PostgreSQL, Redis, PM2, Nginx, OpenMAIC health.
- **Terminal-style command input** — deploy, backup, restart, health, cache actions.
- **Quick-action buttons** for common operations.
- **Course management panel** — browse/create courses.
- **Log viewer** — recent system logs.
- **Live refresh** every 5–15 seconds.

---

## Getting Started (Local)

### Prerequisites
- Node.js **20+** (see `openmaic/.nvmrc`)
- pnpm **10+**
- PostgreSQL **16**
- Redis **7**
- (Optional) Nginx for production parity

### 1. Clone

```bash
git clone https://github.com/<your-user>/elimu.git
cd elimu
```

### 2. ELIMU Platform

```bash
cd elimu-platform
pnpm install
cp .env.example .env.local      # fill in DATABASE_URL, NEXTAUTH_SECRET, etc.
pnpm db:push                    # create tables from Drizzle schema
pnpm dev                        # http://localhost:3000
```

### 3. OpenMAIC

```bash
cd ../openmaic
pnpm install
cp .env.example .env.local      # fill in your LLM provider key(s) + DEFAULT_MODEL
pnpm dev --port 3001            # http://localhost:3001
```

### 4. Open

- ELIMU → `http://localhost:3000`
- OpenMAIC classroom → `http://localhost:3001`

---

## Production Deployment

The repo ships with a full VPS provisioning + deploy pipeline for a Contabo VPS (Ubuntu 22.04).

### 1. Provision the server

```bash
ssh your-vps
# run scripts/setup-server.sh (installs Node 20, pnpm, PM2, PostgreSQL 16, Redis, Nginx, Certbot, Docker)
```

### 2. Clone & configure

```bash
cd /var/www/elimu
git clone <your-repo-url> .
cp elimu-platform/.env.example elimu-platform/.env.local   # edit
cp openmaic/.env.example openmaic/.env.local               # edit
```

### 3. Deploy

```bash
cd /var/www/elimu
./scripts/deploy.sh   # pull → install → build → migrate → pm2 restart
```

### 4. Nginx + SSL

```bash
sudo cp scripts/nginx-config.conf /etc/nginx/sites-available/elimu
sudo ln -s /etc/nginx/sites-available/elimu /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d elimu.com -d www.elimu.com
```

### PM2 (cluster mode)

`ecosystem.config.js` runs:
- `elimu-platform` — 5 cluster instances (`:3000`)
- `openmaic` — 2 cluster instances (`:3001`)

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## Environment Variables

Full templates are provided in `elimu-platform/.env.example` and `openmaic/.env.example`. Copy each to `.env.local` and never commit real values.

### ELIMU Platform (key vars)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | NextAuth base URL + signing secret |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe |
| `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_ANNUAL_PRICE_ID` | Pro plan price IDs |
| `OPENMAIC_URL`, `OPENMAIC_INTERNAL_URL` | OpenMAIC public + internal URLs |
| `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_OPENMAIC_URL` | App + OpenMAIC public URLs |

### OpenMAIC (key concepts)

- **Provider keys** use the `{PROVIDER}_API_KEY` / `_BASE_URL` / `_MODELS` convention for DeepSeek, OpenAI, Anthropic, Google, OpenRouter, MiniMax, Qwen, KIMI, GLM, SiliconFlow, Doubao, Grok/xAI, Tencent, Xiaomi MiMo, and local Ollama/Lemonade.
- **`DEFAULT_MODEL`** — the server-side default used when no stage route or client `x-model` is set (e.g. `deepseek:deepseek-v4-pro`).
- **`MODEL_ROUTES`** — optional per-stage routing JSON (`scene-outlines-stream`, `scene-content`, `scene-actions`, `agent-profiles`, `quiz-grade`, `pbl-chat`, `chat-adapter`, `generate-classroom`, `web-search-query-rewrite`), with `scene-content:<type>` composite keys and per-route `thinking` config.
- **`FREE_MODEL_ROTATION_ENABLED` / `FREE_MODEL_POOL`** — auto-rotate `DEFAULT_MODEL` when a free OpenRouter model hits its daily rate quota.
- **`ACCESS_CODE`** — optional site-wide access password.
- **`ALLOW_LOCAL_NETWORKS`** — enable for self-hosted (Ollama/Lemonade) models; disable on public deployments.
- TTS / ASR / image / video / PDF-processing keys are all optional and provider-specific.

---

## OpenMAIC Fork

`openmaic/` is a white-labeled fork of [OpenMAIC](https://github.com/THU-MAIC/OpenMAIC) (MIT license). ELIMU adds:

- **Free model auto-rotation** (`lib/server/free-model-rotation.ts`) — transparently cycles `DEFAULT_MODEL` across free OpenRouter models when a daily/rate quota is exhausted.
- **Quota-aware AI calls** (`quota-aware-ai-call`) — retries with fallback models on rate limits.
- **ELIMU branding** (`public/elimu-logo.*`, `elimu-mark.svg`).
- i18n config/types and store/settings integration for the ELIMU voice/model overrides.

Upstream documentation lives in `openmaic/README.md` (and `README-zh.md`); see `openmaic/CHANGELOG.md`, `CONTRIBUTING.md`, and `SECURITY.md` for the base project.

---

## License & Credits

- **ELIMU Platform**: MIT License.
- **OpenMAIC**: MIT License — Copyright (c) 2026 [THU-MAIC](https://github.com/THU-MAIC). See `openmaic/LICENSE`.

---

## Commands Cheat Sheet

```bash
# ELIMU platform
cd elimu-platform
pnpm dev            # dev server :3000
pnpm build          # production build
pnpm db:push        # push Drizzle schema → DB
pnpm db:generate    # generate migrations
pnpm db:migrate     # apply migrations
pnpm db:studio      # Drizzle Studio UI

# OpenMAIC
cd ../openmaic
pnpm dev --port 3001
pnpm build
pnpm test           # Vitest
pnpm lint

# Ops
pm2 start ecosystem.config.js
pm2 status
pm2 logs
```