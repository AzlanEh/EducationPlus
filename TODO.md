# Project Status & TODOs

Based on [PRD.md](./PRD.md) and current project state.

## 🟢 Phase 1: MVP (Current Focus)

### 🏗 Infrastructure & Backend

- [x] **Project Setup**: Monorepo structure (Turborepo), Package management (pnpm).
- [x] **Database**: MongoDB setup with Mongoose schemas (`Course`, `Video`, `Note`, `DPP`, `User`).
- [x] **API Layer**: Hono.js server with oRPC.
  - [x] Auth Endpoints (`sendOTP`, `verifyOTP`).
  - [x] Course CRUD.
  - [x] Video CRUD.
  - [x] Note CRUD.
  - [x] DPP CRUD.
  - [x] RBAC Middleware (Admin/Student).

### 🔐 Authentication

- [x] **Backend Logic**: Better Auth integration, OTP logic.
- [x] **Web Auth UI**:
  - [x] Sign In Form.
  - [x] Sign Up Form.
  - [x] Admin Invite/Sign Up.
- [x] **Mobile Auth UI**:
	- [x] Login Screen.
	- [x] Sign Up Screen.
	- [x] OTP Verification Screen.

### 🖥 Web Admin Panel (`apps/web`)

- [x] **Layout**: Sidebar, Header, Responsive Sheet.
- [x] **Dashboard**: Stats overview.
- [x] **Course Management**:
  - [x] List View (Datatable/Cards).
  - [x] Create Course Form.
  - [x] Edit Course Form.
- [x] **Content Management (Within Course)**:
  - [x] Module/Chapter management.
  - [x] Video Upload/Link interface.
  - [x] DPP Creator (Question form, Options, Correct Answer).
  - [x] Note Upload interface (PDF).
- [x] **User Management**: Admin view of students.

### 📱 Mobile Student App (`apps/native`)

- [ ] **Onboarding**: Welcome screens and user preference setup.
- [x] **Home/Dashboard**:
  - [x] Featured courses.
  - [x] Continue watching.
- [x] **Course Discovery**:
  - [x] Course list/grid.
  - [x] Course details screen (Curriculum view).
- [~] **Learning Interface**:
  - [~] Video Player (migrating from YouTube to custom player).
  - [x] PDF/Note Viewer.
  - [x] DPP Attempt Interface (Quiz UI).
- [x] **Profile**:
  - [x] User stats.
  - [x] Settings.

---

## 🎬 Video Streaming Implementation (Cloudflare Stream)

### Phase 1: Infrastructure Setup

