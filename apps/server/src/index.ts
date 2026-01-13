import "dotenv/config";

console.log("[Server] Initializing application...");

import { auth } from "@eduPlus/auth";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { setupMiddleware } from "./middleware";
import { setupRoutes } from "./routes";
import { setupApiRoutes } from "./routes/api";

const app = new Hono();

// =============================================================================
// Middleware Setup
// =============================================================================

setupMiddleware(app);

// =============================================================================
// Better Auth Handler
// =============================================================================

// Mount Better Auth handler on /api/auth/*
// This handles all authentication routes:
// - POST /api/auth/sign-up/email
// - POST /api/auth/sign-in/email
// - POST /api/auth/sign-out
// - GET /api/auth/session (alias: get-session)
// - POST /api/auth/forget-password
// - POST /api/auth/reset-password
// - GET/POST /api/auth/callback/:provider (OAuth callbacks)
// - etc.

app.on(["GET", "POST"], "/api/auth/**", async (c) => {
	try {
		const response = await auth.handler(c.req.raw);

		// Debug: Log Set-Cookie headers in development
		if (process.env.NODE_ENV !== "production") {
			const setCookies = response.headers.getSetCookie?.() || [];
			if (setCookies.length > 0) {
				console.log("[Auth] Set-Cookie headers:", setCookies);
			}
		}

		return response;
	} catch (error) {
		console.error("[Auth] Handler error:", error);
		return c.json(
			{
				error: "Authentication error",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

// =============================================================================
// API Routes (oRPC)
// =============================================================================

setupApiRoutes(app);

// =============================================================================
// Static Routes
// =============================================================================

setupRoutes(app);

// =============================================================================
// Server Startup
// =============================================================================

const port = Number(process.env.PORT) || 3000;

export { app };
export default app;

// Start server in development mode
if (process.env.NODE_ENV !== "production") {
	serve(
		{
			fetch: app.fetch,
			port,
		},
		(info) => {
			console.log(`[Server] Running on http://localhost:${info.port}`);
			console.log(
				`[Server] Auth routes: http://localhost:${info.port}/api/auth/*`,
			);
		},
	);
}
