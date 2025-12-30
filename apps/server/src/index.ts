import "dotenv/config";
import { auth } from "@eduPlus/auth";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { setupMiddleware } from "./middleware";
import { setupRoutes } from "./routes";
import { setupApiRoutes } from "./routes/api";

const app = new Hono();

setupMiddleware(app);

app.on(["POST", "GET", "OPTIONS"], "/api/auth/*", async (c) => {
	const response = await auth.handler(c.req.raw);
	const origin = c.req.header("origin") || "*";
	response.headers.set("Access-Control-Allow-Origin", origin);
	response.headers.set("Access-Control-Allow-Credentials", "true");
	response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	response.headers.set(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, Access-Control-Allow-Origin",
	);
	return response;
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
