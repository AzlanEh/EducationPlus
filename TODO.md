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
- [x] **Learning Interface**:
  - [x] Video Player (supports both YouTube and Bunny Stream).
  - [x] PDF/Note Viewer.
  - [x] DPP Attempt Interface (Quiz UI).
- [x] **Profile**:
  - [x] User stats.
  - [x] Settings.

---

## 🎬 Video Streaming Implementation (Bunny Stream)

### Phase 1: Infrastructure Setup

#### 1.1 Bunny Stream Account & API Setup
- [ ] Create Bunny.net account and start 14-day free trial.
- [ ] Create a Video Library in Bunny Stream dashboard.
- [ ] Generate API key from Account Settings → API.
- [x] Add environment variables to `apps/server/.env.example`:
  - [x] `BUNNY_API_KEY` - Main API key
  - [x] `BUNNY_LIBRARY_ID` - Video Library ID
  - [x] `BUNNY_CDN_HOSTNAME` - Your CDN hostname (e.g., `vz-xxxxx.b-cdn.net`)
  - [x] `BUNNY_WEBHOOK_SECRET` - For webhook signature verification (optional)

#### 1.2 Database Schema Updates
- [x] Update `packages/db/src/models/education.model.ts`:
  - [x] Added Bunny Stream video fields:
    ```typescript
    bunnyVideoId: string      // Bunny Stream video GUID
    videoUrl: string          // Bunny HLS playback URL
    thumbnailUrl: string      // Auto-generated thumbnail
    duration: number          // Video duration in seconds
    status: 'pending' | 'uploading' | 'processing' | 'ready' | 'error'
    isLive: boolean           // Flag for live streams
    liveStreamId: string      // Bunny live stream ID (for live)
    metadata: { width, height, framerate, fileSize, availableResolutions }
    ```
  - [x] Kept `youtubeVideoId` for migration compatibility.
- [ ] Run `pnpm run db:push` from server workspace to apply changes.

#### 1.3 Server-Side Bunny Stream Integration
- [x] Create `packages/api/src/lib/bunny.ts`:
  - [x] Bunny API client with fetch (REST API).
  - [x] Helper functions:
    - [x] `createVideo(title: string)` - Create video placeholder, get upload URL.
    - [x] `getTusUploadUrl(videoId: string)` - Get TUS resumable upload URL with signature.
    - [x] `getVideoStatus(videoId: string)` - Check encoding status.
    - [x] `getPlaybackUrl(videoId: string)` - Get HLS URL.
    - [x] `getThumbnailUrl(videoId: string)` - Get thumbnail URL.
    - [x] `getEmbedUrl(videoId: string)` - Get Bunny player embed URL.
    - [x] `deleteVideo(videoId: string)` - Remove video from library.
    - [x] `updateVideo(videoId, data)` - Update video metadata.
    - [x] `listVideos(options)` - List videos in library.
    - [x] `createLiveStream(title: string)` - Create RTMP endpoint for live.
    - [x] `getLiveStreamStatus(streamId: string)` - Check if live.
    - [x] `deleteLiveStream(streamId: string)` - Remove live stream.
    - [x] `verifyWebhookSignature(payload, signature)` - Verify webhook authenticity.
    - [x] `parseWebhookPayload(payload)` - Parse Bunny webhook data.

### Phase 2: Video Upload & Processing Pipeline

#### 2.1 Video Upload API Endpoints
- [x] Create `packages/api/src/routers/v1/video.ts` (oRPC router):
  - [x] `video.create` - Create video in Bunny, return TUS upload URL.
  - [x] `video.get` - Get video details with playback URL.
  - [x] `video.getStatus` - Check encoding status.
  - [x] `video.markUploading` - Mark upload started.
  - [x] `video.syncFromBunny` - Pull metadata after encoding.
  - [x] `video.update` - Update video details.
  - [x] `video.delete` - Delete video from DB and Bunny.
  - [x] `video.listByCourse` - List videos for a course.
