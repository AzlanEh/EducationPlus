import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import pino from "pino";
import { requestCounter } from "./utils/prometheus";

const log = pino({ level: process.env.LOG_LEVEL || "info" });

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

export function setupMiddleware(app: Hono) {
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
			{
				method: c.req.method,
				path: c.req.path,
				status: c.res.status,
				duration,
			},
			"request",
		);
	});
	// CORS for auth routes
	app.use(
		"/api/auth/*",
		cors({
			origin: (origin: string) => {
				// Allow requests from configured origins or localhost for development
				const allowedOrigins = process.env.CORS_ORIGIN
					? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
					: [
							"http://localhost:3000",
							"http://localhost:3001",
							"https://education-plus-web.vercel.app",
							"https://education-plus-server.vercel.app",
						];

				return allowedOrigins.some((allowed) => {
					if (allowed.includes("*")) {
						// Handle wildcards
						const pattern = allowed.replace(/\*/g, ".*");
						return new RegExp(`^${pattern}$`).test(origin);
					}
					return origin === allowed;
				})
					? origin
					: null;
			},
			allowMethods: ["GET", "POST", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	);

	// General CORS for other routes
	app.use(
		"/*",
		cors({
			origin: (origin: string | undefined) => origin || "*",
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	);

	return app;
}
