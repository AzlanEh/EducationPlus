import { expo } from "@better-auth/expo";
import { type BetterAuthPlugin, betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createAuthMiddleware } from "better-auth/api";
import { createAuthMiddleware as createPluginMiddleware } from "better-auth/plugins";
import { type Db, MongoClient } from "mongodb";

// =============================================================================
// Custom Plugin: Skip State Cookie Check for Cross-Domain OAuth
// =============================================================================
// This plugin is necessary for .vercel.app deployments where the frontend and
// backend are on different subdomains. Since .vercel.app is a public suffix,
// browsers prevent cookie sharing between subdomains. This plugin skips the
// state cookie verification during OAuth callback, which is normally used to
// prevent CSRF attacks. The state is still verified via the database.
//
// WARNING: Only use this for development/preview deployments. For production,
// use a custom domain where cookies can be shared properly.
// =============================================================================

const skipStateCookiePlugin = (): BetterAuthPlugin => {
	return {
		id: "skip-state-cookie",
		hooks: {
			before: [
				{
					matcher: (context) => context.path === "/callback/:id",
					handler: createPluginMiddleware(async () => {
						console.log(
							"[Skip State Cookie Plugin] OAuth callback - skipping state cookie check for cross-domain",
						);
						// Set skipStateCookieCheck in the context to bypass cookie verification
						// This mimics exactly what the oauth-proxy plugin does internally
						// Note: We return a partial context object - the middleware system will merge it
						return {
							context: {
								context: {
									oauthConfig: {
										skipStateCookieCheck: true,
									},
								},
							},
						};
					}),
				},
			],
		},
	};
};

// =============================================================================
// Environment Configuration
// =============================================================================

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
	throw new Error(
		"DATABASE_URL environment variable is required for authentication",
	);
}

// Base URL configuration with fallbacks
const baseURL =
	process.env.BETTER_AUTH_URL ||
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
	"http://localhost:3000";

const isProduction = process.env.NODE_ENV === "production";
const isSecure = baseURL.startsWith("https://");

console.log("[Auth] Configuration:", {
	baseURL,
	isProduction,
	mongoUri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"), // Hide credentials
	hasGoogleCredentials: !!(
		process.env.WEB_GOOGLE_CLIENT_ID && process.env.WEB_GOOGLE_CLIENT_SECRET
	),
});

// =============================================================================
// CORS and Trusted Origins Configuration
// =============================================================================

// Parse CORS origins from environment (comma-separated)
const envOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
	: [];

// Development origins (localhost variants)
const devOrigins = [
	"http://localhost:3000",
	"http://localhost:3001",
	"http://localhost:3002",
	"http://localhost:5173", // Vite default
	"http://127.0.0.1:3000",
	"http://127.0.0.1:3001",
	"http://127.0.0.1:5173",
];

// Mobile app deep links (for React Native/Expo)
// Note: The app scheme is "eduPlus" (camelCase) as defined in app.config.ts
const mobileOrigins = [
	"eduPlus://",
	"eduPlus://*",
	"eduplus://",
	"eduplus://*",
	"exp://",
	"exp://*",
	// Development mode - trust all Expo development URLs
	...(isProduction
		? []
		: [
				"exp://*/*",
				"exp://10.0.0.*:*/*",
				"exp://10.129.*.*:*/*", // Additional range for development
				"exp://192.168.*.*:*/*",
				"exp://172.*.*.*:*/*",
				"exp://localhost:*/*",
			]),
];

// Combine all trusted origins
const trustedOriginsList = [
	baseURL, // Include the server's own URL
	...envOrigins,
	...(isProduction ? [] : devOrigins),
	...mobileOrigins,
];

console.log("[Auth] Trusted origins:", trustedOriginsList);