- [x] Add authentication middleware (admin-only for upload/delete).
- [ ] Implement rate limiting for upload endpoints.

#### 2.2 Webhook for Processing Status
- [x] Create `apps/server/src/routes/webhooks/bunny.ts`:
  - [x] `POST /webhooks/bunny` - Handle encoding complete notification.
  - [x] Update video status in DB when encoding completes.
  - [x] Extract and store metadata (duration, thumbnail URL, resolutions).
  - [ ] Send push notification to admin on completion (optional).
- [ ] Configure webhook URL in Bunny Stream Video Library settings.
- [x] Add webhook signature verification for security.

#### 2.3 Video Processing Pipeline Flow
```
Admin Upload (Web) → TUS Upload to Bunny → DB Record (status: uploading)
                                ↓
                    Bunny Auto-Transcoding (HLS, multi-resolution)
                                ↓
                    Webhook: video-encoded → DB Update (status: ready)
                                ↓
                    Video available in Native App
```

### Phase 3: Web Admin Video Management

#### 3.1 Video Upload UI
- [x] Update `apps/web/src/routes/admin/courses/$courseId.tsx`:
  - [x] Replace YouTube ID input with file upload component.
  - [x] Implement TUS resumable upload with progress bar.
  - [x] Show upload status (uploading → encoding → ready).
  - [x] Display video thumbnail preview after encoding.
  - [x] Add video metadata form (title, description, order).
- [x] Install TUS client: `pnpm add tus-js-client -F @eduPlus/web`.
- [x] Create `apps/web/src/components/video-upload.tsx`:
  - [x] Drag-and-drop file upload zone.
  - [x] File validation (max size, allowed formats: MP4, MOV, MKV, WebM).
  - [x] Progress indicator with cancel option.
  - [x] Error handling with retry option.

#### 3.2 Video Management Dashboard
- [x] Create `apps/web/src/routes/admin/videos/index.tsx`:
  - [x] List all videos with status indicators.
  - [x] Filter by status (uploading, encoding, ready, error).
  - [x] Bulk delete functionality.
  - [x] Video preview using Bunny embedded player.
- [ ] Add video analytics display (views, watch time - from Bunny API).

### Phase 4: Native App Video Player

#### 4.1 Choose Player Implementation
- [x] **Option A: Bunny Embedded Player** (Recommended for simplicity):
  - [x] Use WebView to embed Bunny's customizable player.
  - [x] Customize colors/controls via Bunny dashboard or URL params.
  - [x] Simpler implementation, less native control.
- [ ] **Option B: Custom Player with react-native-video**:
  - [ ] Install: `pnpm add react-native-video -F @eduPlus/native`.
  - [ ] Use Bunny HLS URLs directly.
  - [ ] Full control over UI/UX.
  - [ ] More development effort.

#### 4.2 Video Player Component Updates
- [x] Updated `apps/native/components/video-player.tsx`:
  - [x] Support both YouTube (legacy) and Bunny embedded player sources.
  - [x] Props: `videoId` (YouTube), `playbackUrl`, `embedUrl`, `thumbnailUrl` (Bunny).
  - [x] Minimal overlay controls for Bunny player (back, fullscreen).
  - [x] Full custom controls for YouTube player.
  - [x] Support `initialTime` for resume playback.
  - [x] Support `onProgress` callback for progress tracking.

#### 4.3 Student API Updates
- [x] Updated `packages/api/src/routers/v1/student.ts`:
  - [x] `getVideo` - Returns Bunny playback URLs when video is ready.
  - [x] `getCourseVideos` - Returns Bunny URLs for each video.
  - [x] `getContinueWatching` - Returns Bunny URLs for recently watched videos.
  - [x] Backwards compatible with YouTube videos.

#### 4.4 Lesson Screen Updates
- [x] Updated `apps/native/app/lesson/[lessonId].tsx`:
  - [x] Updated Video type with Bunny fields.
  - [x] Pass Bunny URLs to VideoPlayer when available.
  - [x] Fallback to YouTube player for legacy videos.
  - [x] Support resume playback from last position.

