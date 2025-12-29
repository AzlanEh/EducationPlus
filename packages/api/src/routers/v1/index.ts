// V1 API Router Index
// This file exports all V1 API endpoints for easy importing

export { authRouter } from "./auth";
export { courseRouter } from "./course";
export { progressRouter } from "./progress";
export { userRouter } from "./user";
export { adminRouter } from "./admin";

// Re-export the combined V1 router for convenience
import { os } from "@orpc/server";
import { authRouter } from "./auth";
import { courseRouter } from "./course";
import { progressRouter } from "./progress";
import { userRouter } from "./user";
import { adminRouter } from "./admin";

export const v1Router = os.router({
	auth: authRouter,
	course: courseRouter,
	user: userRouter,
	progress: progressRouter,
	admin: adminRouter,
});
