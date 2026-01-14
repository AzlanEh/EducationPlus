import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import pino from "pino";
import { requestCounter } from "./utils/prometheus";

// =============================================================================
// Logger Setup
// =============================================================================

const log = pino({
	level: process.env.LOG_LEVEL || "info",
	transport:
		process.env.NODE_ENV !== "production"
			? { target: "pino-pretty" }
			: undefined,
});

// =============================================================================
// Environment Configuration
// =============================================================================

const isProduction = process.env.NODE_ENV === "production";

// Parse allowed CORS origins from environment
const getAllowedOrigins = (): string[] => {
	const envOrigins = process.env.CORS_ORIGIN
		? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
		: [];

	// Development origins
	const devOrigins = [
		"http://localhost:3000",
		"http://localhost:3001",
		"http://localhost:3002",
		"http://localhost:5173",
		"http://127.0.0.1:3000",
		"http://127.0.0.1:3001",
		"http://127.0.0.1:5173",
	];

	return [...envOrigins, ...(isProduction ? [] : devOrigins)];
};

// =============================================================================
// Rate Limiting Middleware
// =============================================================================

function rateLimit(): MiddlewareHandler {
	const store = new Map<string, number[]>();
	const limit = Number(process.env.RATE_LIMIT_MAX || 1000);
	const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000);

	// Cleanup old entries periodically
	setInterval(() => {
		const now = Date.now();
		for (const [ip, timestamps] of store.entries()) {
			const filtered = timestamps.filter((t) => now - t < windowMs);
			if (filtered.length === 0) {
				store.delete(ip);
			} else {
				store.set(ip, filtered);
			}
		}
	}, windowMs);

	return async (c, next) => {
		// Get client IP from various headers
		const forwardedFor = c.req.header("x-forwarded-for");
		const ip = forwardedFor
			? (forwardedFor.split(",")[0]?.trim() ?? "unknown")
			: c.req.header("cf-connecting-ip") ||
				c.req.header("x-real-ip") ||
				"unknown";

		const now = Date.now();
		const timestamps = store.get(ip) || [];
		const filtered = timestamps.filter((t) => now - t < windowMs);
		filtered.push(now);
		store.set(ip, filtered);

		if (filtered.length > limit) {
			return c.json({ message: "Too Many Requests" }, 429);
		}

		await next();
	};
}

// =============================================================================
// CORS Origin Checker
// =============================================================================

function isOriginAllowed(origin: string | undefined): string | null {
	// For mobile apps (React Native/Expo), origin might be undefined or null
	// We allow these requests and let Better Auth handle validation via expo-origin header
	if (!origin) {
		return "*"; // Allow the request, Better Auth will validate via expo-origin
	}

	const allowedOrigins = getAllowedOrigins();

	// Check exact match
	if (allowedOrigins.includes(origin)) {
		return origin;
	}

	// Check wildcard patterns
	for (const allowed of allowedOrigins) {
		if (allowed.includes("*")) {
			const pattern = allowed.replace(/\*/g, ".*");
			if (new RegExp(`^${pattern}$`).test(origin)) {
				return origin;
			}
		}
	}

	return null;
}

// =============================================================================
// Middleware Setup
// =============================================================================

export function setupMiddleware(app: Hono) {
	// Request logging
	app.use(logger());

	// Security headers
	app.use(secureHeaders());

	// Rate limiting
	app.use(rateLimit());

	// HTTPS redirect in production
	app.use(async (c, next) => {
		if (isProduction) {
			const proto = c.req.header("x-forwarded-proto");
			if (proto && proto !== "https") {
				const url = new URL(c.req.url);
				url.protocol = "https:";
				return c.redirect(url.toString(), 301);
			}
		}
		await next();
	});

	// Request metrics
	app.use(async (c, next) => {
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

	// ==========================================================================
	// CORS Configuration for Auth Routes
	// ==========================================================================

	app.use(
		"/api/auth/*",
		cors({
			origin: (origin) => isOriginAllowed(origin),
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowHeaders: [
				"Content-Type",
				"Authorization",
				"X-Requested-With",
				"Accept",
				"Origin",
				"Cookie",
				// Expo-specific headers for React Native OAuth
				"expo-origin",
				"x-skip-oauth-proxy",
			],
			exposeHeaders: ["Set-Cookie", "Content-Length"],
			credentials: true,
			maxAge: 86400, // 24 hours
		}),
	);

	// ==========================================================================
	// CORS Configuration for RPC Routes
	// ==========================================================================

	app.use(
		"/rpc/*",
		cors({
			origin: (origin) => isOriginAllowed(origin),
			allowMethods: ["GET", "POST", "OPTIONS"],
			allowHeaders: [
				"Content-Type",
				"Authorization",
				"X-Requested-With",
				"Accept",
				"Origin",
			],
			credentials: true,
			maxAge: 86400,
		}),
	);

	// ==========================================================================
	// General CORS for Other Routes
	// ==========================================================================

	app.use(
		"/*",
		cors({
			origin: (origin) => {
				// Allow any origin for public routes, but prefer allowed origins
				const allowed = isOriginAllowed(origin);
				return allowed || origin || "*";
			},
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	);

	return app;
}
