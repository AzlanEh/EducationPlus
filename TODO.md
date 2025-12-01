# Project Status & Todo

**Current Phase:** Phase 1 (MVP) - Bridging Mock Data to Real Backend

## 1. MVP Objectives (Immediate Priority)

The goal is to move from mock data to a fully dynamic system where content is managed via an Admin Panel and consumed by the Native App.

### Backend (Server & API)

- [x] **Database Schema**: `Course`, `Video`, `Note`, `DPP` models created in `@eduPlus/db`.
- [x] **Server Foundation**: Hono server with Better Auth and oRPC setup.
- [x] **Public API**: Basic `GET /courses` endpoints implemented.
- [x] **Admin API (CRUD)**: Implement oRPC procedures or REST endpoints for:
  - [x] Create/Edit/Delete Courses
  - [x] Add/Edit/Delete Videos (link to YouTube IDs)
  - [x] Add/Edit/Delete Notes & DPPs
- [x] **Seed Script**: Create a script to populate the DB with initial data (migrating from `native/data/courses.ts`).
  - [x] Script created at `scripts/seed.ts`
  - [x] Environment variables configured in `apps/server/.env`
  - [x] Ready to run with `pnpm run seed` (requires MongoDB Atlas access)

### Admin Panel (Web App)

- [ ] **Setup**: Initialize Admin routes/layout in `apps/web`.
- [ ] **Course Manager**: UI to list, create, and edit courses.
- [ ] **Content Editor**: UI to manage modules and add Videos/Notes to courses.
  - [ ] Form to input YouTube Video IDs.
  - [ ] Rich Text Editor for Notes.

### Native App (Student Client)

- [x] **Video Player**: Integrated `react-native-youtube-iframe`.
- [x] **Mock Data**: Updated `courses.ts` with `youtubeId`.
- [ ] **API Integration**: Replace local `data/courses.ts` with API calls to `GET /api/v1/courses`.
- [ ] **Navigation**: Ensure dynamic routing based on fetched Course/Lesson IDs.

---

## 2. Core Features (Next Steps)

Once the content flow (Admin -> DB -> App) is working for Videos, expand to:

### Notes System

- [ ] **Backend**: API to serve Note content (HTML/Markdown).
- [ ] **Native**: Implement a Markdown/HTML renderer view for Lessons.

### DPP (Daily Practice Problems)

- [ ] **Backend**: API to serve Questions and handle submissions.
- [ ] **Native**: Interactive Quiz Interface (Timer, Option Selection, Result View).

### Progress Tracking

- [ ] **Backend**: `UserProgress` model and update endpoints.
- [ ] **Native**: Sync local progress state with server on completion.

---

## 3. Future / Polishing

- [ ] **Offline Support**: Cache text content/questions.
- [ ] **Search**: Global search for courses and topics.
- [ ] **Analytics**: Admin dashboard for user engagement.