#### 1.1 Cloudflare Account & API Setup
- [ ] Create Cloudflare account and enable Stream product.
- [ ] Generate API token with Stream permissions (`Stream:Edit`, `Stream:Read`).
- [ ] Add environment variables to `apps/server/.env`:
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_STREAM_SUBDOMAIN` (optional for custom domain)
- [ ] Update `.env.example` with new variables.

#### 1.2 Database Schema Updates
- [ ] Update `packages/db/src/models/education.model.ts`:
  - [ ] Replace `youtubeVideoId: string` with new video fields:
    ```typescript
    videoUrl: string          // Cloudflare HLS playback URL
    cloudflareVideoId: string // Cloudflare Stream video UID
    thumbnailUrl: string      // Auto-generated thumbnail
    duration: number          // Video duration in seconds
    status: 'uploading' | 'processing' | 'ready' | 'error'
    isLive: boolean           // Flag for live streams
    liveStreamId: string      // Cloudflare live input ID (for live)
    ```
  - [ ] Add `VideoMetadata` schema for additional fields (resolution, fileSize, etc.).
- [ ] Run `pnpm run db:push` from server workspace to apply changes.

#### 1.3 Server-Side Cloudflare Integration
- [ ] Install Cloudflare SDK: `pnpm add cloudflare -F @eduPlus/server`.
- [ ] Create `apps/server/src/lib/cloudflare.ts`:
  - [ ] Initialize Cloudflare client with API token.
  - [ ] Helper functions:
    - [ ] `uploadVideo(file: Buffer, metadata: object)` - Direct upload to Stream.
    - [ ] `getUploadUrl()` - Get TUS resumable upload URL for large files.
    - [ ] `getVideoStatus(videoId: string)` - Check processing status.
    - [ ] `getPlaybackUrl(videoId: string)` - Get signed HLS URL.
    - [ ] `deleteVideo(videoId: string)` - Remove video from Stream.
    - [ ] `createLiveInput()` - Create RTMP endpoint for live streaming.
    - [ ] `startLiveStream(inputId: string)` - Start live broadcast.
    - [ ] `stopLiveStream(inputId: string)` - End live broadcast.

### Phase 2: Video Upload & Processing Pipeline

#### 2.1 Video Upload API Endpoints
- [ ] Create `apps/server/src/routes/videos.ts` (oRPC router):
  - [ ] `POST /videos/upload-url` - Get Cloudflare direct upload URL (TUS protocol).
  - [ ] `POST /videos/create` - Create video record in DB after upload.
  - [ ] `GET /videos/:id` - Get video details with playback URL.
  - [ ] `GET /videos/:id/status` - Check processing status.
  - [ ] `DELETE /videos/:id` - Delete video from DB and Cloudflare.
  - [ ] `GET /videos/course/:courseId` - List videos for a course.
- [ ] Add authentication middleware (admin-only for upload/delete).
- [ ] Implement rate limiting for upload endpoints.

#### 2.2 Webhook for Processing Status
- [ ] Create `apps/server/src/routes/webhooks/cloudflare.ts`:
  - [ ] `POST /webhooks/cloudflare/video-ready` - Handle video ready notification.
  - [ ] Update video status in DB when processing completes.
  - [ ] Extract and store metadata (duration, thumbnail URL).
  - [ ] Send push notification to admin on completion (optional).
- [ ] Configure webhook URL in Cloudflare Stream dashboard.
- [ ] Add webhook signature verification for security.

#### 2.3 Video Processing Pipeline Flow
```
Admin Upload (Web) → TUS Upload to Cloudflare → DB Record (status: uploading)
                                ↓
                    Cloudflare Transcoding (HLS)
                                ↓
                    Webhook: video-ready → DB Update (status: ready)
                                ↓
                    Video available in Native App
