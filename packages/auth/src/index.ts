import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

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
	...envOrigins,
	...(isProduction ? [] : devOrigins),
	...mobileOrigins,
];

// =============================================================================
// MongoDB Client Setup
// =============================================================================

// Create a dedicated MongoDB client for better-auth
// This is separate from Mongoose to ensure proper adapter compatibility
const mongoClient = new MongoClient(MONGODB_URI);

// Connect synchronously (top-level await)
await mongoClient.connect();
console.log("[Auth] Connected to MongoDB");

// Get the database (uses the database name from the connection string)
const db = mongoClient.db();

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

	// Database adapter - pass both db and client for transaction support
	database: mongodbAdapter(db, {
		client: mongoClient, // Enable database transactions
	}),

	// Secret for signing tokens and cookies
	// Falls back to BETTER_AUTH_SECRET env var automatically
	secret: process.env.BETTER_AUTH_SECRET,

	// Trusted origins for CSRF protection
	trustedOrigins,

	// ==========================================================================
	// Session Configuration
	// ==========================================================================
	session: {
		// Session expires in 7 days
		expiresIn: 60 * 60 * 24 * 7,
		// Refresh session if older than 1 day
		updateAge: 60 * 60 * 24,
		// Enable cookie caching for better performance
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},

	// ==========================================================================
	// Account Configuration
	// ==========================================================================
	account: {
		// Enable account linking (same email, different providers)
		accountLinking: {
			enabled: true,
			trustedProviders: ["google", "email-password"],
		},
		// Store OAuth state in database instead of cookies
		// This avoids cookie issues with cross-origin requests
		storeStateStrategy: "database",
	},

	// ==========================================================================
	// Email & Password Authentication
	// ==========================================================================
	emailAndPassword: {
		enabled: true,
		// Don't require email verification for now (we use custom OTP flow)
		requireEmailVerification: false,
		// Minimum password requirements
		minPasswordLength: 8,
		maxPasswordLength: 128,
		// Auto sign in after sign up
		autoSignIn: true,
		// Password reset email handler
		sendResetPassword: async ({ user, url }) => {
			const { sendEmail, getPasswordResetEmailHTML } = await import("./email");
			await sendEmail(
				user.email,
				"Reset your password - EduPlus",
				getPasswordResetEmailHTML(url),
			);
		},
		// Reset token expires in 1 hour
		resetPasswordTokenExpiresIn: 60 * 60,
	},

	// ==========================================================================
	// Social Providers (Google OAuth)
	// ==========================================================================
	socialProviders: {
		google: {
			clientId: process.env.WEB_GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.WEB_GOOGLE_CLIENT_SECRET || "",
			// Redirect URI is auto-generated: {baseURL}/api/auth/callback/google
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
				input: false, // Cannot be set by client during signup
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
		// Cookie configuration
		// In production (HTTPS): Use SameSite=None + Secure for cross-origin cookies
		// In development: Use SameSite=Lax (works with Vite proxy on same origin)
		defaultCookieAttributes: {
			// For cross-origin in production, we need SameSite=None
			// For development with proxy, SameSite=Lax works fine
			sameSite: isProduction ? "none" : "lax",
			// Secure is required when SameSite=None
			secure: isProduction ? true : isSecure,
			httpOnly: true,
			// Cookie path - ensure it's root
			path: "/",
			// Partitioned cookies for modern browsers (required for cross-site cookies)
			...(isProduction ? { partitioned: true } : {}),
		},
		// Cookie prefix
		cookiePrefix: "eduplus",
		// Use secure cookies in production
		useSecureCookies: isProduction ? true : isSecure,
	},

	// ==========================================================================
	// Rate Limiting
	// ==========================================================================
	rateLimit: {
		enabled: isProduction,
		window: 60, // 1 minute window
		max: 100, // 100 requests per minute
	},
});

// =============================================================================
// Type Exports
// =============================================================================

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
