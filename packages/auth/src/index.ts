import { client } from "@eduPlus/db";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

export const auth = betterAuth<BetterAuthOptions>({
	database: mongodbAdapter(client),
	trustedOrigins: [
		...(process.env.CORS_ORIGIN
			? process.env.CORS_ORIGIN.split(",")
			: ["eduPlus://"]),
		"eduPlus://*",
		"mybettertapp://",
		"exp://",
	],
	emailAndPassword: {
		enabled: true,
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
			},
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
});
