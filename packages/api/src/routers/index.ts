import { os } from "@orpc/server";
import type { RouterClient } from "@orpc/server";
import { v1Router } from "./v1";

// Main application router with versioning
export const appRouter = os.router({
	// Version 1 API endpoints
	v1: v1Router,
});
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
