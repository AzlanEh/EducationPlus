/**
 * Better Auth Client Configuration
 *
 * This client is used for all authentication operations in the web app.
 * It connects to the server's Better Auth API endpoints.
 *
 * In development, we use Vite's proxy to forward /api requests to the server.
 * This avoids cross-origin cookie issues since both client and API are on same origin.
 */
import type { auth } from "@eduPlus/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// In development with proxy, use relative URL (same origin)
// In production, use the full server URL
const isDev = import.meta.env.DEV;
const serverUrl = isDev ? "" : import.meta.env.VITE_SERVER_URL;

if (!isDev && !serverUrl) {
	console.error(
		"[Auth] VITE_SERVER_URL is not defined. Authentication will not work.",
	);
}

/**
 * Auth client instance with typed additional fields
 */
export const authClient = createAuthClient({
	baseURL: serverUrl,
	// Infer additional user fields from server auth config
	plugins: [inferAdditionalFields<typeof auth>()],
	// Ensure cookies are sent with requests
	fetchOptions: {
		credentials: "include",
	},
});

/**
 * Re-export commonly used hooks and methods for convenience
 */
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

/**
 * Type definitions for use throughout the app
 */
export type AuthSession = typeof authClient.$Infer.Session;
export type AuthUser = typeof authClient.$Infer.Session.user;
