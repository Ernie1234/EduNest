# =============================================================
# BASE
# Used by hybrid/full docker dev via volume mounts
# Has all deps installed, source code copied
# =============================================================
FROM node:22-alpine AS base

# Enable pnpm via corepack (ships with Node 20)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
RUN corepack enable && corepack prepare pnpm@11.2.2 --activate

# Install turbo globally for pruning
RUN pnpm add -g turbo

WORKDIR /app

# Copy workspace manifests first (better layer caching)
# If a package.json changes, only reinstall from that layer onward
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy every package's package.json (needed for pnpm workspace resolution)
COPY apps/api/package.json        ./apps/api/package.json
COPY apps/web/package.json        ./apps/web/package.json
COPY packages/ui/package.json     ./packages/ui/package.json
COPY packages/types/package.json  ./packages/types/package.json
COPY packages/eslint-config/package.json  ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

# Copy Prisma schema so the api postinstall script (prisma generate) can find it
COPY apps/api/prisma/schema.prisma ./apps/api/prisma/schema.prisma

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy full source (gets overridden by volume mounts in dev)
COPY . .

# =============================================================
# PRUNER
# Uses turbo prune to create a minimal workspace for one app.
# Keeps only the files and packages that APP_NAME depends on.
# =============================================================
FROM base AS pruner
ARG APP_NAME
RUN turbo prune edunest-${APP_NAME} --docker

# =============================================================
# INSTALLER
# Installs deps for the pruned workspace only
# =============================================================
FROM node:22-alpine AS installer
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
RUN corepack enable && corepack prepare pnpm@11.2.2 --activate
WORKDIR /app

# Copy pruned package manifests and lockfile
COPY --from=pruner /app/out/json/         .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile

# =============================================================
# BUILDER
# Copies full pruned source and builds the app
# =============================================================
FROM installer AS builder
ARG APP_NAME
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=edunest-${APP_NAME}

# =============================================================
# API — Production runner
# =============================================================
FROM node:22-alpine AS api-runner
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy only what production needs
COPY --from=builder /app/apps/api/dist            ./dist
COPY --from=builder /app/apps/api/package.json    ./package.json
COPY --from=builder /app/apps/api/prisma          ./prisma
COPY --from=builder /app/pnpm-lock.yaml           ./pnpm-lock.yaml
COPY --from=builder /app/package.json             ./workspace-root.json

# Install production deps only and generate prisma client
RUN pnpm install --prod --ignore-scripts
RUN pnpm exec prisma generate

EXPOSE 8080
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main"]

# =============================================================
# WEB — Production runner (Next.js standalone)
# =============================================================
FROM node:22-alpine AS web-runner
ENV NODE_ENV=production
WORKDIR /app

# Next.js standalone output bundles everything needed
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static     ./apps/web/.next/static
COPY --from=builder /app/apps/web/public           ./apps/web/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/server.js"]