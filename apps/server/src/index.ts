import "dotenv/config";
import { auth } from "@eduPlus/auth";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { setupMiddleware } from "./middleware";
import { setupRoutes } from "./routes";
import { setupApiRoutes } from "./routes/api";

const app = new Hono();

setupMiddleware(app);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

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