```

### Phase 3: Web Admin Video Management

#### 3.1 Video Upload UI
- [ ] Update `apps/web/src/routes/admin/courses/$courseId.tsx`:
  - [ ] Replace YouTube ID input with file upload component.
  - [ ] Implement TUS resumable upload with progress bar.
  - [ ] Show upload status (uploading → processing → ready).
  - [ ] Display video thumbnail preview after processing.
  - [ ] Add video metadata form (title, description, order).
- [ ] Install TUS client: `pnpm add tus-js-client -F @eduPlus/web`.
- [ ] Create `apps/web/src/components/video-upload.tsx`:
  - [ ] Drag-and-drop file upload zone.
  - [ ] File validation (max size, allowed formats: MP4, MOV, MKV).
  - [ ] Progress indicator with cancel option.
  - [ ] Error handling with retry option.

#### 3.2 Video Management Dashboard
- [ ] Create `apps/web/src/routes/admin/videos/index.tsx`:
  - [ ] List all videos with status indicators.
  - [ ] Filter by status (uploading, processing, ready, error).
  - [ ] Bulk delete functionality.
  - [ ] Video preview player (web).
- [ ] Add video analytics display (views, watch time - future).

### Phase 4: Native App Custom Video Player

#### 4.1 Install Video Player Library
- [ ] Install react-native-video: `pnpm add react-native-video -F @eduPlus/native`.
- [ ] Install peer dependencies for Expo compatibility.
- [ ] Configure native modules (if needed for bare workflow).

#### 4.2 Custom Video Player Component
- [ ] Create `apps/native/components/video-player.tsx`:
  - [ ] Replace YouTube iframe with `<Video>` component from react-native-video.
  - [ ] Props: `videoUrl`, `thumbnailUrl`, `onProgress`, `onComplete`.
  - [ ] Features:
    - [ ] Play/Pause button with custom icon.
    - [ ] Seek bar with buffering indicator.
    - [ ] Volume control (mute/unmute).
    - [ ] Playback speed selector (0.5x, 1x, 1.5x, 2x).
    - [ ] Fullscreen toggle.
    - [ ] Picture-in-picture mode (Android).
    - [ ] Quality selector (auto, 1080p, 720p, 480p).
    - [ ] 10s forward/backward skip buttons.
  - [ ] Styling: Branded controls matching app theme.
  - [ ] Accessibility: Screen reader support for controls.

#### 4.3 Video Progress Tracking
- [ ] Update `apps/native/components/video-player.tsx`:
  - [ ] Track watch time via `onProgress` callback.
  - [ ] Save progress to server via oRPC (`updateVideoProgress`).
  - [ ] Resume playback from last position.
  - [ ] Mark video as complete when >90% watched.
- [ ] Update `packages/api/src/routers/v1/progress.ts`:
  - [ ] `POST /progress/video` - Save video progress (userId, videoId, watchedSeconds, completed).
  - [ ] `GET /progress/video/:videoId` - Get user's progress for a video.

#### 4.4 Offline Video Support (Future Enhancement)
- [ ] Implement video download functionality.
- [ ] Cache downloaded videos using `react-native-fs`.
- [ ] Show download progress in UI.
- [ ] Manage storage (delete old downloads).
- [ ] Play offline videos from local storage.

### Phase 5: Live Streaming

#### 5.1 Live Stream API Endpoints
- [ ] Add to `apps/server/src/routes/videos.ts`:
  - [ ] `POST /live/create` - Create Cloudflare live input (get RTMP URL/key).
  - [ ] `POST /live/:id/start` - Mark live stream as started in DB.
  - [ ] `POST /live/:id/stop` - End live stream, save recording.
  - [ ] `GET /live/active` - List active live streams.
  - [ ] `GET /live/:id/playback` - Get live HLS playback URL.

#### 5.2 Admin Live Streaming UI
- [ ] Create `apps/web/src/routes/admin/live/index.tsx`:
  - [ ] "Start Live Stream" button.
  - [ ] Display RTMP URL and stream key for OBS.
  - [ ] Live preview player (optional).
  - [ ] Viewer count display.
  - [ ] "End Stream" button with confirmation.
- [ ] Create `apps/web/src/routes/admin/live/$streamId.tsx`:
  - [ ] Live stream details and controls.
  - [ ] Chat moderation (future).

#### 5.3 Native App Live Stream Playback
- [ ] Update `apps/native/screens/video-player-screen.tsx`:
  - [ ] Detect live stream via `isLive` flag.
  - [ ] Show "LIVE" badge on player.
  - [ ] Disable seek bar for live content.
  - [ ] Auto-refresh playback URL if stream restarts.
  - [ ] Show "Stream ended" message when live ends.
- [ ] Add live stream section to home screen:
  - [ ] "Live Now" banner for active streams.
  - [ ] Push notification when live stream starts.

#### 5.4 Live Stream Recording
- [ ] Configure Cloudflare to auto-record live streams.
- [ ] Webhook to create video record when recording is ready.
- [ ] Show recorded live streams in course content.

### Phase 6: Testing & Quality Assurance

#### 6.1 Unit Tests
- [ ] Add tests in `apps/server/tests/`:
  - [ ] `videos.test.ts` - Video CRUD operations.
  - [ ] `cloudflare.test.ts` - Cloudflare API integration (mocked).
  - [ ] `webhooks.test.ts` - Webhook handling.
- [ ] Add tests in `apps/web/`:
  - [ ] Video upload component tests.
  - [ ] Video management UI tests.

#### 6.2 Integration Tests
- [ ] Test complete upload flow (web → server → Cloudflare → webhook → DB).
- [ ] Test video playback in native app (fetch URL → play → track progress).
- [ ] Test live stream flow (create → broadcast → playback → end → recording).

#### 6.3 Performance Testing
- [ ] Test video playback on slow networks (3G simulation).
- [ ] Test concurrent uploads (admin).
- [ ] Test concurrent video playback (100+ students).
- [ ] Measure video load time (<3 seconds target).

### Phase 7: Migration & Deployment

#### 7.1 Migration from YouTube
- [ ] Create migration script `apps/server/scripts/migrate-youtube-videos.ts`:
  - [ ] Fetch existing YouTube video IDs from DB.
  - [ ] Download videos (if allowed) or flag for manual re-upload.
  - [ ] Update DB records with new Cloudflare URLs.
- [ ] Update seed data (`scripts/seed.ts`) with Cloudflare video URLs.

#### 7.2 Environment Configuration
- [ ] Add Cloudflare credentials to production environment.
- [ ] Configure webhook URLs for production domain.
- [ ] Set up Cloudflare Stream custom domain (optional).

#### 7.3 Deployment Checklist
- [ ] Run `pnpm run lint` - Fix any linting errors.
- [ ] Run `pnpm run check-types` - Fix TypeScript errors.
- [ ] Run `pnpm run test` - All tests passing.
- [ ] Run `pnpm run build` - Build all apps.
- [ ] Deploy server with new video endpoints.
- [ ] Deploy web admin with upload UI.
- [ ] Deploy native app with custom video player.

---

## 🔴 Pre-Production Fixes: Auth Production Readiness

### ✅ **Google OAuth Production Fix**: Implemented hybrid OAuth solution
- **Web**: Server-side OAuth using `WEB_GOOGLE_CLIENT_ID`
- **Mobile**: Client-side Google Sign-In SDK → ID token verification
- **Result**: Google OAuth now works on both platforms in production

### Critical Security & Scalability Issues

- [ ] **Implement Persistent OTP Storage**: Replace in-memory Map with Redis/database storage for OTP codes (packages/auth/src/index.ts, packages/api/src/routers/v1/auth.ts). Prevents data loss on server restarts and enables horizontal scaling.
- [ ] **Enable Email Verification**: Set `requireEmailVerification: true` in auth config (packages/auth/src/index.ts). Currently disabled, allowing unverified signups.
- [ ] **Remove Debug Logging**: Clean up console.log statements exposing OTPs in production logs (multiple auth files).

### Environment & Configuration

- [ ] **Add Missing Environment Variables**: Update .env.example with BETTER_AUTH_SECRET, EMAIL_FROM, RESEND_API_KEY. Ensure DATABASE_URL is production-ready.
- [ ] **Secure Session Management**: Implement Redis for session storage to handle distributed environments and high load.

### Testing & Quality Assurance

- [ ] **Add Auth Unit Tests**: Create tests for auth functions, OTP verification, and error handling in packages/auth/ and packages/api/.
- [ ] **Add Integration Tests**: Test complete auth flows (signup/login/OTP) across web/native apps. Add to apps/server/tests/.
- [ ] **Security Testing**: Implement OWASP top 10 checks and vulnerability scanning for auth endpoints.

### Security Hardening

- [ ] **Input Validation**: Add comprehensive validation for all auth inputs (email format, password strength, OTP format).
- [ ] **Error Handling**: Implement secure error responses without information leakage (avoid exposing stack traces or user data).
- [ ] **Rate Limiting**: Add granular rate limiting for auth endpoints (max login attempts: 5/minute, OTP requests: 3/minute).
- [x] **HTTPS Enforcement**: Ensure all auth routes use HTTPS in production.

### Monitoring & Observability

- [ ] **Auth Metrics**: Add Prometheus metrics for login attempts, failures, OTP usage (integrate with existing prometheus.ts).
- [ ] **Secure Logging**: Implement proper logging without sensitive data exposure.
- [x] **Health Checks**: Add auth-specific health checks in apps/server/tests/health.test.ts.

### Scalability Improvements

- [x] **Database Connection Pooling**: Optimize MongoDB connections for high traffic scenarios.
- [ ] **Caching Strategy**: Implement Redis caching for frequently accessed auth data (user sessions, OTP validation).

---

## 🟡 Phase 2: Core Features (Planned)

### 📚 Content Experience

- [ ] **Rich Text Notes**: Rendering markdown/HTML in mobile app.
- [ ] **DPP System**:
  - [ ] Timer implementation.
  - [ ] Score calculation.
  - [ ] Solution display after attempt.
- [ ] **Progress Tracking**:
  - [ ] Mark video as complete.
  - [ ] Watch history.
  - [ ] DPP scores in database.

### 🎮 Gamification

- [ ] Study streaks logic.
- [ ] Achievement badges system.
- [ ] Leaderboards.

---

## 🔵 Phase 3: Enhancement (Future)

- [ ] **Offline Support**: Video download and caching via react-native-video.
- [ ] **Social Features**: Comments/Discussions on videos.
- [ ] **Advanced Analytics**: Admin reports on video engagement, watch time, drop-off points.
- [ ] **Live Chat**: Real-time chat during live streams.

## 🟣 Phase 4: Launch & Scale (Future)

- [ ] Production Deployment (Vercel/Expo EAS).
- [ ] Marketing Landing Page.
- [ ] Legal (Terms of Service, Privacy Policy).
- [ ] Cloudflare Stream custom domain setup.
- [ ] CDN optimization for global delivery.
