/**
 * Authentication Guards for TanStack Router
 *
 * These guards are used in route `beforeLoad` functions to protect routes
 * based on authentication status and user roles.
 */
import { redirect } from "@tanstack/react-router";
import { type AuthSession, type AuthUser, authClient } from "@/lib/auth-client";

// =============================================================================
// Extended Session Type (with additional fields)
// =============================================================================

export interface ExtendedUser extends AuthUser {
	role: "student" | "admin";
	target?: string;
	gender?: "male" | "female" | "other";
	phoneNo?: string;
	signupSource: "native" | "web";
}

export interface ExtendedSession {
	user: ExtendedUser;
	session: {
		id: string;
		userId: string;
		expiresAt: Date;
		token: string;
	};
}

// =============================================================================
// Session Fetcher
// =============================================================================

/**
 * Fetches the current session from the server.
 * Uses the authClient which handles cookies automatically.
 */
export async function getServerSession(): Promise<ExtendedSession | null> {
	try {
		const { data, error } = await authClient.getSession({
			fetchOptions: {
				credentials: "include",
			},
		});

		if (error || !data) {
			return null;
		}

		// Cast to extended session type (server adds additional fields)
		return data as unknown as ExtendedSession;
	} catch (error) {
		console.error("[Auth Guard] Failed to fetch session:", error);
		return null;
	}
}

// =============================================================================
// Route Guards
// =============================================================================

/**
 * Requires user to be authenticated.
 * Redirects to /login if not authenticated.
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/dashboard')({
 *   beforeLoad: async () => requireAuth(),
 *   component: Dashboard,
 * })
 * ```
 */
export async function requireAuth(): Promise<ExtendedSession> {
	const session = await getServerSession();

	if (!session) {
		throw redirect({
			to: "/login",
			search: { invite: undefined },
		});
	}

	return session;
}

/**
 * Requires user to be an admin.
 * Redirects to /login if not authenticated, or / if not admin.
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/admin')({
 *   beforeLoad: async () => requireAdmin(),
 *   component: AdminDashboard,
 * })
 * ```
 */
export async function requireAdmin(): Promise<ExtendedSession> {
	const session = await requireAuth();

	if (session.user.role !== "admin") {
		throw redirect({
			to: "/",
		});
	}

	return session;
}

/**
 * Requires user to be a student.
 * Redirects to /login if not authenticated, or / if not student.
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/learn')({
 *   beforeLoad: async () => requireStudent(),
 *   component: LearnPage,
 * })
 * ```
 */
export async function requireStudent(): Promise<ExtendedSession> {
	const session = await requireAuth();

	if (session.user.role !== "student") {
		throw redirect({
			to: "/",
		});
	}

	return session;
}

/**
 * Requires user to be a guest (not authenticated).
 * Redirects to / if already authenticated.
 *
 * Use this for login/signup pages.
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/login')({
 *   beforeLoad: async () => requireGuest(),
 *   component: LoginPage,
 * })
 * ```
 */
export async function requireGuest(): Promise<void> {
	const session = await getServerSession();

	if (session) {
		throw redirect({
			to: "/",
		});
	}
}

/**
 * Optional authentication - returns session if available, null otherwise.
 * Does not redirect.
 *
 * Use this for pages that work both with and without authentication.
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/')({
 *   beforeLoad: async () => ({ session: await optionalAuth() }),
 *   component: HomePage,
 * })
 * ```
 */
export async function optionalAuth(): Promise<ExtendedSession | null> {
	return getServerSession();
}
