# Project Workflow & Deployment Instructions

## 1. Project Structure Overview

This monorepo uses **Turborepo**, **TanStack Router**, **Expo**, **Node.js/Hono**, and shared packages.

Recommended structure:

```
root/
  apps/
    native/     → Expo app (built via EAS)
    server/     → Backend (Node.js + Hono)
    web/        → React + TanStack Router app (deployed on Vercel)
  packages/
    api/        → Shared api endpoints
    auth/       → Shared auth function
    config/     → Shared config (tsconfig, etc.)
    db/         → Shared Database Setup
  turbo.json
  package.json
```

---

## 2. Local Development Workflow

### Step 1: Clone the Repo

```bash
git clone https://github.com/AzlanEh/EducationPlus.git
cd EducationPlus
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Run Apps Locally

- **Web app**

```bash
pnpm dev --filter=web
```

- **Expo mobile app**

```bash
pnpm dev --filter=native
```

- **Backend (Hono/Node)**

```bash
pnpm dev --filter=server
```

---

## 3. GitHub Workflow (PR, Commits, Branching)

### Branch Strategy

- `main` → Production (protected)
- `dev` → Development integration branch
- Feature branches: `feat/<feature-name>`
- Bugfix branches: `fix/<issue-name>`
- Refactor branches: `ref/<refactor-name>`

### Creating a New Feature

```bash
git checkout dev
git pull

git checkout -b feat/auth-flow
```

### Commit Rules (Conventional Commits)

- **feat:** new feature
- **fix:** bug fix
- **refactor:** code cleanup
- **docs:** documentation changes
- **chore:** non-feature tasks

Example:

```bash
git commit -m "feat(auth): add Google OAuth using better-auth"
```

### Push & Create PR

```bash
git push -u origin feat/auth-flow
```

Go to GitHub → Open Pull Request → Target **dev**.

### Merge Strategy

- Squash Merge → clean commit history
- Always require PR review

When dev is stable:

- Create PR from `dev → main`

---

## 4. Vercel Deployment (Web App)

### Connect Monorepo to Vercel

1. Go to **vercel.com** → Import GitHub Repo
2. Choose root folder `apps/web`
3. Enable monorepo mode (Vercel detects automatically)
4. Set environment variables
5. Deploy

### Production Deployment

Every merge into **main** auto-deploys.

### Preview Deployment

Every PR creates a unique preview URL.

### Example Build Config

`apps/web/vercel.json`:

```json
{
  "buildCommand": "pnpm turbo run build --filter=web...",
  "outputDirectory": ".next",
  "installCommand": "pnpm install"
}
```

---

## 5. Expo EAS Build Setup (Mobile App)

### Install EAS CLI

```bash
npm install -g eas-cli
```

### Configure

```bash
eas build:configure
```

### Example `eas.json`

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    }
  }
}
```

### Build APK for Android

```bash
eas build -p android --profile production
```

### Build for iOS

```bash
eas build -p ios --profile production
```

---

## 6. Environment Variables Management

Create `.env` files per app:

```
apps/web/.env
apps/api/.env
apps/mobile/.env
```

Use Vercel dashboard to set web env vars.
Use EAS Secrets for mobile builds:

```bash
eas secret:create --name API_URL --value https://api.example.com
```

---

## 7. Turbo Monorepo Build Pipeline

The `turbo.json` handles caching & task pipelines.

### Example Commands

- Build all:

```bash
pnpm turbo run build
```

- Build specific app:

```bash
pnpm turbo run build --filter=web
```
