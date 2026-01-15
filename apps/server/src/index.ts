import "dotenv/config";

console.log("[Server] Initializing application...");

import { auth } from "@eduPlus/auth";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { setupMiddleware } from "./middleware";
import { setupRoutes } from "./routes";
import { setupApiRoutes } from "./routes/api";
import { bunnyWebhookRouter } from "./routes/webhooks/bunny";

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

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
	console.log(`[Auth] Handling ${c.req.method} ${c.req.path}`);

	// Get the raw request
	let request = c.req.raw;

	// Check if this is a mobile app request (no origin but has expo-origin)
	const origin = request.headers.get("origin");
	const expoOrigin = request.headers.get("expo-origin");

	console.log("[Auth] Request headers:", { origin, expoOrigin });

	// If no origin but expo-origin exists, create a new request with the origin header set
	// This is necessary because Better Auth's expo plugin onRequest hook doesn't seem to
	// properly propagate the modified request to the middleware
	if (!origin && expoOrigin) {
		console.log("[Auth] Setting origin from expo-origin:", expoOrigin);

		// Create new headers with the origin set
		const newHeaders = new Headers(request.headers);
		newHeaders.set("origin", expoOrigin);

		// Create a new request with the modified headers
		request = new Request(request.url, {
			method: request.method,
			headers: newHeaders,
			body: request.body,
			duplex: "half",
		} as RequestInit);
	}

	return auth.handler(request);
});

// =============================================================================
// Webhook Routes
// =============================================================================

app.route("/webhooks/bunny", bunnyWebhookRouter);

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
