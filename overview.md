# EduPlus - Technical Overview

## 1. Programming Language

| Category | Technology |
|----------|------------|
| **Primary Language** | TypeScript (full-stack) |
| **Runtime** | Node.js 20 |
| **Package Manager** | pnpm 10.20.0 |
| **Monorepo Tool** | Turborepo |

### Frontend

| Platform | Stack |
|----------|-------|
| **Web** | React 19 + Vite + TanStack Router + Tailwind CSS 4 |
| **Mobile** | React Native 0.81 + Expo 54 + expo-router |

### Backend

| Component | Technology |
|-----------|------------|
| **Framework** | Hono |
| **API Layer** | oRPC (type-safe RPC) |

### Project Structure

```
apps/
  ├── web/       # React + Vite frontend
  ├── server/    # Hono backend
  └── native/    # React Native/Expo mobile app
packages/
  ├── api/       # oRPC API definitions
  ├── auth/      # Better Auth configuration
  ├── db/        # Mongoose models
  └── config/    # Shared configuration
```

---

## 2. Database

| Aspect | Details |
|--------|---------|
| **Database** | MongoDB 7 |
| **ODM** | Mongoose |
| **Connection** | Via `DATABASE_URL` environment variable |

### Database Models

| Model | Description |
|-------|-------------|
| **Auth Models** | User, Session, Account, Verification, OTP, Invite |
| **Education Models** | Course, Video, Note, Test, DPP |
| **Module Models** | Module (course structure) |
| **Progress Models** | CourseProgress, VideoProgress, TestAttempt, DPPAttempt, NoteAccess, StudyStreak |

### Connection Configuration

- **Max Pool Size**: Configurable via `DB_MAX_POOL_SIZE` (default: 10)
- **Min Pool Size**: Configurable via `DB_MIN_POOL_SIZE` (default: 1)
- **Server Selection Timeout**: 5000ms
- **Global Connection Caching**: Enabled for serverless environments

---

## 3. Authentication & Authorization

| Aspect | Details |
|--------|---------|
| **Library** | Better Auth |
| **Database Adapter** | `better-auth/adapters/mongodb` |
| **Mobile Integration** | `@better-auth/expo` with SecureStore |

### Authentication Methods

| Method | Status |
|--------|--------|
| Email/Password | Enabled (with optional email verification) |
| Google OAuth | Enabled (Web + Native) |
| Password Reset | Via email using Resend |
| OTP Support | Enabled |

### User Model Extensions

| Field | Type | Default |
|-------|------|---------|
| `role` | string | "student" |
| `target` | string | optional (JEE, NEET, etc.) |
| `gender` | string | optional |
| `phoneNo` | string | optional |
| `signupSource` | string | "web" |

### Environment Variables

```
BETTER_AUTH_SECRET
BETTER_AUTH_URL
WEB_GOOGLE_CLIENT_ID
WEB_GOOGLE_CLIENT_SECRET
NATIVE_GOOGLE_CLIENT_ID
```

---

## 4. Live Streaming & Video Infrastructure

| Aspect | Details |
|--------|---------|
| **Streaming Provider** | Cloudflare Stream (self-hosted) |
| **Video Player (Native)** | react-native-video |
| **Video Player (Web)** | video.js |
| **Temporary Storage** | Cloudflare R2 (raw uploads) |
| **CDN** | Cloudflare global edge network |
| **Processing** | Cloudflare Stream auto-transcoding (HLS) |

### Recorded Videos

| Feature | Details |
|---------|---------|
| **Upload Formats** | MP4, MOV via admin panel |
| **Transcoding** | Auto HLS (adaptive bitrate: 1080p/720p/480p) |
| **Thumbnails** | Auto-generated |
| **Delivery** | Signed URL for secure student access |

### Live Streaming

| Feature | Details |
|---------|---------|
| **Ingest** | RTMP via OBS Studio or mobile apps |
| **Playback** | Real-time HLS in native app |
| **Recording** | Auto-recording for on-demand replay |
| **Notifications** | Live indicators and push notifications |

### Custom Video Player Features

- Fully branded UI with custom controls
- Play/pause, seek, volume, playback speed
- Progress tracking (watch time, completion percentage)
- Bookmarking and note-taking on videos
- Offline viewing capability via caching

### Video Processing Pipeline

```
Raw Upload → Validation → Cloudflare Transcoding → CDN Delivery
                              ↓
                    Webhook notifications for status
                              ↓
                    Metadata storage (duration, resolution, file size)
```

---

## 5. Hosting & Deployment

| Platform | App | Notes |
|----------|-----|-------|
| **Vercel** | Web (frontend) | API rewrites, security headers |
| **Vercel** | Server (backend) | Serverless functions |
| **EAS (Expo)** | Mobile app | EAS Build & Submit |
| **Docker** | Alternative | Multi-stage Node.js 20 Alpine build |

### Production URLs

| Service | URL |
|---------|-----|
| Server | `https://education-plus-server.vercel.app` |
| Expo Project ID | `eeacf867-78c3-4105-8637-975881c945aa` |

### CI/CD Pipelines (GitHub Actions)

| Workflow | Description |
|----------|-------------|
| `ci.yml` | Lint, build, test |
| `security.yml` | Security scanning |
| `performance.yml` | Performance testing |

---

### Pricing Comparison (100+ students, ~50 videos)

| Feature | Bunny Stream | Cloudflare Stream |
|---------|--------------|-------------------|
| Storage | $0.01/GB/month | $0.015/GB/month |
| Bandwidth/Delivery | $0.005-0.01/GB | $0.085/GB |
| Transcoding | FREE | FREE (basic) |
| Video Player | FREE (customizable) | FREE |
| Min Monthly | $1/month | ~$5/month |
| Est. Total (your scale) | ~$3-10/month | ~$10-30/month |

## Summary

| Category | Technology |
|----------|------------|
| **Language** | TypeScript (full-stack) |
| **Frontend (Web)** | React 19 + Vite + TanStack Router + Tailwind CSS 4 |
| **Frontend (Mobile)** | React Native 0.81 + Expo 54 + expo-router |
| **Backend** | Hono + oRPC |
| **Database** | MongoDB 7 + Mongoose |
| **Authentication** | Better Auth (email/password + Google OAuth) |
| **Video Streaming** | Cloudflare Stream (recorded + live) |
| **Video Player** | react-native-video (native), video.js (web) |
| **Hosting** | Vercel (web/server) + EAS (mobile) |
| **Containerization** | Docker + Docker Compose |
| **Monorepo** | Turborepo + pnpm workspaces |
| **CI/CD** | GitHub Actions |
