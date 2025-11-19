# Branch Protection Rules Setup Guide

Configure these branch protection rules in your GitHub repository settings.

## Main Branch (`main`)

### Protection Rules:
- ✅ Require a pull request before merging
  - Require approvals: **1**
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from Code Owners
- ✅ Require status checks to pass before merging
  - Require branches to be up to date before merging
  - Status checks required:
    - `Lint & Type Check`
    - `Build Web App`
    - `Build Server`
    - `Test Native Build`
    - `Check Conventional Commits`
- ✅ Require conversation resolution before merging
- ✅ Require signed commits
- ✅ Require linear history
- ✅ Include administrators
- ✅ Restrict who can push to matching branches
  - Only maintainers and admins
- ✅ Allow force pushes: **No**
- ✅ Allow deletions: **No**

## Develop Branch (`develop`)

### Protection Rules:
- ✅ Require a pull request before merging
  - Require approvals: **1**
  - Require review from Code Owners
- ✅ Require status checks to pass before merging
  - Status checks required:
    - `Lint & Type Check`
    - `Build Web App`
    - `Build Server`
    - `Test Native Build`
- ✅ Require conversation resolution before merging
- ✅ Allow force pushes: **No**
- ✅ Allow deletions: **No**

## Staging Branch (`staging`)

### Protection Rules:
- ✅ Require a pull request before merging
  - Require approvals: **1**
- ✅ Require status checks to pass before merging
  - Status checks required:
    - `Lint & Type Check`
- ✅ Allow force pushes: **No**

## Setup via GitHub CLI

Run these commands to configure branch protection:

```bash
# Main branch
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_pull_request_reviews[required_approving_review_count]=1 \
  --field required_pull_request_reviews[dismiss_stale_reviews]=true \
  --field required_pull_request_reviews[require_code_owner_reviews]=true \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]="Lint & Type Check" \
  --field required_status_checks[contexts][]="Build Web App" \
  --field required_status_checks[contexts][]="Build Server" \
  --field required_status_checks[contexts][]="Test Native Build" \
  --field required_status_checks[contexts][]="Check Conventional Commits" \
  --field enforce_admins=true \
  --field required_linear_history=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_conversation_resolution=true

# Develop branch
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_pull_request_reviews[required_approving_review_count]=1 \
  --field required_pull_request_reviews[require_code_owner_reviews]=true \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]="Lint & Type Check" \
  --field required_status_checks[contexts][]="Build Web App" \
  --field required_status_checks[contexts][]="Build Server" \
  --field required_status_checks[contexts][]="Test Native Build" \
  --field allow_force_pushes=false \
  --field allow_deletions=false

# Staging branch
gh api repos/:owner/:repo/branches/staging/protection \
  --method PUT \
  --field required_pull_request_reviews[required_approving_review_count]=1 \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]="Lint & Type Check" \
  --field allow_force_pushes=false
```

## Rulesets (Alternative to Branch Protection)

You can also use GitHub Rulesets (newer feature) instead of branch protection rules.

### Create Ruleset via GitHub Web UI:
1. Go to Settings > Rules > Rulesets
2. Click "New ruleset" > "New branch ruleset"
3. Configure the rules as specified above
4. Target branches: `main`, `develop`, `staging`
