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
- [ ] **Mobile Auth UI**:
  - [ ] Login Screen.
  - [ ] Sign Up Screen.
  - [ ] OTP Verification Screen.

### 🖥 Web Admin Panel (`apps/web`)

- [x] **Layout**: Sidebar, Header, Responsive Sheet.
- [x] **Dashboard**: Stats overview (mock data needs real API integration).
- [x] **Course Management**:
  - [x] List View (Datatable/Cards).
  - [ ] Create Course Form (WIP - Route exists).
  - [ ] Edit Course Form (WIP - Route exists).
- [ ] **Content Management (Within Course)**:
  - [ ] Module/Chapter management.
  - [ ] Video Upload/Link interface.
  - [ ] DPP Creator (Question form, Options, Correct Answer).
  - [ ] Note Upload interface (PDF).
- [ ] **User Management**: Admin view of students.

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
