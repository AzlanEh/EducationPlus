# Vercel Server Deployment Guide for eduPlus

Complete guide for deploying the eduPlus backend server to Vercel.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Setup](#quick-setup)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The eduPlus server is deployed to Vercel with:

- ✅ **Serverless Functions** - Automatic scaling and zero cold starts
- ✅ **Edge Network** - Global CDN with 100+ edge locations
- ✅ **Multi-environment support** (production, preview, development)
- ✅ **Automatic deployments** via GitHub Actions
- ✅ **Zero-downtime deployments**
- ✅ **Built-in monitoring and analytics**

## 📦 Prerequisites

### 1. Vercel Account

Sign up at: https://vercel.com/signup

### 2. Vercel CLI (Optional for local testing)

```bash
# Install globally
npm i -g vercel

# Or use with pnpm
pnpm add -g vercel

# Login
vercel login
```

## 🚀 Quick Setup

### 1. Create Vercel Project for Server

Go to https://vercel.com/new and:

1. **Import your repository**
2. **Configure project:**
   - Framework Preset: **Other**
   - Root Directory: **apps/server**
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

3. **Add to existing project** or create new one
4. **Note the Project ID** (Settings > General > Project ID)

### 2. Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

```bash
# Using GitHub CLI
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_SERVER_PROJECT_ID
```

Or manually:
- `VERCEL_TOKEN` - Get from: https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - From Vercel project settings
- `VERCEL_SERVER_PROJECT_ID` - From Vercel server project settings (different from web project)

### 3. Set Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables

Add these for each environment (Production, Preview, Development):

```
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
BETTER_AUTH_SECRET=your-auth-secret
BETTER_AUTH_URL=your-app-url
```

### 4. Deploy

Push to your repository:

```bash
git add .
git commit -m "feat(server): configure Vercel deployment"
git push origin main
```

The GitHub Action will automatically deploy your server!

## ⚙️ Configuration

### vercel.json

Located at `apps/server/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["iad1"],
  "framework": null
}
```

### Available Regions

Change `regions` in `vercel.json` to your preferred location:

**Americas:**
- `iad1` - Washington, D.C., USA (default)
- `sfo1` - San Francisco, USA
- `pdx1` - Portland, USA
- `cle1` - Cleveland, USA
- `gru1` - São Paulo, Brazil

**Europe:**
- `ams1` - Amsterdam, Netherlands
- `lhr1` - London, United Kingdom
- `fra1` - Frankfurt, Germany
- `cdg1` - Paris, France

**Asia Pacific:**
- `hnd1` - Tokyo, Japan
- `sin1` - Singapore
- `syd1` - Sydney, Australia
- `hkg1` - Hong Kong
- `icn1` - Seoul, South Korea
- `bom1` - Mumbai, India

**Multi-region:**
```json
"regions": ["iad1", "sfo1", "lhr1", "sin1"]
```

### Build Configuration

The server is built using your existing build command:

```bash
pnpm --filter server build
```

This generates the `dist/index.js` file that Vercel deploys.

## 🚀 Deployment

### Automatic Deployment (CI/CD)

Deployments happen automatically via GitHub Actions:

**Production:**
- Push to `main` branch → Production deployment

**Preview:**
- Push to `staging` or `develop` branch → Preview deployment
- Pull requests → Preview deployment with unique URL

### Manual Deployment

#### Via GitHub Actions

```bash
gh workflow run deploy-server-vercel.yml -f environment=production
```

#### Via Vercel CLI

```bash
# From project root
cd apps/server

# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Deployment Process

1. **Trigger**: Push to GitHub or manual trigger
2. **Build**: Runs `pnpm build` to create `dist/index.js`
3. **Deploy**: Uploads to Vercel serverless functions
4. **Health Check**: Verifies deployment is healthy
5. **Activate**: Routes traffic to new deployment
6. **Notify**: Comments on PR with deployment URL

## 🔐 Environment Variables

### Required Variables

Set these in Vercel project settings for each environment:

#### Database
```
DATABASE_URL=mongodb+srv://...
# or
DATABASE_URL=postgresql://...
```

#### Authentication
```
JWT_SECRET=your-super-secret-jwt-key
BETTER_AUTH_SECRET=your-better-auth-secret
BETTER_AUTH_URL=https://your-app.vercel.app
```

#### Optional
```
API_KEY=your-external-api-key
LOG_LEVEL=info
NODE_ENV=production
```

### Setting Environment Variables

#### Via Vercel Dashboard

1. Go to your project → Settings → Environment Variables
2. Add variable name and value
3. Select environments (Production, Preview, Development)
4. Click Save

#### Via Vercel CLI

```bash
# Set for production
vercel env add DATABASE_URL production

# Set for all environments
vercel env add JWT_SECRET
```

#### Via GitHub Actions

Environment variables set in Vercel dashboard are automatically available during deployment.

## 📊 Monitoring

### View Deployments

```bash
# Via Vercel CLI
vercel ls

# Via Dashboard
open https://vercel.com/your-org/server/deployments
```

### View Logs

#### Real-time Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Or use CLI:

```bash
vercel logs [deployment-url]

# Follow logs
vercel logs -f
```

#### Function Logs

Each serverless function invocation is logged automatically with:
- Request details
- Response status
- Execution time
- Errors and stack traces

### Analytics

Vercel provides built-in analytics:

1. Go to Vercel Dashboard → Your Project → Analytics
2. View:
   - Traffic patterns
   - Response times
   - Error rates
   - Geographic distribution

### Performance Monitoring

```bash
# Check deployment status
vercel inspect [deployment-url]

# View function metrics
vercel analytics
```

## 🔄 Scaling

Vercel automatically scales your serverless functions:

- **Concurrent Requests**: Automatically scales to handle traffic
- **Cold Starts**: Optimized for fast cold starts (<100ms)
- **Geographic Distribution**: Deployed to edge locations worldwide
- **No Configuration Required**: Just deploy and it scales!

### Function Limits

**Hobby Plan (Free):**
- 100GB bandwidth/month
- 100 hours serverless function execution/month
- 1000 builds/month

**Pro Plan ($20/month):**
- 1TB bandwidth/month
- 1000 hours serverless function execution/month
- 6000 builds/month
- Custom domains
- Team collaboration

See: https://vercel.com/pricing

## 🐛 Troubleshooting

### Deployment Fails

**Check build logs:**
```bash
# Via GitHub Actions
gh run view --log

# Via Vercel CLI
vercel logs [deployment-url]
```

**Common issues:**
1. **Build fails**: Check `pnpm build` works locally
2. **Missing dependencies**: Ensure all deps in `package.json`
3. **Environment variables**: Verify all required vars are set

### Function Timeout

Default timeout is 10 seconds (hobby) or 60 seconds (pro).

To increase timeout, add to `vercel.json`:

```json
{
  "functions": {
    "dist/index.js": {
      "maxDuration": 60
    }
  }
}
```

### Cold Starts

If cold starts are slow:

1. **Reduce bundle size**: Remove unused dependencies
2. **Optimize imports**: Use tree-shaking
3. **Use Edge Functions**: For sub-50ms cold starts

```json
{
  "functions": {
    "dist/index.js": {
      "runtime": "edge"
    }
  }
}
```

### CORS Issues

If facing CORS errors, verify your CORS configuration in server code:

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-app.vercel.app'
    : '*',
  credentials: true
}));
```

### Database Connection Issues

**Check connection string:**
```bash
vercel env ls
```

**Common fixes:**
1. Ensure DATABASE_URL is set for all environments
2. Check database allows connections from Vercel IPs
3. For MongoDB Atlas: Add 0.0.0.0/0 to IP whitelist
4. For PostgreSQL: Enable connection pooling

### 404 Errors

If getting 404s, check `vercel.json` routes:

```json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

### View Deployment Details

```bash
# Get deployment URL
vercel ls

# Inspect specific deployment
vercel inspect [deployment-url]

# View build logs
vercel logs [deployment-url] --since 24h
```

## 🌐 Custom Domains

### Add Custom Domain

#### Via Dashboard

1. Go to Project Settings → Domains
2. Add your domain: `api.yourdomain.com`
3. Configure DNS:
   ```
   CNAME  api  cname.vercel-dns.com
   ```

#### Via CLI

```bash
vercel domains add api.yourdomain.com
```

### SSL Certificates

Vercel automatically provisions SSL certificates:
- Free SSL via Let's Encrypt
- Auto-renewal
- HTTPS enforced by default

## 🔒 Security Best Practices

### 1. Environment Variables

- Never commit secrets to git
- Use different secrets for each environment
- Rotate secrets regularly

### 2. API Security

```typescript
// Add rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. CORS

Configure CORS properly:

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

### 4. Input Validation

Use zod or similar for input validation:

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
});
```

## 💡 Best Practices

### 1. Optimize Bundle Size

```bash
# Check bundle size
pnpm build && du -sh apps/server/dist

# Remove unused dependencies
pnpm prune
```

### 2. Use Connection Pooling

For database connections:

```typescript
// Use connection pooling
const pool = new Pool({
  max: 10, // max connections
  idleTimeoutMillis: 30000
});
```

### 3. Cache Responses

```typescript
// Add cache headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  next();
});
```

### 4. Monitor Performance

- Use Vercel Analytics
- Set up error tracking (Sentry, etc.)
- Monitor function execution time

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Edge Functions](https://vercel.com/docs/functions/edge-functions)

## 🔗 URLs

After deployment, your server will be available at:

- **Production**: https://your-server.vercel.app
- **Preview**: https://your-server-[branch].vercel.app
- **Custom Domain**: https://api.yourdomain.com

## 🆘 Support

For issues:
1. Check deployment logs: `vercel logs`
2. Review Vercel dashboard
3. Check this guide
4. Vercel docs: https://vercel.com/docs
5. Vercel support: https://vercel.com/support

## 🎯 Quick Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs -f

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# View domains
vercel domains ls

# Add domain
vercel domains add api.example.com

# View environment variables
vercel env ls

# Add environment variable
vercel env add DATABASE_URL production
```
