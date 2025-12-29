# Backend Missing Features and Improvements

Based on the codebase investigation, here is a detailed breakdown of what is missing in the backend and how it should be improved to meet the PRD requirements and industry standards.

### 🚨 Critical Missing Features (Gap Analysis)

1.  **Student-Facing API Layer:**
    - **Current State:** The API is 90% admin-focused (CRUD operations).
    - **Missing:** Endpoints for students to:
      - **Fetch Course Curriculum:** Get the hierarchical view of a course (Modules -> Videos/Notes).
      - **Track Progress:** APIs to mark videos as watched, submit DPP answers, and get course completion %.
      - **View Profile:** Endpoints to get/update their own profile (study goals, target exams).
    - **Impact:** The mobile app currently has no way to function for a student user.

2.  **Module System (Course Structure):**
    - **Current State:** The `Module` model is referenced in `Video`/`Note` schemas (`moduleId`) but **does not exist** as a model itself.
    - **Missing:** A dedicated `Module` schema (Title, Order, Parent Course ID) and corresponding CRUD endpoints.
    - **Impact:** Courses are currently just flat lists of videos/notes. You cannot organize content into "Chapters" or "Weeks" as per the PRD.

3.  **Gamification & Progress Engine:**
    - **Current State:** `progress.model.ts` exists but is **unused**.
    - **Missing:**
      - Logic to calculate and update "Study Streaks" on daily activity.
      - Logic to aggregate "Course Completion %" based on watched videos/completed DPPs.
      - Leaderboard aggregation queries.

### 🛠 Architectural Improvements

1.  **Refactor Monolithic Router (`routers/index.ts`):**
    - **Problem:** All 20+ endpoints are in one file. This is unmaintainable.
    - **Solution:** Split into dedicated router files:
      - `routers/auth.ts`
      - `routers/course.ts` (Admin & Student)
      - `routers/user.ts`
      - `routers/progress.ts`
    - Then merge them in `index.ts`.

2.  **Database Indexing (Performance):**
    - **Problem:** Foreign keys like `courseId`, `moduleId`, and `userId` are not indexed in `Video`, `Note`, `Progress`, etc.
    - **Impact:** As data grows, fetching "All videos for Course X" will become extremely slow (collection scan).
    - **Solution:** Add compound indexes (e.g., `{ courseId: 1, order: 1 }`) to schemas.

3.  **Service Layer Pattern:**
    - **Problem:** Database logic (`Model.find(...)`) is written directly inside the router handlers.
    - **Solution:** Extract logic into "Services" (e.g., `CourseService.create(...)`). This makes code reusable (e.g., calling `createProgress` from multiple places) and testable.

### 🔒 Security & Quality

1.  **Rate Limiting:**
    - **Missing:** No protection against brute-force attacks on `verifyOTP` or spamming `createVideo`.
    - **Solution:** Implement a rate-limiting middleware (using Redis or in-memory for MVP) on critical public endpoints.

2.  **Input Validation:**
    - **Improvement:** Current Zod schemas are decent but basic. Add stricter validation for:
      - `youtubeVideoId`: Regex to ensure it's a valid ID format.
      - `fileUrl`: URL format validation.

### Recommendation for Next Steps

Prioritize the **Module System** and **Student API Endpoints** first, as these block the mobile app development.
I will create the `Module` model and refactor the `Course` router to support it.
