# TODO

## Date - 18/11/25

- [x] Fix TS errors in web app (missing 'search' props in router calls)
- [x] Configure .env files with database, auth, and SMTP settings
- [x] Implement User/OTP database models and auth API routes
- [x] Complete auth UI components for Native
- [x] Complete auth UI components for Web
- [ ] Add linting, testing, and error handling
- [ ] Implement role-based guards and CI/CD

## Date - 19/11/25

- [x] Add database models for core educational content (Course, Test, Note, DPP, Video)
- [x] Add Student Progress database models
- [x] Add linting setup (Biome or similar)
- [x] Add Github workflows and CI/CD
- [ ] Implement role-based guards for API routes (admin vs student access)
- [ ] Add API routes for course management (admin CRUD operations)
- [ ] Add basic testing framework and error handling

## Date - 20/11/25

- [x] Solve CORS error in web
- Error
  ```
  Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://education-plus-server.vercel.app//rpc/healthCheck. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing). Status code: 308.
        
  Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://education-plus-server.vercel.app//rpc/healthCheck. (Reason: CORS request did not succeed). Status code: (null).

  Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://education-plus-server.vercel.app/api/auth/get-session. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing). Status code: 404.

- [ ] Implement role-based guards for API routes (admin vs student access)
- [ ] Add API routes for course management (admin CRUD operations)
- [ ] Implement student dashboard UI with course progress tracking
- [ ] Add video player component for course content
- [ ] Add note viewer component for downloadable study materials
- [ ] Set up basic testing framework (Vitest for web/native, Jest for server)
- [ ] Add comprehensive error handling and logging
- [ ] Implement test taking functionality with timer and scoring
  
## Date - 21/11/25