// trustedOrigins as a function to handle null origin from mobile apps
// React Native/Expo doesn't send an Origin header, so we need to handle that case
const trustedOrigins = async (request: Request): Promise<string[]> => {
	const origin = request.headers.get("origin");
	const expoOrigin = request.headers.get("expo-origin");

	console.log("[Auth] trustedOrigins check:", {
		origin,
		expoOrigin,
		url: request.url,
	});

	// If origin is null/missing but expo-origin exists, the expo plugin should handle it
	// If origin is null/missing, it's likely a mobile app request
	// In development, we allow this. In production, you may want stricter checks.
	if (!origin) {
		// Check for expo-specific indicators or allow in development
		const userAgent = request.headers.get("user-agent") || "";
		const isExpoRequest =
			expoOrigin ||
			userAgent.includes("Expo") ||
			userAgent.includes("okhttp") || // Android
			userAgent.includes("CFNetwork"); // iOS

		if (!isProduction || isExpoRequest) {
			console.log(
				"[Auth] Allowing request with null origin (mobile app request)",
			);
			// Return an empty array with a special marker that Better Auth will accept
			// by setting the request's origin to match one of our trusted origins
			return trustedOriginsList;
		}
	}

	return trustedOriginsList;
};

// =============================================================================
// MongoDB Client Setup (Cached for Serverless)
// =============================================================================

