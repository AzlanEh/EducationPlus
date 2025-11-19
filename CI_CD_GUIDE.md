# CI/CD Guide for eduPlus

Complete guide for the CI/CD pipeline and release automation.

## 📋 Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Setup Instructions](#setup-instructions)
- [Conventional Commits](#conventional-commits)
- [Release Process](#release-process)
- [Branch Strategy](#branch-strategy)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project uses a comprehensive CI/CD pipeline with:

- ✅ **Automated testing and linting** on every push/PR
- ✅ **Monorepo-aware deployments** for web (Vercel) and native (EAS)
- ✅ **Semantic versioning** and automated releases
- ✅ **Conventional commits** enforcement
- ✅ **Branch protection** rules
- ✅ **Automated changelogs**

## 🔄 Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:** Push/PR to `main`, `develop`, `staging`

**Jobs:**
- **Detect Changes:** Uses path filters to determine which apps changed
- **Lint & Type Check:** Runs Biome and TypeScript checks
- **Build Web:** Builds the web app (if changed)
- **Build Server:** Builds the server (if changed)
- **Test Native:** Validates native app configuration (if changed)
- **Check Conventional Commits:** Validates commit message format (PRs only)

### 2. Vercel Deploy (`.github/workflows/deploy-vercel.yml`)

**Triggers:** Push to `main`, `develop`, `staging` (when web app changes)

**Environments:**
- `main` → Production deployment
- `develop` → Preview deployment
- `staging` → Preview deployment

**Features:**
- Automatic deployment to Vercel
- PR comments with deployment URL
- Production/Preview environment handling

### 3. EAS Deploy (`.github/workflows/deploy-eas.yml`)

**Triggers:** Push to `main`, `develop` (when native app changes)

**Profiles:**
- `main` → Production build
- `develop` → Preview build

**Features:**
- Automatic EAS builds for iOS and Android
- Automatic submission to stores (production only)
- PR comments with build status

### 4. Release (`.github/workflows/release.yml`)

**Triggers:** Push to `main` or manual workflow dispatch

**Features:**
- Semantic versioning based on conventional commits
- Automated changelog generation
- Git tags and GitHub releases
- Triggers production deployments
- Updates release with deployment status

## 🚀 Setup Instructions

### 1. Initial Setup

Run the automated setup script:

```bash
./scripts/setup-ci.sh
```

Or manually follow these steps:

### 2. Configure GitHub Secrets

Go to Repository Settings → Secrets and variables → Actions

#### Required Secrets:

**Vercel:**
```
VERCEL_TOKEN          # From https://vercel.com/account/tokens
VERCEL_ORG_ID         # From Vercel project settings
VERCEL_PROJECT_ID     # From Vercel project settings
```

**Expo/EAS:**
```
EXPO_TOKEN            # From https://expo.dev/accounts/[account]/settings/access-tokens
```

**Optional:**
```
DATABASE_URL          # If deploying with database
```

### 3. Install Dependencies

Add required development dependencies:

```bash
pnpm add -D husky @commitlint/cli @commitlint/config-conventional
pnpm add -D semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/github conventional-changelog-conventionalcommits
```

### 4. Initialize Husky

```bash
pnpm exec husky init
```

### 5. Update Configuration Files

1. **`.releaserc.json`** - Update repository URL:
```json
{
  "repositoryUrl": "https://github.com/YOUR_ORG/YOUR_REPO.git"
}
```

2. **`.github/CODEOWNERS`** - Update with your team members:
```
* @your-username
/apps/web/ @frontend-team
/apps/native/ @mobile-team
/apps/server/ @backend-team
```

### 6. Create Branches

```bash
git checkout -b develop
git push -u origin develop

git checkout -b staging
git push -u origin staging

git checkout main
```

### 7. Set Up Branch Protection

See `.github/branch-protection.md` for detailed instructions.

Quick setup via CLI:
```bash
gh api repos/:owner/:repo/branches/main/protection --method PUT --input .github/branch-protection.json
```

## 📝 Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature (triggers minor version bump)
- `fix`: Bug fix (triggers patch version bump)
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes
- `revert`: Revert previous commit

### Breaking Changes

Add `BREAKING CHANGE:` in the commit footer to trigger a major version bump:

```
feat(api): redesign authentication flow

BREAKING CHANGE: Authentication now requires email verification
```

### Examples

```bash
# Feature
git commit -m "feat(web): add user profile page"

# Bug fix
git commit -m "fix(server): resolve database connection timeout"

# Multiple scopes
git commit -m "feat(web,native): add dark mode support"

# Breaking change
git commit -m "feat(api): redesign API endpoints

BREAKING CHANGE: All API endpoints now use /v2/ prefix"
```

### Scopes

Use these scopes to indicate which part of the monorepo is affected:

- `web` - Web app
- `native` - Native app
- `server` - Server
- `api` - API package
- `auth` - Auth package
- `db` - Database package
- `ci` - CI/CD
- `deps` - Dependencies

## 🏷️ Release Process

### Automatic Releases

Releases are created automatically when you push to `main`:

1. Semantic Release analyzes commits since last release
2. Determines version bump based on commit types
3. Generates changelog
4. Creates Git tag
5. Creates GitHub release
6. Triggers production deployments
7. Updates release notes with deployment status

### Manual Releases

Trigger a release manually:

```bash
gh workflow run release.yml
```

### Version Bumping

Version bumps are automatic based on commits:

- `fix:` → Patch (1.0.0 → 1.0.1)
- `feat:` → Minor (1.0.0 → 1.1.0)
- `BREAKING CHANGE:` → Major (1.0.0 → 2.0.0)

### Pre-releases

For pre-releases, use branches like `beta`, `alpha`:

```bash
git checkout -b beta/v2.0.0
git push -u origin beta/v2.0.0
```

Configure in `.releaserc.json`:
```json
{
  "branches": [
    "main",
    {"name": "beta", "prerelease": true}
  ]
}
```

## 🌿 Branch Strategy

### Main Branches

- **`main`** - Production code, protected, triggers releases
- **`develop`** - Development branch, staging environment
- **`staging`** - Pre-production testing

### Feature Branches

Use this naming convention:

```
feat/feature-name
fix/bug-description
refactor/what-you-refactored
docs/what-you-documented
```

### Workflow

```bash
# Create feature branch from develop
git checkout develop
git pull
git checkout -b feat/new-feature

# Make changes and commit (with conventional commits)
git add .
git commit -m "feat(web): add new feature"

# Push and create PR
git push -u origin feat/new-feature
gh pr create --base develop

# After approval, merge to develop
# Then merge develop to staging for testing
# Finally merge staging to main for production release
```

## 🚀 Deployment

### Web App (Vercel)

**Automatic:**
- Push to `main` → Production
- Push to `develop` or `staging` → Preview
- PRs → Preview deployments with comment

**Manual:**
```bash
gh workflow run deploy-vercel.yml -f environment=production
```

### Native App (EAS)

**Automatic:**
- Push to `main` → Production build + store submission
- Push to `develop` → Preview build

**Manual:**
```bash
# Trigger build
gh workflow run deploy-eas.yml -f profile=production -f platform=all

# Or use EAS CLI directly
cd apps/native
eas build --platform all --profile production
```

### Server (Vercel)

**Automatic:**
- Push to `main` → Production deployment
- Push to `staging` or `develop` → Preview deployment
- Pull requests → Preview deployment with unique URL

**Manual:**
```bash
# Via GitHub Actions
gh workflow run deploy-server-vercel.yml -f environment=production

# Via Vercel CLI
cd apps/server
vercel --prod
```

**Setup:**
1. Create Vercel project for server
2. Configure GitHub secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_SERVER_PROJECT_ID`
3. Set environment variables in Vercel dashboard

See `VERCEL_SERVER_DEPLOYMENT.md` for complete deployment documentation.

## 🔍 Monitoring Workflows

### View Workflow Status

```bash
# List all runs
gh run list

# View specific run
gh run view <run-id>

# Watch a running workflow
gh run watch
```

### View Logs

```bash
# View logs for a specific run
gh run view <run-id> --log

# View failed logs only
gh run view <run-id> --log-failed
```

## 🐛 Troubleshooting

### CI Failing

1. **Lint errors:**
   ```bash
   pnpm check
   ```

2. **Type errors:**
   ```bash
   pnpm run check-types
   ```

3. **Build errors:**
   ```bash
   pnpm run build
   ```

### Commit Message Rejected

Make sure your commit follows conventional commits:

```bash
# Bad
git commit -m "updated stuff"

# Good
git commit -m "feat(web): add user dashboard"
```

### Release Not Created

1. Check if commits follow conventional commit format
2. Ensure push is to `main` branch
3. Verify semantic-release configuration in `.releaserc.json`
4. Check workflow logs: `gh run list --workflow=release.yml`

### Vercel Deployment Failed

1. Check secrets are configured correctly
2. Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
3. Ensure Vercel project exists and is linked
4. Check build logs in Vercel dashboard

### EAS Build Failed

1. Verify `EXPO_TOKEN` is valid
2. Check `eas.json` configuration
3. Ensure native dependencies are compatible
4. View build logs on Expo dashboard

### Skip CI

To skip CI on a commit:

```bash
git commit -m "docs: update README [skip ci]"
```

## 📚 Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Vercel Documentation](https://vercel.com/docs)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Husky Documentation](https://typicode.github.io/husky/)

## 🤝 Contributing

1. Follow conventional commit format
2. Ensure all CI checks pass
3. Request review from code owners
4. Resolve all conversations
5. Squash and merge (for clean history)

## 📞 Support

For issues with CI/CD:
1. Check this guide first
2. Review workflow logs
3. Check repository issues
4. Contact DevOps team
