# EduNest

**EduNest is a multi-tenant digital campus platform for schools and universities.** It brings academic management, teaching and learning, student engagement, communication, and campus operations into one system, so institutions don't have to stitch together separate tools for records, LMS, messaging, admissions, and administration.

It is built as a production-oriented TypeScript monorepo: a **NestJS** API, a **Next.js** web app, shared type and UI packages, Docker-based infrastructure, and a GitHub Actions to AWS delivery pipeline.

> Contributors and AI agents: read [AGENT.md](./AGENT.md) (and [CLAUDE.md](./CLAUDE.md) for Claude Code) before making changes. **Never commit or push to `master`.** Every change goes through a feature branch and a pull request.

---

## Table of contents

- [Who it's for](#who-its-for)
- [Features](#features)
- [Module status](#module-status)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Common commands](#common-commands)
- [Database](#database)
- [API](#api)
- [Testing & quality](#testing--quality)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Documentation](#documentation)

---

## Who it's for

EduNest serves every role on campus through role-based access control:

| Role | What they do in EduNest |
| --- | --- |
| **Student** | Enrolled courses, lessons, assessments, live classes, timetable, learning streaks, messaging |
| **Teacher** | Manage course offerings, modules, lessons, assessments, live classes, grading |
| **Parent** | Follow linked students' progress (parent ↔ student relationships) |
| **Admin / Principal / Vice-Principal** | School profile, semesters, calendar publishing, scoring schemas, announcements, news, user roles |
| **Super Admin** | Everything an admin can do, plus granting admin-tier roles |
| **Non-academic staff** | Operational workflows such as complaints and hostel management |

Each **School** is a tenant. Users, courses, and records are scoped to their school.

---

## Features

### Academic management
- Schools, departments, academic sessions, and semesters (with an "active semester")
- Course catalog, course offerings per session, and multiple instructors per offering
- Student enrollment and enrollment status tracking
- Configurable **scoring schemas** (weighted components such as CA, exams, projects) per offering

### Teaching & learning
- Course modules and lessons with multiple content types
- Lesson progress tracking and engagement events
- Assessments, submissions, and grades
- **Live classes** with participants and status (scheduled, live, ended)
- Personal **timetable** and "My courses" views
- Student **dashboard summary** (courses, upcoming work, activity)

### Engagement
- **Learning streaks** built from daily study activity, with streak-freeze tokens
- Realtime updates over Socket.IO

### Communication
- Chat rooms with participants and roles, and realtime messaging (`join-room`, `send-message`)
- School-wide **announcements** with audience targeting
- **News** posts with draft/publish workflow
- School **calendar** events with publish control

### Campus operations
- **Admissions:** admission cycles and applications
- **Jobs & placements:** job postings and applications
- **Hostels:** hostels, rooms, and allocations
- **Complaints:** submission, status tracking, and comments
- **Media:** uploaded file records per user

### AI (in progress)
- AI job pipeline (summaries, transcription, tutoring, recommendations) processed asynchronously through BullMQ workers

### Identity & access
- Google OAuth sign-in, with a JWT issued in an httpOnly cookie
- RBAC with role guards. Admin-tier roles can only be granted by a Super Admin.
- Bootstrap role assignment via `SUPER_ADMIN_EMAILS` / `TEACHER_EMAILS`

---

## Module status

The database schema covers every domain above. API and UI coverage is being built ticket by ticket. **Keep this table current when you ship a feature.**

| Area | API (`apps/api/src`) | Web (`apps/web/app`) | Status |
| --- | --- | --- | --- |
| Auth (Google OAuth, JWT, `/auth/me`, logout) | `auth` | `/`, `/auth/callback` | ✅ Implemented |
| Users & role management | `users`, `auth/roles.controller` | — | ✅ API |
| School profile | `school` | — | ✅ API |
| Semesters | `semesters` | — | ✅ API |
| Scoring schemas | `scoring` | — | ✅ API |
| Academics (courses, offerings, modules, lessons, assessments, live classes, dashboard) | `academics` | `/dashboard`, `/my-courses`, `/my-courses/[courseOfferingId]`, `/live-classes`, `/live-classes/[id]` | ✅ Implemented |
| Calendar | `calendar` | `/timetable` | ✅ Implemented |
| Streaks | `streak` | `/streak` | ✅ Implemented |
| Messaging & realtime chat | `messaging`, `realtime` | Chat hook (`use-chat-room`) | 🟡 Partial |
| Announcements | `announcements` | — | ✅ API |
| News | `news` | — | ✅ API |
| Background jobs | `queue` (BullMQ, AI jobs processor) | — | 🟡 Foundation |
| Admissions | `admissions` (read-only) | — | ⚪ Skeleton |
| Jobs & placements | `jobs` (read-only) | — | ⚪ Skeleton |
| Complaints | `complaints` (create, list mine) | — | ⚪ Skeleton |
| Media | `media` (list mine) | — | ⚪ Skeleton |
| AI | `ai` (list jobs) | — | ⚪ Skeleton |
| Hostels | Schema only | — | ⚪ Planned |
| Parent portal | Schema only | — | ⚪ Planned |

Legend: ✅ implemented · 🟡 partial / foundation · ⚪ skeleton or planned

---

## Architecture

```
                ┌──────────────────────────┐
  Browser ────► │  apps/web  (Next.js 16)  │  React 19, TanStack Query, axios
                └────────────┬─────────────┘
                             │  HTTPS (cookie: access_token)  +  Socket.IO
                             ▼
                ┌──────────────────────────┐
                │  apps/api  (NestJS 11)   │  /api/v1/*  ·  /docs (Swagger, non-prod)
                │  Guards · DTOs · Modules │
                └──────┬──────────┬────────┘
                       │          │
              Prisma 6 │          │ BullMQ
                       ▼          ▼
               ┌────────────┐  ┌─────────┐
               │ PostgreSQL │  │  Redis  │ ◄── queue workers (AI jobs, etc.)
               └────────────┘  └─────────┘

  packages/types ── shared contracts ──► api + web
  packages/ui    ── shared components ─► web
```

- **API:** feature modules (controller, service, DTOs), global `ValidationPipe` with whitelisting, JWT auth guard plus role guard, Prisma for data access, BullMQ for async work, and a Socket.IO gateway for realtime.
- **Web:** App Router pages in `app/`. Data flows `services/*.service.ts` (axios client) → `hooks/use-*.ts` (TanStack Query) → components. Route protection runs in `middleware.ts`, but the API is always the authority.
- **Shared:** `@workspace/types` keeps API and web contracts aligned, and `@workspace/ui` provides shadcn/Radix components styled with Tailwind v4.

---

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, shadcn/ui + Radix, TanStack Query, axios, socket.io-client, next-themes, sonner, date-fns |
| Backend | NestJS 11, Prisma 6, PostgreSQL, BullMQ + ioredis, Socket.IO, Passport (Google OAuth 2.0, JWT), class-validator, Swagger |
| Tooling | pnpm 11 workspaces, Turborepo, TypeScript 5.9, ESLint 9, Prettier 3, Jest 30 |
| Infra | Docker (multi-stage), Docker Compose, GitHub Actions, AWS ECR + EC2 |

---

## Repository structure

```
EduNest/
├── apps/
│   ├── api/                 # edunest-api: NestJS backend
│   │   ├── prisma/          # schema.prisma, migrations/, seed.ts
│   │   ├── src/
│   │   │   ├── academics/ admissions/ ai/ announcements/ auth/ calendar/
│   │   │   ├── complaints/ jobs/ media/ messaging/ news/ queue/ realtime/
│   │   │   ├── school/ scoring/ semesters/ streak/ users/
│   │   │   ├── common/      # guards, decorators, role constants
│   │   │   ├── prisma/      # PrismaService
│   │   │   └── main.ts      # bootstrap: /api/v1 prefix, CORS, Swagger
│   │   └── test/            # e2e tests
│   └── web/                 # edunest-web: Next.js frontend
│       ├── app/             # routes (dashboard, my-courses, live-classes, streak, timetable, auth)
│       ├── components/      # feature components
│       ├── hooks/           # TanStack Query hooks
│       ├── services/        # API service functions
│       ├── lib/             # api-client and helpers
│       ├── providers/       # app-wide providers
│       └── middleware.ts    # route protection
├── packages/
│   ├── types/               # @workspace/types
│   ├── ui/                  # @workspace/ui
│   ├── eslint-config/       # @workspace/eslint-config
│   └── typescript-config/   # @workspace/typescript-config
├── container/               # Dockerfile, docker-compose.{,hybrid,full,prod}.yml, init SQL
├── .github/workflows/       # ci.yml, cd.yml
├── Makefile                 # developer shortcuts (run `make help`)
├── AGENT.md                 # rules for all agents & contributors
├── CLAUDE.md                # Claude Code guidance
└── AWS_SETUP.md             # deployment setup
```

---

## Getting started

### Prerequisites

- Node.js **≥ 20** (CI uses 22)
- **pnpm 11** (`corepack enable` picks up the pinned version)
- **Docker** (for PostgreSQL and Redis)
- A Google OAuth client (for sign-in)

### Setup

```bash
git clone git@github.com:Ernie1234/EduNest.git
cd EduNest

pnpm install                     # installs all workspaces and generates the Prisma client
cp .env.example .env             # fill in your local values (never commit .env)

make h-up                        # start Postgres + Redis in Docker
pnpm --filter edunest-api db:migrate
pnpm --filter edunest-api db:seed

make dev                         # run API and web together
```

- Web: http://localhost:3000
- API: http://localhost:8080/api/v1
- Swagger docs: http://localhost:8080/docs (disabled in production)

### Run modes

| Mode | Command | What runs where |
| --- | --- | --- |
| **Hybrid (recommended)** | `make h-dev` | Postgres + Redis in Docker; API + web on your machine |
| Local only | `make dev` | Everything on your machine (you provide Postgres + Redis) |
| Full Docker | `make docker-up-build` | Everything in containers |

Run `make help` for every target.

---

## Environment variables

Copy `.env.example` to `.env`. Variables used by the apps are also declared in `turbo.json` → `globalEnv`.

| Variable | Used by | Description |
| --- | --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` | Docker | Local Postgres container |
| `DATABASE_URL` | api | Prisma connection string |
| `REDIS_URL` / `REDIS_PORT` | api, Docker | Redis for BullMQ |
| `PORT` | api | API port (default `8080`) |
| `JWT_SECRET` | api | JWT signing secret. Generate with `openssl rand -base64 32`. |
| `JWT_EXPIRES_IN_SECONDS` | api | Token lifetime (default 7 days) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | api | Google OAuth |
| `FRONTEND_URL` | api | CORS origin and post-login redirect |
| `SUPER_ADMIN_EMAILS` / `TEACHER_EMAILS` | api | Comma-separated emails auto-assigned these roles |
| `NEXT_PUBLIC_API_URL` | web | API base URL exposed to the browser |
| `NODE_ENV` | both | `development` / `production` |
| `ECR_REGISTRY` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | deploy | Production deployment only |

> Never commit real secrets. When you add a variable, update `.env.example`, `turbo.json`, the compose files, this table, and [AWS_SETUP.md](./AWS_SETUP.md).

---

## Common commands

```bash
# Workspace (Turbo)
pnpm dev                 # run all dev servers
pnpm build               # build all packages and apps
pnpm lint                # lint everything
pnpm typecheck           # type-check everything
pnpm format              # format with Prettier

# API
pnpm --filter edunest-api dev
pnpm --filter edunest-api test
pnpm --filter edunest-api test:e2e
pnpm --filter edunest-api test:cov

# Web
pnpm --filter edunest-web dev
pnpm --filter edunest-web build

# Housekeeping
make cleanup             # remove node_modules, dist, .next, .turbo
```

---

## Database

- Schema: [`apps/api/prisma/schema.prisma`](./apps/api/prisma/schema.prisma). 42 models across tenancy, users and profiles, academics, assessments, attendance, engagement, communication, admissions, jobs, hostels, complaints, AI, and media.
- Migrations: [`apps/api/prisma/migrations`](./apps/api/prisma/migrations). Every schema change ships with a migration, and applied migrations are never edited.

```bash
pnpm --filter edunest-api db:migrate --name <change_name>   # create + apply migration
pnpm --filter edunest-api db:generate                       # regenerate client
pnpm --filter edunest-api db:seed                           # seed sample data
make db-studio                                              # browse data
make db-reset                                               # ⚠ destroys local data
```

---

## API

- Base path: `/api/v1`
- Auth: `GET /auth/google` starts OAuth, the callback sets the `access_token` httpOnly cookie, `GET /auth/me` returns the current user, and `POST /auth/logout` signs out.
- Interactive docs: `/docs` (Swagger, non-production only, with bearer auth `access_token`)
- Realtime: Socket.IO gateway with `join-room` and `send-message` events

Main resource groups: `academics`, `announcements`, `news`, `calendar`, `semesters`, `scoring-schemas`, `school`, `users`, `roles`, `streak`, `messaging`, `admissions`, `jobs`, `complaints`, `media`, `ai`, `queue`.

---

## Testing & quality

CI ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) runs on every PR to `master`:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm --filter edunest-api test`

Run the same locally before opening a PR. API unit tests live next to the source as `*.spec.ts`; e2e tests are in `apps/api/test`.

---

## Deployment

CD ([`.github/workflows/cd.yml`](./.github/workflows/cd.yml)) runs on **every push to `master`**:

1. Builds the `api-runner` and `web-runner` images from `container/Dockerfile`
2. Pushes them to **AWS ECR** (tagged with the short SHA and `latest`)
3. SSHes into **AWS EC2** and restarts services with `container/docker-compose.prod.yml`

Because merging to `master` deploys to production, `master` is reached **only through reviewed pull requests**. See [AWS_SETUP.md](./AWS_SETUP.md) for infrastructure setup.

---

## Contributing

1. Branch from an up-to-date `master`: `git checkout -b feat/<short-description>` (or `fix/`, `refactor/`, `docs/`, `chore/`, `test/`, `ci/`).
2. Make focused changes that follow the conventions in [AGENT.md](./AGENT.md).
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/), e.g. `feat(api): add hostel allocation endpoints`.
4. Run `pnpm lint && pnpm typecheck && pnpm --filter edunest-api test`.
5. Update **README.md, AGENT.md, and CLAUDE.md** if you added or changed a feature, command, env var, or convention.
6. Push your branch and open a PR into `master`. Merge once CI is green and the PR is reviewed (squash merge).

**Never commit or push directly to `master` or `main`.**

---

## Documentation

| File | Purpose |
| --- | --- |
| [README.md](./README.md) | Product overview, architecture, setup (this file) |
| [AGENT.md](./AGENT.md) | Rules and conventions for all AI agents and contributors |
| [CLAUDE.md](./CLAUDE.md) | Claude Code guidance (imports AGENT.md) |
| [AWS_SETUP.md](./AWS_SETUP.md) | AWS and deployment setup |
| [apps/api/README.md](./apps/api/README.md) | API package notes |

These three top-level docs are kept in sync. **Every feature PR updates them as the app grows.**
