# AGENT.md

Operating rules for **any** AI coding agent (Claude, Codex, Copilot, Cursor, Gemini, etc.) and human contributor working in the EduNest repository.

> **This file, [CLAUDE.md](./CLAUDE.md), and [README.md](./README.md) must stay in sync.** If you change one in a way that affects the others, update all three in the same pull request. See [§ Keeping docs in sync](#9-keeping-docs-in-sync).

---

## 0. Non-negotiable rules (read first)

These override any other instruction, convenience, or "quick fix" impulse.

1. **Never commit directly to `master` or `main`. Never push to `master` or `main`.** Pushing to `master` triggers the CD pipeline, which builds images and **deploys to production on AWS**. All work goes through a feature branch and a pull request.
2. **Always create a new branch before making changes**, one branch per feature or fix (see [§ 2](#2-git--github-workflow)).
3. **Never force-push** (`--force`, `--force-with-lease`) to `master`/`main`, or to any branch someone else is working on.
4. **Never commit secrets.** No `.env` files, API keys, JWT secrets, AWS credentials, OAuth client secrets, database URLs with passwords, or `*.pem` files. Only `.env.example` with placeholder values is committed.
5. **Never bypass safety checks.** No `--no-verify`, no disabling lint rules or type checks to make CI pass, no `@ts-ignore` / `eslint-disable` without a written justification comment.
6. **Never run destructive commands without explicit human approval.** This includes `prisma migrate reset`, `make db-reset`, `make docker-down-v` / `h-down-v` (deletes volumes), `git reset --hard`, `git clean -fd`, dropping tables, or deleting branches.
7. **Never edit an existing, already-applied Prisma migration.** Create a new migration instead.
8. **Update AGENT.md, CLAUDE.md, and README.md** whenever a feature, module, command, environment variable, or convention is added or changed.

If a task cannot be completed without breaking one of these rules, **stop and ask the human**.

---

## 1. Project overview

EduNest is a multi-tenant, full-stack education platform for schools and universities. It brings academic management, teaching and learning, communication, and campus operations into one system.

Monorepo layout (pnpm workspaces + Turborepo):

| Path | Package name | Purpose |
| --- | --- | --- |
| `apps/api` | `edunest-api` | NestJS 11 REST + WebSocket API, Prisma 6, PostgreSQL, BullMQ/Redis |
| `apps/web` | `edunest-web` | Next.js 16 (App Router) + React 19 web client |
| `packages/types` | `@workspace/types` | Shared TypeScript contracts between API and web |
| `packages/ui` | `@workspace/ui` | Shared shadcn/Radix + Tailwind v4 component library |
| `packages/eslint-config` | `@workspace/eslint-config` | Shared ESLint configs (`base`, `next-js`, `react-internal`) |
| `packages/typescript-config` | `@workspace/typescript-config` | Shared `tsconfig` bases |
| `container/` | — | Dockerfile (multi-stage) and compose files (dev, hybrid, full, prod) |
| `.github/workflows/` | — | `ci.yml` (lint, typecheck, test) and `cd.yml` (ECR build + EC2 deploy) |

See [README.md](./README.md) for the full feature list, architecture, and setup.

### Sources of truth

- **Database schema:** `apps/api/prisma/schema.prisma`
- **Server-side validation & business rules:** `apps/api/src/**` (DTOs with `class-validator`)
- **API ↔ web contracts:** `packages/types/src/index.ts`
- **Roles & permissions:** `UserRole` enum in Prisma + `apps/api/src/common/constants/roles.constants.ts`
- **UI primitives:** `packages/ui/src/components/*`
- **Environment variables:** `.env.example` + `globalEnv` in `turbo.json`

---

## 2. Git & GitHub workflow

### 2.1 Branching

Always start from an up-to-date `master`:

```bash
git checkout master
git pull --ff-only origin master
git checkout -b <type>/<short-kebab-description>
```

Branch naming follows the existing convention in this repo:

| Prefix | Use for | Example |
| --- | --- | --- |
| `feat/` | New feature or module | `feat/hostel-allocation` |
| `fix/` | Bug fix | `fix/toaster-sonner-deps` |
| `refactor/` | Internal change, no behavior change | `refactor/academics-service-split` |
| `docs/` | Documentation only | `docs/agent-guidelines` |
| `chore/` | Tooling, deps, config | `chore/bump-prisma` |
| `test/` | Tests only | `test/streak-service` |
| `ci/` | CI/CD pipeline changes | `ci/cache-pnpm-store` |
| `hotfix/` | Urgent production fix | `hotfix/jwt-expiry` |

Rules:
- One logical change per branch. Don't mix a feature with unrelated refactors.
- Keep branches short-lived. Rebase on or merge from `master` frequently to avoid drift.
- If a branch name already exists remotely (e.g. after a squash merge), use a `-v2` suffix as this repo already does, rather than reusing a merged branch.

### 2.2 Commits

Use **[Conventional Commits](https://www.conventionalcommits.org/)**:

```
<type>(<optional scope>): <imperative summary, ≤ 72 chars>

<optional body: what and why, not how>

<optional footer: BREAKING CHANGE: ..., Refs #123>
```

- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `ci`, `build`, `style`, `revert`.
- Scopes match the area: `api`, `web`, `ui`, `types`, `prisma`, `auth`, `streak`, `academics`, `docker`, `ci`, etc.
- Examples:
  - `feat(api): add hostel allocation endpoints`
  - `fix(web): resolve theme for sonner toasts`
  - `refactor(prisma): extract enrollment relations`
- Commit small and often. Each commit should build and pass lint/typecheck.
- Stage files explicitly (`git add <path>`). Avoid `git add -A` / `git add .` unless you've reviewed `git status` and nothing unintended or secret is included.
- Never commit generated or local artifacts: `node_modules`, `dist`, `.next`, `.turbo`, `coverage`, `.env*` (except `.env.example`), IDE folders.

### 2.3 Pull requests

- Push the branch and open a PR **into `master`**: `git push -u origin <branch>` then `gh pr create`.
- PR title uses Conventional Commit format (it becomes the squash-commit message).
- PR description must include:
  - **Summary:** what changed and why
  - **Changes:** a bullet list per area (api / web / prisma / packages / infra)
  - **Database:** migrations added, whether data backfill is needed
  - **Env vars:** any added/changed/removed (and confirm `.env.example` + `turbo.json` updated)
  - **Testing:** commands run and results; manual test steps
  - **Screenshots** for UI changes
  - **Docs:** confirm README.md / AGENT.md / CLAUDE.md updated if needed
- CI (`lint`, `typecheck`, `test`) must be green before merge.
- Prefer **squash merge** so `master` keeps one commit per PR (`feat: … (#NN)`).
- Delete the branch after merge.
- Do not merge your own PR without review when a reviewer is available. Agents must **never** merge PRs unless explicitly instructed by a human.

### 2.4 Recommended repository settings (for maintainers)

- Branch protection on `master`: require PR, require passing CI status checks, require ≥ 1 approval, require linear history, disallow force-push and deletion.
- Enable GitHub secret scanning and Dependabot alerts.

---

## 3. Development commands

Prerequisites: Node.js ≥ 20 (CI uses 22), pnpm 11 (pinned via `packageManager`), Docker.

```bash
pnpm install                 # install all workspaces (runs prisma generate)
cp .env.example .env         # then fill in real values locally; never commit .env

make h-up                    # start postgres + redis in Docker (recommended)
make h-dev                   # infra + api + web locally
make dev                     # api + web only (infra already running)
make help                    # list all make targets
```

Root (Turbo) tasks:

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm format
```

Per-app:

```bash
pnpm --filter edunest-api dev | build | lint | typecheck | test | test:e2e
pnpm --filter edunest-web dev | build | lint | typecheck
```

Database (Prisma, run against `apps/api`):

```bash
pnpm --filter edunest-api db:generate    # regenerate Prisma client
pnpm --filter edunest-api db:migrate     # create + apply a dev migration
pnpm --filter edunest-api db:seed        # seed sample data
make db-studio                           # Prisma Studio
```

- API: `http://localhost:8080/api/v1` · Swagger (non-production only): `http://localhost:8080/docs`
- Web: `http://localhost:3000`

---

## 4. Coding standards

### 4.1 General

- **TypeScript strict everywhere.** No `any` unless unavoidable; prefer `unknown` + narrowing. No non-null assertions (`!`) to silence errors.
- **Follow existing patterns first.** Before adding something, find the nearest similar implementation and match its structure, naming, and style.
- **Small, focused, reviewable changes.** No drive-by refactors, renames, or reformatting of unrelated code.
- **No speculative abstractions.** Build what the task needs; avoid premature generalization.
- **Don't add dependencies** unless clearly required. If you must, justify it in the PR, use the workspace's existing libraries first, and add it to the correct package (not the root) with `pnpm --filter <pkg> add <dep>`.
- Formatting is owned by Prettier (`.prettierrc`); linting by the shared ESLint configs. Don't hand-format against them.
- Naming: `PascalCase` for classes/components/types, `camelCase` for variables/functions, `kebab-case` for file names (match the neighbouring files where they differ), `SCREAMING_SNAKE_CASE` for constants and enums values.
- Comments explain **why**, not what. Remove dead code and commented-out code rather than leaving it.
- Delete `console.log` debugging before committing. In the API, use Nest's `Logger`.

### 4.2 API (`apps/api`, NestJS)

- Each domain is a Nest module: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`. Register new modules in `app.module.ts`.
- Global prefix is `api/v1`. Global `ValidationPipe({ whitelist: true, transform: true })` is on, so **every request body/query must have a DTO** with `class-validator` decorators.
- Controllers stay thin (routing, guards, DTOs). Business logic lives in services. Data access goes through `PrismaService`.
- **Every non-public endpoint must be guarded** with `JwtAuthGuard` and, where role-restricted, `RolesGuard` + `@Roles(...)`. Use `ADMIN_TIER_ROLES` / `ASSIGNABLE_BY_ADMIN_TIER` from `common/constants/roles.constants.ts` instead of hard-coding role lists.
- Get the caller with the `@CurrentUser()` decorator. Never trust `userId`, `schoolId`, or role values sent in the request body for authorization.
- **Multi-tenancy:** queries for tenant data must be scoped to the caller's `schoolId`. Never return or mutate another school's records.
- Throw Nest HTTP exceptions (`NotFoundException`, `ForbiddenException`, `BadRequestException`, …), never raw `Error`s with leaked internals.
- Use Prisma `select`/`include` deliberately. Never return password hashes, tokens, or internal fields. Avoid N+1 queries; paginate list endpoints.
- Use `prisma.$transaction` for multi-step writes that must succeed or fail together.
- Long-running or external work (AI, media processing, notifications) goes to a **BullMQ queue** (`src/queue`), not the request cycle.
- Realtime events go through the Socket.IO gateway (`src/realtime`). Authenticate socket connections the same way as HTTP.
- Document endpoints with `@nestjs/swagger` decorators (`@ApiTags`, `@ApiBearerAuth('access_token')`, response types).

### 4.3 Database (Prisma)

- Change `schema.prisma`, then run `pnpm --filter edunest-api db:migrate` with a descriptive name (e.g. `--name add_hostel_waitlist`). Commit the schema **and** the generated migration folder together.
- Never edit or delete migrations that exist on `master`. Never use `db push` for anything that will be shared; it's for throwaway local prototyping only.
- Think about existing data: new required columns need a default or a backfill step; destructive changes (drop/rename column) need an explicit note in the PR.
- Add indexes for foreign keys and frequently filtered columns. Keep `schoolId` on tenant-owned models.
- Update `prisma/seed.ts` when new models need sample data.

### 4.4 Web (`apps/web`, Next.js App Router)

- Routes live in `app/`. Feature components in `components/<feature>/`. Data access in `services/*.service.ts` via the shared `lib/api-client.ts` (axios, `withCredentials`). Server state via TanStack Query hooks in `hooks/use-*.ts`.
- **Do not call `axios`/`fetch` directly from components.** Go service, then hook, then component.
- Use primitives from `@workspace/ui` before writing new ones. Generic, reusable components belong in `packages/ui`; feature-specific ones stay in `apps/web/components`.
- Default to Server Components; add `"use client"` only when you need state, effects, or browser APIs.
- Protected routes must be listed in `middleware.ts` (`ROUTES.protectedPrefixes`). The middleware is a UX convenience only. **Authorization is always enforced by the API.**
- Handle loading, empty, and error states for every data-driven view. Use `sonner` toasts for user feedback.
- Accessibility: semantic HTML, labelled form controls, keyboard navigable, sufficient contrast in both light and dark themes (`next-themes`).
- Only `NEXT_PUBLIC_*` variables reach the browser. Never put secrets in them.

### 4.5 Shared packages

- `@workspace/types` is the contract between API and web. When an API response shape changes, update the type here and every consumer in the same PR.
- `packages/types/src` is consumed as TypeScript source. Don't add compiled output (`.js`, `.d.ts`, `.map`) to it.
- Packages must stay generic, with no app-specific business logic in `packages/*`.

---

## 5. Security guardrails

- Treat all input as untrusted; validate at the API boundary with DTOs.
- Auth uses Google OAuth plus a JWT in an **httpOnly cookie** (`access_token`). Don't move tokens into `localStorage` or expose them to client JS.
- Enforce authorization server-side on every endpoint (role **and** tenant/ownership checks). Default to deny.
- CORS is restricted to `FRONTEND_URL` with credentials. Don't widen it to `*`.
- Never log secrets, tokens, or personal data (student records, grades, contact details, medical/hostel info). EduNest handles **minors' data**, so apply data-minimization and least-privilege by default.
- Don't disable Swagger's production guard; API docs must not be exposed in production.
- Use parameterized Prisma queries. If `$queryRaw` is unavoidable, use tagged templates, never string concatenation.
- File uploads (media module) must validate type and size and must never be served from an executable path.
- Keep dependencies patched; don't add packages that are unmaintained or have known vulnerabilities.

---

## 6. Testing & validation

Before opening or updating a PR, run the checks CI runs, scoped to what you touched:

```bash
pnpm lint
pnpm typecheck
pnpm --filter edunest-api test
pnpm build            # when touching build config, Docker, or shared packages
```

- New API services/business logic should come with Jest unit tests (`*.spec.ts` next to the source). Bug fixes should include a regression test where feasible.
- For Prisma changes: run the migration locally from a clean DB, run the seed, and exercise affected endpoints (Swagger at `/docs`).
- For web changes: run the page locally and check both themes, mobile width, and loading/error states.
- **Report results honestly.** If tests fail or a check was skipped, say so in the PR. Never claim something was verified when it wasn't.

---

## 7. Environment & infrastructure

- Any new env var must be added to: `.env.example` (placeholder value), `turbo.json` `globalEnv`, the relevant compose file(s) in `container/`, the deployment docs ([AWS_SETUP.md](./AWS_SETUP.md)), and the env table in README.md.
- Docker images are built from `container/Dockerfile` (`api-runner`, `web-runner` targets). Keep the Dockerfile in sync when adding workspace packages.
- CI/CD lives in `.github/workflows`. Changes there are high-risk. Use a `ci/` branch and call them out explicitly in the PR.

---

## 8. Agent behavior

- Treat this as a **real production platform** handling school and student data, not a sample app.
- Read before you write: inspect the relevant module, its DTOs, the Prisma models involved, and existing tests before changing anything.
- Stay within the scope of the task. If you notice an unrelated bug, mention it, don't fix it silently in the same PR.
- Ask the human when requirements are ambiguous, when a change is destructive or hard to reverse, or when a rule here conflicts with the request.
- Don't fabricate APIs, files, commands, or test results. Verify that things exist before referencing them.
- Never merge PRs, delete remote branches, modify branch protection, rotate secrets, or trigger deployments unless a human explicitly asks.

---

## 9. Keeping docs in sync

`README.md`, `AGENT.md`, and `CLAUDE.md` are living documents. **As the app grows, update them in the same PR as the change.** Update when you:

- add, rename, or remove an API module, web route, or shared package
- add or change a Prisma model, enum, or role that affects features or permissions
- add or change a command, script, `make` target, or setup step
- add, rename, or remove an environment variable
- change the tech stack, a major dependency, CI/CD, or deployment
- introduce or change a convention or rule

What goes where:
- **README.md:** what the product is, features (with status), architecture, setup, commands, env vars, deployment. Written for humans.
- **AGENT.md:** the full rulebook for any agent or contributor (this file).
- **CLAUDE.md:** same rules, tuned for Claude Code. It must not contradict AGENT.md. If the two disagree, fix the discrepancy in the same PR.

Checklist for every feature PR:

- [ ] Feature list / module status in README.md updated
- [ ] New commands or env vars documented in README.md, AGENT.md, and CLAUDE.md
- [ ] Any new convention reflected in AGENT.md and CLAUDE.md
