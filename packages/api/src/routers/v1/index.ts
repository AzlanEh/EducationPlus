// V1 API Router Index
// This file exports all V1 API endpoints for easy importing

export { authRouter } from "./auth";
export { courseRouter } from "./course";
export { progressRouter } from "./progress";
export { userRouter } from "./user";

// Re-export the combined V1 router for convenience
import { authRouter } from "./auth";
import { courseRouter } from "./course";
import { progressRouter } from "./progress";
import { userRouter } from "./user";

export const v1Router = {
	...authRouter,
	...courseRouter,
	...userRouter,
	...progressRouter,
};
