import type { RouterClient } from "@orpc/server";
import { v1Router } from "./v1";

// Main application router with versioning
export const appRouter = {
	// Version 1 API endpoints
	v1: v1Router,

	// For backward compatibility, expose V1 endpoints at root level
	...v1Router,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
