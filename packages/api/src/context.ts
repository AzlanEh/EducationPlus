import { auth } from "@eduPlus/auth";
import type { Context as HonoContext } from "hono";

// =============================================================================
// Context Creation
// =============================================================================

export type CreateContextOptions = {
	context: HonoContext;
};

/**
 * Creates the context for each oRPC request.
 * Extracts the session from the request headers using Better Auth.
 */
export async function createContext({ context }: CreateContextOptions) {
	let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;

	try {
		session = await auth.api.getSession({
			headers: context.req.raw.headers,
		});
	} catch (error) {
		// Session fetch failed - user is not authenticated
		// This is expected for public routes
		if (process.env.NODE_ENV === "development") {
			console.debug("[Context] No session found");
		}
	}

	return {
		session,
	};
}

// =============================================================================
// Type Exports
// =============================================================================

export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Extended user type with custom fields.
 * These fields are defined in the auth configuration.
 */
export type ExtendedUser = {
	id: string;
	email: string;
	name: string;
	emailVerified: boolean;
	image?: string | null;
	createdAt: Date;
	updatedAt: Date;
	// Custom fields
	role: "student" | "admin";
	target?: string;
	gender?: "male" | "female" | "other";
	phoneNo?: string;
	signupSource: "native" | "web";
};

/**
 * Extended session type with typed user.
 */
export type ExtendedSession = {
	user: ExtendedUser;
	session: {
		id: string;
		userId: string;
		token: string;
		expiresAt: Date;
		createdAt: Date;
		updatedAt: Date;
		ipAddress?: string | null;
		userAgent?: string | null;
	};
};
