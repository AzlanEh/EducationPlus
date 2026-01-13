import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createAuthMiddleware } from "better-auth/api";
import { type Db, MongoClient } from "mongodb";

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
const mobileOrigins = ["eduplus://", "eduplus://*", "exp://", "exp://*"];

// Combine all trusted origins
const trustedOrigins = [
	baseURL, // Include the server's own URL
	...envOrigins,
	...(isProduction ? [] : devOrigins),
	...mobileOrigins,
];

console.log("[Auth] Trusted origins:", trustedOrigins);

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
		// Skip state cookie check for .vercel.app domains
		// Vercel subdomains are public suffixes, so cookies can't be shared
		// TODO: Remove this when using a custom domain
		skipStateCookieCheck: true,
	},

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
			sameSite: isProduction ? "none" : "lax",
			secure: isProduction ? true : isSecure,
			httpOnly: true,
			path: "/",
			// Partitioned cookies for cross-site requests in modern browsers
			...(isProduction ? { partitioned: true } : {}),
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
			console.log("[Auth Hook Before]", ctx.path, ctx.method);
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
