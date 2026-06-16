# AWS Setup Guide for Edunest CI/CD

This guide walks you through every AWS step needed to get the Edunest CI/CD pipeline working — from creating an account to deploying your first container. Follow the steps in order.

---

## Table of Contents

1. [Create an AWS Account](#1-create-an-aws-account)
2. [Secure the Root Account](#2-secure-the-root-account)
3. [Choose a Region](#3-choose-a-region)
4. [Create an IAM User for CI/CD](#4-create-an-iam-user-for-cicd)
5. [Create ECR Repositories](#5-create-ecr-repositories)
6. [Launch an EC2 Instance](#6-launch-an-ec2-instance)
7. [Configure the EC2 Instance](#7-configure-the-ec2-instance)
8. [Set Up the App on EC2](#8-set-up-the-app-on-ec2)
9. [Add GitHub Secrets](#9-add-github-secrets)
10. [Open Firewall Ports](#10-open-firewall-ports)
11. [Trigger Your First Deploy](#11-trigger-your-first-deploy)
12. [Estimated Costs](#12-estimated-costs)
13. [Cheat Sheet — Values to Copy](#13-cheat-sheet--values-to-copy)

---

## 1. Create an AWS Account

1. Go to https://aws.amazon.com and click **Create an AWS Account**.
2. Enter your email address and choose an account name (e.g. `edunest`).
3. Choose **Root user** and set a strong password.
4. Enter your contact information — select **Personal** unless this is a business.
5. Enter a credit/debit card. AWS needs this even for free-tier usage. You will not be charged unless you exceed free-tier limits.
6. Verify your phone number via SMS or call.
7. Choose the **Basic support plan** (free).
8. Click **Complete sign up**, then **Go to the AWS Management Console**.

---

## 2. Secure the Root Account

The root account has unlimited power. You should lock it away after setup and use an IAM user for everything else.

1. Sign in to the [AWS Console](https://console.aws.amazon.com).
2. Click your account name (top right) → **Security credentials**.
3. Under **Multi-factor authentication (MFA)**, click **Assign MFA device**.
4. Choose **Authenticator app**, scan the QR code with Google Authenticator or Authy, and enter two consecutive codes to confirm.
5. Click **Add MFA**. Root MFA is now enabled.

> From this point on, do **not** use the root account for day-to-day work. All actions below use an IAM user.

---

## 3. Choose a Region

Pick the AWS region closest to your users. All resources (ECR, EC2) must be in the **same region**.

| Region name | Code |
|---|---|
| US East (N. Virginia) | `us-east-1` |
| US West (Oregon) | `us-west-2` |
| Europe (Ireland) | `eu-west-1` |
| Europe (Frankfurt) | `eu-central-1` |
| Asia Pacific (Singapore) | `ap-southeast-1` |

1. In the AWS Console, click the region dropdown in the top-right corner (e.g. **N. Virginia**).
2. Select your preferred region.
3. **Remember this region code** — you will need it as `AWS_REGION` in GitHub secrets.

---

## 4. Create an IAM User for CI/CD

This user's credentials will be stored in GitHub and used by the pipeline to push images to ECR.

### 4a. Create a policy

1. In the AWS Console, search for **IAM** and open it.
2. In the left sidebar, click **Policies** → **Create policy**.
3. Click the **JSON** tab and paste the following:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAuth",
      "Effect": "Allow",
      "Action": "ecr:GetAuthorizationToken",
      "Resource": "*"
    },
    {
      "Sid": "ECRPush",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer"
      ],
      "Resource": [
        "arn:aws:ecr:YOUR_REGION:YOUR_ACCOUNT_ID:repository/edunest-api",
        "arn:aws:ecr:YOUR_REGION:YOUR_ACCOUNT_ID:repository/edunest-web"
      ]
    }
  ]
}
```

4. Replace `YOUR_REGION` with your region code (e.g. `us-east-1`).
5. Replace `YOUR_ACCOUNT_ID` with your 12-digit AWS account ID. Find it by clicking your account name → **Account** in the top-right menu.
6. Click **Next**, name the policy `EdunestCICDPolicy`, and click **Create policy**.

### 4b. Create the IAM user

1. In the IAM left sidebar, click **Users** → **Create user**.
2. Username: `edunest-cicd`
3. Do **not** check "Provide user access to the AWS Management Console".
4. Click **Next**.
5. Choose **Attach policies directly**.
6. Search for `EdunestCICDPolicy` and check it.
7. Click **Next** → **Create user**.

### 4c. Generate access keys

1. Click on the `edunest-cicd` user you just created.
2. Click the **Security credentials** tab.
3. Scroll to **Access keys** → **Create access key**.
4. Use case: **Application running outside AWS**.
5. Click **Next** → **Create access key**.
6. **Copy both values now** — you cannot see the secret again:
   - `Access key ID` → this is your `AWS_ACCESS_KEY_ID`
   - `Secret access key` → this is your `AWS_SECRET_ACCESS_KEY`
7. Store them somewhere safe (e.g. a password manager) before closing.

---

## 5. Create ECR Repositories

ECR (Elastic Container Registry) is where your Docker images are stored.

1. In the AWS Console, search for **ECR** and open **Elastic Container Registry**.
2. Make sure you are in the correct region (top-right dropdown).
3. Click **Create repository**.
4. Settings:
   - Visibility: **Private**
   - Repository name: `edunest-api`
   - Leave all other settings as default
5. Click **Create repository**.
6. Repeat steps 3–5 for a second repository named `edunest-web`.

### Find your ECR registry URL

After creating both repositories, you will see a URL in the format:

```
123456789012.dkr.ecr.us-east-1.amazonaws.com
```

This is your `ECR_REGISTRY`. Copy it — everything before the `/edunest-api` part. It is the same for both repositories.

---

## 6. Launch an EC2 Instance

EC2 is the virtual machine (server) that runs your containers in production.

### 6a. Launch the instance

1. In the AWS Console, search for **EC2** and open it.
2. Click **Launch instance**.
3. Fill in:
   - **Name**: `edunest-production`
   - **AMI**: Select **Ubuntu Server 24.04 LTS (HVM)** — click the search if needed. Make sure it says "Free tier eligible".
   - **Instance type**: `t3.small` (recommended — `t2.micro` is free tier but may run out of memory with Postgres + Redis + two Node apps). If cost is a concern, start with `t2.micro` and upgrade if it crashes.
   - **Key pair**: Click **Create new key pair**
     - Name: `edunest-key`
     - Type: RSA
     - Format: `.pem`
     - Click **Create key pair** — a `.pem` file downloads automatically. **Save this file. If you lose it you cannot SSH into your server.**

### 6b. Configure storage

- Under **Configure storage**, change the root volume from `8 GiB` to `20 GiB`. Docker images take space.

### 6c. Network settings

- Under **Network settings**, click **Edit**.
- Leave the default VPC and subnet.
- **Auto-assign public IP**: Enable.
- Under **Firewall (security groups)**, click **Create security group**.
  - Name: `edunest-sg`
  - Add the following inbound rules (the SSH rule is added by default):

| Type | Protocol | Port | Source | Purpose |
|---|---|---|---|---|
| SSH | TCP | 22 | My IP | SSH access for you |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | API |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | Web app |

4. Click **Launch instance**.
5. Click **View all instances** and wait until the **Instance state** shows **Running** and **Status check** shows **2/2 checks passed** (takes ~2 minutes).
6. Click on your instance and copy the **Public IPv4 address** — this is your `EC2_HOST`.

---

## 7. Configure the EC2 Instance

SSH into the server and install everything the app needs.

### 7a. SSH into the instance

On your local machine (Mac/Linux):

```bash
# Make the key file private (required by SSH)
chmod 400 ~/Downloads/edunest-key.pem

# SSH in (replace YOUR_EC2_IP with the Public IPv4 address you copied)
ssh -i ~/Downloads/edunest-key.pem ubuntu@YOUR_EC2_IP
```

If asked "Are you sure you want to continue connecting?" type `yes`.

### 7b. Install Docker

Run these commands on the EC2 instance:

```bash
# Update package list
sudo apt-get update

# Install required packages
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and Docker Compose plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Allow ubuntu user to run docker without sudo
sudo usermod -aG docker ubuntu

# Apply the group change without logging out
newgrp docker

# Verify Docker works
docker run hello-world
```

### 7c. Install AWS CLI

```bash
# Install AWS CLI v2
sudo snap install aws-cli --classic

# Verify installation
aws --version
```

### 7d. Configure AWS credentials on EC2

The EC2 instance needs credentials to pull images from ECR. Use the same IAM user credentials you created in step 4.

```bash
aws configure
```

Enter:
- `AWS Access Key ID`: paste your `AWS_ACCESS_KEY_ID`
- `AWS Secret Access Key`: paste your `AWS_SECRET_ACCESS_KEY`
- `Default region name`: your region code (e.g. `us-east-1`)
- `Default output format`: `json`

---

## 8. Set Up the App on EC2

Still connected via SSH:

### 8a. Create the app directory

```bash
mkdir -p ~/edunest/container/init
```

### 8b. Create the production .env file

```bash
nano ~/edunest/.env
```

Paste in your real production values (use your actual secrets, not example placeholders):

```env
PORT=8080
NODE_ENV=production

POSTGRES_USER=edunest
POSTGRES_PASSWORD=your-strong-password-here
POSTGRES_DB=edunest
POSTGRES_PORT=5432
REDIS_PORT=6379

DATABASE_URL=postgresql://edunest:your-strong-password-here@edunest-postgres:5432/edunest?schema=public
REDIS_URL=redis://edunest-redis:6379

JWT_SECRET=your-long-random-secret-run-openssl-rand-base64-32
JWT_EXPIRES_IN_SECONDS=604800

GOOGLE_CLIENT_ID=your-new-google-client-id
GOOGLE_CLIENT_SECRET=your-new-google-client-secret
GOOGLE_CALLBACK_URL=http://YOUR_EC2_IP:8080/api/v1/auth/google/callback

FRONTEND_URL=http://YOUR_EC2_IP:3000

SUPER_ADMIN_EMAILS=your-email@example.com
TEACHER_EMAILS=

ECR_REGISTRY=123456789012.dkr.ecr.us-east-1.amazonaws.com
```

Save with `Ctrl+O`, `Enter`, `Ctrl+X`.

### 8c. Copy the production docker-compose file

On your **local machine** (open a new terminal, do not exit SSH):

```bash
# Copy the prod compose file to the EC2 instance
scp -i ~/Downloads/edunest-key.pem \
  "/Users/mac/programming/personal projects/edunest/container/docker-compose.prod.yml" \
  ubuntu@YOUR_EC2_IP:~/edunest/container/docker-compose.prod.yml

# Copy the postgres init script
scp -i ~/Downloads/edunest-key.pem \
  "/Users/mac/programming/personal projects/edunest/container/init/01-init.sql" \
  ubuntu@YOUR_EC2_IP:~/edunest/container/init/01-init.sql
```

### 8d. Update the Google OAuth callback URL

Since you rotated credentials in the Google Cloud Console earlier, go back to the Google Cloud Console and update the authorized redirect URI to:

```
http://YOUR_EC2_IP:8080/api/v1/auth/google/callback
```

---

## 9. Add GitHub Secrets

These secrets are used by the GitHub Actions workflows.

1. Go to your GitHub repository: `https://github.com/Ernie1234/EduNest`
2. Click **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret** for each of the following:

| Secret name | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | The access key ID from step 4c |
| `AWS_SECRET_ACCESS_KEY` | The secret access key from step 4c |
| `AWS_REGION` | Your region code, e.g. `us-east-1` |
| `ECR_REGISTRY` | e.g. `123456789012.dkr.ecr.us-east-1.amazonaws.com` |
| `EC2_HOST` | Your EC2 public IPv4 address |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | The full contents of your `edunest-key.pem` file |

To get the contents of the `.pem` file for `EC2_SSH_KEY`:

```bash
cat ~/Downloads/edunest-key.pem
```

Copy the entire output including the `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` lines.

---

## 10. Open Firewall Ports

You already added the security group rules in step 6c. Verify they are correct:

1. In the AWS Console, go to **EC2** → **Instances**.
2. Click your instance → **Security** tab.
3. Click the security group link (e.g. `edunest-sg`).
4. Click **Inbound rules** and confirm you see:

| Port | Source | Purpose |
|---|---|---|
| 22 | Your IP | SSH |
| 8080 | 0.0.0.0/0 | API |
| 3000 | 0.0.0.0/0 | Web |

If port 8080 or 3000 are missing, click **Edit inbound rules** → **Add rule** to add them.

---

## 11. Trigger Your First Deploy

With everything in place, push to master to trigger the full pipeline:

```bash
git add .
git commit -m "feat: add CI/CD pipeline"
git push origin feat/docker-setup
```

Then open a pull request on GitHub and merge it to master. This triggers:

1. **CI job** — lint, typecheck, tests (runs on the PR itself too)
2. **CD job** — builds Docker images, pushes to ECR, SSHs into EC2 and starts containers

### Monitor the pipeline

1. Go to your GitHub repo → **Actions** tab.
2. Click the running workflow to watch live logs.
3. The full pipeline takes about 5–10 minutes on first run (Docker layer cache is cold).

### Verify the deployment

Once the CD job shows a green checkmark:

```bash
# SSH back into the EC2 instance
ssh -i ~/Downloads/edunest-key.pem ubuntu@YOUR_EC2_IP

# Check running containers
docker ps

# Check API logs
docker logs edunest-api --tail 50

# Check web logs
docker logs edunest-web --tail 50
```

Then open in your browser:
- API health check: `http://YOUR_EC2_IP:8080/api/v1/health`
- Web app: `http://YOUR_EC2_IP:3000`

---

## 12. Estimated Costs

| Resource | Type | Monthly cost |
|---|---|---|
| EC2 `t2.micro` | 750 hrs/month free for 12 months, then ~$8–9/mo | Free tier → ~$9 |
| EC2 `t3.small` | Not free tier | ~$15/mo |
| ECR storage | First 500 MB/month free | ~$0 |
| ECR data transfer (pulls from EC2 in same region) | Free | $0 |
| EBS (20 GiB root volume) | 30 GiB/month free for 12 months | Free tier → ~$1.60 |

**Recommendation**: Start with `t2.micro` (free tier). If your app crashes due to memory pressure (you'll see OOM kills in `docker logs`), upgrade to `t3.small`.

To avoid unexpected charges, set up a billing alert:
1. Go to **Billing and Cost Management** (search in console).
2. Click **Budgets** → **Create budget**.
3. Choose **Zero spend budget** — this alerts you at $0.01, i.e. the moment anything is charged.

---

## 13. Cheat Sheet — Values to Copy

Fill this in as you go through the steps:

```
AWS Account ID:        ____________________________________________
AWS Region:            ____________________________________________  (e.g. us-east-1)
ECR Registry URL:      ____________________________________________  (e.g. 123456789.dkr.ecr.us-east-1.amazonaws.com)
EC2 Public IP:         ____________________________________________
IAM Access Key ID:     ____________________________________________
IAM Secret Access Key: ____________________________________________  (keep secret!)
PEM key file location: ____________________________________________  (e.g. ~/Downloads/edunest-key.pem)
```

---

## Common Issues

**SSH connection refused**
- Wait 2 more minutes after the instance shows "Running" — the OS is still booting.
- Confirm port 22 is in the security group inbound rules with your IP as source.
- If your home IP changed, update the SSH rule in the security group.

**Pipeline fails at "Login to Amazon ECR"**
- Double-check `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` GitHub secrets have no extra spaces.
- Confirm the IAM policy in step 4a uses your correct account ID and region.

**Pipeline fails at "Deploy via SSH"**
- Confirm `EC2_USER` is `ubuntu` (not `ec2-user` — that is for Amazon Linux, not Ubuntu).
- Confirm `EC2_SSH_KEY` includes the full PEM content with header and footer lines.
- Confirm port 22 is open in the EC2 security group.

**Docker containers start but app is unreachable**
- Confirm ports 8080 and 3000 are in the security group inbound rules with source `0.0.0.0/0`.
- Run `docker ps` on the EC2 instance to confirm containers are up.
- Run `docker logs edunest-api` to check for startup errors.

**"No space left on device" on EC2**
- Run `docker system prune -a` to remove old images and reclaim disk space.
- Consider increasing the EBS volume size: EC2 → Volumes → Modify volume.
