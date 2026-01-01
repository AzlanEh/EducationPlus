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
- [x] **Dashboard**: Stats overview (mock data needs real API integration).
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
- [ ] **Home/Dashboard**:
  - [ ] Featured courses.
  - [ ] Continue watching.
- [ ] **Course Discovery**:
  - [ ] Course list/grid.
  - [ ] Course details screen (Curriculum view).
- [ ] **Learning Interface**:
  - [ ] Video Player (YouTube Embed).
  - [ ] PDF/Note Viewer.
  - [ ] DPP Attempt Interface (Quiz UI).
- [ ] **Profile**:
  - [ ] User stats.
  - [ ] Settings.

---

## 🔴 Pre-Production Fixes: Auth Production Readiness

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
- [ ] **HTTPS Enforcement**: Ensure all auth routes use HTTPS in production (already configured but verify).

### Monitoring & Observability

- [ ] **Auth Metrics**: Add Prometheus metrics for login attempts, failures, OTP usage (integrate with existing prometheus.ts).
- [ ] **Secure Logging**: Implement proper logging without sensitive data exposure.
- [ ] **Health Checks**: Add auth-specific health checks in apps/server/tests/health.test.ts.

### Scalability Improvements

- [ ] **Database Connection Pooling**: Optimize MongoDB connections for high traffic scenarios.
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

- [ ] **Offline Support**: Caching core content/metadata (Video caching depends on YT Terms).
- [ ] **Social Features**: Comments/Discussions on videos.
- [ ] **Advanced Analytics**: Admin reports on engagement.

## 🟣 Phase 4: Launch & Scale (Future)

- [ ] Production Deployment (Vercel/Expo EAS).
- [ ] Marketing Landing Page.
- [ ] Legal (Terms of Service, Privacy Policy).
