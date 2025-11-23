import "dotenv/config";
import { createContext } from "@eduPlus/api/context";
import { appRouter } from "@eduPlus/api/routers/index";
import { auth } from "@eduPlus/auth";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
const allowedOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",")
	: [];
console.log("Allowed Origins for CORS:", allowedOrigins);

app.use(
	"/*",
	cors({
		origin: (origin) => {
			if (!origin) return "*";
			if (allowedOrigins.length > 0) {
				for (const allowed of allowedOrigins) {
					if (allowed.includes("*")) {
						const regex = new RegExp(allowed.replace(/\*/g, ".*"));
						if (regex.test(origin)) return origin;
					} else if (origin === allowed) return origin;
				}
			}
			if (origin.startsWith("http://localhost:")) return origin;
			if (origin.endsWith(".vercel.app")) return origin;
			if (origin.includes("vercel.live")) return origin;
			if (origin.startsWith("exp://")) return origin;
			if (origin.startsWith("eduPlus://")) return origin;
			return null;
		},
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: [
			"Content-Type",
			"Authorization",
			"Access-Control-Allow-Origin",
		],
		credentials: true,
	}),
);

app.on(["POST", "GET", "OPTIONS"], "/api/auth/*", (c) =>
	auth.handler(c.req.raw),
);

export const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

export const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

app.use("/*", async (c, next) => {
	const context = await createContext({ context: c });

	const rpcResult = await rpcHandler.handle(c.req.raw, {
		prefix: "/rpc",
		context: context,
	});

	if (rpcResult.matched) {
		return c.newResponse(rpcResult.response.body, rpcResult.response);
	}

	const apiResult = await apiHandler.handle(c.req.raw, {
		prefix: "/api-reference",
		context: context,
	});

	if (apiResult.matched) {
		return c.newResponse(apiResult.response.body, apiResult.response);
	}

	await next();
});

app.get("/", (c) => {
	return c.text("OK");
});

app.get("/health", (c) => {
	return c.json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

import { serve } from "@hono/node-server";

const port = Number(process.env.PORT) || 3000;

// For Vercel deployment, export the app
export default app;

// For local development
if (import.meta.main) {
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
