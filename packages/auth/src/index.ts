import { client } from "@eduPlus/db";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// Global OTP store for development (NOT for production)
const otpStore = new Map<string, { otp: string; expires: number }>();

// Determine if we're in a secure environment (HTTPS)
const isSecure =
	process.env.NODE_ENV === "production" ||
	process.env.BETTER_AUTH_URL?.startsWith("https://") ||
	process.env.VERCEL_URL?.startsWith("https://") ||
	false;

// Determine base URL
const baseURL =
	process.env.BETTER_AUTH_URL ||
	process.env.VERCEL_URL ||
	"http://localhost:3000";

// Parse CORS origins
const corsOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
	: [];

export const auth = betterAuth<BetterAuthOptions>({
	baseURL,
	database: mongodbAdapter(client),
	trustedOrigins: [
		...corsOrigins,
		"eduPlus://",
		"eduPlus://*",
		"mybettertapp://",
		"exp://",
	],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // We'll handle verification manually
		sendResetPassword: async ({ user, url, token }) => {
			const { sendEmail, getPasswordResetEmailHTML } = await import("./email");
			await sendEmail(
				user.email,
				"Reset your password",
				getPasswordResetEmailHTML(url),
			);
		},
	},
	socialProviders: {
		google: {
			clientId: process.env.WEB_GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.WEB_GOOGLE_CLIENT_SECRET || "",
		},
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				defaultValue: "student",
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
	advanced: {
		defaultCookieAttributes: {
			sameSite: isSecure ? "none" : "lax",
			secure: isSecure,
			httpOnly: true,
		},
	},
});
