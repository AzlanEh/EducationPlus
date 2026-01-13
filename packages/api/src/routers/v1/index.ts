// V1 API Router Index
// This file exports all V1 API endpoints for easy importing

import { adminRouter } from "./admin";
import { authRouter } from "./auth";
import { courseRouter } from "./course";
import { progressRouter } from "./progress";
import { studentRouter } from "./student";
import { userRouter } from "./user";

// Re-export individual routers for client-side type composition
export { adminRouter } from "./admin";
export { authRouter } from "./auth";
export { courseRouter } from "./course";
export { progressRouter } from "./progress";
export { studentRouter } from "./student";
export { userRouter } from "./user";

// Combined V1 router (plain object - oRPC supports this)
export const v1Router = {
	auth: authRouter,
	course: courseRouter,
	user: userRouter,
	progress: progressRouter,
	admin: adminRouter,
	student: studentRouter,
};