#### 4.5 Video Progress Tracking (Existing)
- [x] Video player component tracks watch time.
- [x] Save progress to server via oRPC (`updateVideoProgress`).
- [x] Resume playback from last position.
- [x] Mark video as complete when >90% watched (manual button).
- [x] `packages/api/src/routers/v1/student.ts`:
  - [x] `updateVideoProgress` - Save video progress (userId, videoId, watchedSeconds, completed).
  - [x] Progress returned with `getVideo` endpoint.

#### 4.6 Offline Video Support (Future Enhancement)
- [ ] Implement video download functionality (if Bunny allows).
- [ ] Cache downloaded videos using `react-native-fs`.
- [ ] Show download progress in UI.
- [ ] Manage storage (delete old downloads).
- [ ] Play offline videos from local storage.

### Phase 5: Live Streaming

#### 5.1 Live Stream API Endpoints
- [x] Add to `packages/api/src/routers/v1/live.ts`:
  - [x] `POST /live/create` - Create Bunny live stream (get RTMP URL/key).
  - [x] `POST /live/:id/start` - Mark live stream as started in DB.
  - [x] `POST /live/:id/stop` - End live stream, save recording.
  - [x] `GET /live/active` - List active live streams.
  - [x] `GET /live/:id/playback` - Get live HLS playback URL.
- [x] Add LiveStream model to `packages/db/src/models/education.model.ts`

#### 5.2 Admin Live Streaming UI
- [x] Create `apps/web/src/routes/admin/live/index.tsx`:
  - [x] "Start Live Stream" button.
  - [x] Display RTMP URL and stream key for OBS.
  - [x] Live preview player (Bunny embedded).
  - [ ] Viewer count display (if available).
  - [x] "End Stream" button with confirmation.
- [x] Create `apps/web/src/routes/admin/live/$streamId.tsx`:
  - [x] Live stream details and controls.
  - [ ] Chat moderation (future).
- [x] Add Live Streams link to admin sidebar

#### 5.3 Native App Live Stream Playback
- [x] VideoPlayer component already supports `isLive` flag:
  - [x] Detect live stream via `isLive` flag.
  - [x] Show "LIVE" badge on player.
  - [x] Disable seek bar for live content.
  - [x] Auto-refresh playback URL if stream restarts.
  - [x] Show "Stream ended" message when live ends.
- [x] Add live stream section to home screen:
  - [x] "Live Now" banner for active streams.
  - [ ] Push notification when live stream starts (future).
- [x] Create `apps/native/app/live/[streamId].tsx` - Live stream player screen
- [x] Update `apps/native/app/live-classes.tsx` to use real API data

#### 5.4 Live Stream Recording
- [x] Recording fields already in LiveStream model (`recordingVideoId`, `hasRecording`)
- [x] Webhook handler updated to auto-link recordings (`apps/server/src/routes/webhooks/bunny.ts`)
- [x] Live router endpoints for recording management:
  - [x] `getRecording` - Get recording info for a stream
  - [x] `linkRecording` - Manually link a recording video
  - [x] `createRecordingVideo` - Create video from Bunny recording ID
- [x] Recording section in admin live stream detail page
- [ ] Enable auto-recording in Bunny live stream settings (Bunny Dashboard configuration)
- [ ] Show recorded live streams in course content (future enhancement)

### Phase 6: Testing & Quality Assurance

#### 6.1 Unit Tests
- [x] Add tests in `apps/server/tests/`:
  - [x] `videos.test.ts` - Video CRUD operations (19 tests).
  - [x] `bunny.test.ts` - Bunny API integration (27 tests).
  - [x] `webhooks.test.ts` - Webhook handling (16 tests).
  - [x] `live.test.ts` - Live streaming tests (26 tests).
  - [x] `health.test.ts` - Health check endpoint (1 test).
  - **Total: 89 tests passing**
