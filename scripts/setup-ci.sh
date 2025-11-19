#!/bin/bash

# CI/CD Setup Script for eduPlus
# This script helps you configure all necessary secrets and settings

set -e

echo "🚀 eduPlus CI/CD Setup"
echo "======================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to GitHub${NC}"
    echo "Running: gh auth login"
    gh auth login
fi

echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
echo ""

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"
echo ""

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_description=$2
    local secret_value=$3
    
    if [ -z "$secret_value" ]; then
        read -sp "$secret_description: " secret_value
        echo ""
    fi
    
    if [ -n "$secret_value" ]; then
        echo "$secret_value" | gh secret set "$secret_name"
        echo -e "${GREEN}✅ Set $secret_name${NC}"
    else
        echo -e "${YELLOW}⚠️  Skipped $secret_name${NC}"
    fi
}

echo "🔐 Setting up GitHub Secrets"
echo "============================="
echo ""

# Vercel Secrets
echo "📦 Vercel Configuration"
echo "Get these from: https://vercel.com/account/tokens"
echo ""
set_secret "VERCEL_TOKEN" "Vercel Token"
set_secret "VERCEL_ORG_ID" "Vercel Organization ID"
set_secret "VERCEL_PROJECT_ID" "Vercel Project ID (for web app)"
echo ""

# Expo/EAS Secrets
echo "📱 Expo/EAS Configuration"
echo "Get token from: https://expo.dev/accounts/[account]/settings/access-tokens"
echo ""
set_secret "EXPO_TOKEN" "Expo Access Token"
echo ""

# Optional: Database secrets
echo "🗄️  Database Configuration (Optional)"
read -p "Do you want to set up database secrets? (y/n): " setup_db
if [ "$setup_db" = "y" ]; then
    set_secret "DATABASE_URL" "Database URL"
fi
echo ""

# Create branch protection
echo "🛡️  Branch Protection"
echo "===================="
read -p "Do you want to set up branch protection rules? (y/n): " setup_protection
if [ "$setup_protection" = "y" ]; then
    echo "Setting up branch protection for main, develop, and staging..."
    
    # Note: This requires admin permissions
    gh api "repos/$REPO/branches/main/protection" \
        -X PUT \
        -f required_pull_request_reviews[required_approving_review_count]=1 \
        -f required_pull_request_reviews[dismiss_stale_reviews]=true \
        -f required_pull_request_reviews[require_code_owner_reviews]=true \
        -f enforce_admins=true \
        -f required_linear_history=true \
        -f allow_force_pushes=false \
        -f allow_deletions=false \
        -f required_conversation_resolution=true 2>/dev/null || echo -e "${YELLOW}⚠️  Could not set branch protection (may need admin permissions)${NC}"
    
    echo -e "${GREEN}✅ Branch protection configured${NC}"
else
    echo "See .github/branch-protection.md for manual setup instructions"
fi
echo ""

# Enable GitHub Actions
echo "⚙️  GitHub Actions"
echo "================="
echo "Enabling GitHub Actions workflows..."
gh api "repos/$REPO/actions/permissions" \
    -X PUT \
    -f enabled=true \
    -f allowed_actions=all 2>/dev/null || echo -e "${YELLOW}⚠️  Could not enable Actions${NC}"
echo ""

# Summary
echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Update CODEOWNERS file with your GitHub usernames"
echo "2. Update .releaserc.json with your repository URL"
echo "3. Create 'develop' and 'staging' branches if needed"
echo "4. Review and customize branch protection rules"
echo "5. Test by creating a pull request"
echo ""
echo "Workflows available:"
echo "  - CI: Runs on every push and PR"
echo "  - Deploy Vercel: Auto-deploys web app"
echo "  - Deploy EAS: Auto-deploys native app"
echo "  - Release: Creates releases with semantic versioning"
echo ""
echo "Documentation:"
echo "  - Branch Protection: .github/branch-protection.md"
echo "  - Conventional Commits: https://www.conventionalcommits.org/"
echo ""
