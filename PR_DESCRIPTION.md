# 🚀 CI/CD Pipeline + AWS Deployment Setup

This PR wires up a full CI/CD pipeline using GitHub Actions and AWS, taking the app from local development to automated production deployments on every merge to `master`.

---

## 🔁 CI — Continuous Integration (`.github/workflows/ci.yml`)

Runs on every push and pull request to `master`:

- 🔍 **Lint** — ESLint across all workspace packages via `pnpm lint`
- 🧠 **Typecheck** — TypeScript validation via `pnpm typecheck`
- 🧪 **Test** — Jest unit tests for the API via `pnpm test`

---

## 📦 CD — Continuous Delivery (`.github/workflows/cd.yml`)

Runs on every merge to `master` (after CI passes):

- 🏗️ **Build** — Multi-stage Docker builds for both `edunest-api` and `edunest-web` using the production targets (`api-runner` / `web-runner`) in the existing Dockerfile
- 🗂️ **Push** — Images tagged with the short commit SHA and `:latest`, pushed to **Amazon ECR**
- ⚡ **Layer caching** — Uses ECR's `:latest` as a build cache so repeat builds are significantly faster
- 🖥️ **Deploy** — SSHs into the EC2 instance, pulls new images, restarts containers via `docker compose`, and runs `prisma migrate deploy` automatically

---

## 🐳 Production Compose (`container/docker-compose.prod.yml`)

A new compose file purpose-built for production:

- 📥 Pulls pre-built images from ECR instead of building on the server
- 🔒 Sets `NODE_ENV=production` and wires `DATABASE_URL` / `REDIS_URL` to internal service names
- 🐘 Postgres + Redis with healthchecks and named volumes for data persistence
- 🚫 No dev-only settings (no volume mounts, no polling watchers, no `--watch` flags)

---

## ☁️ AWS Setup Guide (`AWS_SETUP.md`)

A complete step-by-step guide for configuring AWS from scratch:

- 🔐 Root account security (MFA)
- 👤 IAM user + least-privilege policy scoped to ECR push only
- 📦 ECR repository creation
- 🖥️ EC2 instance launch (AMI, instance type, key pair, security groups)
- 🐧 EC2 provisioning (Docker, AWS CLI, `aws configure`)
- 📝 Production `.env` setup on the server
- 🔑 GitHub secrets reference (all 7 secrets with explanations)
- 💰 Cost estimates + billing alert instructions
- 🩺 Common issues and fixes

---

## 🔑 GitHub Secrets Required

Before merging, add these secrets under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_REGION` | e.g. `us-east-1` |
| `ECR_REGISTRY` | e.g. `123456789.dkr.ecr.us-east-1.amazonaws.com` |
| `EC2_HOST` | EC2 public IP address |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Full contents of the `.pem` key file |

---

## ✅ Checklist

- [x] CI workflow runs lint, typecheck, and tests
- [x] CD workflow builds and pushes both Docker images to ECR
- [x] CD workflow deploys to EC2 via SSH with zero manual steps
- [x] Production compose file uses ECR images (no build on server)
- [x] AWS setup guide covers every step from account creation to first deploy
- [x] `.env.example` updated with `ECR_REGISTRY` placeholder
