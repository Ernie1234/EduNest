# CLAUDE.md

Guidance for Claude Code when working in the EduNest repository.

The complete rulebook shared by all agents and contributors is [AGENT.md](./AGENT.md), imported below. This file restates the non-negotiable rules so they are always in view, and adds Claude-specific notes. **CLAUDE.md must never contradict AGENT.md.** If they disagree, fix both in the same PR.

@AGENT.md

---

## Non-negotiable rules (summary)

1. **Never commit to `master` or `main`. Never push to `master` or `main`.** A push to `master` triggers CD and **deploys to production on AWS**.
2. **Before making any change, create a new branch** from an up-to-date `master`:
   ```bash
   git checkout master && git pull --ff-only origin master
   git checkout -b feat/<short-description>   # or fix/, refactor/, docs/, chore/, test/, ci/, hotfix/
   ```
   If you find yourself on `master` with uncommitted changes, create the branch first (`git checkout -b …` carries the changes over), then commit.
3. **Follow Git and GitHub best practices:** Conventional Commits, small focused commits, explicit `git add <path>`, PR into `master` with a full description, green CI before merge, squash merge, delete branch after merge.
4. **Never** force-push to shared branches, use `--no-verify`, commit secrets or `.env` files, edit applied Prisma migrations, or run destructive commands (`prisma migrate reset`, `make db-reset`, `docker compose down -v`, `git reset --hard`, `git clean`) without explicit approval.
5. **Never merge a PR or trigger a deployment** unless the user explicitly asks.
6. **Keep README.md, AGENT.md, and CLAUDE.md up to date.** Whenever a feature, module, route, command, env var, dependency, or convention is added or changed, update all three in the same branch/PR as the code change.

---

## Claude-specific notes

- **Commit or push only when the user asks.** When you do, you're always on a feature branch, never `master`.
- Open PRs with `gh pr create --base master`. Use a Conventional Commit title and the PR template described in AGENT.md § 2.3.
- Prefer the narrowest validation that proves your change, e.g. `pnpm --filter edunest-api typecheck` or `pnpm --filter edunest-web lint`, then run the full `pnpm lint && pnpm typecheck` before opening a PR.
- After editing `schema.prisma`, run `pnpm --filter edunest-api db:generate` so types are current before typechecking.
- Use Swagger at `http://localhost:8080/docs` to exercise API changes when the dev server is running.
- When you finish a feature, re-read README.md § Features and § Module status and update them before declaring the work done.
- If the user asks for something that would break a rule above, explain the conflict and propose the compliant alternative instead of silently complying.

## Quick reference

| Task | Command |
| --- | --- |
| Install | `pnpm install` |
| Start infra (Postgres + Redis) | `make h-up` |
| Run api + web | `make h-dev` |
| Lint / typecheck all | `pnpm lint` / `pnpm typecheck` |
| API tests | `pnpm --filter edunest-api test` |
| New migration | `pnpm --filter edunest-api db:migrate --name <name>` |
| Seed DB | `pnpm --filter edunest-api db:seed` |
| All make targets | `make help` |

## Useful references

- [README.md](./README.md): product overview, architecture, setup
- [AGENT.md](./AGENT.md): full rules for agents and contributors
- [AWS_SETUP.md](./AWS_SETUP.md): deployment and AWS setup
