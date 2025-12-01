import "dotenv/config";
import { createContext } from "@eduPlus/api/context";
import { appRouter } from "@eduPlus/api/routers/index";
import { auth } from "@eduPlus/auth";
import { Course } from "@eduPlus/db";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import pino from "pino";
import { Counter, collectDefaultMetrics, Registry } from "prom-client";
import { z } from "zod";

const app = new Hono();
const log = pino({ level: process.env.LOG_LEVEL || "info" });
const registry = new Registry();
collectDefaultMetrics({ register: registry });
const requestCounter = new Counter({
	name: "http_requests_total",
	help: "Total HTTP requests",
	labelNames: ["method", "route", "status"],
	registers: [registry],
});

function rateLimit(): MiddlewareHandler {
	const store = new Map<string, number[]>();
	const limit = Number(process.env.RATE_LIMIT_MAX || 100);
	const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
	return async (c, next) => {
		const ip =
			c.req.header("x-forwarded-for") ||
			c.req.header("cf-connecting-ip") ||
			c.req.header("x-real-ip") ||
			"unknown";
		const now = Date.now();
		const list = store.get(ip) || [];
		const filtered = list.filter((t) => now - t < windowMs);
		filtered.push(now);
		store.set(ip, filtered);
		if (filtered.length > limit) {
			return c.json({ message: "Too Many Requests" }, 429);
		}
		await next();
	};
}

app.use(logger());
app.use(secureHeaders());
app.use(rateLimit());
app.use(async (c, next) => {
	if (process.env.NODE_ENV === "production") {
		const proto = c.req.header("x-forwarded-proto");
		if (proto && proto !== "https") {
			const url = new URL(c.req.url);
			url.protocol = "https:";
			return c.redirect(url.toString(), 301);
		}
	}
	const start = Date.now();
	await next();
	const duration = Date.now() - start;
	requestCounter.labels(c.req.method, c.req.path, String(c.res.status)).inc();
	log.info(
		{ method: c.req.method, path: c.req.path, status: c.res.status, duration },
		"request",
	);
});
app.use(
	"/*",
	cors({
		origin: (origin) => {
			if (!origin) return "*";
			if (origin.startsWith("http://localhost:")) return origin;
			if (origin.endsWith(".vercel.app")) return origin;
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

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

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

app.get("/metrics", async (c) => {
	c.header("Content-Type", registry.contentType);
	return c.text(await registry.metrics());
});

app.get("/docs", swaggerUI({ url: "/api-reference/openapi.json" }));

const courseQuerySchema = z.object({
	subject: z.string().optional(),
	target: z.string().optional(),
	level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
	limit: z.coerce.number().min(1).max(100).default(50),
});

app.get("/api/v1/courses", async (c) => {
	const parsed = courseQuerySchema.safeParse(
		Object.fromEntries(new URL(c.req.url).searchParams),
	);
	if (!parsed.success) return c.json({ message: "invalid_query" }, 400);
	const { subject, target, level, limit } = parsed.data;
	const filter: Record<string, unknown> = { isPublished: true };
	if (subject) filter.subject = subject;
	if (target) filter.target = target;
	if (level) filter.level = level;
	const items = await Course.find(filter).limit(limit).lean();
	return c.json({ items });
});

app.get("/api/v1/courses/:id", async (c) => {
	const id = c.req.param("id");
	const item = await Course.findById(id).lean();
	if (!item) return c.json({ message: "not_found" }, 404);
	return c.json({ item });
});

import { serve } from "@hono/node-server";

const port = Number(process.env.PORT) || 3000;

export { app };
serve(
	{
		fetch: app.fetch,
		port: port,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
