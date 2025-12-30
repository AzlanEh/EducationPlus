import "dotenv/config";
console.log("Initializing server application...");
import { auth } from "@eduPlus/auth";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { setupMiddleware } from "./middleware";
import { setupRoutes } from "./routes";
import { setupApiRoutes } from "./routes/api";

const app = new Hono();

setupMiddleware(app);

// Handle OPTIONS for all auth routes to ensure successful preflight
app.options("/api/auth/*", (c) => {
	const origin = c.req.header("Origin");
	const allowedOrigins = process.env.CORS_ORIGIN
		? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
		: [
				"http://localhost:3000",
				"http://localhost:3001",
				"https://education-plus-web.vercel.app",
				"https://education-plus-server.vercel.app",
			];

	if (origin && allowedOrigins.includes(origin)) {
		c.header("Access-Control-Allow-Origin", origin);
		c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
		c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
		c.header("Access-Control-Allow-Credentials", "true");
	}
	return c.body(null, 204);
});

// Custom session endpoint for client getSession - must be before the general auth handler
app.get("/api/auth/get-session", async (c) => {
	try {
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		return c.json(session);
	} catch (error) {
		console.error("Get session error:", error);
		return c.json({ error: "Session error" }, 500);
	}
});

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
	try {
		return await auth.handler(c.req.raw);
	} catch (error) {
		console.error("Auth handler error:", error);
		return c.json({ error: "Auth error" }, 500);
	}
});

setupApiRoutes(app);

setupRoutes(app);

const port = Number(process.env.PORT) || 3000;

export { app };

export default app;

if (process.env.NODE_ENV !== "production") {
	serve(
		{
			fetch: app.fetch,
			port: port,
		},
		(info) => {
			console.log(`Server is running on http://localhost:${info.port}`);
		},
	);
}
