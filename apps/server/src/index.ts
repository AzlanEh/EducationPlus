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
		const startTime = Date.now();
		console.log(`[Auth] Handling ${c.req.method} ${c.req.path}`);
		console.log("[Auth] URL:", c.req.url);
		console.log(
			"[Auth] Headers:",
			Object.fromEntries(c.req.raw.headers.entries()),
		);

		// Clone the request to avoid body consumption issues
		const clonedRequest = c.req.raw.clone();

		// Try to read body for debugging (POST only)
		if (c.req.method === "POST") {
			try {
				const bodyText = await c.req.raw.text();
				console.log("[Auth] Body:", bodyText);
				// Create a new request with the body since we consumed it
				const newRequest = new Request(c.req.url, {
					method: c.req.method,
					headers: c.req.raw.headers,
					body: bodyText,
				});
				console.log("[Auth] Calling auth.handler...");
				const response = await auth.handler(newRequest);
				console.log(
					`[Auth] Completed ${c.req.method} ${c.req.path} in ${Date.now() - startTime}ms`,
				);
				return response;
			} catch (bodyError) {
				console.error("[Auth] Body read error:", bodyError);
			}
		}

		console.log("[Auth] Calling auth.handler with cloned request...");
		const response = await auth.handler(clonedRequest);

		console.log(
			`[Auth] Completed ${c.req.method} ${c.req.path} in ${Date.now() - startTime}ms`,
		);

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
