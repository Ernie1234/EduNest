.PHONY: help install dev dev-api dev-web \
        docker-down docker-down-v docker-build docker-build-n docker-up-build \
        h-up h-down h-down-v h-dev h-api h-web \
        db-migrate db-studio db-reset \
        prod-api prod-web \
        cleanup
 
 
# ─────────────────────────────────────────────
# Help
# ─────────────────────────────────────────────
 
help:
	@echo ""
	@echo "  Edunest — Monorepo Commands"
	@echo "  ═══════════════════════════"
	@echo ""
	@echo "  Development (local pnpm):"
	@echo "    make install         Install all dependencies"
	@echo "    make dev             Run api + web locally (no Docker)"
	@echo "    make dev-api         Run api locally only"
	@echo "    make dev-web         Run web locally only"
	@echo ""
	@echo "  Hybrid (infra in Docker, code runs locally — recommended):"
	@echo "    make h-up            Start postgres + redis only (detached)"
	@echo "    make h-down          Stop hybrid containers"
	@echo "    make h-down-v        Stop hybrid containers + remove volumes"
	@echo "    make h-dev           Start infra + run api and web locally"
	@echo "    make h-api           Start infra + run api locally"
	@echo "    make h-web           Start infra + run web locally"
	@echo ""
	@echo "  Full Docker (everything containerised):"
	@echo "    make docker-down     Stop all containers"
	@echo "    make docker-down-v   Stop all containers + remove volumes"
	@echo "    make docker-build    Build api + web images"
	@echo "    make docker-build-n  Build images (no cache)"
	@echo "    make docker-up-build Build and start all services"
	@echo ""
	@echo "  Database:"
	@echo "    make db-migrate      Run prisma migrate dev (local)"
	@echo "    make db-studio       Open prisma studio"
	@echo "    make db-reset        Reset database (WARNING: destroys data)"
	@echo ""
	@echo "  Production images:"
	@echo "    make prod-api        Build production API image"
	@echo "    make prod-web        Build production Web image"
	@echo ""
	@echo "  Cleanup:"
	@echo "    make cleanup         Remove node_modules, dist, .next, .turbo"
	@echo ""
 
 
# ─────────────────────────────────────────────
# Shared compose references
# ─────────────────────────────────────────────
 
COMPOSE         := docker compose -f container/docker-compose.yml --env-file .env
COMPOSE_HYBRID  := docker compose -f container/docker-compose.hybrid.yml --env-file .env
 
 
# ─────────────────────────────────────────────
# Local development (no Docker at all)
# ─────────────────────────────────────────────
 
install:
	pnpm install
 
dev:
	pnpm exec concurrently --kill-others-on-fail \
	  "pnpm --filter edunest-api dev" \
	  "pnpm --filter edunest-web dev"
 
dev-api:
	pnpm --filter edunest-api dev
 
dev-web:
	pnpm --filter edunest-web dev
 
 
# ─────────────────────────────────────────────
# Hybrid development
# (postgres + redis in Docker, code runs locally)
# ─────────────────────────────────────────────
 
h-up:
	$(COMPOSE_HYBRID) up -d
 
h-down:
	$(COMPOSE_HYBRID) down
 
h-down-v:
	$(COMPOSE_HYBRID) down -v
 
h-dev: h-up
	pnpm exec concurrently --kill-others-on-fail \
	  "pnpm --filter edunest-api dev" \
	  "pnpm --filter edunest-web dev"
 
h-api: h-up
	pnpm --filter edunest-api dev
 
h-web: h-up
	pnpm --filter edunest-web dev
 
 
# ─────────────────────────────────────────────
# Full Docker
# ─────────────────────────────────────────────
 
docker-down:
	$(COMPOSE) down
 
docker-down-v:
	$(COMPOSE) down -v
 
docker-build:
	$(COMPOSE) --profile api --profile web build
 
docker-build-n:
	$(COMPOSE) --profile api --profile web build --no-cache
 
docker-up-build:
	$(COMPOSE) --profile api --profile web up --build
 
 
# ─────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────
 
db-migrate:
	pnpm --filter edunest-api exec prisma migrate dev
 
db-studio:
	pnpm --filter edunest-api exec prisma studio
 
db-reset:
	pnpm --filter edunest-api exec prisma migrate reset
 
 
# ─────────────────────────────────────────────
# Production builds (standalone images)
# ─────────────────────────────────────────────
 
prod-api:
	docker build \
	  --file container/Dockerfile \
	  --target api-runner \
	  --build-arg APP_NAME=api \
	  --tag edunest-api:latest \
	  .
 
prod-web:
	docker build \
	  --file container/Dockerfile \
	  --target web-runner \
	  --build-arg APP_NAME=web \
	  --tag edunest-web:latest \
	  .
 
 
# ─────────────────────────────────────────────
# Cleanup
# ─────────────────────────────────────────────
 
cleanup:
	find . -name 'node_modules' -type d -prune -exec rm -rf {} +
	find . -name 'dist'         -type d -prune -exec rm -rf {} +
	find . -name '.next'        -type d -prune -exec rm -rf {} +
	find . -name '.turbo'       -type d -prune -exec rm -rf {} +
	@echo "✓ Cleaned node_modules, dist, .next, .turbo"