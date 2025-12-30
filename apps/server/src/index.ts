import "dotenv/config";
import { auth } from "@eduPlus/auth";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { setupMiddleware } from "./middleware";
import { setupRoutes } from "./routes";
import { setupApiRoutes } from "./routes/api";

const app = new Hono();

setupMiddleware(app);

// Custom session endpoint for client getSession - must be before the general auth handler
app.all("/api/auth/get-session", async (c) => {
	try {
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		return c.json(session);
	} catch (error) {
		console.error("Get session error:", error);
		return c.json({ error: "Session error" }, 500);
	}
});

app.on(["POST", "GET", "OPTIONS"], "/api/auth/*", async (c) => {
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