// Global cache for serverless environments
declare global {
	// eslint-disable-next-line no-var
	var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let mongoClient: MongoClient;
let db: Db;

// Create cached connection promise
if (!globalThis._mongoClientPromise) {
	console.log("[Auth] Creating new MongoDB connection...");
	globalThis._mongoClientPromise = (async () => {
		const client = new MongoClient(MONGODB_URI, {
			serverSelectionTimeoutMS: 5000,
			connectTimeoutMS: 5000,
			socketTimeoutMS: 30000,
			maxPoolSize: 10,
			minPoolSize: 1,
		});
		await client.connect();
		console.log("[Auth] MongoDB connected successfully");
		return client;
	})();
}

const clientPromise = globalThis._mongoClientPromise;

// Helper to ensure connection is ready
export async function ensureConnection(): Promise<Db> {
	if (db) return db;

	mongoClient = await clientPromise;
	db = mongoClient.db();
	return db;
}

// Synchronously wait for connection at module load
// This is required because better-auth needs the db instance immediately
try {
	mongoClient = await clientPromise;
	db = mongoClient.db();
	console.log("[Auth] Database ready:", db.databaseName);
} catch (error) {
	console.error("[Auth] Failed to connect to MongoDB:", error);
	throw error;
}

// =============================================================================
// Better Auth Configuration
// =============================================================================

export const auth = betterAuth({
	// Application name (used in emails, etc.)
	appName: "EduPlus",

	// Base URL for auth callbacks
	baseURL,

	// Base path for auth routes (default: /api/auth)
	basePath: "/api/auth",

	// Database adapter
	// Note: Not passing client to disable transactions (Atlas free tier doesn't support them)
	database: mongodbAdapter(db),

	// ==========================================================================
	// Database Hooks (for debugging)
	// ==========================================================================
	databaseHooks: {
		verification: {
			create: {
				before: async (verification) => {
					console.log("[Auth DB] Creating verification record...", {
						identifier: verification.identifier,
						expiresAt: verification.expiresAt,
					});
					return { data: verification };
				},
				after: async (verification) => {
					console.log(
						"[Auth DB] Verification record created:",
						verification.id,
					);
				},
			},
		},
		session: {
			create: {
				before: async (session) => {
					console.log("[Auth DB] Creating session...");
					return { data: session };
				},
				after: async (session) => {
					console.log("[Auth DB] Session created:", session.id);
				},
			},
		},
		user: {
			create: {
				before: async (user) => {
					console.log("[Auth DB] Creating user...", { email: user.email });
					return { data: user };
				},
				after: async (user) => {
					console.log("[Auth DB] User created:", user.id);
				},
			},
		},
		account: {
			create: {
				before: async (account) => {
					console.log("[Auth DB] Creating account...", {
						providerId: account.providerId,
					});
					return { data: account };
				},
				after: async (account) => {
					console.log("[Auth DB] Account created:", account.id);
				},
			},
		},
	},

	// Secret for signing tokens and cookies
	secret: process.env.BETTER_AUTH_SECRET,

	// Trusted origins for CSRF protection
	trustedOrigins,

	// ==========================================================================
	// Session Configuration
	// ==========================================================================
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},

	// ==========================================================================
	// Account Configuration
	// ==========================================================================
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google", "email-password"],
		},
	},

	// ==========================================================================
	// Plugins
	// ==========================================================================
	// skipStateCookiePlugin: Necessary for .vercel.app deployments where frontend
	// and backend are on different subdomains (public suffix domain).
	// expo: Required for Expo/React Native OAuth deep linking
	plugins: [skipStateCookiePlugin(), expo()],

	// ==========================================================================
	// Email & Password Authentication
	// ==========================================================================
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		autoSignIn: true,
		sendResetPassword: async ({ user, url }) => {
			const { sendEmail, getPasswordResetEmailHTML } = await import("./email");
			await sendEmail(
				user.email,
				"Reset your password - EduPlus",
				getPasswordResetEmailHTML(url),
			);
		},
		resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
	},

	// ==========================================================================
	// Social Providers (Google OAuth)
	// ==========================================================================
	socialProviders: {
		google: {
			clientId: process.env.WEB_GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.WEB_GOOGLE_CLIENT_SECRET || "",
			// Explicitly set redirect URI for production
			redirectURI: `${baseURL}/api/auth/callback/google`,
		},
	},

	// ==========================================================================
	// User Configuration (Additional Fields)
	// ==========================================================================
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				defaultValue: "student",
				input: false,
			},
			target: {
				type: "string",
				required: false,
			},
			gender: {
				type: "string",
				required: false,
			},
			phoneNo: {
				type: "string",
				required: false,
			},
			signupSource: {
				type: "string",
				required: true,
				defaultValue: "web",
			},
		},
	},

	// ==========================================================================
	// Advanced Configuration
	// ==========================================================================
	advanced: {
		defaultCookieAttributes: {
			// Use "lax" for same-site (subdomains of azlaneh.tech)
			// This is more secure than "none" and works for OAuth redirects
			sameSite: "lax",
			secure: isProduction ? true : isSecure,
			httpOnly: true,
			path: "/",
			// Set domain to root domain to share cookies across subdomains
			// e.g., server.azlaneh.tech and app.azlaneh.tech can share cookies
			...(isProduction ? { domain: ".azlaneh.tech" } : {}),
		},
		cookiePrefix: "eduplus",
		useSecureCookies: isProduction ? true : isSecure,
	},

	// ==========================================================================
	// Rate Limiting
	// ==========================================================================
	rateLimit: {
		enabled: isProduction,
		window: 60,
		max: 100,
	},

	// ==========================================================================
	// Request Hooks (for debugging OAuth flow)
	// ==========================================================================
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			const origin = ctx.headers?.get("origin");
			const expoOrigin = ctx.headers?.get("expo-origin");
			const userAgent = ctx.headers?.get("user-agent");
			console.log("[Auth Hook Before]", ctx.path, ctx.method, {
				origin,
				expoOrigin,
				userAgent: userAgent?.substring(0, 50),
				hasOrigin: !!origin,
				hasExpoOrigin: !!expoOrigin,
				allHeaders: ctx.headers
					? Object.fromEntries(ctx.headers.entries())
					: "no headers",
			});
			if (ctx.path.includes("sign-in/social")) {
				console.log("[Auth Hook] Social sign-in started");
			}
		}),
		after: createAuthMiddleware(async (ctx) => {
			console.log(
				"[Auth Hook After]",
				ctx.path,
				"returned:",
				!!ctx.context.returned,
			);
		}),
	},
});

// =============================================================================
// Type Exports
// =============================================================================

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
