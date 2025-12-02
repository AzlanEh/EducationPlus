import type { RouterClient } from "@orpc/server";
import { authRouter } from "./auth";
import { courseRouter } from "./course";
import { progressRouter } from "./progress";
import { userRouter } from "./user";

export const appRouter = {
	...authRouter,
	...courseRouter,
	...userRouter,
	...progressRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