- [ ] Add tests in `apps/web/`:
  - [ ] Video upload component tests.
  - [ ] Video management UI tests.

#### 6.2 Integration Tests
- [ ] Test complete upload flow (web → server → Bunny → webhook → DB).
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
  - [ ] Flag videos for manual re-upload to Bunny.
  - [ ] Update DB records with new Bunny URLs after upload.
- [ ] Update seed data (`scripts/seed.ts`) with Bunny video URLs.

#### 7.2 Environment Configuration
- [ ] Add Bunny credentials to production environment.
- [ ] Configure webhook URLs for production domain.
- [ ] Set up Bunny Stream custom domain/hostname (optional).
- [ ] Enable token authentication for secure URLs (optional).

#### 7.3 Deployment Checklist
- [ ] Run `pnpm run lint` - Fix any linting errors.
- [ ] Run `pnpm run check-types` - Fix TypeScript errors.
- [ ] Run `pnpm run test` - All tests passing.
- [ ] Run `pnpm run build` - Build all apps.
- [ ] Deploy server with new video endpoints.
- [ ] Deploy web admin with upload UI.
- [ ] Deploy native app with video player.

---

## 🔴 Pre-Production Fixes: Auth Production Readiness

### ✅ **Google OAuth Production Fix**: Implemented hybrid OAuth solution
- **Web**: Server-side OAuth using `WEB_GOOGLE_CLIENT_ID`
- **Mobile**: Client-side Google Sign-In SDK → ID token verification
- **Result**: Google OAuth now works on both platforms in production

### Critical Security & Scalability Issues

- [x] **Implement Persistent OTP Storage**: ~~Replace in-memory Map with Redis/database storage~~ Already using MongoDB with hashed OTPs (packages/db/src/models/auth.model.ts).
- [x] **Enable Email Verification**: Set `requireEmailVerification: isProduction` in auth config. Now enabled in production only (packages/auth/src/index.ts:339).
- [x] **Remove Debug Logging**: OTP logging now requires `DEBUG_OTP=true` in development. All auth debug logging now controlled by `AUTH_DEBUG=true` env var.

### Environment & Configuration

- [ ] **Add Missing Environment Variables**: Update .env.example with BETTER_AUTH_SECRET, EMAIL_FROM, RESEND_API_KEY. Ensure DATABASE_URL is production-ready.
- [ ] **Secure Session Management**: Implement Redis for session storage to handle distributed environments and high load.
- [x] **Auth Debug Control**: Added `AUTH_DEBUG` env var to control verbose auth logging (default: off in production).

### Testing & Quality Assurance

- [ ] **Add Auth Unit Tests**: Create tests for auth functions, OTP verification, and error handling in packages/auth/ and packages/api/.
- [ ] **Add Integration Tests**: Test complete auth flows (signup/login/OTP) across web/native apps. Add to apps/server/tests/.
- [ ] **Security Testing**: Implement OWASP top 10 checks and vulnerability scanning for auth endpoints.

### Security Hardening

- [ ] **Input Validation**: Add comprehensive validation for all auth inputs (email format, password strength, OTP format).
- [ ] **Error Handling**: Implement secure error responses without information leakage (avoid exposing stack traces or user data).
- [x] **Rate Limiting**: Implemented granular rate limiting for auth endpoints:
  - OTP requests: 5/minute
  - Login attempts: 10/minute  
  - General auth: 20/minute
  - Uploads: 30/minute
  - Default API: 1000/minute
  - Added X-RateLimit-* headers and Retry-After for 429 responses
- [x] **HTTPS Enforcement**: Ensure all auth routes use HTTPS in production.

### Monitoring & Observability

- [ ] **Auth Metrics**: Add Prometheus metrics for login attempts, failures, OTP usage (integrate with existing prometheus.ts).
- [x] **Secure Logging**: Debug logging disabled by default in production. Use `AUTH_DEBUG=true` to enable.
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
- [ ] Bunny Stream custom domain setup.
- [ ] CDN optimization for global delivery.
